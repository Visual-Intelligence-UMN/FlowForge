import React from 'react';
import TaskPanel from './components/PanelTaskInput';
import TaskFlows from './components/PanelTaskFlows';
import PatternsPanel from './components/PanelPatterns';
import AgentsPanel from './components/PanelConfigs';
import ReactFlowPanel from './components/PanelReactFlow';
const Construction = () => {
    return (
        <div className="main-container">
            <div className="pre-construction">
                <TaskPanel/>
            </div>
            <div className="construction">
                <TaskFlows/>
                <PatternsPanel/>
                <AgentsPanel/>
            </div>
            <div className="post-construction">
                <ReactFlowPanel/>
            </div>
        </div>
    );
};

function App() {
    return (
        <div>
            <Construction/>
        </div>

    );
}

export default App;