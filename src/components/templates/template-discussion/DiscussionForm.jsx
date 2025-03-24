import {
  Box,
  TextField,
  IconButton,
  Typography,
  Grid2,
  Select,
  MenuItem,
} from "@mui/material";

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/Cancel';

import { PatternTextField } from "../textfield/patternText";

export function DiscussionForm({ data, onChange }) {
  const agents = data.agents || [];
  // console.log("data", data)

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
          gap: 1.5,
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
          color="default"
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
          label="Persona"
          value={agent.persona || ""}
          onChange={handleAgentChange(i, "persona")}
          maxRows={4}
        />
        <PatternTextField
          label="Goal"
          value={agent.goal || ""}
          onChange={handleAgentChange(i, "goal")}
          maxRows={4}
        />
      </Box>
    )
  }

  const summaryDisplay = () => {
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
          minHeight: 130,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Summary</Typography>
        <PatternTextField
          label="Persona"
          value={data.summary?.persona || ""}
        // onChange={handleAggregationChange("persona")}
        />
        <PatternTextField
          label="Goal"
          value={data.summary?.goal || ""}
        // onChange={handleAggregationChange("goal")}
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
      <Grid2 container spacing={2} columns={3}>
        {agents.map((agent, i) => (
          <Grid2 key={i} xs={12} md={12} lg={12}>
            {eachAgent(agent, i)}
          </Grid2>
        ))}
        {data.withSummary && summaryDisplay()}
      </Grid2>


      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>

        <IconButton
          onClick={addAgent}
          size="small"
          color="primary"
          sx={{ width: "10%" }}
        >
          <AddCircleOutlineIcon fontSize="large" />
        </IconButton>

        <TextField
          label="Max Round"
          type="number"
          value={data.maxRound || ""}
          onChange={handleSimpleFieldChange("maxRound")}
          size="small"
          sx={{ maxWidth: "20%" }}
          className={`nodrag nopan nowheel`}
        />

        <Select
          label="Summary"
          value={data.withSummary || ""}
          onChange={handleSimpleFieldChange("withSummary")}
          size="small"
          sx={{ maxWidth: "60%" }}
          className="nodrag nopan"
        >
          <MenuItem value={true}>With Summary</MenuItem>
          <MenuItem value={false}>No Summary</MenuItem>
        </Select>
      </Box>

    </Box>
  );
}
