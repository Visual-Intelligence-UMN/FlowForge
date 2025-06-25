import {
  Box,
  TextField,
  IconButton,
  Typography,
  Grid2,
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/Cancel';
import { PatternTextField } from "../textfield/patternText";
import {InputIO, OutputIO} from "../textfield/streamIcons"


export function RedundantForm({ data, onChange }) {
  // // console.log("data", data)
  const agents = data.agents || [];

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

  const handleAggregationChange = (field) => (e) => {
    onChange({
      ...data,
      aggregation: {
        ...data.aggregation,
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

        <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" ,display: "inline-flex",}}>
          <InputIO active />
          Agent #{i + 1}
        </Typography>

        <PatternTextField
          label="Persona"
          value={agent.persona || ""}
          onChange={handleAgentChange(i, "persona")}
          maxRows={4}
        />

        {/* <PatternTextField
          label="Goal"
          value={agent.goal || ""}
          onChange={handleAgentChange(i, "goal")}
          maxRows={4}
        /> */}
      </Box>
    )
  }

  const aggregationDisplay = () => {
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
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" , display: "inline-flex",}}>
          <OutputIO active />
          Aggregation</Typography>
        <PatternTextField
          label="Persona"
          value={data.aggregation?.persona || ""}
          onChange={handleAggregationChange("persona")}
        />
        {/* <PatternTextField
          label="Goal"
          value={data.aggregation?.goal || ""}
          onChange={handleAggregationChange("goal")}
        /> */}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        pt:3,
        width: "100%",
      }}
    >
      <Grid2 container spacing={2}>
        {agents.map((agent, i) => (
          <Grid2 key={i} xs={12} md={6}>
            {eachAgent(agent, i)}
          </Grid2>
        ))}
        {aggregationDisplay()}
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

      </Box>

    </Box>
  );
}
