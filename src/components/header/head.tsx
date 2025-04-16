import { useState } from "react";
import { Box, IconButton, Modal, TextField, Button, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { headerStyle } from "./header";
import { saveEnvVal } from "../../utils/utils";

const ApiKeyModal = ({ open, handleClose }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    saveEnvVal("VITE_OPENAI_API_KEY", apiKey);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box 
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: '4px',
          boxShadow: 24,
          p: 4,
          minWidth: 300,
        }}
      >
        <Typography variant="h6" gutterBottom>
          OpenAI API Key
        </Typography>
        <TextField
          fullWidth
          label="API Key"
          variant="outlined"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Modal>
  );
};

// Main header component with icons
function HeaderWithIcons() {
  const [open, setOpen] = useState(false);

  const popUpModal = () => {
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
  };

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
            <IconButton color="inherit" onClick={popUpModal}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
      </header>
      <ApiKeyModal open={open} handleClose={handleModalClose} />
    </>
  );
}

export default HeaderWithIcons;
