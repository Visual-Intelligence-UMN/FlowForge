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
          p: 8,
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" sx={{ mb: 4 }}>
          👋 Welcome to FlowForge
        </Typography>
        {/* <Typography variant="body1" sx={{ mb: 4 }}>
          Choose how you would like to proceed:
        </Typography> */}

        <Box 
          display="flex" 
          flexDirection={{ xs: "column", md: "row" }} 
          justifyContent="space-between" 
          gap={8}
        >
          {/* Right side: Continue without API Key */}
          <Box flex="1">
            <Typography variant="h6" gutterBottom>
              Example Mode
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Proceed without an API key. Real-time features will be disabled, but you can still explore example workflows or provide API key later.
            </Typography>
            <Button variant="outlined" onClick={handleContinueWithoutApi} sx={{ mt: 10 }}>
              Begin Without API
            </Button>
          </Box>
          {/* Left side: Provide API Key */}
          <Box flex="1">
            <Typography variant="h6" gutterBottom>
              Real-time Mode
            </Typography>
            <Typography variant="body2" sx={{ mb: 0 }}>
              Enter your OpenAI API key to enable real-time features.
            
                Find your OpenAI API key in{" "}
                <a
                  style={{ color: "black" }}
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenAI User Settings
                </a>.
              </Typography>
            <Box component="form" onSubmit={handleApiSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                id="openai-api"
                label="OpenAI API Key"
                name="openai-api"
                autoFocus
                fullWidth
              />
              <Button type="submit" variant="outlined" sx={{ mt: 2 }}>
                Begin with API
              </Button>
            </Box>
          </Box>          
        </Box>
      </Box>
    </Modal>
  );
};
