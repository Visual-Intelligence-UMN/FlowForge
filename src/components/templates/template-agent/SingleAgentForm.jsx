import { Box, TextField ,  Typography,} from "@mui/material";
import {InputIO, OutputIO} from "../textfield/streamIcons"


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
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" ,display: "inline-flex",}}>
          <InputIO active /> <OutputIO active />
          Single Agent
        </Typography>
      <TextField
        label="Persona / Goal"
        value={data.persona || ""}
        onChange={handleFieldChange("persona")}
        size="small"
        className="nodrag nopan"
        multiline
        minRows={3}
        sx={{ maxWidth: 420 }} 
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
