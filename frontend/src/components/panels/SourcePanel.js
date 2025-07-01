import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Box, Typography, IconButton } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';

const SourcePanel = ({ 
  isOpen, 
  content, 
  title, 
  url, 
  sidebarWidth, 
  onClose,
  heightTier 
}) => {
  if (!isOpen) return null;

  return (
    <Paper
      elevation={6}
      sx={{
        width: `${sidebarWidth}%`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: { xs: "16px", sm: "20px" },
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(59, 130, 246, 0.1)",
        flex: "none",
        zIndex: 0,
        animation: "slideIn 0.3s ease-out",
        "@keyframes slideIn": {
          "0%": { 
            transform: "translateX(100%)",
            opacity: 0
          },
          "100%": { 
            transform: "translateX(0)",
            opacity: 1
          },
        },
      }}
    >
      {/* Source Panel Header */}
      <Box
        sx={{
          background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
          color: "white",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: "600",
            fontSize: "1.1rem",
            letterSpacing: "-0.01em",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {url && (
            <IconButton
              onClick={() => window.open(url, '_blank')}
              sx={{
                color: "white",
                padding: "8px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  transform: "scale(1.05)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
              title={`Open ${url} in new tab`}
            >
              <OpenInNewIcon sx={{ fontSize: "18px" }} />
            </IconButton>
          )}
          <IconButton
            onClick={onClose}
            sx={{
              color: "white",
              padding: "8px",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                transform: "scale(1.05)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
            title="Close source panel"
          >
            <CloseIcon sx={{ fontSize: "18px" }} />
          </IconButton>
        </Box>
      </Box>

      {/* Source Panel Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "linear-gradient(to bottom, #eff6ff, #ffffff)",
        }}
      >
        {url ? (
          <>
            {/* URL Display */}
            <Box sx={{ padding: "16px 24px", borderBottom: "1px solid rgba(0, 0, 0, 0.1)" }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "12px",
                  color: "#6b7280",
                  wordBreak: "break-all",
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                }}
              >
                {url}
              </Typography>
            </Box>
            {/* Iframe */}
            <Box sx={{ flex: 1, position: "relative" }}>
              <Box
                component="iframe"
                src={url}
                sx={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  backgroundColor: "white",
                }}
                onError={(e) => {
                  console.log("Iframe failed to load:", e);
                }}
              />
            </Box>
          </>
        ) : (
          /* Text Content */
          <Box sx={{ padding: "24px", overflowY: "auto" }}>
            <Typography
              variant="body1"
              sx={{
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#374151",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {content}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

SourcePanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  content: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,
  sidebarWidth: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  heightTier: PropTypes.oneOf(['xs', 'small', 'medium', 'large'])
};

SourcePanel.defaultProps = {
  content: null,
  title: 'Source Content',
  url: null,
  heightTier: 'medium'
};

export default SourcePanel;
