import { TextField } from "@mui/material";

export function PatternTextField({ label, value, onChange, maxRows=5 }) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      size="small"
      multiline
      variant="outlined"  
      minRows={2}
      maxRows={8}
      className={`nodrag nopan nowheel`}
      sx={{ p: 0.5}}
    />
  );
}