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

import { designPatternsPool } from "../global/GlobalStates";
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
import DisplayPatterns from "./DisplayPatterns";
import GeneratePatterns from "./GeneratePatterns";

// --------------------------------------
// 1) A dictionary to track per-flow pattern numbering
//    e.g. if flow #123 has generated 2 patterns so far, the next one is 3
// --------------------------------------
const flowIdToPatternCounter = {};

// 2) Utility to reassign pattern IDs for patterns of a specific flow
function reassignPatternIds(flowId, patterns) {
  // If we haven't tracked this flowId yet, start at 1
  if (!flowIdToPatternCounter[flowId]) {
    flowIdToPatternCounter[flowId] = 1;
  }

  return patterns.map((pattern) => {
    const nextCount = flowIdToPatternCounter[flowId]++;
    return {
      ...pattern,
      // Keep the original ID if needed for debugging
      originalPatternId: pattern.patternId,
      // Overwrite patternId with a unique integer-based ID for this flow
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

  // --------------------------------------
  // Generate patterns for the selected flow
  // --------------------------------------
  const generatePatterns = async (flow) => {

    // const patternsFlow = await GeneratePatterns(flow);
    // const examplePatterns = randomCombinePatterns(patternsFlow, 2);

    // TODO: remove this after testing the patterns generation

    const examplePatterns = [
      {
        taskId: flow.taskFlowId,
        taskFlowId: flow.taskFlowId + "1",
        taskFlowName: flow.taskFlowName,
        patternId: flow.taskFlowId + "-A", // This will be overwritten
        taskFlowDescription: flow.taskFlowDescription,
        taskFlowSteps: flow.taskFlowSteps,
      },
      {
        taskId: flow.taskFlowId,
        taskFlowId: flow.taskFlowId + "2",
        taskFlowName: flow.taskFlowName,
        patternId: flow.taskFlowId + "-B", // This will be overwritten
        taskFlowDescription: flow.taskFlowDescription,
        taskFlowSteps: flow.taskFlowSteps,
      },
    ];

    // --- Reassign each pattern's ID to avoid conflicts ---
    const reassignedPatterns = reassignPatternIds(flow.taskFlowId, examplePatterns);

    // Store them in the global designPatterns atom
    setDesignPatterns((previousPatterns) => {
      const updatedPatterns = [];
      let replaced = false;

      for (const pattern of previousPatterns) {
        // If we find existing patterns for the same taskFlowId, replace them once
        if (pattern.taskFlowId === flow.taskFlowId && !replaced) {
          updatedPatterns.push(...reassignedPatterns);
          replaced = true;
        } else {
          updatedPatterns.push(pattern);
        }
      }

      // If no existing patterns for this flow were found, just add them
      if (!replaced) {
        updatedPatterns.push(...reassignedPatterns);
      }

      return updatedPatterns;
    });

    // Reset the pattern generation flags
    setPatternsGenerate(-1);
    setPatternsFlow(null);
  };

  // --------------------------------------
  // On patternsGenerate===0 => generate new patterns
  // --------------------------------------
  useEffect(() => {
    if (patternsGenerate === 0 && patternsFlow) {
      generatePatterns(patternsFlow);
    }
  }, [patternsGenerate, patternsFlow]);

  // --------------------------------------
  // Function to delete a pattern by ID
  // --------------------------------------
  const deletePattern = (patternId) => {
    setDesignPatterns((prev) => prev.filter((p) => p.patternId !== patternId));
    console.log("Deleting pattern with ID:", patternId);
  };

  // --------------------------------------
  // Continue button: configure agents for this pattern
  // --------------------------------------
  const configureAgents = (pattern) => {
    setAgentsConfigGenerate(0);
    setAgentsConfigPattern(pattern);
    console.log("Configuring agents for pattern:", pattern);
  };

  const NoPatterns = () => {
    return <p>No patterns available. Please generate patterns for the selected flow.</p>;
  };

  // --------------------------------------
  // A small sub-component for the top-right pattern menu
  // --------------------------------------
  const PatternMenu = ({ patternId }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
      event.stopPropagation(); // Prevent card click from triggering anything else
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
          // Stop the card click from closing or interfering
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </>
    );
  };

  // --------------------------------------
  // Rendering the patterns in cards
  // --------------------------------------
  const isPatternSelected = (pattern) => {
    if (selectionChain.patternId && pattern.patternId === selectionChain.patternId) {
      return true;
    }
    if (!selectionChain.patternId && selectionChain.flowId) {
      return pattern.patternId.startsWith(selectionChain.flowId+"-");
    }
    return false;
  };

  const PatternsDisplay = () => {
    return (
      <Box sx={{ p: 1, backgroundColor: "#f5f5f5" }}>
        <PatternsMapRow />
        <Grid container spacing={1}>
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
                {/* Pattern Menu in top-right */}
                <PatternMenu patternId={pattern.patternId} />

                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Patterns {pattern.patternId}
                  </Typography>
                  {/* <Divider sx={{ mb: 2 }} /> */}
                  {pattern.taskFlowSteps.map((step, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {step.stepName}
                      </Typography>
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

  // --------------------------------------
  // (Optional) Display Patterns as D3 or Graph
  // --------------------------------------
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

  const PatternsMapRow = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          {designPatternsPool.map((pattern, index) => (
            <Grid item xs="auto" key={index}>
              <Tooltip title={pattern.description} arrow>
                <Card
                  sx={{
                    width: 200,
                    height: 30,
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: 4,
                    },
                    padding: 1,
                  }}
                >
                  <CardContent sx={{ padding: 0, margin: 0 }} >
                    <Typography
                      variant="body2"
                      textAlign="center"
                      sx={{
                        whiteSpace: "wrap",
                        width: "100%",
                      }}
                    >
                      {pattern.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  

  return (
    <div className="patterns-panel">
      <h2>Patterns</h2>
      {designPatterns.length > 0 ? <PatternsDisplay /> : <NoPatterns />}
      {designPatterns.length > 0 ? <DisplayD3 /> : <NoPatterns />}
    </div>
  );
};

export default PatternsPanel;
