import React from 'react';
import { Box, Typography, IconButton, Fade, Backdrop } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShareIcon from '@mui/icons-material/Share';

const FullScreenSourceModal = ({ 
  isOpen, 
  onClose, 
  content, 
  url, 
  title = 'Source Content' 
}) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleShare = async () => {
    if (navigator.share && url) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (err) {
        // Fallback to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
        }
      }
    } else if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
    }
  };

  if (!isOpen) return null;

  return (
    <Backdrop
      open={isOpen}
      onClick={handleBackdropClick}
      sx={{
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Fade in={isOpen}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)',
              color: 'white',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '56px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: '600',
                fontSize: '1rem',
                flex: 1,
                marginRight: '16px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {url && (
                <>
                  <IconButton
                    onClick={handleShare}
                    sx={{
                      color: 'white',
                      padding: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      },
                    }}
                    title="Share"
                  >
                    <ShareIcon sx={{ fontSize: '20px' }} />
                  </IconButton>
                  
                  <IconButton
                    onClick={() => window.open(url, '_blank')}
                    sx={{
                      color: 'white',
                      padding: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      },
                    }}
                    title="Open in new tab"
                  >
                    <OpenInNewIcon sx={{ fontSize: '20px' }} />
                  </IconButton>
                </>
              )}
              
              <IconButton
                onClick={onClose}
                sx={{
                  color: 'white',
                  padding: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
                title="Close"
              >
                <CloseIcon sx={{ fontSize: '20px' }} />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background: 'linear-gradient(to bottom, #eff6ff, #ffffff)',
            }}
          >
            {url ? (
              <>
                {/* URL Display */}
                <Box sx={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '11px',
                      color: '#6b7280',
                      wordBreak: 'break-all',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      lineHeight: 1.3,
                    }}
                  >
                    {url}
                  </Typography>
                </Box>
                
                {/* Iframe */}
                <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <Box
                    component="iframe"
                    src={url}
                    sx={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      backgroundColor: 'white',
                    }}
                    onError={(e) => {
                      console.log("Iframe failed to load:", e);
                    }}
                  />
                </Box>
              </>
            ) : (
              /* Text Content */
              <Box 
                sx={{ 
                  padding: '16px', 
                  overflowY: 'auto',
                  flex: 1,
                  WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#374151',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {content}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Swipe indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              zIndex: 1,
            }}
          />
        </Box>
      </Fade>
    </Backdrop>
  );
};

export default FullScreenSourceModal;
