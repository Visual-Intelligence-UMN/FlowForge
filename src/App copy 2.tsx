import React from 'react';
import TaskPanel from './components/TaskPanel';
import TaskFlows from './components/TaskFlows';
import PatternsPanel from './components/PatternsPanel';
import AgentsPanel from './components/AgentsPanel';

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