
import { Handle, Position } from "@xyflow/react";
import { Box, Typography } from "@mui/material";
import "../langGraphNode.css";

export const FlowStepNode = ({ data, isConnectable, id }) => {
  return (
    <Box
      sx={{
        padding: 1,
        border: "1px solid #ddd",
        borderRadius: "4px",
        backgroundColor: "#fff",
        minWidth: 150,
        textAlign: "center",
        boxShadow: 2,
      }}
    >

      <Handle
        type="target"
        position={Position.Left}
        id={`in-${id}`}    
        isConnectable={isConnectable}
        style={{ top: "50%", background: "#555" }}
      />

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
        {data.stepName}
      </Typography>
      {data.stepLabel && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {data.stepLabel}
        </Typography>
      )}
      {data.stepDescription && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
          {data.stepDescription}
        </Typography>
      )}
      {data.pattern && data.pattern.name && (
        <Typography variant="caption" color="primary">
          {data.pattern.name}
        </Typography>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id={`out-${id}`}
        isConnectable={isConnectable}
        style={{ top: "50%", background: "#555" }}
      />
    </Box>
  );
};
