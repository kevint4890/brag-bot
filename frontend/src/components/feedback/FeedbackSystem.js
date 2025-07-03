import React from 'react';
import {
  Box,
  IconButton,
  Collapse,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Standalone feedback component - easy to replace with other implementation
const FeedbackSystem = ({ 
  messageIndex, 
  message, 
  feedbackHook,
  boxRef // For scrolling to feedback form
}) => {
  const {
    feedbackStates,
    detailedFeedback,
    feedbackSubmitting,
    closingFeedback,
    handleFeedbackClick,
    handleDetailedFeedbackChange,
    submitDetailedFeedback,
    scrollToFeedbackForm,
    getFeedbackOptions,
    isFeedbackEnabled
  } = feedbackHook;

  // Don't render if feedback is disabled
  if (!isFeedbackEnabled()) {
    return null;
  }

  const handleFeedbackClickWithScroll = (index, type) => {
    handleFeedbackClick(index, type);
    
    // Scroll to feedback form if showing detailed feedback
    if (!feedbackStates[index] || feedbackStates[index] !== type) {
      scrollToFeedbackForm(index, boxRef);
    }
  };

  const handleSubmitFeedback = async (index) => {
    await submitDetailedFeedback(index, message);
  };

  return (
    <Box>
      {/* Feedback Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: '6px', 
        marginTop: '4px',
        alignSelf: 'flex-start' 
      }}>
        <IconButton 
          size="small" 
          sx={{
            color: '#6b7280',
            padding: '3px',
            minWidth: '24px',
            width: '24px',
            height: '24px',
            '&[data-selected="true"]': {
              color: '#3b82f6',
            },
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            }
          }}
          onClick={() => handleFeedbackClickWithScroll(messageIndex, 'up')}
          data-selected={feedbackStates[messageIndex] === 'up'}
        >
          <ThumbUpIcon sx={{ fontSize: '16px' }} />
        </IconButton>
        <IconButton 
          size="small" 
          sx={{
            color: '#6b7280',
            padding: '3px',
            minWidth: '24px',
            width: '24px',
            height: '24px',
            '&[data-selected="true"]': {
              color: '#ef4444',
            },
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }
          }}
          onClick={() => handleFeedbackClickWithScroll(messageIndex, 'down')}
          data-selected={feedbackStates[messageIndex] === 'down'}
        >
          <ThumbDownIcon sx={{ fontSize: '16px' }} />
        </IconButton>
      </Box>

      {/* Detailed Feedback Section */}
      <Collapse in={detailedFeedback[messageIndex]?.showDetailed && !detailedFeedback[messageIndex]?.submitted && !closingFeedback[messageIndex]}>
        <Box 
          data-feedback-index={messageIndex}
          sx={{ 
            marginTop: '8px',
            padding: '12px',
            backgroundColor: 'rgba(248, 250, 252, 0.8)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            maxWidth: '350px'
          }}
        >
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel 
              component="legend" 
              sx={{ 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}
            >
              {feedbackStates[messageIndex] === 'up' ? 'What made this helpful?' : 'What was the issue?'}
            </FormLabel>
            <RadioGroup
              value={detailedFeedback[messageIndex]?.category || ''}
              onChange={(e) => handleDetailedFeedbackChange(messageIndex, 'category', e.target.value)}
              sx={{ gap: '2px' }}
            >
              {getFeedbackOptions(feedbackStates[messageIndex]).map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={
                    <Radio 
                      size="small" 
                      sx={{ 
                        color: '#9ca3af',
                        padding: '4px',
                        '&.Mui-checked': {
                          color: feedbackStates[messageIndex] === 'up' ? '#3b82f6' : '#ef4444'
                        }
                      }} 
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '12px', color: '#4b5563' }}>
                      {option.label}
                    </Typography>
                  }
                  sx={{ margin: '1px 0', minHeight: '28px' }}
                />
              ))}
            </RadioGroup>

            {/* Optional Comment Field */}
            {(detailedFeedback[messageIndex]?.category?.includes('other') || detailedFeedback[messageIndex]?.category) && (
              <TextField
                multiline
                rows={2}
                placeholder="Additional comments (optional)"
                value={detailedFeedback[messageIndex]?.comment || ''}
                onChange={(e) => handleDetailedFeedbackChange(messageIndex, 'comment', e.target.value)}
                sx={{
                  marginTop: '8px',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '12px',
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(59, 130, 246, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  }
                }}
              />
            )}

            {/* Submit Button */}
            <Box sx={{ display: 'flex', gap: '6px', marginTop: '12px', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={() => handleDetailedFeedbackChange(messageIndex, 'showDetailed', false)}
                sx={{
                  color: '#6b7280',
                  fontSize: '11px',
                  textTransform: 'none',
                  minWidth: 'auto',
                  padding: '3px 6px'
                }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!detailedFeedback[messageIndex]?.category || feedbackSubmitting[messageIndex]}
                onClick={() => handleSubmitFeedback(messageIndex)}
                startIcon={
                  feedbackSubmitting[messageIndex] ? 
                    <CircularProgress size={10} color="inherit" /> : 
                    <SendIcon sx={{ fontSize: '12px' }} />
                }
                sx={{
                  backgroundColor: feedbackStates[messageIndex] === 'up' ? '#3b82f6' : '#ef4444',
                  fontSize: '11px',
                  textTransform: 'none',
                  minWidth: 'auto',
                  padding: '4px 8px',
                  '&:hover': {
                    backgroundColor: feedbackStates[messageIndex] === 'up' ? '#1d4ed8' : '#dc2626',
                  },
                  '&:disabled': {
                    backgroundColor: '#9ca3af',
                  }
                }}
              >
                Submit
              </Button>
            </Box>
          </FormControl>
        </Box>
      </Collapse>

      {/* Feedback Submitted Confirmation */}
      <Collapse in={detailedFeedback[messageIndex]?.submitted}>
        <Box sx={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          maxWidth: '250px'
        }}>
          <CheckCircleIcon sx={{ fontSize: '14px', color: '#3b82f6' }} />
          <Typography sx={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '500' }}>
            Thank you for your feedback!
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export default FeedbackSystem;
