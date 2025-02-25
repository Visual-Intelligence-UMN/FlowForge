import { TextField } from "@mui/material";

export function PatternTextField({ label, value, onChange }) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      size="small"
      multiline
      variant="outlined"
      maxRows={4}
      className={`nodrag nopan nowheel`}
    />
  );
}