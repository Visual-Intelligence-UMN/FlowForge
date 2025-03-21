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
import { PatternsMap1, PatternsMap2, PatternsMap3 } from "../canvas-sidebar/PatternsPoolSidebar";
import { TaskFlowWithProvider } from "../canvas-provider/FlowWithProvider";
import { RfWithProvider } from "../canvas-provider/FlowWithProvider";
import { FlowWithProviderAgent } from "../canvas-provider/FlowWithProvider";
import { LoadingFlows, LoadingPatterns } from "./Loading";

const SharedCanvas = () => {
  const [canvasPages] = useAtom(canvasPagesAtom);
  const [flowsMap] = useAtom(flowsMapAtom);
  const [agentsConfig] = useAtom(agentsConfigAtom);
  const [flowsWithPatterns] = useAtom(patternsAtom);
  const [compiledConfigs] = useAtom(compiledConfigsAtom);

  const { type, configId, patternId, flowId } = canvasPages || {};
  let enableButtons = true;
  let loading = false;

  const convertToReactFlowFormat = (taskflow, nodeType) => {
    const { taskFlowSteps = [], taskFlowStart } = taskflow;
    const startNode = {
      id: "step-0",
      type: "startStep",
      position: { x: 0, y: 0 },
      data: {
        stepName: "START",
        inputText: taskFlowStart.input?.text || "",
        inputFile: taskFlowStart.input?.file || "",
      },
      deletable: false,
    };
    const stepNodes = taskFlowSteps.map((step, index) => {
      return {
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
          nextSteps: step.nextSteps || [],
        },
      };
    });

    const nodes = [startNode, ...stepNodes];
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
    taskFlowStart.nextSteps.forEach((nextStepId, idx) => {
      edges.push({
        id: `step-0->${nextStepId}`,
        source: "step-0",
        target: nextStepId,
        animated: true,
      });
    });

    taskFlowSteps.forEach((step) => {
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
          if (!targetWorkflow) {
            return <Typography>Pattern not found or deleted.</Typography>;
          }
          headerContent = "Flow with Patterns " + targetWorkflow.patternId;
          nodeType = "patternsStep";
          console.log("targetWorkflow", targetWorkflow);
          break;

        case "flow":
          // return <LoadingPatterns />
          targetWorkflow = flowsMap[flowId];
          if (!targetWorkflow) {
            return <Typography>Flow not found or deleted.</Typography>;
          }
          headerContent = "Flow " + String(targetWorkflow.taskFlowId);
          nodeType = "flowStep";
          break;

        case "compiled":
          targetWorkflow = compiledConfigs.find(
            (config) => config.configId === configId
          );
          if (!targetWorkflow) {
            return (
              <Typography>Compiled config not found or deleted.</Typography>
            );
          }
          headerContent = "Compiled Config " + targetWorkflow.configId;
          nodeType = "compiledStep";
          break;

        case "flow-generating":
          enableButtons = false;
          loading = true;
          return <LoadingFlows />;
        case "pattern-generating":
          enableButtons = false;
          loading = true;
          return <LoadingPatterns />;
        default:
          return <Typography>Canvas goes here</Typography>;
      }
      if (targetWorkflow && type !== "compiled") {
        ({ nodes: initialNodes, edges: initialEdges } =
          convertToReactFlowFormat(targetWorkflow, nodeType));
        // console.log("initialNodes and initialEdges after transform", initialNodes, initialEdges);
        if (type === "pattern") {
          return (
            <>
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
                <PatternsMap2 />
              </Box>
              {/* {loading && <LoadingPatterns />} */}
            </>
          );
        } else if (type === "flow") {
          return (
            <>
              <Typography variant="body1">{headerContent}</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <TaskFlowWithProvider
                  nodes={initialNodes}
                  edges={initialEdges}
                  targetWorkflow={targetWorkflow}
                />
                <PatternsMap1 />
              </Box>
            </>
          );
        }
      } else {
        initialNodes = targetWorkflow.reactflowDisplay[0].graph.nodes;
        initialEdges = targetWorkflow.reactflowDisplay[0].graph.edges;
        // console.log("initialNodes", initialNodes);
        return (
          <>
            <Typography variant="body1">{headerContent}</Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <FlowWithProviderAgent
                nodes={initialNodes}
                edges={initialEdges}
                targetWorkflow={targetWorkflow}
              />
              <PatternsMap3 />
            </Box>
          </>
        );
      }
    };
    return renderCanvasContent();
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
        <Typography variant="h5" sx={{ pt: 2, color: "lightgrey" }}>
          Please input your task first
        </Typography>
      </Box>
    );
  };

  return canvasPages.type ? (
    <Box
      className="canvas"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "0px solid #ddd",
        width: "100%",
        margin: '0px',
        // height
      }}
    >
      {canvasPage()}
    </Box>
  ) : (
    emptyCanvas()
  );
};

export default SharedCanvas;
