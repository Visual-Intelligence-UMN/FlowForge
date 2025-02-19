import {
    Box,
    TextField,
    FormControlLabel,
    Checkbox,
    IconButton,
    Typography
  } from "@mui/material";
  import AddCircleIcon from "@mui/icons-material/AddCircle";
  import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
  
  export function DiscussionForm({ data, onChange }) {
    // data = {
    //   maxRound: number,
    //   agentNum: number,
    //   withSummary: boolean,
    //   agents: [
    //     { persona, goal }, ...
    //   ],
    //   summary: { persona, goal }
    // };
    const agents = data.agents || [];
  
    const handleSimpleFieldChange = (field) => (e) => {
      onChange({
        ...data,
        [field]: e.target.type === "number" 
          ? parseInt(e.target.value) 
          : e.target.value
      });
    };
  
    const handleCheckboxChange = (field) => (e) => {
      onChange({
        ...data,
        [field]: e.target.checked
      });
    };
  
    const handleAgentChange = (index, field) => (e) => {
      const newAgents = [...agents];
      newAgents[index] = {
        ...newAgents[index],
        [field]: e.target.value
      };
      onChange({ 
        ...data, 
        agents: newAgents 
      });
    };
  
    const addAgent = () => {
      const newAgents = [...agents, { persona: "", goal: "" }];
      onChange({
        ...data,
        agentNum: (data.agentNum || 0) + 1,
        agents: newAgents
      });
    };
  
    const removeAgent = (index) => {
      const newAgents = [...agents];
      newAgents.splice(index, 1);
      onChange({
        ...data,
        agentNum: (data.agentNum || 1) - 1,
        agents: newAgents
      });
    };
  
    const handleSummaryChange = (field) => (e) => {
      onChange({
        ...data,
        summary: {
          ...data.summary,
          [field]: e.target.value
        }
      });
    };
  
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Max Round"
          type="number"
          value={data.maxRound || ""}
          onChange={handleSimpleFieldChange("maxRound")}
          size="small"
        />
  
        <TextField
          label="Number of Agents"
          type="number"
          value={data.agentNum || 0}
          onChange={handleSimpleFieldChange("agentNum")}
          size="small"
        />
  
        <FormControlLabel
          control={
            <Checkbox
              checked={!!data.withSummary}
              onChange={handleCheckboxChange("withSummary")}
            />
          }
          label="With Summary"
        />
  
        <Typography variant="subtitle2">Agents</Typography>
        {agents.map((agent, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              border: "1px solid #ccc",
              p: 1,
              mb: 1
            }}
          >
            <TextField
              label={`Agent #${i + 1} Persona`}
              value={agent.persona || ""}
              onChange={handleAgentChange(i, "persona")}
              size="small"
            />
            <TextField
              label="Goal"
              value={agent.goal || ""}
              onChange={handleAgentChange(i, "goal")}
              size="small"
            />
            <IconButton onClick={() => removeAgent(i)} size="small" color="error">
              <RemoveCircleIcon />
            </IconButton>
          </Box>
        ))}
  
        <IconButton onClick={addAgent} size="small" color="primary">
          <AddCircleIcon />
        </IconButton>
  
        {data.withSummary && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Summary</Typography>
            <TextField
              label="Summary Persona"
              value={data.summary?.persona || ""}
              onChange={handleSummaryChange("persona")}
              size="small"
            />
            <TextField
              label="Summary Goal"
              value={data.summary?.goal || ""}
              onChange={handleSummaryChange("goal")}
              size="small"
            />
          </Box>
        )}
      </Box>
    );
  }
  