import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";
import { Typography, Box, TextField, Button } from "@mui/material";
import { useAtom } from "jotai";
import { patternsFlowAtom, patternsGenerateAtom, flowsMapAtom } from "../global/GlobalStates";

const convertToReactFlowFormat = (taskflow) => {
  const nodes = taskflow.taskFlowSteps.map((step, index) => ({
    id: `step-${index}`,
    type: "customNode",
    position: { x: index * 250, y: 100 },
    data: {
      stepName: step.stepName || `Step ${index + 1}`,
      stepLabel: step.stepLabel || "",
      stepDescription: step.stepDescription || "",
      label: step.stepLabel || `Step ${index + 1}`,
    },
  }));
  
  const edges = nodes.map((node, index) =>
    index < nodes.length - 1
      ? { id: `edge-${index}`, source: node.id, target: nodes[index + 1].id }
      : null
  ).filter(Boolean);
  
  return { nodes, edges };
};

const PageTaskFlow = ({ taskflow }) => {

    const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
    const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
    const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);

  if (!taskflow) {
    return <div>No flow data</div>;
  }

  const { nodes: initialNodes, edges: initialEdges } = convertToReactFlowFormat(taskflow);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  useEffect(() => {
    setFlowsMap((prevFlows) => ({
      ...prevFlows,
      [taskflow.taskFlowId]: {
        ...taskflow,
        taskFlowSteps: nodes.map(node => ({
          stepName: node.data.stepName,
          stepLabel: node.data.stepLabel,
          stepDescription: node.data.stepDescription,
        }))
      },
    }));
  }, [nodes, setFlowsMap, taskflow.taskFlowId]);

  return (
    <ReactFlowProvider>
      <Box>
        <Typography variant="h6">{taskflow.taskFlowName}</Typography>
        <Typography variant="body1">{taskflow.taskFlowDescription}</Typography>
        <Box sx={{ height: 500, border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          />
        </Box>
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setPatternsFlow({ ...taskflow }); // Ensures a fresh copy is passed
            setPatternsGenerate(0);
          }}
          sx={{ textTransform: "none", pt: 2 }}
        >
          CONTINUE
        </Button>
      </Box>
    </ReactFlowProvider>
  );
};

export default PageTaskFlow;
