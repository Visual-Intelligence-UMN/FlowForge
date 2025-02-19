import { Box, TextField } from "@mui/material";

export function SingleAgentForm({ data, onChange }) {
  // data = { persona: "Single Agent", goal: "Single Agent" }
    
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
        className="nodrag nopan"
      />
      <TextField
        label="Goal"
        value={data.goal || ""}
        onChange={handleFieldChange("goal")}
        size="small"
        className="nodrag nopan"
      />
    </Box>
  );
}
