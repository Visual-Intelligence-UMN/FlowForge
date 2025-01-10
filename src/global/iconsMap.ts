// Import all the icons you need
import {
    Home as HomeIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    // ...any other icons
} from "@mui/icons-material";

// Create a mapping from iconType to the actual component

export const iconMap = {
    "Discussion": HomeIcon,
    "Reflection": PersonIcon,
    "Supervision": SettingsIcon,
    "Web Search Agent": HomeIcon,
    "PDF Loader Agent": PersonIcon,
    "Single Agent": SettingsIcon,
    // any other icons ...
  };