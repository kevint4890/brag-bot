import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { QAHeader } from "./QAHeader";
import Chat from "./components/chat/Chat";
import { useState, useEffect, useRef } from "react";
import { Typography, Button, Popover, Switch } from "@mui/material";
import * as React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import UrlSourcesForm from "./WebUrlsForm";
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
  const [sourceBehavior, setSourceBehavior] = useState(() => {
    const saved = localStorage.getItem('sourceBehavior');
    return saved || 'smart'; // 'smart', 'sidebar', 'newTab'
  });
  
  // Animation state to prevent text reflow during transitions
  const [isAnimating, setIsAnimating] = useState(false);
  const [fixedChatWidth, setFixedChatWidth] = useState(null);
  const chatContainerRef = useRef(null);

  // Responsive layout detection
  const layout = useResponsiveLayout();
  const heightTier = useResponsiveHeight();

  useEffect(() => {
    if (!baseUrl) {
      return;
    }
    const getWebSourceConfiguration = async () => {
      fetch(baseUrl + "urls", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setSourceUrlInfo({
            exclusionFilters: data.exclusionFilters ?? [],
            inclusionFilters: data.inclusionFilters ?? [],
            seedUrlList: data.seedUrlList ?? [],
          });
          setHasWebDataSource(true);
        })
        .catch((err) => {
          console.log("err", err);
        });

    };
    getWebSourceConfiguration();
  }, [baseUrl]);


  const handleSendQuestion = () => {
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

    fetch(baseUrl + "docs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestSessionId: sessionId,
        question: currentQuestion,
        inferenceProfileId: selectedModel?.inferenceProfileId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
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
      })
      .catch((err) => {
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
      });
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
    try {
      const response = await fetch(baseUrl + "web-urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urlList: [...new Set(urls)],
          exclusionFilters: [...new Set(newExclusionFilters)],
          inclusionFilters: [...new Set(newInclusionFilters)],
        }),
      });
      return !!response.ok;
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
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
    const shouldUseSidebar = layout.shouldUseSidebar && sourceBehavior !== 'newTab';
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
    
    // Capture current chat width before opening sidebar to prevent text reflow
    if (chatContainerRef.current && !sourcePanel.isOpen) {
      const currentWidth = chatContainerRef.current.offsetWidth;
      setFixedChatWidth(currentWidth);
      setIsAnimating(true);
      
      // Clear fixed width after animation completes
      setTimeout(() => {
        setFixedChatWidth(null);
        setIsAnimating(false);
      }, 250); // Match animation duration
    }
    
    // Use sidebar for desktop
    setSourcePanel({
      isOpen: true,
      content: citation,
      url: url,
      title: url ? 'Source Document' : 'Source Content'
    });
  };

  const handleCloseSourcePanel = () => {
    // Capture current chat width before closing sidebar to prevent text reflow
    if (chatContainerRef.current && sourcePanel.isOpen) {
      const currentWidth = chatContainerRef.current.offsetWidth;
      setFixedChatWidth(currentWidth);
      setIsAnimating(true);
      
      // Clear fixed width after animation completes
      setTimeout(() => {
        setFixedChatWidth(null);
        setIsAnimating(false);
      }, 250); // Match animation duration
    }
    
    setSourcePanel({ isOpen: false, content: null, title: null });
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

  // Handle source behavior change
  const handleSourceBehaviorChange = (newBehavior) => {
    setSourceBehavior(newBehavior);
    localStorage.setItem('sourceBehavior', newBehavior);
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
          maxWidth: sourcePanel.isOpen ? "95vw" : { xs: "95vw", sm: "90vw", md: "800px" },
          height: containerHeight,
          minHeight: heightTier === 'xs' ? "300px" : "400px",
          display: "flex",
          gap: sourcePanel.isOpen ? (heightTier === 'xs' ? "8px" : "16px") : 0,
          transition: "all 0.3s ease",
        }}
      >
        {/* Chat Container */}
        <Paper
          ref={chatContainerRef}
          elevation={8}
          sx={{
            width: sourcePanel.isOpen ? `${100 - sidebarWidth}%` : "100%",
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
            transition: isAnimating ? "none" : "width 0.3s ease",
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
          
          // Find Claude 3.5 Sonnet model from inference profiles
          const claudeModel = inferenceProfileSummaries.find(model => 
            model.inferenceProfileId.includes('claude-3-5-sonnet') || 
            (model.inferenceProfileName.toLowerCase().includes('claude') && model.inferenceProfileName.toLowerCase().includes('sonnet'))
          );
          
          if (claudeModel) {
            setSelectedModel(claudeModel);
          }
          
          // Show confirmation message
          setShowQuickConfigSnackbar(true);
        }}
        onOpenSettings={(e) => setDevSettingsAnchor(e.currentTarget)}
      />

      {/* Developer Settings Popup */}
      <Popover
        open={Boolean(devSettingsAnchor)}
        anchorEl={devSettingsAnchor}
        onClose={() => setDevSettingsAnchor(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: getResponsiveSpacing(heightTier, {
              xs: '16px',
              small: '20px',
              medium: '24px',
              large: '24px'
            }),
            padding: '0',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.15),
              0 1px 0 rgba(255, 255, 255, 0.9) inset,
              0 -1px 0 rgba(255, 255, 255, 0.3) inset,
              0 0 0 1px rgba(255, 255, 255, 0.1) inset
            `,
            border: '1px solid rgba(255, 255, 255, 0.4)',
            marginBottom: '8px',
            maxWidth: getResponsiveSpacing(heightTier, {
              xs: '95vw',
              small: '350px',
              medium: '400px',
              large: '420px'
            }),
            minWidth: getResponsiveSpacing(heightTier, {
              xs: '280px',
              small: '320px',
              medium: '360px',
              large: '380px'
            }),
            maxHeight: getResponsiveSpacing(heightTier, {
              xs: '90vh',
              small: '85vh',
              medium: '80vh',
              large: '80vh'
            }),
            position: 'relative',
            overflow: 'hidden',
          }
        }}
      >
        <Box 
          sx={{ 
            padding: '24px',
            maxHeight: '80vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.05)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(59, 130, 246, 0.3)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(59, 130, 246, 0.5)',
              },
            },
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <SettingsIcon sx={{ color: '#3b82f6', marginRight: '8px' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1e40af', 
                fontWeight: '600',
                fontSize: '1.1rem',
              }}
            >
              Developer Settings
            </Typography>
            {baseUrl && selectedModel && (
              <Typography
                variant="caption"
                sx={{
                  marginLeft: 'auto',
                  color: '#22c55e',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                ● Connected
              </Typography>
            )}
          </Box>

          {/* API Configuration */}
          <QAHeader
            setBaseUrl={setBaseUrl}
            baseUrl={baseUrl}
            inferenceProfileSummaries={inferenceProfileSummaries}
            setSelectedModel={handleChangeModel}
            selectedModel={selectedModel}
          />
          
          {/* Quick Setup Button */}
          <Box sx={{ marginTop: '16px' }}>
            <Button
              variant="contained"
              onClick={() => {
                const quickSetupUrl = "https://eogeslxp5e.execute-api.us-east-2.amazonaws.com/prod/";
                setBaseUrl(quickSetupUrl);
                
                // Find Claude 3.5 Sonnet model from inference profiles
                const claudeModel = inferenceProfileSummaries.find(model => 
                  model.inferenceProfileId.includes('claude-3-5-sonnet') || 
                  (model.inferenceProfileName.toLowerCase().includes('claude') && model.inferenceProfileName.toLowerCase().includes('sonnet'))
                );
                
                if (claudeModel) {
                  setSelectedModel(claudeModel);
                }
              }}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease',
                width: '100%',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              ⚡️ Quick Configure (Autofills preset API URL & Claude 3.5 Sonnet)
            </Button>
          </Box>

          {/* UI Settings */}
          <Box sx={{ marginTop: '20px' }}>
            <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>
              UI Settings
            </Typography>
            
            {/* Source Panel Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)', marginBottom: '12px' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                  📄 Source Documents Panel
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '12px' }}>
                  When you click on source links in chat responses, open them in a side panel instead of new browser tabs. Makes it easier to reference sources while continuing your conversation.
                </Typography>
              </Box>
              <Switch
                size="small"
                checked={enableSourcePanel}
                onChange={(e) => setEnableSourcePanel(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#3b82f6',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#93c5fd',
                  },
                }}
              />
            </Box>

            {/* Sidebar Slider Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(255, 193, 7, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 193, 7, 0.2)', marginBottom: '12px' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: '600', color: '#d97706', marginBottom: '4px' }}>
                  ↔️ Resizable Panel (Experimental)
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '12px' }}>
                  Add a draggable handle to resize the source panel width. Click and drag the thin line between panels to adjust. Note: Still in early stages, may lag or react unexpectedly when dragging over content.
                </Typography>
              </Box>
              <Switch
                size="small"
                checked={enableSidebarSlider}
                onChange={(e) => {
                  setEnableSidebarSlider(e.target.checked);
                  localStorage.setItem('enableSidebarSlider', JSON.stringify(e.target.checked));
                }}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#f59e0b',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#fbbf24',
                  },
                }}
              />
            </Box>

          </Box>

          {/* Web URL Configuration */}
          {hasWebDataSource && (
            <Box sx={{ marginTop: '20px' }}>
              <UrlSourcesForm
                exclusionFilters={sourceUrlInfo.exclusionFilters}
                inclusionFilters={sourceUrlInfo.inclusionFilters}
                seedUrlList={sourceUrlInfo.seedUrlList.map(
                  (urlObj) => urlObj.url
                )}
                handleUpdateUrls={handleUpdateUrls}
              />
            </Box>
          )}
        </Box>
      </Popover>

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
