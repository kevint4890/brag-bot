import { useState, useEffect } from 'react';

export const useResponsiveHeight = () => {
  const [heightTier, setHeightTier] = useState('large');

  useEffect(() => {
    const updateHeightTier = () => {
      const height = window.innerHeight;
      if (height < 500) {
        setHeightTier('xs');
      } else if (height < 650) {
        setHeightTier('small');
      } else if (height < 800) {
        setHeightTier('medium');
      } else {
        setHeightTier('large');
      }
    };

    updateHeightTier();
    window.addEventListener('resize', updateHeightTier);
    
    return () => window.removeEventListener('resize', updateHeightTier);
  }, []);

  return heightTier;
};

// New hook for comprehensive responsive detection
export const useResponsiveLayout = () => {
  const [layout, setLayout] = useState({
    heightTier: 'large',
    widthTier: 'large',
    isMobile: false,
    shouldUseSidebar: true
  });

  useEffect(() => {
    const updateLayout = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;
      
      // Height tiers
      let heightTier = 'large';
      if (height < 500) {
        heightTier = 'xs';
      } else if (height < 650) {
        heightTier = 'small';
      } else if (height < 800) {
        heightTier = 'medium';
      }

      // Width tiers
      let widthTier = 'large';
      let isMobile = false;
      let shouldUseSidebar = true;

      if (width < 600) {
        widthTier = 'xs';
        isMobile = true;
        shouldUseSidebar = false;
      } else if (width < 768) {
        widthTier = 'small';
        isMobile = true;
        shouldUseSidebar = false;
      } else if (width < 1024) {
        widthTier = 'medium';
        shouldUseSidebar = true;
      }

      setLayout({
        heightTier,
        widthTier,
        isMobile,
        shouldUseSidebar
      });
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return layout;
};

// Helper function to determine if sidebar should be used based on available space
export const shouldUseSidebarForWidth = (screenWidth, sidebarWidthPercent = 40) => {
  const availableWidth = screenWidth * (sidebarWidthPercent / 100);
  return screenWidth >= 768 && availableWidth >= 300;
};

// Helper function to get responsive spacing based on height tier
export const getResponsiveSpacing = (heightTier, spacingMap) => {
  return spacingMap[heightTier] || spacingMap.large || spacingMap.medium || spacingMap.small || spacingMap.xs;
};

// Helper function to get responsive values based on width tier
export const getResponsiveWidth = (widthTier, valueMap) => {
  return valueMap[widthTier] || valueMap.large || valueMap.medium || valueMap.small || valueMap.xs;
};
