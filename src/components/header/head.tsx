import { useState, useEffect } from "react";
import { Box, IconButton, Modal, TextField, Button, Typography, Stack } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { headerStyle } from "./header";
import { saveEnvVal, saveKey, loadKey } from "../../utils/utils";
import { runRealtimeAtom } from "../../patterns/GlobalStates";
import { useAtom } from "jotai";

const STORAGE_KEY = "VITE_OPENAI_API_KEY";

interface ApiKeyModalProps {
  open: boolean;
  handleClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, handleClose }) => {
  const [apiKey, setApiKey] = useState("");
  const [, setRunRealtime] = useAtom(runRealtimeAtom);

  // Load any existing key when the modal opens
  useEffect(() => {
    if (open) {
      // console.log("get key")
      const storedKey = localStorage.getItem(STORAGE_KEY) ?? "no key";
      setApiKey(storedKey);
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;

    localStorage.setItem(STORAGE_KEY, trimmed);
    // Optionally keep this for other utility hooks (noop on client build)
    saveKey(STORAGE_KEY, trimmed);

    setRunRealtime(true);
    handleClose();
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey("");
    setRunRealtime(false);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 24,
          p: 4,
          minWidth: 320,
        }}
      >
        <Typography variant="h6" gutterBottom>
          OpenAI API Key
        </Typography>

        <TextField
          fullWidth
          label="API Key"
          variant="outlined"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={handleClear} disabled={!apiKey}>
            Clear
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={!apiKey}>
            Save & Enable Online Mode
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

function HeaderWithIcons() {
  const [open, setOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  // Update indicator whenever modal toggles
  useEffect(() => {
    setHasKey(!!localStorage.getItem(STORAGE_KEY));
  }, [open]);

  return (
    <>
      <header style={headerStyle}>
        <Box
          sx={{
            paddingRight: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "24pt", padding: "10px 40px" }}>FlowForge</div>
          <Box>
            <IconButton
              color={hasKey ? "success" : "inherit"}
              onClick={() => setOpen(true)}
              title={hasKey ? "API Key set" : "Add API Key"}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
      </header>
      <ApiKeyModal open={open} handleClose={() => setOpen(false)} />
    </>
  );
}

export default HeaderWithIcons;
