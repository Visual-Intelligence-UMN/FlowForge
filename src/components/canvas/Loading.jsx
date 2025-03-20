import React from 'react';
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";

// Reusable overlay component for loading
const LoadingOverlay = ({ message, open = true }) => {
  return (
    <Backdrop
      open={open}
      sx={{ 
        zIndex: (theme) => theme.zIndex.modal + 1,
        color: '#fff'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
};

const LoadingFlows = () => (
  <LoadingOverlay message="Flows are generating..." />
);

const LoadingPatterns = () => (
  <LoadingOverlay message="Patterns are generating..." />
);

export { LoadingFlows, LoadingPatterns };
