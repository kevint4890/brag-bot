import React from 'react';
import {
  Popover,
  Box,
  Typography,
  Button,
  Switch,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { QAHeader } from '../../QAHeader';
import UrlSourcesForm from '../../WebUrlsForm';
import { getResponsiveSpacing } from '../../hooks/useResponsiveHeight';
import { colors, gradients, shadows, borderRadius, transitions } from '../../constants/theme';

const SettingsPopover = ({
  anchor,
  onClose,
  baseUrl,
  setBaseUrl,
  inferenceProfileSummaries,
  selectedModel,
  onChangeModel,
  enableSourcePanel,
  setEnableSourcePanel,
  enableSidebarSlider,
  setEnableSidebarSlider,
  hasWebDataSource,
  sourceUrlInfo,
  handleUpdateUrls,
  heightTier,
  onQuickConfig,
}) => {
  return (
    <Popover
      open={Boolean(anchor)}
      anchorEl={anchor}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transitionDuration={150}
      sx={{
        '& .MuiPopover-paper': {
          borderRadius: getResponsiveSpacing(heightTier, {
            xs: borderRadius.lg,
            small: borderRadius.xl,
            medium: borderRadius.xxl,
            large: borderRadius.xxl
          }),
          padding: '0',
          background: gradients.glass,
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: shadows.glass,
          border: `1px solid ${colors.primary.lighter}`,
          marginBottom: '8px',
          maxWidth: getResponsiveSpacing(heightTier, {
            xs: '95vw',
            small: '350px',
            medium: '400px',
            large: '420px'
          }),
          minWidth: getResponsiveSpacing(heightTier, {
            xs: '280px',
            small: '320px',
            medium: '360px',
            large: '380px'
          }),
          maxHeight: getResponsiveSpacing(heightTier, {
            xs: '90vh',
            small: '85vh',
            medium: '80vh',
            large: '80vh'
          }),
          position: 'relative',
          overflow: 'hidden',
        }
      }}
    >
      <Box 
        sx={{ 
          padding: '24px',
          maxHeight: '80vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.primary.light + '4D', // 30% opacity
            borderRadius: '3px',
            '&:hover': {
              background: colors.primary.light + '80', // 50% opacity
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <SettingsIcon sx={{ color: colors.primary.main, marginRight: '8px' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: colors.primary.darker, 
              fontWeight: '600',
              fontSize: '1.1rem',
            }}
          >
            Developer Settings
          </Typography>
          {baseUrl && selectedModel && (
            <Typography
              variant="caption"
              sx={{
                marginLeft: 'auto',
                color: colors.success.main,
                fontWeight: 'bold',
                backgroundColor: colors.success.main + '1A', // 10% opacity
                padding: '4px 8px',
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.success.main}4D`, // 30% opacity
              }}
            >
              ● Connected
            </Typography>
          )}
        </Box>

        {/* API Configuration */}
        <QAHeader
          setBaseUrl={setBaseUrl}
          baseUrl={baseUrl}
          inferenceProfileSummaries={inferenceProfileSummaries}
          setSelectedModel={onChangeModel}
          selectedModel={selectedModel}
        />
        
        {/* Quick Setup Button */}
        <Box sx={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={onQuickConfig}
            sx={{
              background: gradients.success,
              color: colors.white,
              borderRadius: borderRadius.md,
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'none',
              boxShadow: shadows.md.replace(colors.primary.main, colors.success.main),
              transition: transitions.smooth,
              '&:hover': {
                background: gradients.successReverse,
                transform: 'translateY(-2px)',
                boxShadow: shadows.lg.replace(colors.primary.main, colors.success.main),
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <Box component="span" sx={{ fontSize: '13px', fontWeight: '600' }}>
                ⚡️ Quick Configure
              </Box>
              <Box component="span" sx={{ fontSize: '10px', opacity: 0.9, lineHeight: '1.2' }}>
                (Autofills preset API URL & Claude 3.5 Haiku)
              </Box>
            </Box>
          </Button>
        </Box>

        {/* UI Settings */}
        <Box sx={{ marginTop: '20px' }}>
          <Typography variant="h6" sx={{ 
            color: colors.primary.darker, 
            fontWeight: '600', 
            marginBottom: '12px', 
            fontSize: '14px' 
          }}>
            UI Settings
          </Typography>
          
          {/* Source Panel Toggle */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '12px 16px', 
            backgroundColor: colors.primary.main + '0D', // 5% opacity
            borderRadius: borderRadius.md, 
            border: `1px solid ${colors.primary.main}1A`, // 10% opacity
            marginBottom: '12px' 
          }}>
            <Box>
              <Typography variant="body2" sx={{ 
                fontWeight: '600', 
                color: colors.primary.darker, 
                marginBottom: '4px' 
              }}>
                📄 Source Documents Panel
              </Typography>
              <Typography variant="caption" sx={{ 
                color: colors.gray[500], 
                fontSize: '12px' 
              }}>
                When you click on source links in chat responses, open them in a side panel instead of new browser tabs. Makes it easier to reference sources while continuing your conversation.
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={enableSourcePanel}
              onChange={(e) => setEnableSourcePanel(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: colors.primary.main,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: colors.primary.light,
                },
              }}
            />
          </Box>

          {/* Sidebar Slider Toggle */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '12px 16px', 
            backgroundColor: colors.secondary.main + '0D', // 5% opacity
            borderRadius: borderRadius.md, 
            border: `1px solid ${colors.secondary.main}33`, // 20% opacity
            marginBottom: '12px' 
          }}>
            <Box>
              <Typography variant="body2" sx={{ 
                fontWeight: '600', 
                color: colors.secondary.dark, 
                marginBottom: '4px' 
              }}>
                ↔️ Resizable Panel (Experimental)
              </Typography>
              <Typography variant="caption" sx={{ 
                color: colors.gray[500], 
                fontSize: '12px' 
              }}>
                Add a draggable handle to resize the source panel width. Click and drag the thin line between panels to adjust. Note: Still in early stages, may lag or react unexpectedly when dragging over content.
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={enableSidebarSlider}
              onChange={(e) => {
                setEnableSidebarSlider(e.target.checked);
                localStorage.setItem('enableSidebarSlider', JSON.stringify(e.target.checked));
              }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: colors.secondary.main,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: colors.secondary.light,
                },
              }}
            />
          </Box>
        </Box>

        {/* Web URL Configuration */}
        {hasWebDataSource && (
          <Box sx={{ marginTop: '20px' }}>
            <UrlSourcesForm
              exclusionFilters={sourceUrlInfo.exclusionFilters}
              inclusionFilters={sourceUrlInfo.inclusionFilters}
              seedUrlList={sourceUrlInfo.seedUrlList.map(
                (urlObj) => urlObj.url
              )}
              handleUpdateUrls={handleUpdateUrls}
            />
          </Box>
        )}
      </Box>
    </Popover>
  );
};

export default SettingsPopover;
