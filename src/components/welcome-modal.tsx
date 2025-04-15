import { Modal, Box, TextField, Button, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { saveEnvVal } from "../utils/utils";
import { runRealtimeAtom } from "../patterns/GlobalStates";
import { useState } from "react";

export const WelcomeModal = ({ updateApiKey }) => {
  const [runRealtime, setRunRealtime] = useAtom(runRealtimeAtom);
  const [open, setOpen] = useState(true);

  const handleApiSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const openaiApiToken = data.get("openai-api") as string;
    saveEnvVal("VITE_OPENAI_API_KEY", openaiApiToken);

    // Update parent state with the new API key
    updateApiKey(openaiApiToken);
    setRunRealtime(true);
    setOpen(false);
  };

  const handleContinueWithoutApi = () => {
    updateApiKey("");
    setRunRealtime(false);
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => {}}
      aria-labelledby="welcome-modal"
      aria-describedby="welcome-modal-options"
      className="api-input-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          maxWidth: "90%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          👋 Welcome to FlowForge
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Choose how you would like to proceed:
        </Typography>

        <Box 
          display="flex" 
          flexDirection={{ xs: "column", md: "row" }} 
          justifyContent="space-between" 
          gap={4}
        >
          {/* Left side: Provide API Key */}
          <Box flex="1">
            <Typography variant="h6" gutterBottom>
              Real-Time Mode
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter your OpenAI API key to enable real-time features.
            </Typography>
            <Box component="form" onSubmit={handleApiSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="openai-api"
                label="OpenAI API Key"
                name="openai-api"
                autoFocus
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Don’t have an API key yet? Find yours in{" "}
                <a
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenAI User Settings
                </a>
              </Typography>
              <Button type="submit" sx={{ mt: 2 }}>
                Begin
              </Button>
            </Box>
          </Box>

          {/* Right side: Continue without API Key */}
          <Box flex="1">
            <Typography variant="h6" gutterBottom>
              Offline Mode
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Proceed without providing an API key. Real-time features will be disabled.
            </Typography>
            <Button variant="outlined" onClick={handleContinueWithoutApi}>
              Continue Without API Key
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
