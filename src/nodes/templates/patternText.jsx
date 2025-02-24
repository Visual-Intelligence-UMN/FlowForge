import { TextField } from "@mui/material";

export function PatternTextField({ label, value, onChange }) {
    const trimmedValue = value.trim();
  return (
    <TextField
      label={label}
      value={trimmedValue || ""}
      onChange={onChange}
      size="small"
      multiline
      variant="outlined"
      maxRows={4}
      className={`nodrag nopan nowheel`}
    />
  );
}