import { Handle, Position } from "@xyflow/react";
import { Box, Typography, TextField, Select, MenuItem } from "@mui/material";
import { designPatternsPool } from "../global/patternsMap";
import { designPatternsTemplate } from "../global/patternsMap";
import { SingleAgentForm } from "./templates/SingleAgentForm";
import { SupervisionForm } from "./templates/SupervisionForm";
import { ValidatorForm } from "./templates/ValidatorForm";
import { ReflectionForm } from "./templates/ReflectionForm";
import { DiscussionForm } from "./templates/DiscussionForm";
import { ParallelForm } from "./templates/ParallelForm";
import { VotingForm } from "./templates/VotingForm";

export const FlowWithPatternsNode = ({ data, isConnectable,id }) => {
  if (!id) {
    console.log("FlowWithPatternsNode id", id);
  }
  const { updateNodeField, updateNodeFieldset } = data;

  const onChange = (fieldName) => (event) => {
    updateNodeFieldset(id, fieldName, event.target.value);
  };
  const patternName = data.pattern?.name || "";

  const handleSelectPattern = (event) => {
    const chosenName = event.target.value;
    updateNodeFieldset(id, "pattern.name", chosenName);
    updateNodeFieldset(id, "template", designPatternsTemplate[chosenName] || {});
  };

  const onChangeTemplate = (newData) => {
    updateNodeFieldset(id, "template", newData);
  };

  const patternForm = () => {
    switch (data.pattern.name) {
      case "Single Agent":
        return <SingleAgentForm data={data.template} onChange={onChangeTemplate}/>
      case "Supervision":
        return <SupervisionForm data={data.template} onChange={onChangeTemplate}/>
      case "Validator":
        return <ValidatorForm data={data.template} onChange={onChangeTemplate}/>
      case "Reflection":
        return <ReflectionForm data={data.template} onChange={onChangeTemplate}/>
      case "Discussion":
        return <DiscussionForm data={data.template} onChange={onChangeTemplate}/>
      case "Parallel":
        return <ParallelForm data={data.template} onChange={onChangeTemplate}/>
      case "Voting":
        return <VotingForm data={data.template} onChange={onChangeTemplate}/>
    }
  }
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
        style={{ top: "50%", background: "blue" }}
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
        sx={{ marginBottom: 1}}
        className="nodrag nopan nowheel"
        fullWidth
      />

      <TextField
        label="Step Description"
        variant="outlined"
        multiline
        minRows={1}         
        maxRows={1}     
        value={Object.keys(data.template)[0] || ""}
        sx={{ marginBottom: 1 , 
        }}
        className="nodrag nopan"
        fullWidth
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          width: "90%"
        }}
      >
        <Select
          label="Pattern"
          value={patternName}
          onChange={handleSelectPattern}
          size="small"
          sx={{ 
            marginBottom: 1 , 
            minWidth: 120,
            backgroundColor: "#e3f2fd",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#90caf9",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#42a5f5",
            }
          }}
          className="nodrag nopan"
        >
          {designPatternsPool.map((pattern) => (
            <MenuItem key={pattern.name} value={pattern.name}>
              {pattern.name}
            </MenuItem>
            ))}
        </Select>

        {patternForm()}

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
