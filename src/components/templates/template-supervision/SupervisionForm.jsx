import { Box, TextField, IconButton, Typography, Grid2 } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/Cancel';
import { PatternTextField } from "../textfield/patternText";
import {InputIO, OutputIO} from "../textfield/streamIcons"

export function SupervisionForm({ data, onChange }) {
  // data = { workerNum, maxRound, workers: [...], supervisor: {...} }
  const workers = data.workers || [];

  const handleSimpleFieldChange = (field) => (e) => {
    onChange({
      ...data,
      [field]: e.target.value,
    });
  };

  const handleWorkerChange = (index, field) => (e) => {
    const newWorkers = [...workers];
    newWorkers[index] = {
      ...newWorkers[index],
      [field]: e.target.value,
    };
    onChange({
      ...data,
      workers: newWorkers,
    });
  };

  const addWorker = () => {
    const newWorkers = [...workers, { persona: "Worker", goal: "Worker" }];
    onChange({
      ...data,
      workers: newWorkers,
      workerNum: (data.workerNum || 0) + 1,
    });
  };

  const removeWorker = (index) => {
    const newWorkers = [...workers];
    newWorkers.splice(index, 1);
    onChange({
      ...data,
      workers: newWorkers,
      workerNum: Math.max((data.workerNum || 1) - 1, 0),
    });
  };

  const handleSupervisorChange = (field) => (e) => {
    onChange({
      ...data,
      supervisor: {
        ...data.supervisor,
        [field]: e.target.value,
      },
    });
  };

  const supervisorDisplay = () => {
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
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" ,textAlign: "center" ,display: "inline-flex"}}>
          <InputIO active />
          Supervisor</Typography>
        <PatternTextField
          label="Persona"
          value={data.supervisor?.persona || ""}
          onChange={handleSupervisorChange("persona")}
        />
        {/* <PatternTextField
          label="Goal"
          value={data.supervisor?.goal || ""}
          onChange={handleSupervisorChange("goal")}
        /> */}
      </Box>
    )
  }

  const eachWorker = (w, i) => {
    return (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          // width: "80%",
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
          onClick={() => removeWorker(i)}
          size="small"
          // color="error"
          sx={{
            position: "absolute",
            top: 4,
            right: 12,
          }}
        >
          <RemoveOutlinedIcon
            size="small"
          />
        </IconButton>

        <Typography variant="subtitle1"
          sx={{textAlign: "center" ,display: "inline-flex",}}
        >
          <OutputIO />
          Worker #{i + 1}</Typography>
        <PatternTextField
          label="Persona"
          value={w.persona || ""}
          onChange={handleWorkerChange(i, "persona")}
          size="small"
          fullWidth
        />
        {/* <PatternTextField
          label="Goal"
          value={w.goal || ""}
          onChange={handleWorkerChange(i, "goal")}
          size="small"
          fullWidth
        /> */}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        width: "100%",
        alignItems: "center",
      }}
    >

      <Grid2
        container
        spacing={3}
        columns={3}
      >
        {/* <Grid2 container spacing={2} xs={12} md={6} lg={4}> */}
          {supervisorDisplay()}
        {/* </Grid2> */}
        {workers.map((w, i) => (
          <Grid2 key={i} xs={12} md={12} lg={12}>
            {eachWorker(w, i)}
          </Grid2>
        ))}
      </Grid2>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "left"
        }}>

        <IconButton onClick={addWorker} size="small" color="primary">
          <AddCircleOutlineIcon fontSize="large" />
        </IconButton>

        <TextField
          label="Max Turn"
          value={data.maxRound || ""}
          onChange={handleSimpleFieldChange("maxRound")}
          size="small"
          sx={{ maxWidth: "23%", justifyContent: "center" }}
        />
      </Box>

    </Box>
  );
}
