import React, { useEffect, useCallback, useLayoutEffect } from "react";
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
  useStore,
  useStoreApi
} from "@xyflow/react";
import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";
import { layoutDagre } from "./layout-agents";
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

      // Keep local state for ReactFlow
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const {fitView} = useReactFlow();

  useEffect(() => {

    // const edgesWithHandles = initialEdges.map(edge => {

    //   if (edge.id.includes("Supervisor->Worker")) {
    //     return {
    //       ...edge,
    //       sourceHandle: "bottom" + "-" + edge.source,
    //       targetHandle: "top" + "-" + edge.target,
    //       type: "default",
    //       animated: true,
    //     };
    //   }

    //   if (edge.id.includes("->Supervisor")) {
    //     return {
    //       ...edge,
    //       sourceHandle: "top" + "-" + edge.source,
    //       targetHandle: "bottom" + "-" + edge.target,
    //       type: "default",
    //       animated: true,
    //     };
    //   }

    //   if (edge.id.includes("Evaluator->Optimizer")) {
    //       return {
    //           ...edge,
    //           sourceHandle: "out-left" + "-" + edge.source,
    //           targetHandle: "in-right" + "-" + edge.target,
    //           type: "default",
    //           animated: true,
    //           style: {
    //             stroke: "red",
    //           },
    //       };
    //   }

    //   if (edge.id.includes("Optimizer->Evaluator")) {
    //       return {
    //           ...edge,
    //           sourceHandle: "out-right" + "-" + edge.source,
    //           targetHandle: "in-left" + "-" + edge.target,
    //           type: "default",
    //           animated: true,
    //       };
    //   }
    //   if (edge.id.includes("->Aggregator")) {
    //       return {
    //           ...edge,
    //           type: "default",
    //           sourceHandle: "out-right" + "-" + edge.source,
    //           targetHandle: "in-left" + "-" + edge.target,
    //           animated: true,
    //       };
    //   }
    //   return edge;
    //   });
    
    console.log("layout");
    const { nodes: layoutedNodes, edges: layoutedEdges } =
      layoutDagre(initialNodes, initialEdges);

    const reorderedNodes = reorderNodesForReactFlow(layoutedNodes);
    setNodes(reorderedNodes);
    setEdges(layoutedEdges);

    setTimeout(() => {
      if (layoutedNodes.length) {
        fitView({ padding: 0.05, duration: 2000 });
      }
    }, 500);
  }, [props.nodes, props.edges, fitView]);


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

  // const onEdgesChange = useCallback(
  //   (changes) => {
  //     setEdges((prevEdges) => {
  //       const newEdges = applyEdgeChanges(changes, prevEdges);
  //       targetWorkflow.reactflowDisplay[0].graph.edges = newEdges;
  //       return newEdges;
  //     });
  //   },
  //   [setEdges, targetWorkflow]
  // );

  // const onConnect: OnConnect = useCallback(
  //   (connection) => {
  //     setEdges((prevEdges) => {
  //       const newEdges = addEdge(connection, prevEdges);
  //       targetWorkflow.reactflowDisplay[0].graph.edges = newEdges;
  //       return newEdges;
  //     });
  //   },
  //   [setEdges, targetWorkflow]
  // );

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

  const zoomSelector = (s) => s.transform[2] >= 0.5;
  const showContent = useStore(zoomSelector);
  const zoomRatio = useStore((s) => s.transform[2]);

  const modifiedNodes = nodes.map((node) => ({
    ...node,
    style: {
      ...(node.style || {}),
      transition: "transform 0.5s ease"
    },
    data: {
      ...node.data,
      updateNodeFieldset,
      showContent,
    },
  }));

  const panOnDrag = [1, 2];

  const handleNodeClick = useCallback((evt, node) => {
    if (node){
      console.log("node", node);
    }
  }, []);

  // const handleEdgeClick = useCallback((evt, edge) => {
  //   if (edge){
  //     console.log("edge", edge);
  //   }
  // }, []);

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
        // onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        onNodeClick={handleNodeClick}
        // onEdgeClick={handleEdgeClick}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        panOnScroll
        panOnDrag={panOnDrag}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5}}
        minZoom={0.1}
      >
        <Background />
        <Controls />
        {/* <MiniMap /> */}
      </ReactFlow>
    </div>
  );
}
