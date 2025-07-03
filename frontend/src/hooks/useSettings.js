import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../services/chatApi';

export const useSettings = () => {
  const [selectedModel, setSelectedModel] = useState(undefined);
  const [baseUrl, setBaseUrl] = useState(() => {
    const saved = localStorage.getItem('baseUrl');
    return saved || undefined;
  });
  const [sessionId, setSessionId] = useState(() => {
    const saved = sessionStorage.getItem('session_id');
    return saved || undefined;
  });
  const [sourceUrlInfo, setSourceUrlInfo] = useState({
    exclusionFilters: [],
    inclusionFilters: [],
    seedUrlList: [],
  });
  const [hasWebDataSource, setHasWebDataSource] = useState(false);
  const [enableSourcePanel, setEnableSourcePanel] = useState(true);
  const [enableSidebarSlider, setEnableSidebarSlider] = useState(() => {
    const saved = localStorage.getItem('enableSidebarSlider');
    return saved ? JSON.parse(saved) : false;
  });

  // Wrapped setBaseUrl that updates localStorage
  const setBaseUrlWithStorage = useCallback((url) => {
    setBaseUrl(url);
    if (url) {
      localStorage.setItem('baseUrl', url);
      console.log('baseUrl saved to localStorage:', url);
    }
  }, []);

  // Save baseUrl to localStorage when it changes
  useEffect(() => {
    if (baseUrl) {
      localStorage.setItem('baseUrl', baseUrl);
    }
  }, [baseUrl]);
  
  // Save sessionId to sessionStorage when it changes
  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('session_id', sessionId);
    }
  }, [sessionId]);

  // Fetch web source configuration when baseUrl changes
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

  const handleChangeModel = useCallback((model) => {
    setSelectedModel(model);
    setSessionId(undefined);
  }, []);

  const handleUpdateUrls = useCallback(async (
    urls,
    newExclusionFilters,
    newInclusionFilters
  ) => {
    return await chatApi.updateWebUrls(baseUrl, {
      urlList: urls,
      exclusionFilters: newExclusionFilters,
      inclusionFilters: newInclusionFilters,
    });
  }, [baseUrl]);

  return {
    // State
    selectedModel,
    baseUrl,
    sessionId,
    sourceUrlInfo,
    hasWebDataSource,
    enableSourcePanel,
    enableSidebarSlider,
    
    // Actions
    setSelectedModel,
    setBaseUrl: setBaseUrlWithStorage,
    setSessionId,
    setEnableSourcePanel,
    setEnableSidebarSlider,
    handleChangeModel,
    handleUpdateUrls
  };
};
