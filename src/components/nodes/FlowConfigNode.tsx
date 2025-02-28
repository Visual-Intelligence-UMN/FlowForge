import { Handle, Position } from "@xyflow/react";
import { Box, Typography, TextField, Select, MenuItem } from "@mui/material";
import { designPatternsPool } from "../../global/patternsMap";

export const FlowConfigNode = ({ data, isConnectable,id }) => {
    if (!id) {
        console.log("FlowConfigNode id", id);
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
        gap: 1
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
      <Typography variant="h6" gutterBottom>
        {data.stepName}
      </Typography>

{/*       
      <TextField
        label="Step Name"
        variant="outlined"
        value={data.stepName || ""}
        onChange={onChange("stepName")}
        size="small"
        sx={{ marginBottom: 1}}
        className="nodrag nopan nowheel"
        fullWidth
      /> */}

{/* 
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
      </Select> */}

      {/* Display Config Info */}
      
      <Box
        sx={{
          width: "100%",
          padding: 0,
          marginTop: 0,
        }}
      >
        {/* <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Config Type:
        </Typography>
        <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
          {data.config.type}
        </Typography> */}

        <Typography variant="subtitle1">
          Config Agent
        </Typography>
        {data.config.nodes && data.config.nodes.length > 0 ? (
          data.config.nodes.map((node, index) => (
            <Box
              key={index}
              sx={{
                border: "1px solid #ddd",
                borderRadius: 2,
                padding: 1,
                marginTop: 1,
                backgroundColor: "#e3f2fd",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#90caf9",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#42a5f5",
                }
              }}
            >
              <Typography variant="body2">
                <strong>Type:</strong> {node.type}
              </Typography>
              <Typography variant="body2">
                <strong>Description:</strong> {node.description}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2">No config nodes available</Typography>
        )}
      </Box>
      

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
