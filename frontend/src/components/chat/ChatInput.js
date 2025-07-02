import React from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getResponsiveSpacing } from '../../hooks/useResponsiveHeight';

const ChatInput = ({ 
  question, 
  setQuestion, 
  onSendQuestion, 
  onKeyDown,
  disabled, 
  baseUrl,
  heightTier 
}) => {
  return (
    <Box
      sx={{
        padding: getResponsiveSpacing(heightTier, {
          xs: "8px 12px",
          small: "10px 16px",
          medium: "14px 20px",
          large: "16px 24px"
        }),
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        borderTop: "1px solid rgba(59, 130, 246, 0.1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: getResponsiveSpacing(heightTier, {
            xs: "8px",
            small: "10px",
            medium: "12px",
            large: "12px"
          }),
          backgroundColor: "white",
          borderRadius: heightTier === 'xs' ? "20px" : "25px",
          padding: getResponsiveSpacing(heightTier, {
            xs: "6px 12px",
            small: "7px 14px",
            medium: "8px 16px",
            large: "8px 16px"
          }),
          boxShadow: "0 2px 12px rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
        }}
      >
        <TextField
          disabled={disabled}
          variant="standard"
          placeholder={baseUrl ? "Type your message..." : "Please configure API settings first"}
          value={question}
          onChange={(e) => setQuestion(e.target?.value)}
          onKeyDown={onKeyDown}
          multiline
          maxRows={heightTier === 'xs' ? 2 : 4}
          sx={{
            flex: 1,
            "& .MuiInput-underline:before": { display: "none" },
            "& .MuiInput-underline:after": { display: "none" },
            "& .MuiInputBase-input": {
              padding: getResponsiveSpacing(heightTier, {
                xs: "6px 0",
                small: "7px 0",
                medium: "8px 0",
                large: "8px 0"
              }),
              fontSize: getResponsiveSpacing(heightTier, {
                xs: "14px",
                small: "14px",
                medium: "15px",
                large: "15px"
              }),
              color: "#374151",
              "&::placeholder": {
                color: "#9ca3af",
                opacity: 0.8,
              },
            },
          }}
        />
        <IconButton
          disabled={disabled || !baseUrl || !question.trim()}
          onClick={onSendQuestion}
          sx={{
            backgroundColor: baseUrl && question.trim() ? "#3b82f6" : "rgba(0, 0, 0, 0.1)",
            color: "white",
            width: getResponsiveSpacing(heightTier, {
              xs: "32px",
              small: "34px",
              medium: "36px",
              large: "36px"
            }),
            height: getResponsiveSpacing(heightTier, {
              xs: "32px",
              small: "34px",
              medium: "36px",
              large: "36px"
            }),
            minWidth: getResponsiveSpacing(heightTier, {
              xs: "32px",
              small: "34px",
              medium: "36px",
              large: "36px"
            }),
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: baseUrl && question.trim() ? "#1d4ed8" : "rgba(0, 0, 0, 0.2)",
              transform: baseUrl && question.trim() ? "scale(1.05)" : "none",
              boxShadow: baseUrl && question.trim() ? "0 4px 12px rgba(59, 130, 246, 0.4)" : "none",
            },
            "&:disabled": {
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              color: "rgba(0, 0, 0, 0.3)",
            },
            "&:active": {
              transform: baseUrl && question.trim() ? "scale(0.95)" : "none",
            },
          }}
        >
          <SendIcon sx={{ fontSize: heightTier === 'xs' ? '18px' : '20px' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

ChatInput.propTypes = {
  question: PropTypes.string.isRequired,
  setQuestion: PropTypes.func.isRequired,
  onSendQuestion: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  baseUrl: PropTypes.string,
  heightTier: PropTypes.oneOf(['xs', 'small', 'medium', 'large']).isRequired
};

export default ChatInput;
