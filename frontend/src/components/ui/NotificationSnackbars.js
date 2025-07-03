import React from 'react';
import PropTypes from 'prop-types';
import { Snackbar, Alert } from '@mui/material';

const NotificationSnackbars = ({
  showSnackbar,
  showQuickConfigSnackbar,
  onCloseSnackbar,
  onCloseQuickConfigSnackbar
}) => {
  return (
    <>
      {/* Double-click Success Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={onCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={onCloseSnackbar} 
          severity="success" 
          variant="filled"
          sx={{
            borderRadius: '8px',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          New chat started
        </Alert>
      </Snackbar>

      {/* Quick Configure Success Snackbar */}
      <Snackbar
        open={showQuickConfigSnackbar}
        autoHideDuration={3000}
        onClose={onCloseQuickConfigSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={onCloseQuickConfigSnackbar} 
          severity="success" 
          variant="filled"
          sx={{
            borderRadius: '8px',
            backgroundColor: '#10b981',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          Quick configuration applied successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

NotificationSnackbars.propTypes = {
  showSnackbar: PropTypes.bool.isRequired,
  showQuickConfigSnackbar: PropTypes.bool.isRequired,
  onCloseSnackbar: PropTypes.func.isRequired,
  onCloseQuickConfigSnackbar: PropTypes.func.isRequired
};

export default NotificationSnackbars;
