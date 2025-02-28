import React from 'react';
import TaskPanel from './components/panel-input/PanelTaskInput';
import TaskFlows from './components/unused/PanelTaskFlows';
import PatternsPanel from './components/unused/PanelPatterns';
import AgentsPanel from './components/unused/PanelConfigs';
import ReactFlowPanel from './components/unused/PanelReactFlow';
import Builder from './components/builder/Builder';
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

// const Construction = () => {
//     return (
//         <div className="main-container">
//             <header style={headerStyle}>
//                 FlowBuilder
//             </header>
//             <div className="builder-container">
//                 <Builder />
//             </div>
//             <div style={{ marginTop: '30px', padding: '20px 0px', }}>
//                 <div className="pre-construction section">
//                     <TaskPanel />
//                 </div>
//                 <div className="construction section">
//                     <TaskFlows />
//                     <PatternsPanel />
//                     <AgentsPanel />
//                 </div>
//                 <div className="post-construction section">
//                     <ReactFlowPanel />
//                 </div>
//             </div>
//         </div>
//     );
// };

const NewConstruction = () => {
    return (
        <div className="main-container">
            <header style={headerStyle}>
                FlowBuilder
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
        <div>
            <NewConstruction />
        </div>

    );
}

export default App;