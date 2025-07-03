import { useState, useCallback } from 'react';

export const useNotifications = () => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showQuickConfigSnackbar, setShowQuickConfigSnackbar] = useState(false);

  const handleCloseSnackbar = useCallback(() => {
    setShowSnackbar(false);
  }, []);

  const handleCloseQuickConfigSnackbar = useCallback(() => {
    setShowQuickConfigSnackbar(false);
  }, []);

  const showNewChatNotification = useCallback(() => {
    setShowSnackbar(true);
  }, []);

  const showQuickConfigNotification = useCallback(() => {
    setShowQuickConfigSnackbar(true);
  }, []);

  return {
    // State
    showSnackbar,
    showQuickConfigSnackbar,
    
    // Actions
    handleCloseSnackbar,
    handleCloseQuickConfigSnackbar,
    showNewChatNotification,
    showQuickConfigNotification
  };
};
