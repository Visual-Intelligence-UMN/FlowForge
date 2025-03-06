import { Handle, Position } from "@xyflow/react";
import "./langGraphNode.css";
import {TextField, Typography, Box, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText} from "@mui/material";

const SingleAgentNode = ({ id, data }) => {
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
            onChange={(e) => data.updateNode(id, "llm", e.target.value)}
            size="small"
            className="nodrag nopan" // set to prevent dragging and panning
          >
            <MenuItem value="gpt-4o-mini">GPT-4o Mini</MenuItem>
            <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
            <MenuItem value="other">Other</MenuItem>
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
          onChange={(e) => data.updateNode(id, "systemPrompt", e.target.value)}
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
            onChange={(e) => data.updateNode(id, "tools", e.target.value)}
            // If you only need to display them (no editing), consider `disabled`:
            // disabled
            renderValue={(selected) => {
              // 'selected' is an array of the currently selected tool values
              // e.g., ["someTool_ChatGPT", "anotherTool_Search"]
              const displayedNames = selected.map((tool) => tool.split("_")[1]);
              return displayedNames.join(", ");
            }}
          >
            {data.tools.map((tool, index) => (
              <MenuItem key={index} value={tool}>
                {tool.split("_")[1]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Multiple Handles for Outputs */}
      <Handle type="source" position={Position.Right} id={`out-${id}-a`} style={{top: 100}} />
      <Handle type="source" position={Position.Right} id={`out-${id}-b`} style={{top: 200}} />
    </Box>
  );
};

export default SingleAgentNode;
