import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Typography,
  Grid2,
  Select,
  MenuItem,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { PatternTextField } from "./patternText";

export function DiscussionForm({ data, onChange }) {
  const agents = data.agents || [];
  console.log(data)

  const handleSimpleFieldChange = (field) => (e) => {
    onChange({
      ...data,
      [field]: e.target.type === "number" ? parseInt(e.target.value) : e.target.value,
    });
  };

  const handleCheckboxChange = (field) => (e) => {
    onChange({
      ...data,
      [field]: e.target.checked,
    });
  };

  const handleAgentChange = (index, field) => (e) => {
    const newAgents = [...agents];
    newAgents[index] = {
      ...newAgents[index],
      [field]: e.target.value,
    };
    onChange({
      ...data,
      agents: newAgents,
    });
  };

  const addAgent = () => {
    const newAgents = [...agents, { persona: "", goal: "" }];
    onChange({
      ...data,
      agentNum: (data.agentNum || 0) + 1,
      agents: newAgents,
    });
  };

  const removeAgent = (index) => {
    const newAgents = [...agents];
    newAgents.splice(index, 1);
    onChange({
      ...data,
      agentNum: Math.max((data.agentNum || 1) - 1, 0),
      agents: newAgents,
    });
  };

  const handleSummaryChange = (field) => (e) => {
    onChange({
      ...data,
      summary: {
        ...data.summary,
        [field]: e.target.value,
      },
    });
  };

  const eachAgent = (agent, i) => {
    return (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          border: "1px solid #ccc",
          p: 1,
          borderRadius: 2,
          boxShadow: 1,
          minHeight: 120, 
        }}
      >
    
      <IconButton
        onClick={() => removeAgent(i)}
        size="small"
        color="error"
        sx={{
          position: "absolute",
          top: 4,
          right: 12,
        }}
      >
        {/* <RemoveCircleIcon /> */}
        -
      </IconButton>

      <Typography variant="subtitle2" sx={{ fontWeight: "bold", textAlign: "center" }}>
        Agent #{i + 1}
      </Typography>
      {/* <PatternTextField
        label="Pattern Prompt"
        value={agent.patternPrompt || ""}
        onChange={handleAgentChange(i, "patternPrompt")}
        size="small"
      /> */}
      <PatternTextField
        label="Persona"
        value={agent.persona || ""}
        onChange={handleAgentChange(i, "persona")}
        size="small"
      />
      <PatternTextField
        label="Goal"
        value={agent.goal || ""}
        onChange={handleAgentChange(i, "goal")}
        size="small"
      />
    </Box>
    )
  }

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 2,
        width: "100%",
      }}
    >
      <Grid2 container spacing={1} columns={3}>
        {agents.map((agent, i) => (
          <Grid2 key={i} xs={12} md={6} lg={4}>
            {eachAgent(agent, i)}
          </Grid2>
        ))}
      </Grid2>
      

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        
          <IconButton 
            onClick={addAgent} 
            size="large" 
            color="primary"
            sx={{  width: "8%"}}
            >
            <AddCircleIcon fontSize="large" />
          </IconButton>

          <TextField
            label="Max Round"
            type="number"
            value={data.maxRound || ""}
            onChange={handleSimpleFieldChange("maxRound")}
            size="small"
            sx={{ flex: "1" }}
          />

          <Select
            label="Summary"
            value={data.withSummary || ""}
            onChange={handleSimpleFieldChange("withSummary")}
            size="small"
            sx={{ flex: "1" , mt: 1}}
            className="nodrag nopan"
          >
            <MenuItem value="true">yes</MenuItem>
            <MenuItem value="false">no</MenuItem>
          </Select>
      </Box>
     
      

      {/* Checkbox for Summary */}
      {/* <FormControlLabel
        control={<Checkbox checked={!!data.withSummary} onChange={handleCheckboxChange("withSummary")} />}
        label="With Summary"
      />
      {data.withSummary && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Summary</Typography>
          <TextField
            label="Summary Persona"
            value={data.summary?.persona || ""}
            onChange={handleSummaryChange("persona")}
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Summary Goal"
            value={data.summary?.goal || ""}
            onChange={handleSummaryChange("goal")}
            size="small"
          />
        </Box>
      )} */}
    </Box>
  );
}
