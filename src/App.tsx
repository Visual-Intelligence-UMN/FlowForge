import TaskPanel from "./components/panel-input/PanelTaskInput";
import Builder from "./components/builder/Builder";
import { headerStyle } from "./components/header/header";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import "./App.css";

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
      <header style={headerStyle}>
        <div style={{ padding: "10px 40px", fontSize: "24pt" }}>FlowForge</div>
      </header>
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
  return (
    <ThemeProvider theme={theme}>
      <div>
        <NewConstruction />
      </div>
    </ThemeProvider>
  );
}

export default App;
