import { useState, useCallback } from 'react';
import { chatApi } from '../services/chatApi';

export const useChat = (baseUrl, selectedModel, sessionId, setSessionId) => {
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [spinner, setSpinner] = useState(false);

  const handleSendQuestion = useCallback(async () => {
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
  }, [question, history, baseUrl, sessionId, selectedModel, setSessionId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  }, [handleSendQuestion]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    // State
    history,
    question,
    spinner,
    
    // Actions
    setQuestion,
    handleSendQuestion,
    handleKeyDown,
    clearHistory,
    
    // Computed
    hasHistory: history.length > 0
  };
};
