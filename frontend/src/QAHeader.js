import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Typography, Popover } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputIcon from "@mui/icons-material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import LinkIcon from "@mui/icons-material/Link";
import CloudIcon from "@mui/icons-material/Cloud";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import InfoIcon from "@mui/icons-material/Info";
import PropTypes from "prop-types";

export const QAHeader = (props) => {
  const { setSelectedModel, setBaseUrl, inferenceProfileSummaries, selectedModel, baseUrl } =
    props;
  const [url, setUrl] = useState(baseUrl ?? "");
  const [infoAnchor, setInfoAnchor] = useState(null);
  const modelListDisabledText =
    "Input a valid base url to enable model selection";

  // Sync local URL state with baseUrl prop
  useEffect(() => {
    setUrl(baseUrl ?? "");
  }, [baseUrl]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setBaseUrl(url);
    }
  };

  const handleInfoClick = (event) => {
    setInfoAnchor(event.currentTarget);
  };

  const handleInfoClose = () => {
    setInfoAnchor(null);
  };

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <LinkIcon sx={{ color: '#3b82f6', marginRight: '8px', fontSize: '20px' }} />
        <Typography
          variant="overline"
          sx={{ 
            letterSpacing: "0.1em",
            color: "#1e40af",
            fontWeight: "600",
            transition: "color 0.3s ease",
            "&:hover": {
              color: "#3b82f6"
            }
          }}
        >
          Input your base URL
        </Typography>
      </Box>
      
      <Box sx={{ 
        position: 'relative',
        marginBottom: '12px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(147, 197, 253, 0.05))',
          borderRadius: '16px',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover::before': {
          opacity: 1,
        }
      }}>
        <OutlinedInput
          id="standard-basic"
          value={url}
          sx={{ 
            width: "100%",
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)",
              borderColor: "#3b82f6",
              background: 'rgba(255, 255, 255, 0.95)',
              transform: 'translateY(-2px)',
            },
            "&.Mui-focused": {
              boxShadow: "0 12px 35px rgba(59, 130, 246, 0.25)",
              transform: 'translateY(-3px)',
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(59, 130, 246, 0.3)",
              borderWidth: '2px',
              transition: 'all 0.3s ease',
            },
            "& .MuiOutlinedInput-input": {
              padding: '14px 16px',
              fontSize: '14px',
              fontWeight: '500',
            }
          }}
          name="Base Url"
          onChange={(event) => setUrl(event.target?.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://example.execute-api.example.amazonaws.com/example/"
          startAdornment={
            <InputAdornment position="start">
              <CloudIcon 
                sx={{ 
                  color: '#6b7280', 
                  fontSize: '18px',
                  transition: 'color 0.3s ease',
                }} 
              />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                color="primary"
                onClick={() => setBaseUrl(url)}
                onMouseDown={() => setBaseUrl(url)}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    transform: "scale(1.1) rotate(5deg)",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  }
                }}
              >
                <InputIcon sx={{ fontSize: '18px' }} />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <SmartToyIcon sx={{ color: '#3b82f6', marginRight: '8px', fontSize: '20px' }} />
        <Typography
          variant="overline"
          sx={{ 
            letterSpacing: "0.1em",
            color: "#1e40af",
            fontWeight: "600",
            transition: "color 0.3s ease",
            "&:hover": {
              color: "#3b82f6"
            }
          }}
        >
          Select a model
        </Typography>
        <IconButton
          size="small"
          onClick={handleInfoClick}
          sx={{
            marginLeft: '8px',
            width: '20px',
            height: '20px',
            color: '#6b7280',
            '&:hover': {
              color: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            }
          }}
        >
          <InfoIcon sx={{ fontSize: '16px' }} />
        </IconButton>
      </Box>

      <Popover
        open={Boolean(infoAnchor)}
        anchorEl={infoAnchor}
        onClose={handleInfoClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '400px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: '12px',
            lineHeight: '1.4',
            color: '#374151',
          }}
        >
          Make sure to check in your AWS console that you have access to the
          selected model. Note: if no model is selected, the default model used
          will be anthropic.claude-instant-v1. Check out the list of supported
          models and regions{" "}
          <a
            href="https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-supported.html"
            target="_blank"
            rel="noreferrer"
            style={{ 
              color: "#1d4ed8", 
              textDecoration: "none",
              fontWeight: "600",
              borderBottom: '1px solid rgba(29, 78, 216, 0.3)',
            }}
          >
            here
          </a>
        </Typography>
      </Popover>
      <Box 
        sx={{ 
          paddingBottom: "20px",
          position: 'relative',
        }}
      >
        <Tooltip title={inferenceProfileSummaries.length === 0 ? modelListDisabledText : null}>
          <Box sx={{ 
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.03), rgba(147, 197, 253, 0.03))',
              borderRadius: '20px',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              zIndex: 0,
            },
            '&:hover::before': {
              opacity: 1,
            }
          }}>
            <Autocomplete
              disabled={!baseUrl}
              includeInputInList
              id="model-select"
              autoComplete
              options={inferenceProfileSummaries}
              getOptionLabel={(option) => option.inferenceProfileId ?? option}
              renderOption={(props, option) => (
                <Box 
                  {...props}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.06)',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: '#1f2937',
                        marginBottom: '2px',
                      }}
                    >
                      {option.inferenceProfileName}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#6b7280',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {option.inferenceProfileId}
                    </Typography>
                  </Box>
                </Box>
              )}
              ListboxProps={{
                sx: {
                  minWidth: '100%',
                  maxHeight: '300px',
                  '& .MuiAutocomplete-option': {
                    minHeight: 'auto',
                  }
                }
              }}
              sx={{ 
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: '2px solid rgba(59, 130, 246, 0.1)',
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(59, 130, 246, 0.1)",
                    borderColor: "rgba(59, 130, 246, 0.3)",
                    background: 'rgba(255, 255, 255, 0.95)',
                    transform: 'translateY(-1px)',
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 6px 25px rgba(59, 130, 246, 0.15)",
                    borderColor: "#3b82f6",
                    transform: 'translateY(-2px)',
                  },
                  "&.Mui-disabled": {
                    background: 'rgba(249, 250, 251, 0.8)',
                    color: '#9ca3af',
                  }
                },
                "& .MuiInputLabel-root": {
                  transition: "all 0.3s ease",
                  fontWeight: '500',
                  "&.Mui-focused": {
                    color: "#3b82f6",
                    fontWeight: '600',
                  }
                },
                "& .MuiAutocomplete-endAdornment": {
                  '& .MuiSvgIcon-root': {
                    color: '#3b82f6',
                    transition: 'all 0.3s ease',
                  }
                }
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="" 
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SmartToyIcon 
                          sx={{ 
                            color: !baseUrl ? '#d1d5db' : '#3b82f6', 
                            fontSize: '18px',
                            transition: 'all 0.3s ease',
                          }} 
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      display: 'none' // Hide default border since we're using custom border
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: '16px 14px',
                      fontSize: '14px',
                      fontWeight: '500',
                    }
                  }}
                />
              )}
              defaultValue={null}
              value={selectedModel ?? null}
              onChange={(event, value) => {
                setSelectedModel(value);
              }}
            />
          </Box>
        </Tooltip>
      </Box>
    </div>
  );
};

QAHeader.propTypes = {
  setSelectedModel: PropTypes.func.isRequired,
  setBaseUrl: PropTypes.func.isRequired,
  inferenceProfileSummaries: PropTypes.array,
  selectedModel: PropTypes.object,
  baseUrl: PropTypes.string,
};

QAHeader.defaultProps = {
  inferenceProfileSummaries: [],
  selectedModel: null,
  baseUrl: "",
};

export default QAHeader;
