import { Handle, Position } from "@xyflow/react";
import { Box, Typography, Select, MenuItem, Button, Tooltip } from "@mui/material";
import { designPatternsPool } from "../../../patterns/patternsData";
import { designPatternsTemplate } from "../../../patterns/patternsData";
import { SingleAgentForm } from "../../templates/template-agent/SingleAgentForm";
import { SupervisionForm } from "../../templates/template-supervision/SupervisionForm";
import { ValidatorForm } from "../../templates/template-validator/ValidatorForm";
import { ReflectionForm } from "../../templates/template-reflection/ReflectionForm";
import { DiscussionForm } from "../../templates/template-discussion/DiscussionForm";
import { ParallelForm } from "../../templates/template-parallel/ParallelForm";
import { VotingForm } from "../../templates/template-voting/VotingForm";
import { PatternIcons } from "../../canvas-patterns/PatternIcons";
import { calculateCost } from "./helpers";
import Grow from '@mui/material/Grow';

export const FlowWithPatternsNode = ({ data, isConnectable, id }) => {
  if (!id) {
    console.log("FlowWithPatternsNode id", id);
  }
  const { updateNodeFieldset } = data;
  const showContent = false;
  const patternName = data.pattern?.name || "";

  const handleSelectPattern = (event) => {
    const chosenName = event.target.value;
    const chosenTemplate = designPatternsTemplate[chosenName] || {};
    updateNodeFieldset(id, "pattern.name", chosenName);
    updateNodeFieldset(id, "template", chosenTemplate);
  };

  const onChangeTemplate = (newData) => {
    updateNodeFieldset(id, "template", newData);
  };

  const patternForm = () => {
    switch (patternName) {
      case "Single Agent":
        return <SingleAgentForm data={data.template} onChange={onChangeTemplate} />;
      case "Supervision":
        return <SupervisionForm data={data.template} onChange={onChangeTemplate} />;
      case "Validator":
        return <ValidatorForm data={data.template} onChange={onChangeTemplate} />;
      case "Reflection":
        return <ReflectionForm data={data.template} onChange={onChangeTemplate} />;
      case "Discussion":
        return <DiscussionForm data={data.template} onChange={onChangeTemplate} />;
      case "Parallel":
        return <ParallelForm data={data.template} onChange={onChangeTemplate} />;
      case "Voting":
        return <VotingForm data={data.template} onChange={onChangeTemplate} />;
      default:
        return null;
    }
  };

  const patternWidthMap = {
    "Single Agent": showContent ? [450, 450] : [230, 450],
    "Supervision": showContent ? [230, 700] : [100, 450],
    "Validator": showContent ? [450, 450] : [230, 450],
    "Reflection": showContent ? [666, 600] : [333, 450],
    "Discussion": showContent ? [700, 700] : [350, 450],
    "Parallel": showContent ? [666, 700] : [333, 450],
    "Voting": showContent ? [666, 700] : [333, 450],
    "PDF Loader Agent": showContent ? [450, 450] : [230, 450],
    "Web Search Agent": showContent ? [450, 450] : [230, 450],
    default: [100, 100],
  };

  const patternSelect = () => {
    return (
      <Select
        label="Pattern"
        value={patternName}
        onChange={handleSelectPattern}
        size="small"
        sx={{
          fontSize: "16px",
          marginBottom: 1,
          maxWidth: 150,
          backgroundColor: "#e3f2fd",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#90caf9",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#42a5f5",
          },
        }}
        className="nodrag nopan"
      >
        {designPatternsPool.map((pattern) => (
          <MenuItem 
          key={pattern.name} 
          value={pattern.name}
          sx={{
            cursor: "pointer",
            fontSize: "12px",
          }}
          >
            {pattern.name}
          </MenuItem>
        ))}
      </Select>
    );
  };

  const confirmButton = () => {
    return (
      <Button
        color="primary"
        onClick={() => {
          if (data.template.confirm) {
            updateNodeFieldset(id, "template.confirm", false);
          } else {
            updateNodeFieldset(id, "template.confirm", true);
          }
        }}
      >
        Confirm
      </Button>
    );
  };

  const taskDescription = () => {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontSize: "18px",
            mb: 1,
            alignSelf: "flex-start",
          }}
        >
          <b>Task Description:</b> {data.stepDescription}
        </Typography>
      </Box>
    );
  };

  const iconsDisplay = () => {
    return (
      <Box
        sx={{
          transition: "opacity 0.5s ease-in-out",
          opacity: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          border: "1px solid #ddd",
        }}
      >
        <PatternIcons pattern={data.pattern} template={data.template} />
      </Box>
    );
  };

  const detailedTemplate = () => {
    return (
        <Box
          sx={{
            maxWidth: "100%",
            backgroundColor: data.template.confirm ? "#e3f2fd" : "#fff",
            transition: "opacity 0.3s ease-in-out",
            opacity: 1,
          }}
        >
          {patternForm()}
        </Box>
    );
  };

  const nodeHandles = () => {
    return (
      <>
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
      </>
    );
  };

  const stepNumber = () => {
    return (
      <Typography 
        sx={{ 
          fontWeight: "bold", 
          fontSize: "22px",
          m: 0 
        }}
      >
        Step {id.split("-")[1]}
      </Typography>
    );
  };

  const computationCost = () => {
    const {calls, runtime} = calculateCost(data.pattern, data.template);
    return (
      <Typography
        sx={{
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        {calls} LLM calls
      </Typography>
    );
  };

  const explanation = () => {
    const explanation = data.pattern.description;
    const placeholder = "This pattern is suitable because it optimizes cost and efficiency.";
    return (
      <Tooltip 
        title={explanation || placeholder} 
        arrow
        placement="right"
        componentsProps={{
          tooltip: {
            sx: {
              maxWidth: "150px",
            },
          },
        }}
      >
        <Button
          size="small"
          variant="outlined"
        >
          ?
        </Button>
      </Tooltip>
    );
  };


  const ZoomOutLevel = () => {
    return (
      <Box
        sx={{
          padding: 2,
          border: "1px solid #ddd",
          borderRadius: 4,
          backgroundColor: "#fff",
          minWidth: patternWidthMap[patternName]?.[0] || 100,
          textAlign: "center",
          maxWidth: patternWidthMap[patternName]?.[1] || 100,
          boxShadow: 2,
          gap: 0,
          transition: "all 0.3s ease-in-out",
        }}
      >
        {nodeHandles()}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            padding: 1,
          }}
        >
          {/* Top row: step number and pattern select centered */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            {stepNumber()}
            {patternSelect()}
          </Box>

          {/* Second row: menu */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
            }}
          >
            {computationCost()}

            {explanation()}

            {/* <Button size="small" variant="outlined">
              +
            </Button> */}
          </Box>

          {/* Icons display row */}
          <Box sx={{ marginTop: 1 }}>
            {iconsDisplay()}
          </Box>
        </Box>
      </Box>
    );
  };

  return <ZoomOutLevel />;
};
