import TaskPanel from "./components/panel-input/PanelTaskInput";
import Builder from "./components/builder/Builder";
import { headerStyle } from "./components/header/header";
import "./App.css";

const NewConstruction = () => {
  return (
    <div className="main-container">
      <header style={headerStyle}>FlowBuilder</header>
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
    <div>
      <NewConstruction />
    </div>
  );
}

export default App;
