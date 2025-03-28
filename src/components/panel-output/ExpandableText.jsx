import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {Typography } from '@mui/material';
import Grid from "@mui/material/Grid2";
const ExpandableTextBox = ({ msg, collapsedHeight = 200, index, isLastItem }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(prev => !prev);

  const containerStyle = {
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    wordWrap: 'break-word',
    maxHeight: expanded ? 'none' : collapsedHeight,
    overflowY: 'hidden',
    backgroundColor: isLastItem ? "#ffeb9b" : "white",
    padding: 10,
    margin: 10,
  };

  return (
    <Grid item key={index} 
        sx={{ minWidth: 450, 
            maxWidth: 500,
            backgroundColor: isLastItem ? "#ffeb9b" : "white",
            padding: 1,
        }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            {"Step" + Number(msg.sender.split("-")[1]) + " " + msg.sender.split("-")[3]}
        </Typography>
        <button onClick={toggleExpand}>
        {expanded ? 'Show Less' : 'Show More'}
      </button>
      <div style={containerStyle}>
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>
      
      </Grid>
  );
};

export default ExpandableTextBox;
