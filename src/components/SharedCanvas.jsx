import React, { useState } from "react";
import {Slider, Box, Typography} from "@mui/material";
import { useAtom } from "jotai";
import { canvasPagesAtom } from "../global/GlobalStates";
import PageCompiledCfg from "./PageCompiledCfg";

import { RfWithProvider } from "./FlowWithProvider";

import { flowsMapAtom , patternsAtom, agentsConfigAtom, compiledConfigsAtom} from "../global/GlobalStates";

const SharedCanvas = ( ) => {
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
        {value: 1, label: "Task Split"},
        {value: 2, label: "Subtask-Pattern"},
        {value: 3, label: "Agents Config"},
    ];

    // const verticalSlider = () => {
    //     return (
    //         <Box sx={{ width: 20 , pt: 2, pl: 10, pr: 2, border: "1px solid black"}}>
    //             <Slider 
    //                 value={activeStep}
    //                 onChange={handleSliderChange}
    //                 step={1}
    //                 min={1}
    //                 max={3}
    //                 marks={steps.map(step => ({value: step.value, label: step.label}))}
    //                 valueLabelDisplay="auto"
    //                 orientation="vertical"
    //                 sx={{
    //                     pl: 5,
    //                     height: 400,
    //                     transform: "rotate(180deg)",
    //                     transformOrigin: "center center",
              
    //                     "& .MuiSlider-markLabel": {
    //                       transform: "rotate(180deg)",
    //                       whiteSpace: "nowrap",
    //                     },
    //                     "& .MuiSlider-valueLabel": {
    //                       transform: "rotate(180deg)",
    //                       left: "-100px",
    //                     },
    //                     "& .MuiSlider-rail": {
    //                         transform: "rotate(180deg)"
    //                     },

    //                   }}
    //             />
    //         </Box>
    //     );
    // };

    const horizontalSlider = () => {
        return (
            <Box sx={{ width: 300 , pt: 2, pl: 2, pr: 2}}>
                <Slider 
                    value={activeStep}
                    onChange={handleSliderChange}
                    step={1}
                    min={1}
                    max={3}
                    marks={steps.map(step => ({value: step.value, label: step.label}))}
                    valueLabelDisplay="auto"
                    // disabled={true}
                />
            </Box>
        );
    };

    const convertToReactFlowFormat = (taskflow, nodeType) => {
        
        // console.log("taskflow to transform nodes and edges", taskflow);
        const nodes = taskflow.taskFlowSteps.map((step, index) => ({
          id: `step-${index+1}`,
          type: nodeType,
          position: { x: index * 250, y: 100 },
          data: {
            stepName: step.stepName || `Step ${index + 1}`,
            stepLabel: step.stepLabel || "",
            stepDescription: step.stepDescription || "",
            label: step.stepLabel || `Step ${index + 1}`,
            pattern: step.pattern || { name: "", description: "" },
            config: step.config || { type: "none", nodes: [], edges: [] },
          },
        }));
        const edges = nodes.map((node, index) =>
          index < nodes.length - 1
            ? { 
              id: `edge-${index}`, 
              source: node.id, 
              target: nodes[index + 1].id,
              animated: true,
            }
            : null
        ).filter(Boolean);
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
                case 'config':
                    targetWorkflow = agentsConfig.find(config => config.configId === configId);
                    headerContent = "Config " + targetWorkflow.configId;
                    nodeType = "configStep"
                    break;
                case 'pattern':
                    targetWorkflow = flowsWithPatterns.find(pattern => pattern.patternId === patternId);
                    headerContent = "Flow with Patterns " + targetWorkflow.patternId;
                    nodeType = "patternsStep"
                    break;
                case 'flow':
                    targetWorkflow = flowsMap[flowId];
                    headerContent = "Flow " + String(targetWorkflow.taskFlowId);
                    nodeType = "flowStep"
                    break;
                case 'compiled':
                    // return <PageRfCompiledCfg />;
                    targetWorkflow = compiledConfigs.find(config => config.configId === configId);
                    headerContent = "Compiled Config " + targetWorkflow.configId;
                    nodeType = "compiledStep"
                    break;
                default:
                    return <Typography>Canvas goes here</Typography>;
            }
            if (targetWorkflow && type !== "compiled") {
                ({ nodes: initialNodes, edges: initialEdges } = convertToReactFlowFormat(targetWorkflow, nodeType));
                // console.log("initialNodes and initialEdges after transform", initialNodes, initialEdges);
                return (
                    <Box sx={{border: "1px solid #ddd", display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <Typography variant="h6">{headerContent}</Typography>
                        <RfWithProvider nodes={initialNodes} edges={initialEdges} targetWorkflow={targetWorkflow} />
                    </Box>
                );
            } else {
                return <PageCompiledCfg />;
            }
        };
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "left" }}>
                {renderCanvasContent()}
            </Box>
        );
    };

    return (
        <Box sx={{display: "flex", flexDirection: "column", alignItems: "center" }}>
            {canvasPage()}
            {horizontalSlider()}
        </Box>
    );
};

export default SharedCanvas;