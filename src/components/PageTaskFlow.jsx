import React, { useState, useEffect } from "react";
import {Box, Typography, Card, CardContent, TextField, IconButton, Menu, MenuItem, Button} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const PageTaskFlow = ({ taskflow, setFlowsMap, setPatternsFlow, setPatternsGenerate, setCanvasPages }) => {
  if (!taskflow) {
    return <div>No flow data</div>;
  }

  const { taskFlowId, taskFlowName, taskFlowDescription, taskFlowSteps } = taskflow;


  const [stepEdits, setStepEdits] = useState([]);
  const [anchorEls, setAnchorEls] = useState([]);

  useEffect(() => {
    if (taskFlowSteps) {
      const initialEdits = taskFlowSteps.map((step) => ({
        isEditing: false,
        stepName: step.stepName,
        stepDescription: step.stepDescription
      }));
      setStepEdits(initialEdits);
      setAnchorEls(new Array(taskFlowSteps.length).fill(null));
    }
  }, [taskFlowSteps]);

  const handleMenuOpen = (event, index) => {
    event.stopPropagation();
    setAnchorEls((prev) => {
      const updated = [...prev];
      updated[index] = event.currentTarget;
      return updated;
    });
  };

  const handleMenuClose = (index) => {
    setAnchorEls((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };


  const handleEdit = (index) => {
    setStepEdits((prev) =>
      prev.map((step, idx) =>
        idx === index ? { ...step, isEditing: true } : step
      )
    );
    handleMenuClose(index);
  };

  const handleChange = (index, field, value) => {
    setStepEdits((prev) =>
      prev.map((editItem, idx) => {
        if (idx === index) {
          return { ...editItem, [field]: value };
        }
        return editItem;
      })
    );
  };

  const handleSave = (index) => {
    const editsForStep = stepEdits[index];
    // Update the parent flowsMap
    setFlowsMap((prevMap) => {
      const newMap = { ...prevMap };
      const updatedFlow = { ...newMap[taskFlowId] };
      const updatedSteps = [...updatedFlow.taskFlowSteps];

      updatedSteps[index] = {
        ...updatedSteps[index],
        stepName: editsForStep.stepName,
        stepDescription: editsForStep.stepDescription
      };
      updatedFlow.taskFlowSteps = updatedSteps;
      newMap[taskFlowId] = updatedFlow;
      return newMap;
    });
    // Turn off editing mode
    setStepEdits((prev) =>
      prev.map((editItem, idx) =>
        idx === index ? { ...editItem, isEditing: false } : editItem
      )
    );
    handleMenuClose(index);
  };

  const handleCancel = (index) => {
    // Revert to original data
    const originalStep = taskFlowSteps[index];
    setStepEdits((prev) =>
      prev.map((editItem, idx) => {
        if (idx === index) {
          return {
            isEditing: false,
            stepName: originalStep.stepName,
            stepDescription: originalStep.stepDescription
          };
        }
        return editItem;
      })
    );
    handleMenuClose(index);
  };


  const handleDelete = (index) => {
    setFlowsMap((prevMap) => {
      const newMap = { ...prevMap };
      const updatedFlow = { ...newMap[taskFlowId] };
      updatedFlow.taskFlowSteps = updatedFlow.taskFlowSteps.filter(
        (_, idx) => idx !== index
      );
      newMap[taskFlowId] = updatedFlow;
      return newMap;
    });
    setStepEdits((prev) => prev.filter((_, idx) => idx !== index));
    setAnchorEls((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <Box
      sx={{
        padding: 1,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <Typography variant="h6" gutterBottom>
        {taskFlowName || `Flow #${taskFlowId}`}
      </Typography>
      {taskFlowDescription && (
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          {taskFlowDescription}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2
        }}
      >
        {taskFlowSteps?.map((step, index) => {
          const edits = stepEdits[index] || {};
          const { isEditing, stepName, stepDescription } = edits;
          const anchorEl = anchorEls[index];

          return (
            <Card
              key={index}
              sx={{
                minWidth: 180,
                position: "relative"
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, index)}
                sx={{ position: "absolute", top: 1, right: 1 }}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => handleMenuClose(index)}
                onClick={(e) => e.stopPropagation()}
              >
                {isEditing ? (
                  <>
                    <MenuItem onClick={() => handleSave(index)}>Save</MenuItem>
                    <MenuItem onClick={() => handleCancel(index)}>Cancel</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem onClick={() => handleEdit(index)}>Edit</MenuItem>
                    <MenuItem onClick={() => handleDelete(index)}>Delete</MenuItem>
                  </>
                )}
              </Menu>

              <CardContent>
                {isEditing ? (
                  <>
                    <TextField
                      label="Step Name"
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ marginBottom: 1 }}
                      value={stepName ?? ""}
                      onChange={(e) =>
                        handleChange(index, "stepName", e.target.value)
                      }
                    />
                    <TextField
                      label="Step Description"
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={5}
                      value={stepDescription ?? ""}
                      onChange={(e) =>
                        handleChange(index, "stepDescription", e.target.value)
                      }
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {step.stepName}
                    </Typography>
                    <Typography variant="body2">
                      {step.stepDescription}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
      <Button
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setPatternsFlow(taskflow);
          setPatternsGenerate(0);
        }}
        sx={{ textTransform: "none", pt: 2 }}
      >
        CONTINUE
      </Button>
    </Box>
  );
};

export default PageTaskFlow;
