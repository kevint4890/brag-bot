import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Chat from "./components/chat/Chat";
import { useEffect, useRef } from "react";
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
import { useChat } from "./hooks/useChat";
import { useSettings } from "./hooks/useSettings";
import { useNotifications } from "./hooks/useNotifications";
import { useUIState } from "./hooks/useUIState";

const App = (props) => {
  // Custom hooks for state management
  const settings = useSettings();
  const chat = useChat(settings.baseUrl, settings.selectedModel, settings.sessionId, settings.setSessionId);
  const notifications = useNotifications();
  const ui = useUIState();
  
  const chatContainerRef = useRef(null);

  // Responsive layout detection
  const layout = useResponsiveLayout();
  const heightTier = useResponsiveHeight();

  // Reset sidebar width when slider is disabled
  useEffect(() => {
    ui.resetSidebarWidth(settings.enableSidebarSlider);
  }, [settings.enableSidebarSlider, ui.resetSidebarWidth]);


  // Event handlers that integrate with hooks
  const handleNewChatClick = (event) => {
    ui.handleNewChatClick(event);
  };

  const handleNewChatDoubleClick = (event) => {
    const shouldStartNewChat = ui.handleNewChatDoubleClick(event);
    if (shouldStartNewChat) {
      chat.clearHistory();
      notifications.showNewChatNotification();
    }
  };

  const handleConfirmNewChat = () => {
    const shouldStartNewChat = ui.handleConfirmNewChat();
    if (shouldStartNewChat) {
      chat.clearHistory();
    }
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
          maxWidth: (ui.sourcePanel.isOpen || ui.sourcePanelClosing) ? "95vw" : { xs: "95vw", sm: "90vw", md: "800px" },
          height: containerHeight,
          minHeight: heightTier === 'xs' ? "300px" : "400px",
          display: "flex",
          gap: (ui.sourcePanel.isOpen || ui.sourcePanelClosing) ? (heightTier === 'xs' ? "8px" : "16px") : 0,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Chat Container */}
        <Paper
          ref={chatContainerRef}
          elevation={8}
          sx={{
            width: (ui.sourcePanel.isOpen || ui.sourcePanelClosing) ? `${100 - ui.sidebarWidth}%` : "100%",
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
            hasHistory={chat.hasHistory}
            heightTier={heightTier}
          />

          {/* Chat Messages Area */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Chat 
              history={chat.history} 
              onOpenSourcePanel={settings.enableSourcePanel ? ui.handleOpenSourcePanel : null} 
            />
          </Box>

          <ChatInput
            question={chat.question}
            setQuestion={chat.setQuestion}
            onSendQuestion={chat.handleSendQuestion}
            onKeyDown={chat.handleKeyDown}
            disabled={chat.spinner}
            baseUrl={settings.baseUrl}
            heightTier={heightTier}
          />
        </Paper>

        {/* Resize Handle */}
        {ui.sourcePanel.isOpen && layout.shouldUseSidebar && settings.enableSidebarSlider && (
          <ResizeHandle
            onResize={ui.handleSidebarResize}
            isVisible={true}
          />
        )}

        <SourcePanel
          isOpen={ui.sourcePanel.isOpen}
          isClosing={ui.sourcePanelClosing}
          content={ui.sourcePanel.content}
          title={ui.sourcePanel.title}
          url={ui.sourcePanel.url}
          sidebarWidth={ui.sidebarWidth}
          onClose={ui.handleCloseSourcePanel}
          heightTier={heightTier}
        />
      </Box>

      <FloatingActionButtons
        onOpenSettings={(e) => ui.setDevSettingsAnchor(e.currentTarget)}
      />

      <SettingsPopover
        anchor={ui.devSettingsAnchor}
        onClose={() => ui.setDevSettingsAnchor(null)}
        baseUrl={settings.baseUrl}
        setBaseUrl={settings.setBaseUrl}
        inferenceProfileSummaries={inferenceProfileSummaries}
        selectedModel={settings.selectedModel}
        onChangeModel={settings.handleChangeModel}
        enableSourcePanel={settings.enableSourcePanel}
        setEnableSourcePanel={settings.setEnableSourcePanel}
        enableSidebarSlider={settings.enableSidebarSlider}
        setEnableSidebarSlider={settings.setEnableSidebarSlider}
        hasWebDataSource={settings.hasWebDataSource}
        sourceUrlInfo={settings.sourceUrlInfo}
        handleUpdateUrls={settings.handleUpdateUrls}
        heightTier={heightTier}
      />

      <NewChatConfirmation
        anchor={ui.popoverAnchor}
        onConfirm={handleConfirmNewChat}
        onCancel={ui.handleCancelNewChat}
      />

      <NotificationSnackbars
        showSnackbar={notifications.showSnackbar}
        showQuickConfigSnackbar={notifications.showQuickConfigSnackbar}
        onCloseSnackbar={notifications.handleCloseSnackbar}
        onCloseQuickConfigSnackbar={notifications.handleCloseQuickConfigSnackbar}
      />

      {/* Full Screen Source Modal */}
      <FullScreenSourceModal
        isOpen={ui.fullScreenSource.isOpen}
        onClose={ui.handleCloseFullScreenSource}
        content={ui.fullScreenSource.content}
        url={ui.fullScreenSource.url}
        title={ui.fullScreenSource.title}
      />
    </Box>
  );
};

export default App;
