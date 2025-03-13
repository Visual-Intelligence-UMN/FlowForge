import React, { useEffect, useRef, useCallback, useState } from "react";
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
  Panel,
  SelectionMode,
} from "@xyflow/react";
import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";
import {
  getLayoutedNodesAndEdges,
  getLayoutedNodesAndEdgesInGroup,
} from "../../utils/layout/dagreUtils";
import { useDnD } from "./DnDContext";
import "@xyflow/react/dist/style.css";
import "./xy-theme.css";
import { set } from "lodash";
let nodeId = 0;

export function FlowPanelComponent(props) {
  // props = {
  //     targetWorkflow: {
  //         graph: {
  //         nodes: [{id, type, position, data, }],
  //         edges: [{id, source, target,data:{label, llm, systemPrompt, tools:}}],
  //     },
  //      configId: "",
  //      key: "",
  //      langgraphRun: {},
  //      stepMetadata: {},
  // }

  const { configId, graph, langgraphRun, reactflowDisplay } =
    props.targetWorkflow;

  const initialNodes = graph?.nodes || [];
  const initialEdges = graph?.edges || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  // const [rfInstance, setRfInstance] = useState(null);

  const getId = (id: string) => `dndnode_${id}_${nodeId++}`;

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } =
      getLayoutedNodesAndEdgesInGroup(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    // screenToFlowPosition.fitView();
  }, [props.nodes, props.edges]);

  // --- on drag over --- 
  // const onDragOver = useCallback((event: any) => {
  //   event.preventDefault();
  //   event.dataTransfer.dropEffect = "move";
  // }, []);
  // --- on drag over --- 

  // --- on drop --- 
  // const onDrop = useCallback(
  //   (event: any) => {
  //     event.preventDefault();
  //     if (!type) return;

  //     const position = screenToFlowPosition({
  //       x: event.clientX,
  //       y: event.clientY,
  //     });
  //     const newNode = {
  //       id: getId(props.id),
  //       type,
  //       position,
  //       data: { label: `${type} node` },
  //     };
  //     setNodes((nds: any) => nds.concat(newNode));
  //   },
  //   [type, screenToFlowPosition]
  // );
  // --- on drop --- 

  const updateNodeFieldset = (nodeId, fieldName, newValue) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== nodeId) return node;
        const newData = { ...node.data };
        set(newData, fieldName, newValue);
        return { ...node, data: newData };
      })
    );
  };

  const modifiedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      updateNodeFieldset,
    },
  }));

  const panOnDrag = [1, 2];

  return (
    <div
      className="reactflow-wrapper"
      style={{ width: "100%", border: "1px solid #ddd" }}
    >
      <ReactFlow
        // id = {props.id}
        nodes={modifiedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        // onInit={setRfInstance}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // onDragOver={onDragOver}
        // onDrop={onDrop}
        // fitView={true}
        panOnScroll
        panOnDrag={panOnDrag}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
      >
        <Background />
        <Controls />
        <MiniMap />
        {/* <Panel position="top-right">
                    <button onClick={onSave}>Save</button>
                </Panel> */}
      </ReactFlow>
    </div>
  );
}
