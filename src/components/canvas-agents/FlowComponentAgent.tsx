import React, { useEffect, useCallback } from "react";
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
  SelectionMode,
} from "@xyflow/react";
import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";
import { getLayoutedNodesAndEdgesInGroup } from "../../utils/layout/dagreUtils";
import "@xyflow/react/dist/style.css";
import "./xy-theme.css";
import { set } from "lodash";

function reorderNodesForReactFlow(nodes) {
  // return nodes;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const visited = new Set();
  const result = [];

  function visit(node) {
    if (!node) return;
    if (visited.has(node.id)) return;
    visited.add(node.id);

    // If this node has a parentId, visit that first
    if (node.parentId) {
      visit(nodeMap.get(node.parentId));
    }

    result.push(node);
  }

  // Visit each node in the array
  nodes.forEach((node) => visit(node));

  return result;
}

export function FlowComponentAgent(props) {
  const { targetWorkflow } = props;

  // We assume data is in targetWorkflow.reactflowDisplay[0].graph
  let { nodes: initialNodes, edges: initialEdges } =
    targetWorkflow.reactflowDisplay[0].graph;
  //   initialNodes = initialNodes.filter((node) => node.type !== "group");
  //   initialEdges = initialEdges.filter((edge) => edge.type !== "stepGroup");

  const reactFlowInstance = useReactFlow();
  const {fitView} = useReactFlow();

  // Keep local state for ReactFlow
  const [nodes, setNodes, rawOnNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, rawOnEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } =
      getLayoutedNodesAndEdgesInGroup(nodes, edges);

    setNodes(reorderNodesForReactFlow(layoutedNodes));
    setEdges(layoutedEdges);

    setTimeout(() => {
      if (layoutedNodes.length) {
        fitView({ padding: 0.2 });
      }
    }, 100);

  }, [setNodes, setEdges, fitView]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((prevNodes) => {
        const newNodes = applyNodeChanges(changes, prevNodes);
        targetWorkflow.reactflowDisplay[0].graph.nodes = newNodes;
        return newNodes;
      });
    },
    [setNodes, targetWorkflow]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((prevEdges) => {
        const newEdges = applyEdgeChanges(changes, prevEdges);
        targetWorkflow.reactflowDisplay[0].graph.edges = newEdges;
        return newEdges;
      });
    },
    [setEdges, targetWorkflow]
  );

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

  const updateNodeFieldset = (nodeId, fieldName, newValue) => {
    setNodes((prevNodes) => {
      const newNodes = prevNodes.map((node) => {
        if (node.id !== nodeId) return node;
        const newData = { ...node.data };
        set(newData, fieldName, newValue); // Using lodash `set` for nested paths
        return { ...node, data: newData };
      });

      targetWorkflow.reactflowDisplay[0].graph.nodes = newNodes;
      return newNodes;
    });
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
      style={{ height: "57vh", border: "1px solid #ddd", position: "relative" }}
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
        defaultViewport={{ x: 0, y: 0, zoom: 0.1}}
        minZoom={0.1}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
