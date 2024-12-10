import React from 'react';
import TaskPanel from './components/TaskPanel';
import TaskFlows from './components/TaskFlows';
import PatternsPanel from './components/PatternsPanel';
import AgentsPanel from './components/AgentsPanel';
import ReactFlowPanel from './components/ReactFlowPanel';
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