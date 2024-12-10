import React from 'react';
import TaskPanel from './components/TaskPanel';
import TaskFlows from './components/TaskFlows';
import PatternsPanel from './components/PatternsPanel';
import AgentsPanel from './components/AgentsPanel';
import ReactFlowPanel from './components/ReactFlowPanel';
const Construction = () => {
    return (
        <>
            <div className="pre-construction">
                <TaskPanel/>
            </div>
            <div className="construction">
                <TaskFlows/>
                <PatternsPanel/>
                <AgentsPanel/>
            </div>
            <ReactFlowPanel/>
        </>
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