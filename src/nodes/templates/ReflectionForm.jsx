import { Box, TextField, Typography } from "@mui/material";
import { PatternTextField } from "./patternText";
export function ReflectionForm({ data, onChange }) {
  // data = {
  //   maxRound: number,
  //   evaluator: { persona, goal, patternPrompt },
  //   optimizer: { persona, goal, patternPrompt },
  // }

  const handleSimpleFieldChange = (field) => (e) => {
    onChange({
      ...data,
      [field]: e.target.value.trim(),
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
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2, width: "100%" , backgroundColor: "#e3f2fd", p: 1, borderRadius: 1, border: "1px solid #90caf9"}}>

     
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>

      {/* Evaluator */}
      <Typography variant="subtitle2">Evaluator</Typography>
      <PatternTextField
        label="Evaluator Goal"
        value={data.evaluator?.goal || ""}
        onChange={handleNestedFieldChange("evaluator", "goal")}
      />
      <PatternTextField
        label="Evaluator Pattern Prompt"
        value={data.evaluator?.patternPrompt || ""}
        onChange={handleNestedFieldChange("evaluator", "patternPrompt")}
      />
      <PatternTextField
        label="Evaluator Persona"
        value={data.evaluator?.persona || ""}
        onChange={handleNestedFieldChange("evaluator", "persona")}
      />
      </Box>

      {/* Optimizer */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      <Typography variant="subtitle2">Optimizer</Typography>
      <PatternTextField
        label="Optimizer Goal"
        value={data.optimizer?.goal || ""}
        onChange={handleNestedFieldChange("optimizer", "goal")}
      />
      <PatternTextField
        label="Optimizer Pattern Prompt"
        value={data.optimizer?.patternPrompt || ""}
        onChange={handleNestedFieldChange("optimizer", "patternPrompt")}
      />
      <PatternTextField
        label="Optimizer Persona"
        value={data.optimizer?.persona || ""}
        onChange={handleNestedFieldChange("optimizer", "persona")}
      />
      </Box>
      <TextField
          label="Max Round"
          type="number"
          value={data.maxRound || ""}
          onChange={handleSimpleFieldChange("maxRound")}
          size="small"
      />
    </Box>
  );
}
