import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getResponsiveSpacing } from '../../hooks/useResponsiveHeight';

const ChatHeader = ({ onNewChat, onNewChatDoubleClick, hasHistory, heightTier }) => {
  return (
    <Box
      sx={{
        background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
        color: "white",
        padding: getResponsiveSpacing(heightTier, {
          xs: "8px 12px",
          small: "10px 16px", 
          medium: "14px 20px",
          large: "16px 24px"
        }),
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.1) 50%, transparent 100%)",
          animation: "shimmer 3s ease-in-out infinite",
        },
        "@keyframes shimmer": {
          "0%, 100%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(100%)" },
        },
      }}
    >
      <Box
        component="img"
        src="/chat-bubble-logo.png"
        alt="Chat"
        sx={{
          height: getResponsiveSpacing(heightTier, {
            xs: "18px",
            small: "20px",
            medium: "22px", 
            large: "24px"
          }),
          width: "auto",
          zIndex: 1,
          filter: "brightness(0) invert(1)",
          opacity: 0.9,
        }}
      />
      <Button
        disabled={!hasHistory}
        startIcon={<AddIcon sx={{ fontSize: heightTier === 'xs' ? '16px' : '20px' }} />}
        onClick={onNewChat}
        onDoubleClick={onNewChatDoubleClick}
        sx={{
          color: "white",
          borderColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 1,
          fontSize: heightTier === 'xs' ? '12px' : '14px',
          padding: heightTier === 'xs' ? '4px 8px' : '6px 16px',
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "white",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 8px rgba(255, 255, 255, 0.2)",
          },
          "&:disabled": {
            borderColor: "rgba(255, 255, 255, 0.3)",
            color: "rgba(255, 255, 255, 0.5)",
          },
        }}
        variant="outlined"
        size="small"
      >
        New Chat
      </Button>
    </Box>
  );
};

ChatHeader.propTypes = {
  onNewChat: PropTypes.func.isRequired,
  onNewChatDoubleClick: PropTypes.func.isRequired,
  hasHistory: PropTypes.bool.isRequired,
  heightTier: PropTypes.oneOf(['xs', 'small', 'medium', 'large']).isRequired
};

export default ChatHeader;
