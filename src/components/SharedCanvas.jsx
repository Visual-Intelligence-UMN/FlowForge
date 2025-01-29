import React, { useState } from "react";
import {Slider, Box, Typography} from "@mui/material";
import { useAtom } from "jotai";
import { canvasPagesAtom } from "../global/GlobalStates";
import PageCompiledCfg from "./PageCompiledCfg";
import PageRfTaskFlow from "./PageRfTaskFlow";
import PageRfPatterns from "./PageRfPatterns";
import PageRfConfigs from "./PageRfConfigs";
import PageRfCompiledCfg from "./PageRfCompiledCfg";
const SharedCanvas = ( ) => {
    const [activeStep, setActiveStep] = useState(1);
    const [canvasPages] = useAtom(canvasPagesAtom);
    
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
        const renderCanvasContent = () => {
            switch (canvasPages.type) {
            case 'config':
                return <PageRfConfigs />;
            case 'pattern':
                return <PageRfPatterns  />;
            case 'flow':
                return <PageRfTaskFlow />;
            case 'compiled':
                // return <PageRfCompiledCfg />;
                return <PageCompiledCfg />;
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