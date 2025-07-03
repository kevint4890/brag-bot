// Dedicated feedback API service - easy to replace with your coworker's implementation
export const feedbackApi = {
  // Submit feedback with fallback to localStorage
  async submitFeedback(feedbackData, baseUrl) {
    try {
      // Try multiple sources for the baseUrl
      // 1. Use the passed baseUrl parameter
      // 2. Try to get from localStorage directly
      const apiUrl = baseUrl || localStorage.getItem('baseUrl');
      
      if (apiUrl) {
        console.log('Using API URL:', apiUrl);
          
        const response = await fetch(apiUrl + 'feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });
        
        if (response.ok) {
          console.log('Feedback submitted successfully:', feedbackData);
          return { success: true, method: 'api' };
        }
      } else {
        // Fallback for when baseUrl is not provided
        console.log('No baseUrl provided, using fallback');
      }
    } catch (apiError) {
      console.log('API not available, logging feedback locally:', feedbackData);
    }
    
    // Fallback: Store feedback in localStorage
    const existingFeedback = JSON.parse(localStorage.getItem('chatFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('chatFeedback', JSON.stringify(existingFeedback));
    return { success: true, method: 'localStorage' };
  },

  // Get feedback history from localStorage (placeholder for future API integration)
  async getFeedbackHistory() {
    try {
      const feedback = JSON.parse(localStorage.getItem('chatFeedback') || '[]');
      return feedback;
    } catch (error) {
      console.error('Error retrieving feedback history:', error);
      return [];
    }
  },

  // Clear feedback history (useful for testing/development)
  async clearFeedbackHistory() {
    try {
      localStorage.removeItem('chatFeedback');
      return { success: true };
    } catch (error) {
      console.error('Error clearing feedback history:', error);
      return { success: false, error };
    }
  },

  // Configuration for feedback system (easy extension point)
  getConfig() {
    return {
      enableFeedback: true,
      enableDetailedFeedback: true,
      feedbackCategories: {
        positive: [
          { value: 'very_helpful', label: 'Very helpful' },
          { value: 'mostly_helpful', label: 'Mostly helpful' },
          { value: 'quick_accurate', label: 'Quick and accurate' },
          { value: 'well_explained', label: 'Well explained' },
          { value: 'other_positive', label: 'Other' }
        ],
        negative: [
          { value: 'completely_incorrect', label: 'Completely incorrect' },
          { value: 'partially_incorrect', label: 'Partially incorrect' },
          { value: 'irrelevant', label: 'Irrelevant to my question' },
          { value: 'unclear_confusing', label: 'Unclear or confusing' },
          { value: 'missing_information', label: 'Missing information' },
          { value: 'other_negative', label: 'Other' }
        ]
      }
    };
  }
};
