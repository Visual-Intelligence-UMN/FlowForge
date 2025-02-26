import {
  Box,
  TextField,
  IconButton,
  Typography,
  Grid2,
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import { PatternTextField } from "./patternText";

export function VotingForm({ data, onChange }) {
  const agents = data.agents || [];

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
          top: 1,
          right: 9,
        }}
      >
        <RemoveOutlinedIcon 
            size="small" 
        />
      </IconButton>

      <Typography variant="subtitle2" sx={{ fontWeight: "bold", textAlign: "center" }}>
        Agent #{i + 1}
      </Typography>

      <PatternTextField
        label="Rubric"
        value={agent.rubric || ""}
        onChange={handleAgentChange(i, "rubric")}
        maxRows={4}
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
      

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        
          <IconButton 
            onClick={addAgent} 
            size="small" 
            color="primary"
            sx={{width: "10%"}}
            >
            <AddCircleOutlineIcon fontSize="large" />
          </IconButton>

          <TextField
            label="Max Round"
            type="number"
            value={data.maxRound || ""}
            onChange={handleSimpleFieldChange("maxRound")}
            size="small"
            sx={{ maxWidth: "20%", justifyContent: "center" }}
            className={`nodrag nopan nowheel`}
          />
      </Box>
     
    </Box>
  );
}
