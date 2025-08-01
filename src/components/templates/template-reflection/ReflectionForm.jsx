import { Box, TextField, Typography} from "@mui/material";
import { PatternTextField } from "../textfield/patternText";
import {InputIO, OutputIO} from "../textfield/streamIcons"

export function ReflectionForm({ data, onChange }) {
  // data = {
  //   maxRound: number,
  //   evaluator: { persona, goal, patternPrompt },
  //   optimizer: { persona, goal, patternPrompt },
  // }

  const handleSimpleFieldChange = (field) => (e) => {
    onChange({
      ...data,
      [field]: e.target.value.trim(),
    });
  };

  const handleNestedFieldChange = (role, field) => (e) => {
    onChange({
      ...data,
      [role]: {
        ...data[role],
        [field]: e.target.value,
      },
    });
  };

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: 0,  
      // backgroundColor: "#e3f2fd", 
      maxWidth: "100%" }}>
    <Box sx={{ 
      display: "flex", 
      flexDirection: "row", 
      gap: 2, 
      maxWidth: "100%" , 
      p: 3
      }}>

      {/* Optimizer */}
      <Box sx={{ display: "flex", flexDirection: "column", flex:1, gap: 2 }}>
        <Typography variant="subtitle2" fontSize={"18px"}>
          <InputIO active/>
          Optimizer</Typography>
        <PatternTextField
          label="Optimizer Persona"
          value={data.optimizer?.persona || ""}
          onChange={handleNestedFieldChange("optimizer", "persona")}
        />
        {/* <PatternTextField
          label="Optimizer Pattern Prompt"
          value={data.optimizer?.patternPrompt || ""}
          onChange={handleNestedFieldChange("optimizer", "patternPrompt")}
        /> */}
        {/* <PatternTextField
          label="Optimizer Goal"
          value={data.optimizer?.goal || ""}
          onChange={handleNestedFieldChange("optimizer", "goal")}
        /> */}
      
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", flex:1, gap: 2 }}>

        {/* Evaluator */}
        <Typography variant="subtitle2" fontSize={"18px"} sx={{gap: 1.5 }}>
          <OutputIO active/>
          Evaluator
        </Typography>
        <PatternTextField
          label="Evaluator Persona"
          value={data.evaluator?.persona || ""}
          onChange={handleNestedFieldChange("evaluator", "persona")}
        />
        {/* <PatternTextField
          label="Evaluator Pattern Prompt"
          value={data.evaluator?.patternPrompt || ""}
          onChange={handleNestedFieldChange("evaluator", "patternPrompt")}
        /> */}
        {/* <PatternTextField
          label="Evaluator Goal"
          value={data.evaluator?.goal || ""}
          onChange={handleNestedFieldChange("evaluator", "goal")}
        /> */}

      </Box>
      
      
    </Box>
      <TextField
          label="Max Round"
          type="number"
          value={data.maxRound || ""}
          onChange={handleSimpleFieldChange("maxRound")}
          size="small"
          sx={{ width: "50%", margin: "auto" }}
          className="nodrag nopan nowheel"
      />
    </Box>
  );
}
