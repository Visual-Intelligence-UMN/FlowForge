import { Box, TextField, IconButton, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

export function SupervisionForm({ data, onChange }) {
  // data = { workerNum, maxRound, workers: [...], supervisor: {...} }
  // Be careful: data might be empty, so default to empty arrays/objects

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
    const newWorkers = [
      ...workers,
      { persona: "Worker", goal: "Worker" },
    ];
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
      workerNum: (data.workerNum || 1) - 1,
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Simple fields */}
      <TextField
        label="maxRound"
        value={data.maxRound || ""}
        onChange={handleSimpleFieldChange("maxRound")}
        size="small"
      />

      {/* Workers */}
      <Typography variant="subtitle2">Workers ({workers.length})</Typography>
      {workers.map((w, i) => (
        <Box
          key={i}
          sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1 }}
        >
          <TextField
            label="Worker Persona"
            value={w.persona || ""}
            onChange={handleWorkerChange(i, "persona")}
            size="small"
          />
          <TextField
            label="Worker Goal"
            value={w.goal || ""}
            onChange={handleWorkerChange(i, "goal")}
            size="small"
          />
          <IconButton onClick={() => removeWorker(i)} size="small" color="error">
            <RemoveCircleIcon />
          </IconButton>
        </Box>
      ))}
      <IconButton onClick={addWorker} size="small" color="primary">
        <AddCircleIcon />
      </IconButton>

      {/* Supervisor */}
      <Typography variant="subtitle2">Supervisor</Typography>
      <TextField
        label="Supervisor Persona"
        value={data.supervisor?.persona || ""}
        onChange={handleSupervisorChange("persona")}
        size="small"
      />
      <TextField
        label="Supervisor Goal"
        value={data.supervisor?.goal || ""}
        onChange={handleSupervisorChange("goal")}
        size="small"
      />
    </Box>
  );
}
