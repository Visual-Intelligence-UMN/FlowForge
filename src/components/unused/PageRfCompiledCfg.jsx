import React, { useEffect, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Typography, Box, Button } from "@mui/material";
import { useAtom } from "jotai";
import {
  canvasPagesAtom,
  compiledConfigsAtom, // Ensure this is correctly named in your GlobalStates
} from "../../global/GlobalStates";
import isEqual from "lodash.isequal";

import { nodeTypes } from '../../nodes';
import { edgeTypes } from '../../edges';

const PageRfCompiledCfg = () => {

  const [compiledConfigs, setCompiledConfigs] = useAtom(compiledConfigsAtom);
  const [canvasPages] = useAtom(canvasPagesAtom);

  const compiledConfig = compiledConfigs.find(
    (config) => config.configId === canvasPages.configId
  );

  const { reactflowDisplay = [], langgraphRun, configId } = compiledConfig || {};
  console.log("reactflowDisplay", reactflowDisplay);

  const currentReactflowDisplay = reactflowDisplay[0] || {};

  const [nodes, setNodes, onNodesChange] = useNodesState(
    currentReactflowDisplay.graph?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    currentReactflowDisplay.graph?.edges || []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (compiledConfig && reactflowDisplay.length > 0) {
      const { nodes: newNodes, edges: newEdges } = reactflowDisplay[0].graph;
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [compiledConfig, reactflowDisplay, setNodes, setEdges]);

  const handleSave = () => {
    if (!compiledConfig) {
      console.error("No compiledConfig found to save.");
      return;
    }

    if (reactflowDisplay.length === 0) {
      console.error("reactflowDisplay array is empty.");
      return;
    }

    const updatedGraph = {
      ...currentReactflowDisplay.graph,
      nodes,
      edges,
    };

    const updatedReactflowDisplay = reactflowDisplay.map((flow, index) => {
      if (index === 0) {
        return {
          ...flow,
          graph: updatedGraph,
        };
      }
      return flow;
    });

    const updatedConfig = {
      ...compiledConfig,
      reactflowDisplay: updatedReactflowDisplay,
    };

    if (!isEqual(compiledConfig.reactflowDisplay[0].graph, updatedGraph)) {
      setCompiledConfigs((prevConfigs) =>
        prevConfigs.map((cfg) => {
          if (cfg.configId === configId) {
            return updatedConfig;
          }
          return cfg;
        })
      );

      console.log("CompiledConfig updated successfully.");
    } else {
      console.log("No changes detected. No update performed.");
    }

  };

  if (!compiledConfig) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          No configuration found for the current configId: {canvasPages.configId}
        </Typography>
      </Box>
    );
  }

  return (
    
      <Box>
        <Typography variant="body1">Compiled Config ID: {configId}</Typography>
        <Box
          sx={{
            height: 500,
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            marginTop: 2,
            width: "100%",
          }}
        >
            <ReactFlowProvider>
          <ReactFlow 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          />
          </ReactFlowProvider>
        </Box>

        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          sx={{ textTransform: "none", marginTop: 2 }}
        >
          Run
        </Button>
      </Box>
    
  );
};

export default React.memo(PageRfCompiledCfg);
