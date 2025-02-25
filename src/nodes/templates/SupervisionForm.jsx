import { Box, TextField, IconButton, Typography, Grid2 } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

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
        <Typography variant="subtitle2">Supervisor</Typography>
        <TextField
          label="Supervisor Persona"
          value={data.supervisor?.persona || ""}
          onChange={handleSupervisorChange("persona")}
          size="small"
          fullWidth
        />
        <TextField
          label="Supervisor Goal"
          value={data.supervisor?.goal || ""}
          onChange={handleSupervisorChange("goal")}
          size="small"
          fullWidth
        />
    </Box>
    )
  }

  const eachWorker = (w, i) => {
    return (
      <Box 
        sx={{
          position: "relative",
          display: "flex",
          flex: 1,
          // width: "80%",
          flexDirection: "column",
          gap: 1,
          border: "1px solid #ccc",
          p: 1,
          borderRadius: 2,
          boxShadow: 1,
          minHeight: 130, 
        }}
      >
            
      <IconButton
        onClick={() => removeWorker(i)}
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

        <Typography variant="subtitle2">Worker #{i + 1}</Typography>
        <TextField
          label="Worker Persona"
          value={w.persona || ""}
          onChange={handleWorkerChange(i, "persona")}
          size="small"
          fullWidth
        />
        <TextField
          label="Worker Goal"
          value={w.goal || ""}
          onChange={handleWorkerChange(i, "goal")}
          size="small"
          fullWidth
        />
      </Box>
    )
  }

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 3,
        width: "100%"
      }}
    >
     
      <Grid2
        container
        spacing={1}
        columns={3}
      >
        <Grid2 xs={12} md={6} lg={4}>
          {supervisorDisplay()}
        </Grid2>
        {workers.map((w, i) => (
          <Grid2 key={i} xs={12} md={6} lg={4}>
            {eachWorker(w, i)}
          </Grid2>
        ))}
      </Grid2>

      <Box 
        sx={{ 
          display: "flex", 
          gap: 2, 
          flexWrap: "wrap", 
          justifyContent: "left" }}>
        <IconButton onClick={addWorker} size="small" color="primary">
          <AddCircleIcon />
        </IconButton>
        <TextField
          label="maxRound"
          value={data.maxRound || ""}
          onChange={handleSimpleFieldChange("maxRound")}
          size="small"
        />
      </Box>

    </Box>
  );
}
