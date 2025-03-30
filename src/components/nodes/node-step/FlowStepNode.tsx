import { Handle, Position } from "@xyflow/react";
import { Box, Typography, TextField } from "@mui/material";
import { useState } from "react";

export const FlowStepNode = ({ data, isConnectable, id }) => {
  // console.log("id", id);
  if (!id) {
    console.log("FlowStepNode id", id);
  }
  console.info(data)
  const { updateNodeField } = data;
  const [showContent, setShowContent] = useState(false);

  const onChange = (fieldName) => (event) => {
    updateNodeField(id, fieldName, event.target.value);
  };

  return (
    <Box
      sx={{
        padding: 1,
        border: "1px solid #ddd",
        borderRadius: 1,
        backgroundColor: "#fff",
        minWidth: 200,
        textAlign: "center",
        boxShadow: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        // animate the height when showContent changes
        height: showContent ? 220 : 30,
        overflow: "scroll",
        transition: "height 0.5s ease-in-out",
      }}
      onClick={() => setShowContent(!showContent)}
    >

      <Handle
        type="target"
        position={Position.Left}
        id={`in-${id}`}
        isConnectable={isConnectable}
        style={{ top: "50%", background: "#555" }}
      />

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
        {data.stepLabel}
      </Typography>

      {/* <TextField
        label="Step Name"
        variant="outlined"
        value={data.stepName || ""}
        onChange={onChange("stepName")}
        size="small"
        sx={{ marginBottom: 1 ,
          backgroundColor: "#e3f2fd",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#90caf9",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#42a5f5",
          }
        }}
        className="nodrag nopan nowheel"
        fullWidth
      /> */}

      {/* <TextField
        label="Step Label"
        variant="outlined"
        value={data.stepLabel || ""}
        onChange={onChange("stepLabel")}
        size="small"
        sx={{ marginBottom: 1 ,
          backgroundColor: "#e3f2fd",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#90caf9",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#42a5f5",
          }
        }}
        className="nodrag nopan nowheel"
        fullWidth
      /> */}

      {showContent && (
        <TextField
          label="Step Description"
          variant="outlined"
          multiline
          minRows={3}
          maxRows={6}
          value={data.stepDescription || ""}
          onChange={onChange("stepDescription")}
          sx={{
            marginBottom: 1,
            backgroundColor: "#e3f2fd",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#90caf9",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#42a5f5",
            }
          }}
          className="nodrag nopan nowheel"
          fullWidth
        />)}

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
