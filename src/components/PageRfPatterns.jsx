// PageTaskFlow.js
import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Typography, Box, Button } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import {
  canvasPagesAtom,
  patternsAtom,
  agentsConfigGenerateAtom,
  agentsConfigPatternAtom,
} from "../global/GlobalStates";
import isEqual from "lodash.isequal"; 

const convertToReactFlowFormat = (flowWithPatterns) => {
  const nodes = flowWithPatterns.taskFlowSteps.map((step, index) => ({
    id: `step-${index}`,
    type: "customNode",
    position: { x: index * 250, y: 100 },
    data: {
      stepName: step.stepName || `Step ${index + 1}`,
      stepLabel: step.stepLabel || "",
      stepDescription: step.stepDescription || "",
      label: step.stepLabel || `Step ${index + 1}`,
      pattern: step.pattern || { name: "", description: "" },
    },
  }));
  
  const edges = nodes.map((node, index) =>
    index < nodes.length - 1
      ? { id: `edge-${index}`, source: node.id, target: nodes[index + 1].id }
      : null
  ).filter(Boolean);
  
  return { nodes, edges };
};

const PageRfPatterns = () => {

  const [flowsWithPatterns, setFlowsWithPatterns] = useAtom(patternsAtom);
  const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(agentsConfigGenerateAtom);
  const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(agentsConfigPatternAtom);
  
  const canvasPages = useAtomValue(canvasPagesAtom);
  
  const { type, configId, patternId, flowId } = canvasPages || {};
  const flowWithPatterns = flowsWithPatterns.find(pattern => pattern.patternId === patternId);

  const { nodes: initialNodes, edges: initialEdges } = convertToReactFlowFormat(flowWithPatterns);
  
  // Initialize ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (flowWithPatterns) {
      const { nodes: newNodes, edges: newEdges } = convertToReactFlowFormat(flowWithPatterns);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [flowWithPatterns]);


  const handleSave = () => {
    const updatedTaskFlowSteps = nodes.map((node) => ({
      stepName: node.data.stepName,
      stepLabel: node.data.stepLabel,
      stepDescription: node.data.stepDescription,
      pattern: node.data.pattern,
    }));

    const updatedTaskflow = {
      ...flowWithPatterns,
      taskFlowSteps: updatedTaskFlowSteps,
    };

    // Deep comparison to prevent unnecessary updates
    if (!isEqual(flowWithPatterns, updatedTaskflow)) {
      setFlowsWithPatterns((prevFlows) => 
        prevFlows.map((f) =>
          f.patternId === patternId ? updatedTaskflow : f
        )
      );
    }

    setAgentsConfigPattern({ ...updatedTaskflow });
    setAgentsConfigGenerate(0);
  };

  return (
    <ReactFlowProvider>
      <Box>
        <Typography variant="h6">{flowWithPatterns.taskFlowName}</Typography>
        <Typography variant="body1">{flowWithPatterns.taskFlowDescription}</Typography>
        <Box
          sx={{
            height: 500,
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
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
            handleSave(); // Save updates to flowsMapAtom
          }}
          sx={{ textTransform: "none", pt: 2 }}
        >
          CONTINUE
        </Button>
      </Box>
    </ReactFlowProvider>
  );
};

export default React.memo(PageRfPatterns); 