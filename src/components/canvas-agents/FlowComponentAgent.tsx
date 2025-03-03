import React, { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  OnConnect,
  SelectionMode
} from '@xyflow/react';
import { nodeTypes } from '../nodes';
import { edgeTypes } from '../edges';
import { getLayoutedNodesAndEdgesInGroup } from '../../utils/layout/dagreUtils';
import '@xyflow/react/dist/style.css';
import './xy-theme.css';
import { set } from 'lodash';

export function FlowComponentAgent(props) {
  const { targetWorkflow } = props;

  // We assume data is in targetWorkflow.reactflowDisplay[0].graph
  let { nodes: initialNodes, edges: initialEdges } = targetWorkflow.reactflowDisplay[0].graph;
  initialNodes = initialNodes.filter((node) => node.type !== "group");
  initialEdges = initialEdges.filter((edge) => edge.type !== "stepGroup");
  
  const { screenToFlowPosition } = useReactFlow();

  // Keep local state for ReactFlow
  const [nodes, setNodes, rawOnNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, rawOnEdgesChange] = useEdgesState(initialEdges);

  // 1) A custom wrapper to update ReactFlow's nodes and also
  //    keep the parent data (targetWorkflow) in sync
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((prevNodes) => {
        const newNodes = applyNodeChanges(changes, prevNodes);
        // Update targetWorkflow’s node list directly
        targetWorkflow.reactflowDisplay[0].graph.nodes = newNodes;
        return newNodes;
      });
    },
    [setNodes, targetWorkflow]
  );

  // 2) A custom wrapper for edges
  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((prevEdges) => {
        const newEdges = applyEdgeChanges(changes, prevEdges);
        // Update targetWorkflow’s edge list
        targetWorkflow.reactflowDisplay[0].graph.edges = newEdges;
        return newEdges;
      });
    },
    [setEdges, targetWorkflow]
  );

  // 3) On connect
  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((prevEdges) => {
        const newEdges = addEdge(connection, prevEdges);
        targetWorkflow.reactflowDisplay[0].graph.edges = newEdges;
        return newEdges;
      });
    },
    [setEdges, targetWorkflow]
  );

  // 4) Lay out the initial graph or whenever nodes/edges change
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } =
      getLayoutedNodesAndEdgesInGroup(nodes, edges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // If you'd like to fit the view after layout:
    // instance?.fitView();
  }, [nodes, edges, setNodes, setEdges]);

  // 5) When a node's data is changed inside a custom node (e.g., SingleAgentNode),
  //    call this function. It updates local state and also writes back to
  //    targetWorkflow.reactflowDisplay[0].graph.nodes.
  const updateNodeFieldset = (nodeId, fieldName, newValue) => {
    setNodes((prevNodes) => {
      const newNodes = prevNodes.map((node) => {
        if (node.id !== nodeId) return node;
        const newData = { ...node.data };
        set(newData, fieldName, newValue); // Using lodash `set` for nested paths
        return { ...node, data: newData };
      });

      // Sync the parent data structure
      targetWorkflow.reactflowDisplay[0].graph.nodes = newNodes;
      return newNodes;
    });
  };

  // 6) Pass `updateNodeFieldset` to each node so they can call it
  const modifiedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      updateNodeFieldset
    }
  }));

  // Let the user pan if they drag with mouse button 1 or 2
  const panOnDrag = [1, 2];

  return (
    <div
      className="reactflow-wrapper"
      style={{ width: '1300px', height: '800px', border: '1px solid #ddd' }}
    >
      <ReactFlow
        nodes={modifiedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        panOnScroll
        panOnDrag={panOnDrag}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
