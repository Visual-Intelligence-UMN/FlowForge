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

import { iconMap } from "../global/iconsMap";

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


  const patternIcon = () => {
    const IconComponent = iconMap[data.pattern.name] || <Typography>No Icon</Typography>;
    return <IconComponent fontSize="small"/>
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
        maxWidth: 600,
        boxShadow: 2,
        gap: 0
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id={`in-${id}`}
        isConnectable={isConnectable}
        style={{ top: "50%", background: "blue" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={`out-${id}`}
        isConnectable={isConnectable}
        style={{ top: "50%", background: "#555" }}
      />

    <Box 
      sx={{ 
        display: "flex", 
        // maxWidth: "70%",
        flex:1,
        gap: 1, 
        padding: 1, 
      }}
    >
      <Box 
        sx={{ 
        display: "flex", 
        flexDirection: "column", 
        maxWidth: "80%", 
        // flex:1,
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", m: 0 }}>
          {id}
        </Typography>
        <Select
          label="Pattern"
          value={patternName}
          onChange={handleSelectPattern}
          size="small"
          sx={{ 
            marginBottom: 1 , 
            // maxWidth: 120,
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
      </Box>

      <Box 
        sx={{ 
        flex:1,
        display: "flex",
        }}>
        <Typography 
          variant="body1" 
          sx={{ 
          fontSize: "18px", 
          mb: 1, 
          alignSelf: "flex-start",
          }}>
            <b>Task Description:</b> {data.stepDescription}
        </Typography>
      </Box>
        <Box sx={{maxWidth: "30%", border: "1px solid #ddd"}}>
          {/* {patternIcon()} */}
        </Box>
      </Box>

      <Box
        sx={{maxWidth: "100%"}}>
          {patternForm()}
      </Box>

      
    </Box>
  );
};
