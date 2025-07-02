import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const FloatingActionButtons = ({ onQuickConfig, onOpenSettings }) => {
  return (
    <>
      {/* Quick Access Button */}
      <IconButton
        onClick={onQuickConfig}
        sx={{
          position: "fixed",
          bottom: "20px",
          right: "80px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          zIndex: 2,
          width: "48px",
          height: "48px",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgb(236, 255, 249)",
            boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
            transform: "translateY(-2px)",
          },
        }}
        title="Quick Configure"
      >
        <FlashOnIcon sx={{ color: "rgba(16, 185, 129, 0.9)", fontSize: "20px" }} />
      </IconButton>

      {/* Developer Settings Button */}
      <IconButton
        onClick={onOpenSettings}
        sx={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.1)",
          zIndex: 2,
          width: "48px",
          height: "48px",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 1)",
            boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <SettingsIcon sx={{ color: "#3b82f6", fontSize: "20px" }} />
      </IconButton>
    </>
  );
};

FloatingActionButtons.propTypes = {
  onQuickConfig: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired
};

export default FloatingActionButtons;
