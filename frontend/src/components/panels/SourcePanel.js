import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Box, Typography, IconButton } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import { getResponsiveSpacing } from '../../hooks/useResponsiveHeight';

const SourcePanel = ({ 
  isOpen, 
  content, 
  title, 
  url, 
  sidebarWidth, 
  onClose,
  heightTier,
  isClosing = false
}) => {
  const handleOpenUrl = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (!isOpen && !isClosing) return null;

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
        animation: isClosing 
          ? "slideOutToRight 0.3s ease-in forwards" 
          : "slideInFromRight 0.3s ease-out",
      }}
    >
      {/* Source Panel Header */}
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
          minHeight: getResponsiveSpacing(heightTier, {
            xs: "42px", // 8px + 8px padding + 18px image + 8px extra
            small: "48px", // 10px + 10px padding + 20px image + 8px extra
            medium: "58px", // 14px + 14px padding + 22px image + 8px extra
            large: "64px" // 16px + 16px padding + 24px image + 8px extra
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
        <Box sx={{ flex: 1, minWidth: 0, zIndex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: "600",
              fontSize: getResponsiveSpacing(heightTier, {
                xs: "0.9rem",
                small: "1rem",
                medium: "1.1rem",
                large: "1.1rem"
              }),
              letterSpacing: "-0.01em",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              flexShrink: 0,
            }}
          >
            {title}
          </Typography>
          {url && (
            <Typography
              variant="body2"
              onClick={handleOpenUrl}
              sx={{
                fontSize: getResponsiveSpacing(heightTier, {
                  xs: "10px",
                  small: "11px",
                  medium: "12px",
                  large: "12px"
                }),
                opacity: 0.9,
                fontFamily: "monospace",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
                "&:hover": {
                  opacity: 1,
                  textDecoration: "underline",
                },
              }}
              title={`Click to open: ${url}`}
            >
              {url}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "8px", zIndex: 1 }}>
          {url && (
            <IconButton
              onClick={() => window.open(url, '_blank')}
              sx={{
                color: "white",
                padding: heightTier === 'xs' ? "6px" : "8px",
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
              <OpenInNewIcon sx={{ fontSize: heightTier === 'xs' ? '16px' : '18px' }} />
            </IconButton>
          )}
          <IconButton
            onClick={onClose}
            sx={{
              color: "white",
              padding: heightTier === 'xs' ? "6px" : "8px",
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
            <CloseIcon sx={{ fontSize: heightTier === 'xs' ? '16px' : '18px' }} />
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
          /* Iframe */
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
  isClosing: PropTypes.bool,
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
