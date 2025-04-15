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
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: 2, 
      width: "100%",
      p: 1,
    }}>
      <TextField
        label="Persona / Goal"
        value={data.persona || ""}
        onChange={handleFieldChange("persona")}
        size="small"
        className="nodrag nopan"
        multiline
        minRows={3}
      />
      {/* <TextField
        label="Goal"
        value={data.goal || ""}
        onChange={handleFieldChange("goal")}
        size="small"
        className="nodrag nopan"
        multiline
        minRows={3}
      /> */}
    </Box>
  );
}
