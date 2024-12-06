
import '@xyflow/react/dist/style.css';
import { DnDProvider } from './components/DnDContext';
import Sidebar from './components/Sidebar';
import StreamOutput from './components/StreamOutput';
import { FlowWithProvider } from './components/FlowWithProvider';
import { useState } from 'react';
import TabFlows from './components/TabFlows';
import TabTask from './components/TabTasks';
import { useAtom } from 'jotai';
import { flowsAtom } from './global/GlobalStates';

const DoubleFlows = () => {

  const [selectedFlow1, setSelectedFlow1] = useState(null);
  const [selectedFlow2, setSelectedFlow2] = useState(null);
  const [inputFlowId1, setInputFlowId1] = useState("");
  const [selectedTask, setSelectedTask] = useState("ml-visualization");
  const [flows, setFlows] = useAtom(flowsAtom);
  const handleSelectTask = (tabId) => {
    setSelectedTask(tabId);
  }
  const handleSelectFlow1 = (tabId) => {
    setSelectedFlow1(tabId);
  }
  const handleSelectFlow2 = (tabId) => {
    setSelectedFlow2(tabId);
  }

  const handleSetFlow1ById = (inputFlowId1) => {
    setFlows((prev) => ({...prev, [inputFlowId1]: flows[inputFlowId1]}));
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
            <button onClick={() => handleSetFlow1ById(inputFlowId1)}>Create New Flow canvas: </button>
            <input
                type="text"
                placeholder="Enter Flow ID"
                value={inputFlowId1}
                onChange={(e) => setInputFlowId1(e.target.value)}
              />
              
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