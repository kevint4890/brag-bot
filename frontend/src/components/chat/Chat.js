import {
  Box,
  Typography,
  Avatar,
  Chip,
  Grow,
  Paper,
  Collapse,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import LinkIcon from "@mui/icons-material/Link";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import '../../animations.css';
import { useResponsiveHeight, getResponsiveSpacing } from "../../hooks/useResponsiveHeight";
import FeedbackSystem from "../feedback/FeedbackSystem";
import { useFeedback } from "../../hooks/useFeedback";

const TypingIndicator = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Box className="typing-dots" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </Box>
    <Typography 
      variant="caption" 
      sx={{ 
        color: '#9ca3af', 
        fontSize: '12px',
        fontStyle: 'italic',
        opacity: 0.8
      }}
    >
      AI is thinking...
    </Typography>
  </Box>
);

const Chat = (props) => {
  const history = props.history;
  const onOpenSourcePanel = props.onOpenSourcePanel;
  const boxRef = useRef(null);
  const [expandedErrors, setExpandedErrors] = useState({});

  // Initialize feedback hook
  const feedbackHook = useFeedback();

  // Responsive height detection
  const heightTier = useResponsiveHeight();
  
  // Format timestamp to 12-hour format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  // Get or generate timestamp for message
  const getMessageTimestamp = (msg, index) => {
    // If message already has timestamp, use it
    if (msg.timestamp) {
      return formatTimestamp(msg.timestamp);
    }
    
    // Generate timestamp based on current time minus some offset for older messages
    const now = new Date();
    const offsetMinutes = (history.length - index - 1) * 2; // 2 minutes between messages
    const messageTime = new Date(now.getTime() - (offsetMinutes * 60 * 1000));
    return formatTimestamp(messageTime);
  };

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [history]);

  // Helper functions for error handling
  const isModelError = (response) => {
    return response && response.includes("Error generating an answer. Please check your browser console, WAF configuration, Bedrock model access, and Lambda logs for debugging the error.");
  };

  const isServerError = (response) => {
    return response && response.includes("Server side error: please check function logs");
  };

  const handleErrorToggle = (index) => {
    setExpandedErrors(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };


  const formatCitation = (citation) => {
    if (!citation) return null;
    
    // Try to extract URL from citation if it contains one
    const urlMatch = citation.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      return urlMatch[0];
    }
    return citation;
  };

  return (
    <Box
      ref={boxRef}
      sx={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        padding: getResponsiveSpacing(heightTier, {
          xs: "12px",
          small: "16px",
          medium: "20px",
          large: "24px"
        }),
        background: "linear-gradient(to bottom, #eff6ff, #ffffff)",
        display: "flex",
        flexDirection: "column",
        scrollBehavior: "smooth",
        flex: 1,
        minHeight: 0,
        maxHeight: "100%",
        boxSizing: "border-box",
      }}
    >
      {history?.length > 0 ? (
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: getResponsiveSpacing(heightTier, {
            xs: "12px",
            small: "16px",
            medium: "20px",
            large: "24px"
          })
        }}>
          {history?.map((msg, index) => (
            <Grow 
              in={true} 
              timeout={600} 
              style={{ transformOrigin: '0 0 0' }}
              key={index}
            >
              <Box
                sx={{
                  animation: `messageSlide 0.5s ease-out ${index * 0.1}s both`,
                  "@keyframes messageSlide": {
                    "0%": { 
                      transform: "translateY(20px)", 
                      opacity: 0 
                    },
                    "100%": { 
                      transform: "translateY(0)", 
                      opacity: 1 
                    },
                  },
                }}
              >
                {/* User Message */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                    gap: "12px",
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        fontWeight: "500",
                      }}
                    >
                      {getMessageTimestamp(msg, index)}
                    </Typography>
                    <Box
                      sx={{
                        maxWidth: "60%",
                        minWidth: "fit-content",
                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        color: "white",
                        borderRadius: "18px 18px 4px 18px",
                        padding: "12px 16px",
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                        position: "relative",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: "15px",
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          hyphens: "none",
                          fontWeight: "400",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.question}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* AI Response */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: "#fbbf24",
                      color: "white",
                      fontSize: "14px",
                      marginTop: "4px",
                      boxShadow: "0 2px 8px rgba(251, 191, 36, 0.3)",
                    }}
                  >
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                  <Box sx={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* AI Bot Name and Timestamp */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Bot
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "11px",
                          color: "#9ca3af",
                          fontWeight: "500",
                        }}
                      >
                        {getMessageTimestamp(msg, index)}
                      </Typography>
                    </Box>
                    {/* Check if this is a server error */}
                    {isServerError(msg.response) && !msg.isLoading ? (
                      /* Server Error Message Bubble */
                      <Box
                        onClick={() => handleErrorToggle(index)}
                        sx={{
                          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          color: "white",
                          borderRadius: "18px 18px 18px 4px",
                          padding: "12px 16px",
                          boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                          border: "2px solid rgba(251, 191, 36, 0.3)",
                          position: "relative",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          animation: "errorPulse 2s ease-in-out infinite",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 20px rgba(245, 158, 11, 0.4)",
                            borderColor: "rgba(251, 191, 36, 0.5)",
                          },
                          "@keyframes errorPulse": {
                            "0%, 100%": { 
                              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)" 
                            },
                            "50%": { 
                              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.5)" 
                            },
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <WarningAmberIcon sx={{ fontSize: '18px', color: 'white' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontSize: "15px",
                                lineHeight: 1.5,
                                fontWeight: "500",
                                marginBottom: "2px",
                              }}
                            >
                              The server is not available right now.
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "13px",
                                opacity: 0.9,
                                lineHeight: 1.4,
                              }}
                            >
                              Please try again in a moment.
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {expandedErrors[index] ? (
                              <ExpandLessIcon sx={{ fontSize: '18px', opacity: 0.8 }} />
                            ) : (
                              <ExpandMoreIcon sx={{ fontSize: '18px', opacity: 0.8 }} />
                            )}
                          </Box>
                        </Box>
                        
                        {/* Expandable Technical Details */}
                        <Collapse in={expandedErrors[index]}>
                          <Box sx={{ 
                            marginTop: '12px',
                            padding: '8px 12px',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "11px",
                                opacity: 0.8,
                                fontFamily: 'monospace',
                                display: 'block',
                                marginBottom: '4px',
                                color: 'rgba(255, 255, 255, 0.7)'
                              }}
                            >
                              Technical Details:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontFamily: 'monospace',
                                wordBreak: "break-all",
                                lineHeight: 1.4,
                                color: 'rgba(255, 255, 255, 0.9)'
                              }}
                            >
                              {msg.response}
                            </Typography>
                          </Box>
                        </Collapse>
                      </Box>
                    ) : isModelError(msg.response) && !msg.isLoading ? (
                      /* Model Unavailability Error Message Bubble */
                      <Box
                        onClick={() => handleErrorToggle(index)}
                        sx={{
                          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                          color: "white",
                          borderRadius: "18px 18px 18px 4px",
                          padding: "12px 16px",
                          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                          border: "2px solid rgba(248, 113, 113, 0.3)",
                          position: "relative",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          animation: "modelErrorPulse 2s ease-in-out infinite",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
                            borderColor: "rgba(248, 113, 113, 0.5)",
                          },
                          "@keyframes modelErrorPulse": {
                            "0%, 100%": { 
                              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" 
                            },
                            "50%": { 
                              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.5)" 
                            },
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <WarningAmberIcon sx={{ fontSize: '18px', color: 'white' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontSize: "15px",
                                lineHeight: 1.5,
                                fontWeight: "500",
                                marginBottom: "2px",
                              }}
                            >
                              The AI model could not be reached.
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "13px",
                                opacity: 0.9,
                                lineHeight: 1.4,
                              }}
                            >
                              AI model may not be selected, may be offline, or your IP may not be whitelisted.
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {expandedErrors[index] ? (
                              <ExpandLessIcon sx={{ fontSize: '18px', opacity: 0.8 }} />
                            ) : (
                              <ExpandMoreIcon sx={{ fontSize: '18px', opacity: 0.8 }} />
                            )}
                          </Box>
                        </Box>
                        
                        {/* Expandable Technical Details */}
                        <Collapse in={expandedErrors[index]}>
                          <Box sx={{ 
                            marginTop: '12px',
                            padding: '8px 12px',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "11px",
                                opacity: 0.8,
                                fontFamily: 'monospace',
                                display: 'block',
                                marginBottom: '4px',
                                color: 'rgba(255, 255, 255, 0.7)'
                              }}
                            >
                              Technical Details:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontFamily: 'monospace',
                                wordBreak: "break-all",
                                lineHeight: 1.4,
                                color: 'rgba(255, 255, 255, 0.9)'
                              }}
                            >
                              {msg.response}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "12px",
                                fontWeight: "500",
                                marginTop: '12px',
                                color: 'rgba(255, 255, 255, 0.9)'
                              }}
                            >
                              Note: Please ensure an AI model is selected in the settings. You can access settings via the gear icon in the bottom right.
                            </Typography>
                          </Box>
                        </Collapse>
                      </Box>
                    ) : (
                      /* Normal Message Bubble */
                      <Box
                        sx={{
                          backgroundColor: "white",
                          color: "#374151",
                          borderRadius: "18px 18px 18px 4px",
                          padding: "12px 16px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                          border: "1px solid rgba(59, 130, 246, 0.1)",
                          position: "relative",
                        }}
                      >
                        {msg.isLoading ? (
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            height: '24px',
                            py: 1
                          }}>
                            <TypingIndicator />
                          </Box>
                        ) : (
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: "15px",
                              lineHeight: 1.6,
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap",
                              fontWeight: "400",
                            }}
                          >
                            {msg.response}
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {/* Citation */}
                    {msg.citation && (
                      <Chip
                        icon={<LinkIcon sx={{ color: "#3b82f6 !important" }} />}
                        label={formatCitation(msg.citation).length > 50 
                          ? `${formatCitation(msg.citation).substring(0, 50)}...` 
                          : formatCitation(msg.citation)
                        }
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const citation = formatCitation(msg.citation);
                          if (onOpenSourcePanel) {
                            onOpenSourcePanel(msg.citation);
                          } else if (citation.startsWith('http')) {
                            window.open(citation, '_blank');
                          }
                        }}
                        sx={{
                          alignSelf: "flex-start",
                          fontSize: "11px",
                          height: "24px",
                          fontWeight: "500",
                          borderColor: "#3b82f6",
                          color: "#3b82f6",
                          backgroundColor: "rgba(59, 130, 246, 0.05)",
                          cursor: formatCitation(msg.citation).startsWith('http') ? 'pointer' : 'default',
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: formatCitation(msg.citation).startsWith('http') 
                              ? "rgba(59, 130, 246, 0.1)" 
                              : "rgba(59, 130, 246, 0.05)",
                            borderColor: formatCitation(msg.citation).startsWith('http') 
                              ? "#1d4ed8" 
                              : "#3b82f6",
                            transform: formatCitation(msg.citation).startsWith('http') 
                              ? "translateY(-1px)" 
                              : "none",
                            boxShadow: formatCitation(msg.citation).startsWith('http') 
                              ? "0 2px 8px rgba(59, 130, 246, 0.2)" 
                              : "none",
                          },
                        }}
                      />
                    )}
                    
                    {/* Feedback System */}
                    {!msg.isLoading && !isServerError(msg.response) && !isModelError(msg.response) && (
                      <FeedbackSystem
                        messageIndex={index}
                        message={{
                          question: msg.question,
                          response: msg.response,
                          sessionId: msg.sessionId || 'unknown'
                        }}
                        feedbackHook={feedbackHook}
                        boxRef={boxRef}
                      />
                    )}

                    {/* Add bottom margin for last message */}
                    {index === history.length - 1 && (
                      <Box sx={{ 
                        marginBottom: getResponsiveSpacing(heightTier, {
                          xs: "12px",
                          small: "14px",
                          medium: "16px",
                          large: "16px"
                        })
                      }} />
                    )}
                  </Box>
                </Box>
              </Box>
            </Grow>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            textAlign: "center",
            padding: getResponsiveSpacing(heightTier, {
              xs: "12px 8px",
              small: "16px 12px",
              medium: "24px 16px",
              large: "32px 20px"
            }),
            minHeight: heightTier === 'xs' ? "200px" : "300px",
            animation: "fadeInUp 0.8s ease-out",
            "@keyframes fadeInUp": {
              "0%": { 
                transform: "translateY(30px)", 
                opacity: 0 
              },
              "100%": { 
                transform: "translateY(0)", 
                opacity: 1 
              },
            },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              padding: getResponsiveSpacing(heightTier, {
                xs: "16px 12px",
                small: "24px 18px",
                medium: "32px 24px",
                large: "40px 32px"
              }),
              borderRadius: heightTier === 'xs' ? "16px" : { xs: "20px", sm: "24px" },
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(59, 130, 246, 0.08)",
              maxWidth: { xs: "95%", sm: "90%", md: "500px" },
              width: "100%",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.4s ease",
              animation: heightTier === 'xs' ? "none" : "float 6s ease-in-out infinite",
              "&:hover": {
                transform: heightTier === 'xs' ? "none" : "translateY(-8px)",
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.12)",
                border: "1px solid rgba(59, 130, 246, 0.15)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.03) 0%, transparent 50%)
                `,
                zIndex: 0,
              },
              "@keyframes float": {
                "0%, 100%": { transform: "translateY(0px)" },
                "50%": { transform: "translateY(-4px)" },
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              {/* Enhanced Icon with Background */}
              <Box
                sx={{
                  width: getResponsiveSpacing(heightTier, {
                    xs: "60px",
                    small: "70px",
                    medium: "80px",
                    large: "88px"
                  }),
                  height: getResponsiveSpacing(heightTier, {
                    xs: "60px",
                    small: "70px",
                    medium: "80px",
                    large: "88px"
                  }),
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: getResponsiveSpacing(heightTier, {
                    xs: "0 auto 16px",
                    small: "0 auto 20px",
                    medium: "0 auto 28px",
                    large: "0 auto 32px"
                  }),
                  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.25)",
                  position: "relative",
                  animation: heightTier === 'xs' ? "none" : "iconPulse 4s ease-in-out infinite",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: "-4px",
                    left: "-4px",
                    right: "-4px",
                    bottom: "-4px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.2) 100%)",
                    zIndex: -1,
                    animation: heightTier === 'xs' ? "none" : "iconGlow 4s ease-in-out infinite",
                  },
                  "@keyframes iconPulse": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.05)" },
                  },
                  "@keyframes iconGlow": {
                    "0%, 100%": { opacity: 0.5 },
                    "50%": { opacity: 0.8 },
                  },
                }}
              >
                <FindInPageIcon 
                  sx={{ 
                    fontSize: getResponsiveSpacing(heightTier, {
                      xs: 28,
                      small: 32,
                      medium: 36,
                      large: 40
                    }), 
                    color: "white",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                  }} 
                />
              </Box>

              {/* Main Heading */}
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: getResponsiveSpacing(heightTier, {
                    xs: "8px",
                    small: "10px",
                    medium: "12px",
                    large: "12px"
                  }),
                  letterSpacing: "-0.02em",
                  fontSize: getResponsiveSpacing(heightTier, {
                    xs: "1.5rem",
                    small: "1.6rem",
                    medium: "1.75rem",
                    large: "2rem"
                  }),
                }}
              >
                Find What You Need
              </Typography>

              {/* Subtitle */}
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: "#3b82f6",
                  fontWeight: "600",
                  marginBottom: getResponsiveSpacing(heightTier, {
                    xs: "12px",
                    small: "16px",
                    medium: "18px",
                    large: "20px"
                  }),
                  fontSize: getResponsiveSpacing(heightTier, {
                    xs: "0.9rem",
                    small: "0.95rem",
                    medium: "1rem",
                    large: "1rem"
                  }),
                  letterSpacing: "0.01em",
                }}
              >
                Your Knowledge Assistant
              </Typography>

              {/* Description */}
              <Typography 
                variant="body1" 
                sx={{ 
                  color: "#64748b",
                  lineHeight: 1.7,
                  fontSize: getResponsiveSpacing(heightTier, {
                    xs: "13px",
                    small: "14px",
                    medium: "15px",
                    large: "15px"
                  }),
                  marginBottom: getResponsiveSpacing(heightTier, {
                    xs: "16px",
                    small: "20px",
                    medium: "24px",
                    large: "28px"
                  }),
                  maxWidth: heightTier === 'xs' ? "300px" : "420px",
                  margin: `0 auto ${getResponsiveSpacing(heightTier, {
                    xs: "16px",
                    small: "20px",
                    medium: "24px",
                    large: "28px"
                  })}`,
                }}
              >
                {heightTier === 'xs' 
                  ? "Ask questions and get reliable answers from our knowledge base."
                  : "Search through company documentation, policies, and procedures. Ask questions naturally and get reliable answers from our secure knowledge base."
                }
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

Chat.propTypes = { 
  history: PropTypes.array,
  onOpenSourcePanel: PropTypes.func
};
Chat.defaultProps = { 
  history: [],
  onOpenSourcePanel: null
};

export default Chat;
