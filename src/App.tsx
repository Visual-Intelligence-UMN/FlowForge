import TaskPanel from "./components/panel-input/PanelTaskInput";
import Builder from "./components/builder/Builder";
import headerWithIcons from "./components/header/head";
import { headerStyle } from "./components/header/header";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import "./App.css";
import { useEffect, useState } from "react";
import { WelcomeModal } from "./components/welcome-modal";
// Or Create your Own theme:
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    // secondary: {
    //   main: '#dc004e',
    // },
  }
});

const NewConstruction = () => {
  return (
    <div className="main-container">
      {headerWithIcons()}
      {/* <header style={headerStyle}>
        <div style={{ padding: "10px 40px", fontSize: "24pt" }}>FlowForge</div>
      </header> */}
      <div className="pre-construction section">
        <TaskPanel />
      </div>
      <div className="builder-container">
        <Builder />
      </div>
    </div>
  );
};

function App() {
  const [firstTime, setFirstTime] = useState(localStorage.getItem("firstTime") !== "false");
  const [openaiApiKey, setopenaiApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY); 

  useEffect(() => {
    if (firstTime) {
      // tutorial
      localStorage.setItem("firstTime", "false");
    }
  }, [firstTime]);

  const updateOpenaiApiKey = (newApiKey: string) => {
    setopenaiApiKey(newApiKey); 
  }

  return (
    <>
    <WelcomeModal updateApiKey={updateOpenaiApiKey}/>
      {/* {openaiApiKey ? (
        <></>
      ) : (
      
    )} */}
    <ThemeProvider theme={theme}>
      <div>
        <NewConstruction />
      </div>
    </ThemeProvider>
    </>
  );
}

export default App;
