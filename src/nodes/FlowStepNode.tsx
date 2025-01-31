import { Handle, Position } from "@xyflow/react";
import { Box, Typography, TextField } from "@mui/material";

export const FlowStepNode = ({ data, isConnectable,id }) => {
  // Instead of using useReactFlow directly, we rely on the parent's updateNodeField
  const { updateNodeField } = data;

  const onChange = (fieldName) => (event) => {
    updateNodeField(id, fieldName, event.target.value);
  };

  return (
    <Box
      sx={{
        padding: 2,
        border: "1px solid #ddd",
        borderRadius: 4,
        backgroundColor: "#fff",
        minWidth: 230,
        textAlign: "center",
        boxShadow: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2
      }}
    >
      {/* Input / output handles */}
      <Handle
        type="target"
        position={Position.Left}
        // id={`in-${id}`}
        isConnectable={isConnectable}
        style={{ top: "50%", background: "#555" }}
      />

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
        {id}
      </Typography>
      {/* You can render multiple text fields for each data field */}
      <TextField
        label="Step Name"
        variant="outlined"
        value={data.stepName || ""}
        onChange={onChange("stepName")}
        size="small"
        sx={{ marginBottom: 1 }}
        className="nodrag nopan nowheel"
        fullWidth
      />

      <TextField
        label="Step Label"
        variant="outlined"
        value={data.stepLabel || ""}
        onChange={onChange("stepLabel")}
        size="small"
        sx={{ marginBottom: 1 }}
        className="nodrag nopan nowheel"
        fullWidth
      />

      <TextField
        label="Step Description"
        variant="outlined"
        multiline
        minRows={3}         
        maxRows={7}     
        value={data.stepDescription || ""}
        onChange={onChange("stepDescription")}
        sx={{ marginBottom: 1 }}
        className="nodrag nopan"
        fullWidth
      />

      <Handle
        type="source"
        position={Position.Right}
        // id={`out-${id}`}
        isConnectable={isConnectable}
        style={{ top: "50%", background: "#555" }}
      />
    </Box>
  );
};
