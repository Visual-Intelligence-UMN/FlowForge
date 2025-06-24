import React from 'react';
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import { patternsGenerateProgress } from '../../patterns/GlobalStates';
import { useAtom } from 'jotai';

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

const LoadingPatterns = () => {
  const [progress] = useAtom(patternsGenerateProgress);
  let open = true;
  let message = "";
  if (progress.total === 0) {
    open = true;
  } else if (progress.completed < progress.total) {
    open = true;
    message = `Suggesting design patterns for step-${progress.completed}/${progress.total}: ${progress.currentStep}`;
  } else {
    open = true;
    message = "Generating workflows with suggesetd design patterns...";
  }

  return <LoadingOverlay message={message} open={open} />;
};


export { LoadingFlows, LoadingPatterns };
