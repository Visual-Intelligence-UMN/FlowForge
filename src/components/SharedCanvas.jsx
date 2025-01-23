import React, { useState } from "react";
import {Slider, Box} from "@mui/material";

const SharedCanvas = () => {
    const [activeStep, setActiveStep] = useState(1);

    const handleSliderChange = (event, newValue) => {
        setActiveStep(newValue);
    };

    const steps = [
        {value: 1, label: "Task Split"},
        {value: 2, label: "Subtask-Pattern"},
        {value: 3, label: "Agents Config"},
    ];

    return (
        <div>
            <Box sx={{ width: 300 , pt: 2, pl: 2}}>
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
        </div>
    );
};

export default SharedCanvas;