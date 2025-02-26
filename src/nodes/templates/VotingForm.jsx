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

export function VotingForm({ data, onChange }) {
  const agents = data.agents || [];
  // console.log(data)

  const handleSimpleFieldChange = (field) => (e) => {
    onChange({
      ...data,
      [field]: e.target.type === "number" ? parseInt(e.target.value) : e.target.value,
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

      <PatternTextField
        label="Persona"
        value={agent.persona || ""}
        onChange={handleAgentChange(i, "persona")}
        size="small"
      />
      <PatternTextField
        label="Rubric"
        value={agent.rubric || ""}
        onChange={handleAgentChange(i, "rubric")}
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
      </Box>
     
    </Box>
  );
}
