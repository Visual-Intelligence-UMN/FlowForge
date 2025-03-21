import { useState, useEffect } from "react";
import { Slider, Box } from "@mui/material";
import { useAtom } from "jotai";
import { canvasPagesAtom } from "../../patterns/GlobalStates";

const stepFromType = (type) => {
  switch (type) {
    case "flow":
      return 1;
    case "pattern":
      return 2;
    case "config":
      return 3;
    case "compiled":
      return 4;
    default:
      return 1;
  }
};

const typeFromStep = (step) => {
  switch (step) {
    case 1:
      return "flow";
    case 2:
      return "pattern";
    case 3:
      return "config";
    case 4:
      return "compiled";
    default:
      return "flow";
  }
};

const StageHighlight = () => {
  const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);
  const { type } = canvasPages || {};
  const [activeStep, setActiveStep] = useState(stepFromType(type));

  useEffect(() => {
    setActiveStep(stepFromType(type));
  }, [type]);

  const steps = [
    { value: 1, label: "Task Planning" },
    { value: 2, label: "Assign Agents" },
    { value: 3, label: "Config Agents" },
    // { value: 4, label: "Compile" },
  ];

  const handleSliderChange = (event, newValue) => {
    if (newValue >= 2 && !patternId) {
      return;
    }
    if (newValue >= 3 && !configId) {
      return;
    }
    if (newValue >= 4 && !configId) {
      return;
    }
    setActiveStep(newValue);
    setCanvasPages((prev) => ({
      ...prev,
      type: typeFromStep(newValue),
    }));
  };

  return (
    <Box sx={{ width: 300, pt: 3 }}>
      <Slider
        value={activeStep}
        onChange={handleSliderChange}
        step={1}
        min={1}
        max={3}
        marks={steps.map((s) => ({ value: s.value, label: s.label }))}
        disabled={true} //  Disable manual user interaction
        valueLabelDisplay="off"
        sx={{
          "& .MuiSlider-track": {
            display: "none",
          },
          "& .MuiSlider-rail": {
            color: "#ddd",
          },
          "& .MuiSlider-thumb": {
            display: "none",
          },
          "& .MuiSlider-mark": {
            height: 15,
            width: 15,
            borderRadius: "50%",
            backgroundColor: "#ccc",
            border: "2px solid white",
            marginTop: "-1px",
          },
          "& .MuiSlider-markActive": {
            backgroundColor: "navy",
          },
          "& .MuiSlider-markLabel": {
            fontSize: "1rem",
          },
        }}
      />
    </Box>
  );
};

export default StageHighlight;
