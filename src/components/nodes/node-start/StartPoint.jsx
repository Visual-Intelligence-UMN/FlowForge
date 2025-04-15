import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { TextField, Box, Typography } from '@mui/material';
import { useState } from 'react';
export const StartPoint = ({ data, isConnectable, id }) => {
  const updateNodeFieldset = data.updateNodeFieldset ? data.updateNodeFieldset : data.updateNodeField;
  const [showContent, setShowContent] = useState(false);
  return (
    <Box sx={{ 
      p: 1.5, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      border: '1px solid #ccc',
      borderRadius: 4,
      height: showContent ? 150 : 30,
      minWidth: 150,
      transition: "height 0.5s ease-in-out",
      }}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        isConnectable={isConnectable}
      />
      <Typography variant="h6" sx={{ mt: 1, mb: 1 }} 
       onClick={() => setShowContent(!showContent)}
      >
        START 
      </Typography>

      {showContent && (
        <TextField
          id="text"
          name="text"
          label="START"
          variant="outlined"
          size="small"
        onChange={(e) => {
          console.log("e.target.value", e.target.value);
          updateNodeFieldset(id, "inputText", e.target.value)
        }}
        sx={{ 
          mt: 1, 
          mb: 0.5,
          
        }}
        value={data.inputText}
        multiline
        minRows={2} 
        className = "nodrag nopan nowheel"
      />
      )}
    </Box>
  );
}
