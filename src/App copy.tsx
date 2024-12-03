
import '@xyflow/react/dist/style.css';
import { DnDProvider } from './components/DnDContext';
import Sidebar from './components/Sidebar';
import StreamOutput from './components/StreamOutput';
import { FlowWithProvider } from './components/FlowWithProvider';
import { useState } from 'react';
import TabFlows from './components/TabFlows';
import TabTask from './components/TabTasks';

const DoubleFlows = () => {

  const [selectedFlow1, setSelectedFlow1] = useState("1");
  const [selectedFlow2, setSelectedFlow2] = useState("2");
  const [selectedTask, setSelectedTask] = useState("ml-visualization");

  const handleSelectTask = (tabId) => {
    setSelectedTask(tabId);
  }
  const handleSelectFlow1 = (tabId) => {
    setSelectedFlow1(tabId);
  }
  const handleSelectFlow2 = (tabId) => {
    setSelectedFlow2(tabId);
  }
  
  return (
      <>
      <div className = "dndflow">
      <DnDProvider>
        <Sidebar />

        <div className = "doubleflow" style={{height: "800px"}}>
          <TabTask selectedTask={selectedTask} onSelectTask={handleSelectTask} />
          <div className="recommend-flows"> Recommendation Flows for {selectedTask}</div>
          <div className = "reactflow-wrapper">
            <TabFlows selectedFlow={selectedFlow1} onSelectFlow={handleSelectFlow1} />
        {selectedFlow1 ? (
        // <FlowWithProvider key={selectedFlow1}  id = {selectedFlow1} nodesState={flowsNodes[selectedFlow1]} edgesState={flowsEdges[selectedFlow1]} />) : null}
        <FlowWithProvider key={selectedFlow1} id = {selectedFlow1} />) : null}
        </div>
        <div className = "reactflow-wrapper">
        <TabFlows selectedFlow={selectedFlow2} onSelectFlow={handleSelectFlow2} />
        {selectedFlow2 ? (
        // <FlowWithProvider key={selectedFlow2} id = {selectedFlow2} nodesState={flowsNodes[selectedFlow2]} edgesState={flowsEdges[selectedFlow2]} />) : null}
        <FlowWithProvider key={selectedFlow2} id = {selectedFlow2} />) : null}
          </div>
        </div>
        </DnDProvider>
        <StreamOutput />
      </div>
    </>
  );
}


export default function DoubleFlow() {

  return (
      <DoubleFlows />
  );
}