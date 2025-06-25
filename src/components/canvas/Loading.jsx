import React from 'react';
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import { patternsGenerateProgress } from '../../patterns/GlobalStates';
import { useAtom } from 'jotai';
import { useState, useEffect } from "react";

// Reusable overlay component for loading
const LoadingOverlay = ({ message, open = true }) => {
  return (
    <Backdrop
      open={open}
      sx={{ 
        zIndex: (theme) => theme.zIndex.modal + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',   
        color: '#fff',
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

 const LoadingFlows = () => {
    const tips = [
      "Decomposes the task into clear, actionable subtasks/steps",
      "FlowForge prompts GPT-4o to generate five distinct task planning, each with a unique perspective",
      "You can rename, add, delete, reorder the nodes to customize the task planning",
      "Define detailed inputs and expected outputs",
      "Ensure steps connected with cohesive input and output",
    ];
  

   const [tipIndex, setTipIndex] = useState(0);
   const [seconds, setSeconds] = useState(0);

  useEffect(() => {
      const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(timer);
   }, []);

   useEffect(() => {
     const iv = setInterval(() => {
       setTipIndex((i) => (i + 1) % tips.length);
     }, 2500);
     return () => clearInterval(iv);
   }, []);

    return (
        <Backdrop
          open
         sx={{
            zIndex: (theme) => theme.zIndex.modal + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',   
            color: '#fff',
         }}
        >
        <Box
           sx={{
             display: 'flex',
              flexDirection: 'column',
            alignItems: 'center',
           
          }}
         >
           <CircularProgress color="inherit" />
           <Typography variant="h6" sx={{ mt: 2}}>
             {tips[tipIndex]}
           </Typography>
           <Typography
            variant="body2"
             sx={{ mt: 1, color: 'secondary' }}
           >
             Task planning generation usually takes 20-50 seconds, awaiting: {seconds}s 
           </Typography>
         </Box>
       </Backdrop>
     );
};

const LoadingPatterns = () => {
  const [progress] = useAtom(patternsGenerateProgress);
  let open = true;
  let message = "";
  if (progress.total === 0) {
    message = "Generating design patterns for each subtasks...";
    open = true;
  } else if (progress.completed <= progress.total) {
    open = true;
    message = `Suggesting design patterns for step-${progress.completed}/${progress.total}: ${progress.currentStep}`;
  } else {
    open = true;
    message = "Generating workflows with suggesetd design patterns...";
  }

  return <LoadingOverlay message={message} open={open} />;
};


export { LoadingFlows, LoadingPatterns };
