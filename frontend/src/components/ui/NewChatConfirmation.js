import React from 'react';
import PropTypes from 'prop-types';
import { Popover, Box, Typography, Button } from '@mui/material';

const NewChatConfirmation = ({ anchor, onConfirm, onCancel }) => {
  return (
    <Popover
      open={Boolean(anchor)}
      anchorEl={anchor}
      onClose={onCancel}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      sx={{
        '& .MuiPopover-paper': {
          borderRadius: '12px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          marginTop: '8px',
          maxWidth: '280px',
          position: 'relative',
        }
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '14px',
            fontSize: '13px',
            fontWeight: '600',
            lineHeight: 1.4,
          }}
        >
          Start a new chat? This will clear your current conversation.
        </Typography>
        <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button 
            onClick={onCancel}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: '8px',
              fontSize: '12px',
              padding: '6px 12px',
              minWidth: '60px',
              borderColor: 'rgba(59, 130, 246, 0.4)',
              color: '#3b82f6',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 4px rgba(59, 130, 246, 0.1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                borderColor: '#3b82f6',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            size="small"
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '8px',
              fontSize: '12px',
              padding: '6px 12px',
              minWidth: '60px',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 3px 12px rgba(59, 130, 246, 0.4)',
              }
            }}
          >
            Start New Chat
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

NewChatConfirmation.propTypes = {
  anchor: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default NewChatConfirmation;
