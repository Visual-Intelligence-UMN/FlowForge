import React, { useState } from "react";
import {Slider, Box, Typography} from "@mui/material";
import { useAtom } from "jotai";
import { canvasPagesAtom } from "../global/GlobalStates";
import { flowsMapAtom } from "../global/GlobalStates";
import { patternsGenerateAtom, patternsFlowAtom, patternsAtom,
     agentsConfigGenerateAtom, agentsConfigPatternAtom, agentsConfigAtom,
     selectedConfigAtom, compiledConfigsAtom, compliedGenerateAtom} from "../global/GlobalStates";

import PageTaskFlow from "./PageTaskFlow";
import PagePatterns from "./PagePatterns";
import PageConfigs from "./PageConfigs";
import PageCompiledCfg from "./PageCompiledCfg";
const SharedCanvas = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);

    const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
    const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
    const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);

    const [flowsWithPatterns, setFlowsWithPatterns] = useAtom(patternsAtom);
    const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(agentsConfigGenerateAtom);
    const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(agentsConfigPatternAtom);
    const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);

    const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
    const [compliedGenerate, setCompliedGenerate] = useAtom(compliedGenerateAtom);
    const [compiledConfigs, setCompiledConfigs] = useAtom(compiledConfigsAtom);
    const handleSliderChange = (event, newValue) => {
        setActiveStep(newValue);
    };

    const steps = [
        {value: 1, label: "Task Split"},
        {value: 2, label: "Subtask-Pattern"},
        {value: 3, label: "Agents Config"},
    ];

    const verticalSlider = () => {
        return (
            <Box sx={{ width: 20 , pt: 2, pl: 10, pr: 2, border: "1px solid black"}}>
                <Slider 
                    value={activeStep}
                    onChange={handleSliderChange}
                    step={1}
                    min={1}
                    max={3}
                    marks={steps.map(step => ({value: step.value, label: step.label}))}
                    valueLabelDisplay="auto"
                    orientation="vertical"
                    sx={{
                        pl: 5,
                        height: 400,
                        transform: "rotate(180deg)",
                        transformOrigin: "center center",
              
                        "& .MuiSlider-markLabel": {
                          transform: "rotate(180deg)",
                          whiteSpace: "nowrap",
                        },
                        "& .MuiSlider-valueLabel": {
                          transform: "rotate(180deg)",
                          left: "-100px",
                        },
                        "& .MuiSlider-rail": {
                            transform: "rotate(180deg)"
                        },

                      }}
                />
            </Box>
        );
    };

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

    const canvasPage = () => {
        const { type, configId, patternId, flowId } = canvasPages || {};
        // Helper function to decide what to render based on `type`.
        const renderCanvasContent = () => {
            switch (type) {
            case 'config':
                const config = agentsConfig.find(config => config.configId === configId);
                return <PageConfigs config={config} 
                setSelectedConfig={setSelectedConfig} 
                setCompliedGenerate={setCompliedGenerate} 
                setCanvasPages={setCanvasPages}/>;
            case 'pattern':
                const flowWithPatterns = flowsWithPatterns.find(pattern => pattern.patternId === patternId);
                return <PagePatterns 
                flow={flowWithPatterns} 
                setFlowsWithPatterns={setFlowsWithPatterns} 
                setAgentsConfigGenerate={setAgentsConfigGenerate} 
                setAgentsConfigPattern={setAgentsConfigPattern} 
                setCanvasPages={setCanvasPages}/>;
            case 'flow':
                const taskflow = flowsMap[flowId];
                console.log("taskflow", taskflow);
                return <PageTaskFlow taskflow={taskflow} 
                setFlowsMap={setFlowsMap} 
                setPatternsFlow={setPatternsFlow} 
                setPatternsGenerate={setPatternsGenerate} 
                setCanvasPages={setCanvasPages}/>;
            case 'compiled':
                const compiledConfig = compiledConfigs.find(compiledConfig => compiledConfig.configId === configId);
                return <PageCompiledCfg compiledConfig={compiledConfig} 
                setCompiledConfigs={setCompiledConfigs}/>;
            default:
                return <Typography>Canvas goes here</Typography>;
            }
        };

        return (
            <Box sx={{ width:"100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "left" }}>
                {renderCanvasContent()}
            </Box>
        );
    };

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {canvasPage()}
            {horizontalSlider()}
        </Box>
    );
};

export default SharedCanvas;