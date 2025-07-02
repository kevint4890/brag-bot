// API service for chat-related operations
export const chatApi = {
  // Send a question to the chat API
  async sendQuestion(baseUrl, { requestSessionId, question, inferenceProfileId }) {
    const response = await fetch(baseUrl + "docs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestSessionId,
        question,
        inferenceProfileId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get web source configuration
  async getWebSourceConfiguration(baseUrl) {
    const response = await fetch(baseUrl + "urls", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Update web URLs configuration
  async updateWebUrls(baseUrl, { urlList, exclusionFilters, inclusionFilters }) {
    const response = await fetch(baseUrl + "web-urls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urlList: [...new Set(urlList)],
        exclusionFilters: [...new Set(exclusionFilters)],
        inclusionFilters: [...new Set(inclusionFilters)],
      }),
    });
    
    return response.ok;
  },

  // Submit feedback (with fallback to localStorage)
  async submitFeedback(feedbackData) {
    try {
      // Try to submit to API endpoint
      const baseUrl = window.location.origin.includes('localhost') 
        ? 'https://eogeslxp5e.execute-api.us-east-2.amazonaws.com/prod/' 
        : window.location.origin + '/api/';
        
      const response = await fetch(baseUrl + 'feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (response.ok) {
        console.log('Feedback submitted successfully:', feedbackData);
        return true;
      }
    } catch (apiError) {
      console.log('API not available, logging feedback locally:', feedbackData);
    }
    
    // Fallback: Store feedback in localStorage
    const existingFeedback = JSON.parse(localStorage.getItem('chatFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('chatFeedback', JSON.stringify(existingFeedback));
    return true;
  },
};
