import { Handle, Position } from "@xyflow/react";
import "./langGraphNode.css";
import {TextField, Typography, Box, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText} from "@mui/material";
// import { toolsMap } from "../../../langgraph/tools";

const SingleAgentNode = ({ id, data }) => {
  const updateNodeFieldset = data.updateNodeFieldset;
  return (
    <Box className="single-agent-node" sx={{p: 2, width: "260px"}}>
      {/* Input Handle (for connecting incoming edges) */}
      {/* <Handle type="source" position={Position.Right} id="right" /> */}
      <Handle type="target" position={Position.Left} id={`in-${id}`} />
      {"Step "+(Number(id.split("-")[1]))}
      <Typography variant="h6" gutterBottom>
        🤖 {data.label || "Single Agent"}
      </Typography>

       <Box mt={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel id={`llm-label-${id}`}>LLM Model</InputLabel>
          <Select
            labelId={`llm-label-${id}`}
            id={`llm-select-${id}`}
            value={data.llm}
            label="LLM Model"
            onChange={(e) => updateNodeFieldset(id, "llm", e.target.value)}
            size="small"
            className="nodrag nopan" // set to prevent dragging and panning
          >
            <MenuItem value="gpt-4o-mini">GPT-4o Mini</MenuItem>
            <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
            {/* <MenuItem value="other">Other</MenuItem> */}
          </Select>
        </FormControl>
      </Box>

      {/* System Prompt */}
        <TextField
          label="System Prompt" 
          variant="outlined"
          multiline
          minRows={3}          // Minimum number of rows
          maxRows={6}       // If you'd like to cap the max rows
          fullWidth
          value={data.systemPrompt}
          onChange={(e) => updateNodeFieldset(id, "systemPrompt", e.target.value)}
          className="nodrag nopan nowheel"
        />

      

      <Box mt={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel id={`tools-label-${id}`}>Tools</InputLabel>
          <Select
            labelId={`tools-label-${id}`}
            id={`tools-select-${id}`}
            multiple
            value={data.tools}
            label="Tools"
            size="small"
            onChange={(e) => updateNodeFieldset(id, "tools", e.target.value)}
            className="nodrag nopan" // set to prevent dragging and panning
          >
            <MenuItem value="tool_WebSearch">Web Search</MenuItem>
            <MenuItem value="none">No Tool</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Multiple Handles for Outputs */}
      <Handle type="source" position={Position.Right} id={`out-${id}`} />
    </Box>
  );
};

export default SingleAgentNode;
