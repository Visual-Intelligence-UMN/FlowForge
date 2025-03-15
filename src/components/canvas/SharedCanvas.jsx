import React, { useState } from "react";
import { Slider, Box, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { canvasPagesAtom } from "../../patterns/GlobalStates";
import StageHighlight from "../canvas-slider/StageHighlight";
import {
  flowsMapAtom,
  patternsAtom,
  agentsConfigAtom,
  compiledConfigsAtom,
} from "../../patterns/GlobalStates";
import {
  ExploreLeftButton,
  ExploreRightButton,
} from "../canvas-buttons/ExploreButtons";
import { PatternsMap } from "../canvas-sidebar/PatternsPoolSidebar";
import { TaskFlowWithProvider } from "../canvas-provider/FlowWithProvider";
import { RfWithProvider } from "../canvas-provider/FlowWithProvider";
import { FlowWithProviderAgent } from "../canvas-provider/FlowWithProvider";
const SharedCanvas = () => {
  const [canvasPages] = useAtom(canvasPagesAtom);
  const [flowsMap] = useAtom(flowsMapAtom);
  const [agentsConfig] = useAtom(agentsConfigAtom);
  const [flowsWithPatterns] = useAtom(patternsAtom);
  const [compiledConfigs] = useAtom(compiledConfigsAtom);
  const { type, configId, patternId, flowId } = canvasPages || {};

  const convertToReactFlowFormat = (taskflow, nodeType) => {
    const nodes = taskflow.taskFlowSteps.map((step, index) => ({
      id: `step-${index + 1}`,
      type: nodeType,
      position: { x: index * 250, y: 100 },
      data: {
        stepName: step.stepName || `Step ${index + 1}`,
        stepLabel: step.stepLabel || "",
        stepDescription: step.stepDescription || "",
        label: step.stepLabel || `Step ${index + 1}`,
        pattern: step.pattern || { name: "", description: "" },
        template: step.template || {
          persona: "Single Agent",
          goal: "Single Agent",
        },
        config: step.config || { type: "none", nodes: [], edges: [] },
      },
    }));
    // const edges = nodes
    //   .map((node, index) =>
    //     index < nodes.length - 1
    //       ? {
    //           id: `edge-${index}`,
    //           source: node.id,
    //           target: nodes[index + 1].id,
    //           animated: true,
    //         }
    //       : null
    //   )
    //   .filter(Boolean);
    
    const edges = [];
    taskflow.taskFlowSteps.forEach((step) => {
      if (Array.isArray(step.nextSteps)) {
        step.nextSteps.forEach((nextStepId, idx) => {
          edges.push({
            id: `${step.stepId}->${nextStepId}-${idx}`,
            source: step.stepId,
            target: nextStepId,
            animated: true,
          });
        });
      }
    });
    // console.log("nodes and edges after transform", nodes, edges);

    return { nodes, edges };
  };

  let initialNodes;
  let initialEdges;
  let targetWorkflow;
  let headerContent;
  let nodeType;

  const canvasPage = () => {
    // console.log("canvasPage", canvasPages);
    targetWorkflow = null;
    const renderCanvasContent = () => {
      switch (type) {
        case "config":
          targetWorkflow = agentsConfig.find(
            (config) => config.configId === configId
          );
          headerContent = "Config " + targetWorkflow.configId;
          nodeType = "configStep";
          break;
        case "pattern":
          targetWorkflow = flowsWithPatterns.find(
            (pattern) => pattern.patternId === patternId
          );
          headerContent = "Flow with Patterns " + targetWorkflow.patternId;
          nodeType = "patternsStep";
          console.log("targetWorkflow", targetWorkflow);
          break;
        case "flow":
          targetWorkflow = flowsMap[flowId];
          headerContent = "Flow " + String(targetWorkflow.taskFlowId);
          nodeType = "flowStep";
          break;
        case "compiled":
          targetWorkflow = compiledConfigs.find(
            (config) => config.configId === configId
          );
          headerContent = "Compiled Config " + targetWorkflow.configId;
          nodeType = "compiledStep";
          break;
        default:
          return <Typography>Canvas goes here</Typography>;
      }
      if (targetWorkflow && type !== "compiled") {
        ({ nodes: initialNodes, edges: initialEdges } =
          convertToReactFlowFormat(targetWorkflow, nodeType));
        // console.log("initialNodes and initialEdges after transform", initialNodes, initialEdges);
        if (type === "pattern") {
          return (
            <Box
              sx={{
                width: "100%",
                height: "55vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="body1">{headerContent}</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <RfWithProvider
                  nodes={initialNodes}
                  edges={initialEdges}
                  targetWorkflow={targetWorkflow}
                />
                <PatternsMap />
              </Box>
            </Box>
          );
        } else if (type === "flow") {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                height: "55vh",
              }}
            >
              <Typography variant="body1">{headerContent}</Typography>
              <TaskFlowWithProvider
                nodes={initialNodes}
                edges={initialEdges}
                targetWorkflow={targetWorkflow}
              />
            </Box>
          );
        }
      } else {
        initialNodes = targetWorkflow.reactflowDisplay[0].graph.nodes;
        initialEdges = targetWorkflow.reactflowDisplay[0].graph.edges;
        // console.log("initialNodes", initialNodes);
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              height: "55vh",
            }}
          >
            <Typography variant="body1">{headerContent}</Typography>
            <FlowWithProviderAgent
              nodes={initialNodes}
              edges={initialEdges}
              targetWorkflow={targetWorkflow}
            />
          </Box>
        );
      }
    };
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "left" }}
      >
        {renderCanvasContent()}
      </Box>
    );
  };

  const emptyCanvas = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1px solid #ddd",
          width: "100%",
          height: "70vh",
          color: "grey",
        }}
      >
        <Typography variant="h8" sx={{ pt: 2 }}>
          Canvas page waits for task to be selected
        </Typography>
      </Box>
    );
  };

  return canvasPages.type ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid #ddd",
      }}
    >
      {/* Row with left button, canvas content, right button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <ExploreLeftButton />
        {canvasPage()}
        <ExploreRightButton />
      </Box>

      <Box sx={{ mt: 8 }}>
        <StageHighlight />
      </Box>
    </Box>
  ) : (
    emptyCanvas()
  );
};

export default SharedCanvas;
