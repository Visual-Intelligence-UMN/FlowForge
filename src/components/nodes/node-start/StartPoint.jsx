import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { TextField, Box, Typography } from '@mui/material';

export const StartPoint = ({ data, isConnectable, id }) => {
  const updateNodeFieldset = data.updateNodeFieldset ? data.updateNodeFieldset : data.updateNodeField;
  return (
    <Box sx={{ 
      p: 2, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      border: '1px solid #ccc',
      borderRadius: 4,
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
      <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
        START 
      </Typography>
      <TextField
        id="text"
        name="text"
        label="START"
        variant="outlined"
        size="small"
        onChange={(e) => {
          console.log("e.target.value", e.target.value);
          updateNodeFieldset(id, "inputText", e.target.value)}
        }
        sx={{ 
          mt: 1, 
          mb: 1,
        }}
        value={data.inputText}
        multiline
        minRows={2} 
        className = "nodrag nopan nowheel"
      />
    </Box>
  );
}
