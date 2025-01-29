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
  agentsConfigAtom,
  selectedConfigAtom,
  compliedGenerateAtom,
} from "../global/GlobalStates";
import isEqual from "lodash.isequal"; 
import { config } from "dotenv";

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

const PageRfConfigs = () => {

  const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);

  const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
  const [compliedGenerate, setCompliedGenerate] = useAtom(compliedGenerateAtom);

  const canvasPages = useAtomValue(canvasPagesAtom);
  
  const { type, configId, patternId, flowId } = canvasPages || {};
  const config = agentsConfig.find(config => config.configId === configId);

  const { nodes: initialNodes, edges: initialEdges } = convertToReactFlowFormat(config);
  
  // Initialize ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (config) {
      const { nodes: newNodes, edges: newEdges } = convertToReactFlowFormat(config);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [config]);


  const handleSave = () => {
    const updatedTaskFlowSteps = nodes.map((node) => ({
      stepName: node.data.stepName,
      stepLabel: node.data.stepLabel,
      stepDescription: node.data.stepDescription,
      pattern: node.data.pattern,
    }));

    const updatedConfig = {
      ...config,
      taskFlowSteps: updatedTaskFlowSteps,
    };

    if (!isEqual(config, updatedConfig)) {
      setAgentsConfig((prevFlows) => 
        prevFlows.map((f) =>
          f.configId === configId ? updatedConfig : f
        )
      );
    }

    setSelectedConfig({ ...updatedConfig });
    setCompliedGenerate(0);
  };

  return (
    <ReactFlowProvider>
      <Box>
        <Typography variant="h6">{config.taskFlowName}</Typography>
        <Typography variant="body1">Config {config.configId}</Typography>
        <Typography variant="body1">{config.taskFlowDescription}</Typography>
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

export default React.memo(PageRfConfigs); 