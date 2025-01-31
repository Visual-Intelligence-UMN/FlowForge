import React from "react";
import {
  Box,
  Card,
  CardContent,
  Select,
  Typography,
  MenuItem,
  Button
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { designPatternsPool } from "../global/patternsMap";
import { PatternsMapRow } from "./PatternsPoolSidebar";

const PagePatterns = ({ flow, setFlowsWithPatterns, setAgentsConfigGenerate, setAgentsConfigPattern, setCanvasPages }) => {

  const { taskFlowId, taskFlowName, taskFlowDescription, taskFlowSteps , patternId } = flow || {};
  
  const handlePatternChange = (stepIndex, newPatternName) => {
    const updatedSteps = [...taskFlowSteps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      pattern: { name: newPatternName }
    };

    const updatedFlow = {
      ...flow,
      taskFlowSteps: updatedSteps
    };

    setFlowsWithPatterns((prevFlows) =>
      prevFlows.map((f) =>
        f.patternId === patternId ? updatedFlow : f
      )
    );
  };

  if (!flow) {
    return <Typography>No flow provided.</Typography>;
  }

  return (
    <Box sx={{ width: "100%", p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>

      <Typography variant="h6" gutterBottom>
        {taskFlowName || `Flow #${taskFlowId}`}
      </Typography>
      {taskFlowDescription && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {taskFlowDescription}
        </Typography>
      )}
        <PatternsMapRow />
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        {taskFlowSteps.map((step, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ position: "relative" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {step.stepName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {step.stepDescription}
                </Typography>

                <Typography variant="body2" gutterBottom>

                  <strong>{step.pattern?.name || "None"}</strong>
                </Typography>

                <Select
                  value={step.pattern?.name || ""}
                  onChange={(e) => handlePatternChange(index, e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  {designPatternsPool.map((pattern) => (
              <MenuItem key={pattern.name} value={pattern.name}>{pattern.name}</MenuItem>
            ))}
                </Select>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Box>
      <Button
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAgentsConfigPattern(flow);
          setAgentsConfigGenerate(0);
        }}
        sx={{ textTransform: "none", pt: 2 }}
      >
        CONTINUE
      </Button>
    </Box>
  );
};

export default PagePatterns;
