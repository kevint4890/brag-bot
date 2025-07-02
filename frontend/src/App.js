import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Chat from "./components/chat/Chat";
import { useState, useEffect, useRef } from "react";
import * as React from "react";
import {inferenceProfileSummaries} from "./InferenceProfileSummaries";
import { useResponsiveHeight, useResponsiveLayout, getResponsiveSpacing } from "./hooks/useResponsiveHeight";
import ResizeHandle from "./components/ui/ResizeHandle";
import FullScreenSourceModal from "./components/modals/FullScreenSourceModal";
import ChatHeader from "./components/chat/ChatHeader";
import ChatInput from "./components/chat/ChatInput";
import SourcePanel from "./components/panels/SourcePanel";
import FloatingActionButtons from "./components/ui/FloatingActionButtons";
import NewChatConfirmation from "./components/ui/NewChatConfirmation";
import NotificationSnackbars from "./components/ui/NotificationSnackbars";
import SettingsPopover from "./components/ui/SettingsPopover";
import { chatApi } from "./services/chatApi";
import { colors, gradients, shadows, borderRadius, transitions } from "./constants/theme";

const App = (props) => {
  const [history, setHistory] = useState([]);
  const [selectedModel, setSelectedModel] = useState(undefined);
  const [baseUrl, setBaseUrl] = useState(undefined);
  const [question, setQuestion] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [sessionId, setSessionId] = useState(undefined);
  const [sourceUrlInfo, setSourceUrlInfo] = useState({
    exclusionFilters: [],
    inclusionFilters: [],
    seedUrlList: [],
  });
  const [hasWebDataSource, setHasWebDataSource] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [devSettingsAnchor, setDevSettingsAnchor] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [sourcePanel, setSourcePanel] = useState({ isOpen: false, content: null, title: null });
  const [sourcePanelClosing, setSourcePanelClosing] = useState(false);
  const [enableSourcePanel, setEnableSourcePanel] = useState(true);
  const [enableSidebarSlider, setEnableSidebarSlider] = useState(() => {
    const saved = localStorage.getItem('enableSidebarSlider');
    return saved ? JSON.parse(saved) : false;
  });

  // Reset sidebar to default size when slider is disabled
  useEffect(() => {
    if (!enableSidebarSlider) {
      setSidebarWidth(55); // Reset to default 55%
      localStorage.setItem('sidebarWidth', '55');
    }
  }, [enableSidebarSlider]);
  const [showQuickConfigSnackbar, setShowQuickConfigSnackbar] = useState(false);

  // New state for sidebar resizing and mobile handling
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseFloat(saved) : 55;
  });
  const [fullScreenSource, setFullScreenSource] = useState({ 
    isOpen: false, 
    content: null, 
    url: null, 
    title: null 
  });
  const sourceBehavior = 'smart'; // Default behavior for source handling
  
  const chatContainerRef = useRef(null);

  // Responsive layout detection
  const layout = useResponsiveLayout();
  const heightTier = useResponsiveHeight();

  useEffect(() => {
    if (!baseUrl) {
      return;
    }
    const getWebSourceConfiguration = async () => {
      try {
        const data = await chatApi.getWebSourceConfiguration(baseUrl);
        setSourceUrlInfo({
          exclusionFilters: data.exclusionFilters ?? [],
          inclusionFilters: data.inclusionFilters ?? [],
          seedUrlList: data.seedUrlList ?? [],
        });
        setHasWebDataSource(true);
      } catch (err) {
        console.log("err", err);
      }
    };
    getWebSourceConfiguration();
  }, [baseUrl]);


  const handleSendQuestion = async () => {
    if (!question.trim()) return;
    
    setSpinner(true);
    const currentQuestion = question;
    setQuestion(''); // Clear input immediately

    // Add the user question and a loading response immediately
    const newHistory = [
      ...history,
      {
        question: currentQuestion,
        response: "",
        isLoading: true,
        citation: undefined,
      },
    ];
    setHistory(newHistory);

    try {
      const data = await chatApi.sendQuestion(baseUrl, {
        requestSessionId: sessionId,
        question: currentQuestion,
        inferenceProfileId: selectedModel?.inferenceProfileId,
      });
      
      console.log("data", data);
      setSpinner(false);
      setSessionId(data.sessionId);
      
      // Update the last message with the actual response
      setHistory(prevHistory => {
        const updatedHistory = [...prevHistory];
        updatedHistory[updatedHistory.length - 1] = {
          question: currentQuestion,
          response: data.response,
          citation: data.citation,
          isLoading: false,
        };
        return updatedHistory;
      });
    } catch (err) {
      setSpinner(false);
      // Update the last message with error response
      setHistory(prevHistory => {
        const updatedHistory = [...prevHistory];
        updatedHistory[updatedHistory.length - 1] = {
          question: currentQuestion,
          response:
            "Error generating an answer. Please check your browser console, WAF configuration, Bedrock model access, and Lambda logs for debugging the error.",
          citation: undefined,
          isLoading: false,
        };
        return updatedHistory;
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  const handleNewChatClick = (event) => {
    // Show popover immediately on single click
    setPopoverAnchor(event.currentTarget);
  };

  const handleNewChatDoubleClick = (event) => {
    // Double-click: immediately start new chat and close any open popover
    event.preventDefault();
    setHistory([]);
    setShowSnackbar(true);
    setPopoverAnchor(null);
  };

  const handleConfirmNewChat = () => {
    setHistory([]);
    setPopoverAnchor(null);
  };

  const handleCancelNewChat = () => {
    setPopoverAnchor(null);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const handleCloseQuickConfigSnackbar = () => {
    setShowQuickConfigSnackbar(false);
  };

  const handleUpdateUrls = async (
    urls,
    newExclusionFilters,
    newInclusionFilters
  ) => {
    return await chatApi.updateWebUrls(baseUrl, {
      urlList: urls,
      exclusionFilters: newExclusionFilters,
      inclusionFilters: newInclusionFilters,
    });
  };

  const handleChangeModel = (model) => {
    setSelectedModel(model);
    setSessionId(undefined)
  }

  // Smart source handling based on screen size and user preference
  const handleOpenSourcePanel = (citation) => {
    // Extract URL from citation if it contains one
    const urlMatch = citation.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : null;
    
    // Determine how to handle the source based on responsive layout and user preference
    const forceNewTab = sourceBehavior === 'newTab' || !layout.shouldUseSidebar;
    
    if (forceNewTab && url) {
      // Open in new tab for mobile or when user prefers new tabs
      window.open(url, '_blank');
      return;
    }
    
    if (!layout.shouldUseSidebar && sourceBehavior === 'smart') {
      // Use full-screen modal for mobile when no URL or user prefers integrated experience
      setFullScreenSource({
        isOpen: true,
        content: citation,
        url: url,
        title: url ? 'Source Document' : 'Source Content'
      });
      return;
    }
    
    // Use sidebar for desktop
    setSourcePanel({
      isOpen: true,
      content: citation,
      url: url,
      title: 'Source'
    });
  };

  const handleCloseSourcePanel = () => {
    // Start the closing animation
    setSourcePanelClosing(true);
    
    // After animation completes, actually close the panel
    setTimeout(() => {
      setSourcePanel({ isOpen: false, content: null, title: null });
      setSourcePanelClosing(false);
    }, 300); // Match animation duration
  };

  const handleCloseFullScreenSource = () => {
    setFullScreenSource({ isOpen: false, content: null, url: null, title: null });
  };

  // Handle sidebar resizing
  const handleSidebarResize = (deltaPercent) => {
    const newWidth = Math.max(20, Math.min(70, sidebarWidth + deltaPercent));
    setSidebarWidth(newWidth);
    localStorage.setItem('sidebarWidth', newWidth.toString());
  };


  // Get responsive spacing values
  const containerPadding = getResponsiveSpacing(heightTier, {
    xs: "4px",
    small: "8px", 
    medium: "16px",
    large: "24px"
  });

  const containerHeight = getResponsiveSpacing(heightTier, {
    xs: "calc(100vh - 16px)",
    small: "calc(100vh - 24px)",
    medium: "calc(100vh - 40px)", 
    large: "calc(100vh - 48px)"
  });

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: containerPadding,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `,
          animation: "float 6s ease-in-out infinite",
          zIndex: 0,
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      }}
    >

      {/* Main Content Container */}
      <Box
        sx={{
          width: "100%",
          maxWidth: (sourcePanel.isOpen || sourcePanelClosing) ? "95vw" : { xs: "95vw", sm: "90vw", md: "800px" },
          height: containerHeight,
          minHeight: heightTier === 'xs' ? "300px" : "400px",
          display: "flex",
          gap: (sourcePanel.isOpen || sourcePanelClosing) ? (heightTier === 'xs' ? "8px" : "16px") : 0,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Chat Container */}
        <Paper
          ref={chatContainerRef}
          elevation={8}
          sx={{
            width: (sourcePanel.isOpen || sourcePanelClosing) ? `${100 - sidebarWidth}%` : "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: { xs: "16px", sm: "20px" },
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(59, 130, 246, 0.1)",
            position: "relative",
            zIndex: 1,
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 12px 40px rgba(59, 130, 246, 0.15)",
            },
          }}
        >
          <ChatHeader
            onNewChat={handleNewChatClick}
            onNewChatDoubleClick={handleNewChatDoubleClick}
            hasHistory={history.length > 0}
            heightTier={heightTier}
          />

          {/* Chat Messages Area */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Chat 
              history={history} 
              onOpenSourcePanel={enableSourcePanel ? handleOpenSourcePanel : null} 
            />
          </Box>

          <ChatInput
            question={question}
            setQuestion={setQuestion}
            onSendQuestion={handleSendQuestion}
            onKeyDown={handleKeyDown}
            disabled={spinner}
            baseUrl={baseUrl}
            heightTier={heightTier}
          />
        </Paper>

        {/* Resize Handle */}
        {sourcePanel.isOpen && layout.shouldUseSidebar && enableSidebarSlider && (
          <ResizeHandle
            onResize={handleSidebarResize}
            isVisible={true}
          />
        )}

        <SourcePanel
          isOpen={sourcePanel.isOpen}
          isClosing={sourcePanelClosing}
          content={sourcePanel.content}
          title={sourcePanel.title}
          url={sourcePanel.url}
          sidebarWidth={sidebarWidth}
          onClose={handleCloseSourcePanel}
          heightTier={heightTier}
        />
      </Box>

      <FloatingActionButtons
        onQuickConfig={() => {
          const quickSetupUrl = "https://eogeslxp5e.execute-api.us-east-2.amazonaws.com/prod/";
          setBaseUrl(quickSetupUrl);
          
          // Find Claude 3.5 Haiku model from inference profiles
          const claudeModel = inferenceProfileSummaries.find(model => 
            model.inferenceProfileId.includes('claude-3-5-haiku') || 
            (model.inferenceProfileName.toLowerCase().includes('claude') && model.inferenceProfileName.toLowerCase().includes('3.5') && model.inferenceProfileName.toLowerCase().includes('haiku'))
          );
          
          if (claudeModel) {
            setSelectedModel(claudeModel);
          }
          
          // Show confirmation message
          setShowQuickConfigSnackbar(true);
        }}
        onOpenSettings={(e) => setDevSettingsAnchor(e.currentTarget)}
      />

      <SettingsPopover
        anchor={devSettingsAnchor}
        onClose={() => setDevSettingsAnchor(null)}
        baseUrl={baseUrl}
        setBaseUrl={setBaseUrl}
        inferenceProfileSummaries={inferenceProfileSummaries}
        selectedModel={selectedModel}
        onChangeModel={handleChangeModel}
        enableSourcePanel={enableSourcePanel}
        setEnableSourcePanel={setEnableSourcePanel}
        enableSidebarSlider={enableSidebarSlider}
        setEnableSidebarSlider={setEnableSidebarSlider}
        hasWebDataSource={hasWebDataSource}
        sourceUrlInfo={sourceUrlInfo}
        handleUpdateUrls={handleUpdateUrls}
        heightTier={heightTier}
        onQuickConfig={() => {
          const quickSetupUrl = "https://eogeslxp5e.execute-api.us-east-2.amazonaws.com/prod/";
          setBaseUrl(quickSetupUrl);
          
          // Find Claude 3.5 Haiku model from inference profiles
          const claudeModel = inferenceProfileSummaries.find(model => 
            model.inferenceProfileId.includes('claude-3-5-haiku') || 
            (model.inferenceProfileName.toLowerCase().includes('claude') && model.inferenceProfileName.toLowerCase().includes('3.5') && model.inferenceProfileName.toLowerCase().includes('haiku'))
          );
          
          if (claudeModel) {
            setSelectedModel(claudeModel);
          }
        }}
      />

      <NewChatConfirmation
        anchor={popoverAnchor}
        onConfirm={handleConfirmNewChat}
        onCancel={handleCancelNewChat}
      />

      <NotificationSnackbars
        showSnackbar={showSnackbar}
        showQuickConfigSnackbar={showQuickConfigSnackbar}
        onCloseSnackbar={handleCloseSnackbar}
        onCloseQuickConfigSnackbar={handleCloseQuickConfigSnackbar}
      />

      {/* Full Screen Source Modal */}
      <FullScreenSourceModal
        isOpen={fullScreenSource.isOpen}
        onClose={handleCloseFullScreenSource}
        content={fullScreenSource.content}
        url={fullScreenSource.url}
        title={fullScreenSource.title}
      />
    </Box>
  );
};

export default App;
