import { useState } from 'react';
import { feedbackApi } from '../services/feedbackApi';

// Dedicated feedback hook - easy to replace with your coworker's implementation
export const useFeedback = () => {
  const [feedbackStates, setFeedbackStates] = useState({});
  const [detailedFeedback, setDetailedFeedback] = useState({});
  const [feedbackSubmitting, setFeedbackSubmitting] = useState({});
  const [closingFeedback, setClosingFeedback] = useState({});

  // Get feedback configuration
  const config = feedbackApi.getConfig();

  const handleFeedbackClick = (index, type) => {
    const currentState = feedbackStates[index];
    const newState = currentState === type ? null : type;
    
    // If we're unclicking (removing feedback), handle the transition properly
    if (currentState === type && detailedFeedback[index]?.showDetailed) {
      // Mark this feedback as closing to prevent conflicts
      setClosingFeedback(prev => ({
        ...prev,
        [index]: true
      }));
      
      // First hide the detailed feedback menu
      setDetailedFeedback(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          showDetailed: false
        }
      }));
      
      // Wait for the Collapse animation to complete (Material-UI default is 300ms)
      setTimeout(() => {
        // Clear the feedback state
        setFeedbackStates(prev => ({
          ...prev,
          [index]: null
        }));
        
        // Clear detailed feedback completely
        setDetailedFeedback(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
        
        // Clear the closing state
        setClosingFeedback(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      }, 350); // Slightly longer than Material-UI's default 300ms to ensure completion
      
      return;
    }
    
    // Normal feedback selection (not unclicking)
    setFeedbackStates(prev => ({
      ...prev,
      [index]: newState
    }));

    // Initialize detailed feedback state if feedback is being given
    if (newState) {
      setDetailedFeedback(prev => ({
        ...prev,
        [index]: {
          type: newState,
          category: '',
          comment: '',
          showDetailed: true,
          submitted: false
        }
      }));
    }
  };

  const handleDetailedFeedbackChange = (index, field, value) => {
    setDetailedFeedback(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  const submitDetailedFeedback = async (index, message) => {
    const feedback = detailedFeedback[index];
    
    if (!feedback.category) return;

    setFeedbackSubmitting(prev => ({ ...prev, [index]: true }));

    try {
      const feedbackData = {
        messageIndex: index,
        question: message.question,
        response: message.response,
        feedbackType: feedback.type,
        category: feedback.category,
        comment: feedback.comment,
        timestamp: new Date().toISOString(),
        sessionId: message.sessionId || 'unknown'
      };

      // Submit feedback using the dedicated API service
      await feedbackApi.submitFeedback(feedbackData);

      // Mark as submitted
      setDetailedFeedback(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          submitted: true,
          showDetailed: false
        }
      }));

      // Auto-hide after 3 seconds
      setTimeout(() => {
        setDetailedFeedback(prev => {
          const newState = { ...prev };
          if (newState[index]) {
            newState[index].submitted = false;
          }
          return newState;
        });
      }, 3000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setFeedbackSubmitting(prev => ({ ...prev, [index]: false }));
    }
  };

  // Scroll to feedback form helper (for better UX)
  const scrollToFeedbackForm = (index, boxRef) => {
    setTimeout(() => {
      if (boxRef.current) {
        const feedbackElement = document.querySelector(`[data-feedback-index="${index}"]`);
        if (feedbackElement) {
          // Calculate the position to ensure the entire feedback form is visible
          const containerRect = boxRef.current.getBoundingClientRect();
          const elementRect = feedbackElement.getBoundingClientRect();
          const containerScrollTop = boxRef.current.scrollTop;
          
          // Check if the feedback form extends below the visible area
          if (elementRect.bottom > containerRect.bottom) {
            const scrollOffset = elementRect.bottom - containerRect.bottom + 20; // 20px padding
            boxRef.current.scrollTo({
              top: containerScrollTop + scrollOffset,
              behavior: 'smooth'
            });
          }
        }
      }
    }, 350); // Wait for Collapse animation to complete
  };

  // Get feedback categories for a specific type
  const getFeedbackOptions = (type) => {
    return type === 'up' ? config.feedbackCategories.positive : config.feedbackCategories.negative;
  };

  // Check if feedback is enabled
  const isFeedbackEnabled = () => {
    return config.enableFeedback;
  };

  // Get feedback history (for debugging/admin purposes)
  const getFeedbackHistory = async () => {
    return await feedbackApi.getFeedbackHistory();
  };

  // Clear feedback history (for testing/development)
  const clearFeedbackHistory = async () => {
    return await feedbackApi.clearFeedbackHistory();
  };

  return {
    // State
    feedbackStates,
    detailedFeedback,
    feedbackSubmitting,
    closingFeedback,
    
    // Actions
    handleFeedbackClick,
    handleDetailedFeedbackChange,
    submitDetailedFeedback,
    scrollToFeedbackForm,
    
    // Utilities
    getFeedbackOptions,
    isFeedbackEnabled,
    getFeedbackHistory,
    clearFeedbackHistory,
    
    // Configuration
    config
  };
};
