import { Box, TextField } from "@mui/material";

export function ValidatorForm({ data, onChange }) {
  // data = { persona: "Validator", goal: "Validator" }
  const handleFieldChange = (field) => (e) => {
    onChange({
      ...data,
      [field]: e.target.value,
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
      <TextField
        label="Persona"
        value={data.persona || ""}
        onChange={handleFieldChange("persona")}
        size="small"
      />
      <TextField
        label="Goal"
        value={data.goal || ""}
        onChange={handleFieldChange("goal")}
        size="small"
      />
    </Box>
  );
}
