
import '@xyflow/react/dist/style.css';
import { DnDProvider } from './components/DnDContext';
import Sidebar from './components/Sidebar';
import { useDnD } from './components/DnDContext';

import { initialNodes, nodeTypes } from './nodes';
import { initialEdges, edgeTypes } from './edges';

import { transformLangGraphToReactFlow } from './langgraph/graphUtils';
import { graphVizGraph } from './langgraph/test-graph';
import StreamOutput from './components/StreamOutput';
import { FlowWithProvider } from './components/FlowWithProvider';


// const DnDFlow = () => {
//   const {nodes: initialTransformedNodes, edges: initialTransformedEdges} = transformLangGraphToReactFlow(graphVizGraph);
//   return (
//     <div className="dndflow">
//       <Sidebar />
//       <div className="flows-container">
//         <div className="flow-section">
//           <FlowComponent
//               id = "1"
//               nodesState={[...initialNodes]}
//               edgesState={[...initialEdges]}
//           />
//         </div>
//         <div className="flow-section">flow2
//           <FlowComponent
//               id = "2"
//               nodesState={[...initialTransformedNodes]}
//               edgesState={[...initialTransformedEdges]}
//           />
//         </div>
//       </div>
//       <StreamOutput />
//     </div>
//   );
// }

const DoubleFlows = () => {
  const {nodes: initialTransformedNodes, edges: initialTransformedEdges} = transformLangGraphToReactFlow(graphVizGraph);
  return (
      <>
      <div className = "dndflow">
      <DnDProvider>
        <Sidebar />
        <div className = "doubleflow" style={{height: "800px"}}>
        <div className = "reactflow-wrapper">
        flow1
        <FlowWithProvider id = "1" nodesState={[...initialNodes]} edgesState={[...initialEdges]} />
      </div>
      <div className = "reactflow-wrapper">
        flow2
        <FlowWithProvider id = "2" nodesState={[...initialTransformedNodes]} edgesState={[...initialTransformedEdges]} />
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