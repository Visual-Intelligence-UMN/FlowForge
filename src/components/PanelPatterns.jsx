import { useAtom } from "jotai";
import {
  patternsAtom,
  patternsGenerateAtom,
  patternsFlowAtom,
  agentsConfigGenerateAtom,
  agentsConfigPatternAtom,
  selectionChainAtom,
} from "../global/GlobalStates";
import { useEffect, useState } from "react";
import React from "react";

import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Divider, 
  IconButton, 
  Menu, 
  MenuItem,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DisplayPatterns from "./DisplayGraphPatterns";
import GeneratePatterns from "./GeneratePatterns";
import PatternsMapRow from "./PatternsPoolSidebar";
// A dictionary to track per-flow pattern numbering
const flowIdToPatternCounter = {};

// reassign pattern IDs for patterns of a specific flow
function reassignPatternIds(flowId, patterns) {
  if (!flowIdToPatternCounter[flowId]) {
    flowIdToPatternCounter[flowId] = 1;
  }

  return patterns.map((pattern) => {
    const nextCount = flowIdToPatternCounter[flowId]++;
    return {
      ...pattern,
      originalPatternId: pattern.patternId,
      patternId: `${flowId}-${nextCount}`,
    };
  });
}

const PatternsPanel = () => {
  const [designPatterns, setDesignPatterns] = useAtom(patternsAtom);
  const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
  const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
  const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(agentsConfigGenerateAtom);
  const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(agentsConfigPatternAtom);
  const [selectionChain, setSelectionChain] = useAtom(selectionChainAtom);

  // Generate patterns for the selected flow
  const generatePatterns = async (flow) => {

    // const patternsFlow = await GeneratePatterns(flow);
    // const examplePatterns = randomCombinePatterns(patternsFlow, 2);

    // TODO: remove the hardcoded patterns
    const examplePatterns = [
      {
        taskId: flow.taskFlowId,
        taskFlowId: flow.taskFlowId + "1",
        taskFlowName: flow.taskFlowName,
        patternId: flow.taskFlowId + "-A", 
        taskFlowDescription: flow.taskFlowDescription,
        taskFlowSteps: flow.taskFlowSteps,
      },
      {
        taskId: flow.taskFlowId,
        taskFlowId: flow.taskFlowId + "2",
        taskFlowName: flow.taskFlowName,
        patternId: flow.taskFlowId + "-B", 
        taskFlowDescription: flow.taskFlowDescription,
        taskFlowSteps: flow.taskFlowSteps,
      },
    ];

    // Reassign IDs
    const reassignedPatterns = reassignPatternIds(flow.taskFlowId, examplePatterns);

    // Store generated workflow with patterns
    setDesignPatterns((previousPatterns) => {
      const updatedPatterns = [];
      let replaced = false;

      for (const pattern of previousPatterns) {
        if (pattern.taskFlowId === flow.taskFlowId && !replaced) {
          updatedPatterns.push(...reassignedPatterns);
          replaced = true;
        } else {
          updatedPatterns.push(pattern);
        }
      }

      if (!replaced) {
        updatedPatterns.push(...reassignedPatterns);
      }

      return updatedPatterns;
    });

    setPatternsGenerate(-1);
    setPatternsFlow(null);
  };

  useEffect(() => {
    if (patternsGenerate === 0 && patternsFlow) {
      generatePatterns(patternsFlow);
    }
  }, [patternsGenerate, patternsFlow]);

  // delete a pattern by patternId
  const deletePattern = (patternId) => {
    setDesignPatterns((prev) => prev.filter((p) => p.patternId !== patternId));
    console.log("Deleting pattern with ID:", patternId);
  };

  // generate configuration for this workflow with patterns
  const configureAgents = (pattern) => {
    setAgentsConfigGenerate(0);
    setAgentsConfigPattern(pattern);
    console.log("Configuring agents for pattern:", pattern);
  };

  const NoPatterns = () => {
    return <p>No patterns available. Please generate patterns for the selected flow.</p>;
  };

  // top right menu
  const PatternMenu = ({ patternId }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleDelete = (event) => {
      event.stopPropagation();
      deletePattern(patternId);
      handleMenuClose();
    };

    return (
      <>
        <IconButton
          aria-label="more"
          onClick={handleMenuOpen}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </>
    );
  };

  // Check if a pattern is selected to highlight it
  const isPatternSelected = (pattern) => {
    if (selectionChain.patternId && pattern.patternId === selectionChain.patternId) {
      return true;
    }
    if (!selectionChain.patternId && selectionChain.flowId) {
      return pattern.patternId.startsWith(selectionChain.flowId + "-");
    }
    return false;
  };

  // Rendering the workflow with patterns in cards
  const PatternsDisplay = () => {
    return (
      <Box sx={{ p: 1, backgroundColor: "#f5f5f5" }}>
        <Grid container spacing={2}>
          <PatternsMapRow />
          {designPatterns.map((pattern) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={pattern.patternId}
              sx={{ position: "relative" }}
            >
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  border: isPatternSelected(pattern) ? "2px solid blue" : "1px solid #ccc",
                  backgroundColor: isPatternSelected(pattern) ? "#f0f8ff" : "#fff",
                  cursor: "pointer",
                  ":hover": { boxShadow: 3 },
                  marginBottom: "1px",
                }}
                onClick={() => {
                  const [flowId] = pattern.patternId.split("-");
                  setSelectionChain({flowId: flowId, patternId: pattern.patternId, configId: null});
                }}
              >
                <PatternMenu patternId={pattern.patternId} />

                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Patterns {pattern.patternId}
                  </Typography>

                  {pattern.taskFlowSteps.map((step, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      {/* 
                        ADD THE TOOLTIP HERE: 
                        The title prop is displayed as the tooltip text, 
                        to explain why this pattern is suitable f
                      */}
                      <Tooltip title={step.stepDescription || ""}>
                        <Typography variant="body1" fontWeight="bold">
                          {step.stepName}
                        </Typography>
                      </Tooltip>

                      <Typography variant="body2" color="text.secondary">
                        {step.pattern?.name}
                      </Typography>
                    </Box>
                  ))}

                  <Button
                    color="primary"
                    size="small"
                    onClick={() => configureAgents(pattern)}
                    sx={{ mt: 2 }}
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // TODO: if we want to display a simple graph, it may be more informative and more specific to describe different patterns 
  const DisplayD3 = () => {
    return (
      <Box sx={{ p: 1, backgroundColor: "#f5f5f5" }}>
        <Grid container spacing={1}>
          {designPatterns.map((pattern) => (
            <Grid item xs={12} key={pattern.patternId}>
              <DisplayPatterns designPatterns={pattern} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <div className="patterns-panel">
      <h2>Flows with Patterns</h2>
      {designPatterns.length > 0 ? <PatternsDisplay /> : <NoPatterns />}
      {/* {designPatterns.length > 0 ? <DisplayD3 /> : <NoPatterns />} */}
    </div>
  );
};

export default PatternsPanel;
