import { useState, useCallback } from 'react';
import { useResponsiveLayout } from './useResponsiveHeight';

export const useUIState = () => {
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [devSettingsAnchor, setDevSettingsAnchor] = useState(null);
  const [sourcePanel, setSourcePanel] = useState({ isOpen: false, content: null, title: null });
  const [sourcePanelClosing, setSourcePanelClosing] = useState(false);
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

  const layout = useResponsiveLayout();
  const sourceBehavior = 'smart'; // Default behavior for source handling

  // Reset sidebar to default size when slider is disabled
  const resetSidebarWidth = useCallback((enableSidebarSlider) => {
    if (!enableSidebarSlider) {
      setSidebarWidth(55); // Reset to default 55%
      localStorage.setItem('sidebarWidth', '55');
    }
  }, []);

  const handleNewChatClick = useCallback((event) => {
    // Show popover immediately on single click
    setPopoverAnchor(event.currentTarget);
  }, []);

  const handleNewChatDoubleClick = useCallback((event) => {
    // Double-click: immediately start new chat and close any open popover
    event.preventDefault();
    setPopoverAnchor(null);
    return true; // Signal that new chat should be started
  }, []);

  const handleConfirmNewChat = useCallback(() => {
    setPopoverAnchor(null);
    return true; // Signal that new chat should be started
  }, []);

  const handleCancelNewChat = useCallback(() => {
    setPopoverAnchor(null);
  }, []);

  // Smart source handling based on screen size and user preference
  const handleOpenSourcePanel = useCallback((citation) => {
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
  }, [layout.shouldUseSidebar, sourceBehavior]);

  const handleCloseSourcePanel = useCallback(() => {
    // Start the closing animation
    setSourcePanelClosing(true);
    
    // After animation completes, actually close the panel
    setTimeout(() => {
      setSourcePanel({ isOpen: false, content: null, title: null });
      setSourcePanelClosing(false);
    }, 300); // Match animation duration
  }, []);

  const handleCloseFullScreenSource = useCallback(() => {
    setFullScreenSource({ isOpen: false, content: null, url: null, title: null });
  }, []);

  // Handle sidebar resizing
  const handleSidebarResize = useCallback((deltaPercent) => {
    const newWidth = Math.max(20, Math.min(70, sidebarWidth + deltaPercent));
    setSidebarWidth(newWidth);
    localStorage.setItem('sidebarWidth', newWidth.toString());
  }, [sidebarWidth]);

  return {
    // State
    popoverAnchor,
    devSettingsAnchor,
    sourcePanel,
    sourcePanelClosing,
    sidebarWidth,
    fullScreenSource,
    
    // Actions
    setDevSettingsAnchor,
    handleNewChatClick,
    handleNewChatDoubleClick,
    handleConfirmNewChat,
    handleCancelNewChat,
    handleOpenSourcePanel,
    handleCloseSourcePanel,
    handleCloseFullScreenSource,
    handleSidebarResize,
    resetSidebarWidth
  };
};
