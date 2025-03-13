import { Handle, Position } from "@xyflow/react";
import "./langGraphNode.css";
import {TextField, Typography, Box, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, TextareaAutosize} from "@mui/material";

const SingleAgentNode = ({ id, data }) => {

  // console.log("data", data);

  const { updateNodeFieldset } = data;
  const showContent = data.showContent;

  // console.log("showContent", showContent);

  const onChange = (fieldName) => (event) => {
    updateNodeFieldset(id, fieldName, event.target.value);
  };

  const handles = () => {
    if (data.label.includes("Worker")) {
      return (
        <>
        <Handle type="source" position={Position.Top} id={`top-${id}`} />
        <Handle type="target" position={Position.Top} id={`top-${id}`} />
        </>
      )
    } else if (data.label.includes("Agent") && data.pattern.includes("parallel")) {
      return (
        <>
        <Handle type="target" position={Position.Left} id={`in-left-${id}`} />
        <Handle type="source" position={Position.Right} id={`out-right-${id}`} />
        </>
      )
    } else if (data.label.includes("Optimizer")) {
      return (
        <>
        <Handle type="source" position={Position.Right} id={`out-right-${id}`} />
        <Handle type="target" position={Position.Left} id={`in-left-${id}`} />
        <Handle type="target" position={Position.Right} id={`in-right-${id}`}  style={{top: "40%"}}/>
        </>
      )
    } else if (data.label.includes("Summary") || data.label.includes("Aggregator")) {
      return (
        <>
                <Handle type="source" position={Position.Right} id={`out-right-${id}`} />
                <Handle type="target" position={Position.Left} id={`in-left-${id}`} />
        </>
      )
    } else if (data.label.includes("Evaluator")) {
        return (
          <>
          <Handle type="source" position={Position.Right} id={`out-right-${id}`} />
          <Handle type="source" position={Position.Left} id={`out-left-${id}`} style={{top: "40%"}}/>
          <Handle type="target" position={Position.Left} id={`in-left-${id}`}  />
        </>
      )
    } else if (data.label.includes("Agent") && data.pattern.includes("discussion")) {
      if (data.label.includes("Agent1")) {
        return (
          <>
          <Handle type="source" position={Position.Right} id={`out-right-${id}`} />
          <Handle type="target" position={Position.Left} id={`in-left-${id}`} />
          </>
        )
      } else {
        return (
          <>
          <Handle type="source" position={Position.Right} id={`out-right-${id}`} />
          {/* <Handle type="target" position={Position.Left} id={`in-left-${id}`} /> */}
          </>
        )
      }
    } else {
      return (
        <>
        <Handle type="source" position={Position.Right} id={`out-right-${id}`} />
        <Handle type="target" position={Position.Left} id={`in-left-${id}`} />
        </>
      )
    }
  }

  const modelSelector = () => {
    return (
      <Box mt={2} mb={2}>
      <FormControl fullWidth>
        <InputLabel id={`llm-label-${id}`}>LLM Model</InputLabel>
        <Select
          labelId={`llm-label-${id}`}
          id={`llm-select-${id}`}
          value={data.llm}
          label="LLM Model"
          onChange={onChange("llm")}
          size="small"
          className="nodrag nopan" // set to prevent dragging and panning
        >
          <MenuItem value="gpt-4o-mini">GPT-4o Mini</MenuItem>
          <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
          <MenuItem value="gpt-4o">GPT-4o</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>
    </Box>
      )
  }

  const systemPrompt = () => {
    return(
      <TextField
          label="System Prompt" 
          variant="outlined"
          multiline
          minRows={3}          // Minimum number of rows
          maxRows={6}       // If you'd like to cap the max rows
          fullWidth
          value={data.systemPrompt}
          onChange={onChange("systemPrompt")}
          className="nodrag nopan nowheel"
        />
    )
  }


  const toolsSelector = () => {
    return(
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
            onChange={onChange("tools")}
            renderValue={(selected) => {
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
    )
  }


  return (
    <Box className="single-agent-node" sx={{p: 2, width: "260px"}}>

      {handles()}

      {"Step "+(Number(id.split("-")[1]))}
      <Typography variant="h6" gutterBottom>
        🤖 {data.label || "Single Agent"}
      </Typography>

      {modelSelector()}

      {systemPrompt()}

      {toolsSelector()}

     
    </Box>
  );
};

export default SingleAgentNode;
