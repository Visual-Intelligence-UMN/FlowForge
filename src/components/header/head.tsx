import { Box, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExtensionIcon from "@mui/icons-material/Extension"; 
import { headerStyle } from "./header";

function headerWithIcons() {
  return (
    <header style={headerStyle}>
      <Box
        sx={{
          paddingRight: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
       
          {/* <ExtensionIcon sx={{ fontSize: "28px" }} /> */}
          <div style={{ fontSize: "24pt", padding: "10px 40px" }}>FlowForge</div>
        

        <Box>
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
          {/* <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton> */}
        </Box>
      </Box>
    </header>
  );
};

export default headerWithIcons;