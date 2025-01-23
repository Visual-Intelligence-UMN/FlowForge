import React from 'react';
import TaskPanel from './components/PanelTaskInput';
import TaskFlows from './components/PanelTaskFlows';
import PatternsPanel from './components/PanelPatterns';
import AgentsPanel from './components/PanelConfigs';
import ReactFlowPanel from './components/PanelReactFlow';
import SharedCanvas from './components/SharedCanvas';
import TreeNav from './components/TreeNav';
import './App.css';

const headerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#333',
    fontSize: '28px',
    color: 'white',
    padding: '10px 20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
};

const Construction = () => {
    return (
        <div className="main-container">
            <header style={headerStyle}>
                FlowBuilder
            </header>
            <div style={{ marginTop: '50px', padding: '20px 20px', }}>
                <SharedCanvas />
                <TreeNav />
            </div>
            <div style={{ marginTop: '30px', padding: '20px 0px', }}>
                <div className="pre-construction section">
                    <TaskPanel />
                </div>
                <div className="construction section">
                    <TaskFlows />
                    <PatternsPanel />
                    <AgentsPanel />
                </div>
                <div className="post-construction section">
                    <ReactFlowPanel />
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <div>
            <Construction />
        </div>

    );
}

export default App;