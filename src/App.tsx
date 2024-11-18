import { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type OnConnect,
  ReactFlowProvider,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { DnDProvider } from './components/DnDContext';
import Sidebar from './components/Sidebar';
import { useDnD } from './components/DnDContext';

import { initialNodes, nodeTypes } from './nodes';
import { initialEdges, edgeTypes } from './edges';

import { transformLangGraphToReactFlow } from './langgraph/graphUtils';
import { graphVizGraph } from './langgraph/test-graph';
import StreamOutput from './components/StreamOutput';

import { getLayoutedNodesAndEdges } from './utils/dagreUtils';


let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const {screenToFlowPosition} = useReactFlow();
  const [type] = useDnD()

  const {nodes: initialTransformedNodes, edges: initialTransformedEdges} = transformLangGraphToReactFlow(graphVizGraph);

  const [nodes, setNodes, onNodesChange] = useNodesState([...initialTransformedNodes, ...initialNodes]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([...initialTransformedEdges, ...initialEdges]);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    if(!type) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const newNode = {
      id: getId(),
      type,
      position,
      data: {label: `${type} node`},
    };
    setNodes((nds: any) => nds.concat(newNode));
  }, [type, screenToFlowPosition]);

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedNodesAndEdges(
      nodes,
      edges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, []);

  return (
    <div className="dndflow">
      <Sidebar />
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
      <StreamOutput />
      
    </div>
  );
}

export default function App() {
  return (
    // <StreamOutput />
    <ReactFlowProvider>
      <DnDProvider>
      <DnDFlow /> 
      </DnDProvider>
    </ReactFlowProvider>
  );
}