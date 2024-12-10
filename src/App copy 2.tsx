import React from 'react';
import TaskPanel from './components/TaskPanel';
import TaskFlows from './components/TaskFlows';
import PatternsPanel from './components/PatternsPanel';

function App() {
    return (
        <div>
            <TaskPanel/>
            <TaskFlows/>
            <PatternsPanel/>
        </div>

    );
}

export default App;