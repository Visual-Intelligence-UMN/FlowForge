import { Box, TextField, Typography } from "@mui/material";

export function ReflectionForm({ data, onChange }) {
  // data = {
  //   maxRound: number,
  //   evaluator: { persona, goal },
  //   optimizer: { persona, goal },
  // }

  const handleSimpleFieldChange = (field) => (e) => {
    onChange({
      ...data,
      [field]: e.target.value,
    });
  };

  const handleNestedFieldChange = (role, field) => (e) => {
    onChange({
      ...data,
      [role]: {
        ...data[role],
        [field]: e.target.value,
      },
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      {/* maxRound */}
      <TextField
        label="Max Round"
        type="number"
        value={data.maxRound || ""}
        onChange={handleSimpleFieldChange("maxRound")}
        size="small"
      />

      {/* Evaluator */}
      <Typography variant="subtitle2">Evaluator</Typography>
      <TextField
        label="Evaluator Persona"
        value={data.evaluator?.persona || ""}
        onChange={handleNestedFieldChange("evaluator", "persona")}
        size="small"
      />
      <TextField
        label="Evaluator Goal"
        value={data.evaluator?.goal || ""}
        onChange={handleNestedFieldChange("evaluator", "goal")}
        size="small"
      />

      {/* Optimizer */}
      <Typography variant="subtitle2">Optimizer</Typography>
      <TextField
        label="Optimizer Persona"
        value={data.optimizer?.persona || ""}
        onChange={handleNestedFieldChange("optimizer", "persona")}
        size="small"
      />
      <TextField
        label="Optimizer Goal"
        value={data.optimizer?.goal || ""}
        onChange={handleNestedFieldChange("optimizer", "goal")}
        size="small"
      />
    </Box>
  );
}
