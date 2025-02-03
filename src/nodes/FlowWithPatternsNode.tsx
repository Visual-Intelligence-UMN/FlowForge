import { Handle, Position } from "@xyflow/react";
import { Box, Typography, TextField, Select, MenuItem } from "@mui/material";
import { designPatternsPool } from "../global/patternsMap";
export const FlowWithPatternsNode = ({ data, isConnectable,id }) => {
  if (!id) {
    console.log("FlowWithPatternsNode id", id);
  }
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
        id={`in-${id}`}
        isConnectable={isConnectable}
        style={{ top: "50%", background: "#555" }}
      />

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
        {id}
      </Typography>
    
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
        label="Step Description"
        variant="outlined"
        multiline
        minRows={3}         
        maxRows={3}     
        value={data.stepDescription || ""}
        onChange={onChange("stepDescription")}
        sx={{ marginBottom: 1 }}
        className="nodrag nopan"
        fullWidth
      />

      <Select
        label="Pattern"
        value={data.pattern?.name || ""}
        onChange={onChange("pattern.name")}
        size="small"
        sx={{ marginBottom: 1 , minWidth: 120 }}
        className="nodrag nopan"
      >
        {designPatternsPool.map((pattern) => (
          <MenuItem key={pattern.name} value={pattern.name}>
            {pattern.name}
          </MenuItem>
        ))}
      </Select>

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
