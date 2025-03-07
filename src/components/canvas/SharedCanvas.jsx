import React, { useState } from "react";
import { Slider, Box, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { canvasPagesAtom } from "../../patterns/GlobalStates";
import PageCompiledCfg from "../canvas-agents/PageCompiledCfg";
import { RfWithProvider } from "../canvas-provider/FlowWithProvider";
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
const SharedCanvas = () => {
  const [activeStep, setActiveStep] = useState(1);

  const [canvasPages] = useAtom(canvasPagesAtom);
  const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
  const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
  const [flowsWithPatterns, setFlowsWithPatterns] = useAtom(patternsAtom);
  const [compiledConfigs, setCompiledConfigs] = useAtom(compiledConfigsAtom);
  const { type, configId, patternId, flowId } = canvasPages || {};

  const handleSliderChange = (event, newValue) => {
    setActiveStep(newValue);
  };

  const steps = [
    { value: 1, label: "Task Split" },
    { value: 2, label: "Subtask-Pattern" },
    { value: 3, label: "Agents Config" },
  ];

  const horizontalSlider = () => {
    return (
      <Box sx={{ width: 300, pt: 2, pl: 2, pr: 2 }}>
        <Slider
          value={activeStep}
          onChange={handleSliderChange}
          step={1}
          min={1}
          max={3}
          marks={steps.map((step) => ({
            value: step.value,
            label: step.label,
          }))}
          valueLabelDisplay="auto"
          // disabled={true}
        />
      </Box>
    );
  };

  const convertToReactFlowFormat = (taskflow, nodeType) => {
    // console.log("taskflow to transform nodes and edges", taskflow);
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
    const edges = nodes
      .map((node, index) =>
        index < nodes.length - 1
          ? {
              id: `edge-${index}`,
              source: node.id,
              target: nodes[index + 1].id,
              animated: true,
            }
          : null
      )
      .filter(Boolean);
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
                width: "1500px",
                height: "900px",
                border: "1px solid #ddd",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 2,
              }}
            >
              <Typography variant="h6" sx={{ marginBottom: 1 }}>
                {headerContent}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
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
                border: "1px solid #ddd",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "1500px",
                height: "900px",
              }}
            >
              <Typography variant="h6">{headerContent}</Typography>
              <TaskFlowWithProvider
                nodes={initialNodes}
                edges={initialEdges}
                targetWorkflow={targetWorkflow}
              />
            </Box>
          );
        } else {
          return (
            <Box
              sx={{
                border: "1px solid #ddd",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "1500px",
                height: "900px",
              }}
            >
              <Typography variant="h6">{headerContent}</Typography>
              <RfWithProvider
                nodes={initialNodes}
                edges={initialEdges}
                targetWorkflow={targetWorkflow}
              />
            </Box>
          );
        }
      } else {
        return (
          <Box
            sx={{
              border: "1px solid #ddd",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{headerContent}</Typography>
            <PageCompiledCfg />
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
          height: "500px",
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
        // p: 2,
        // m: 2,
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
