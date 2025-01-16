import { useAtom } from "jotai";
import {
  taskFlowsGenerateAtom,
  selectedTaskAtom,
  patternsGenerateAtom,
  patternsFlowAtom,
  selectionChainAtom,
  flowsMapAtom,
  flowIdsAtom
} from "../global/GlobalStates";
import { useEffect, useState } from "react";
import GenerateTaskFlows from "./GenerateTaskFlows";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

let flowCounter = 1;

function reassignFlowIds(flows) {
  return flows.map((flow) => {
    const newId = flowCounter++;
    return {
      ...flow,
      originalFlowId: flow.taskFlowId,
      taskFlowId: newId,
    };
  });
}

function mergeFlowsById(existingMap, existingIds, newFlows) {
  const updatedMap = { ...existingMap };
  let updatedIds = [...existingIds];

  for (const flow of newFlows) {
    const { taskFlowId } = flow;
    updatedMap[taskFlowId] = {
      ...updatedMap[taskFlowId],
      ...flow,
    };
    if (!updatedIds.includes(taskFlowId)) {
      updatedIds.push(taskFlowId);
    }
  }

  return { updatedMap, updatedIds };
}

const TaskFlows = () => {
  // -- Normalized flow storage
  const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
  const [flowIds, setFlowIds] = useAtom(flowIdsAtom);

  const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
  const [selectedTask] = useAtom(selectedTaskAtom);
  const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
  const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);

  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [selectionChain, setSelectionChain] = useAtom(selectionChainAtom);

  const [editingStates, setEditingStates] = useState({});

  // generate initial flows
  const generateTaskFlows = async (selectedTask) => {
    const newData = await GenerateTaskFlows(selectedTask);
    const incomingFlows = reassignFlowIds(newData.taskFlows);

    setFlowsMap((prevMap) => {
      const { updatedMap, updatedIds } = mergeFlowsById(prevMap, flowIds, incomingFlows);
      setFlowIds(updatedIds);
      return updatedMap;
    });

    setTaskFlowsGenerate(1);
  };

  // load/generate more flows
  // TODO: how to avoid the relunctant generation
  const loadMoreTaskFlows = async (selectedTask) => {
    const moreData = await GenerateTaskFlows(selectedTask);
    const moreFlows = reassignFlowIds(moreData.taskFlows);

    setFlowsMap((prevMap) => {
      const { updatedMap, updatedIds } = mergeFlowsById(prevMap, flowIds, moreFlows);
      setFlowIds(updatedIds);
      return updatedMap;
    });
  };

  // trigger if the task is selected and submitted
  useEffect(() => {
    if (taskFlowsGenerate === 0) {
      generateTaskFlows(selectedTask);
    }
  }, [taskFlowsGenerate]);

  // delete a flow
  const deleteFlow = (flowId) => {
    setFlowsMap((prevMap) => {
      const updatedMap = { ...prevMap };
      delete updatedMap[flowId];
      return updatedMap;
    });
    setFlowIds((prevIds) => prevIds.filter((id) => id !== flowId));
    console.log("Deleting flow with ID:", flowId);
  };

  const editFlow = (flowId) => {
    const currentFlow = flowsMap[flowId];
    setEditingStates(prev => ({
      ...prev,
      [flowId]: {
        taskFlowSteps: currentFlow.taskFlowSteps.map(step => ({...step})),
        originalSteps: currentFlow.taskFlowSteps.map(step => ({...step}))
      }
    }));
    
    setFlowsMap(prevMap => ({
      ...prevMap,
      [flowId]: {
        ...prevMap[flowId],
        isEditing: true
      }
    }));
  };
  const saveFlow = (flowId) => {
    const editedSteps = editingStates[flowId]?.taskFlowSteps;
    if (editedSteps) {
      setFlowsMap(prevMap => ({
        ...prevMap,
        [flowId]: {
          ...prevMap[flowId],
          isEditing: false,
          taskFlowSteps: editedSteps
        }
      }));
      setEditingStates(prev => {
        const newState = {...prev};
        delete newState[flowId];
        return newState;
      });
    }
  };
  
  const cancelEdit = (flowId) => {
    setFlowsMap(prevMap => ({
      ...prevMap,
      [flowId]: {
        ...prevMap[flowId],
        isEditing: false
      }
    }));
    setEditingStates(prev => {
      const newState = {...prev};
      delete newState[flowId];
      return newState;
    });
  };

  // trigger to generate workflows with patterns for the selected task flow
  const generatePatterns = (flow) => {
    console.log("Generating patterns for flow with ID:", flow.taskFlowId);
    setPatternsGenerate(0);
    setPatternsFlow(flow);
  };

  // top-right menu
  const FlowMenu = ({ flowId }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const isEditing = flowsMap[flowId]?.isEditing;

    const handleMenuOpen = (event) => {
      event.stopPropagation(); 
      setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    const handleDelete = (event) => {
      event.stopPropagation();
      deleteFlow(flowId);
      handleMenuClose();
    };

    const handleEdit = (event) => {
      event.stopPropagation();
      editFlow(flowId);
      handleMenuClose();
    };
    const handleSave = (event) => {
      event.stopPropagation();
      saveFlow(flowId);
      handleMenuClose();
    };
    const handleCancel = (event) => {
      event.stopPropagation();
      cancelEdit(flowId);
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
          {!isEditing && <MenuItem onClick={handleEdit}>Edit</MenuItem>}
          {isEditing && (
            <>
              <MenuItem onClick={handleSave}>Save</MenuItem>
              <MenuItem onClick={handleCancel}>Cancel</MenuItem>
            </>
          )}
        </Menu>
      </>
    );
  };
  // check if a task flow is highlighted
  const isFlowSelected = (flow) => {
    return String(flow.taskFlowId) === String(selectionChain.flowId);
  };

  const taskflowStepDisplay = (flow) => {
    return (
        <CardContent sx={{ paddingBottom: 0 }}>
          <Typography
            variant="h6"
            textAlign="left"
            color="primary"
            sx={{ wordWrap: "break-word", whiteSpace: "normal" }}
            >
              Task Flow {flow.taskFlowId}
            </Typography>
            <Box mt={2}>
                  {flow.taskFlowSteps.map((step, index) => (
                    <Box
                      key={index}
                      sx={{
                        padding: 0,
                        marginBottom: 1,
                        borderRadius: "4px",
                        wordWrap: "break-word",
                      }}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        {step.stepName}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ wordWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {step.stepDescription}
                      </Typography>
                    </Box>
                  ))}
                </Box>
        </CardContent>
    )
  }


  const taskflowStepEditDisplay = (flow) => {
    const editingData = editingStates[flow.taskFlowId];
    // console.log("Editing data:", editingData);
    return (
      <CardContent sx={{ paddingBottom: 0 }}>
        <Typography
          variant="h6"
          textAlign="left"
          color="primary"
          sx={{ wordWrap: "break-word", whiteSpace: "normal" }}
        >
          Editing Task Flow {editingData.taskFlowId}
        </Typography>
        <Box mt={2}>
          {editingData.taskFlowSteps.map((step, index) => (
            <Box
              key={index}
              sx={{
                padding: 0,
                marginBottom: 3,
                borderRadius: "4px",
                wordWrap: "break-word",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
            >
              {/* Editable Step Name */}
              <TextField
                value={step.stepName}
                onChange={(e) =>
                  handleStepUpdate(flow.taskFlowId, index, "stepName", e.target.value)
                }
                variant="outlined"
                fullWidth
                size="small"
                label="Step Name"
                sx={{ marginBottom: 1, marginTop: 0 }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              />
  
              {/* Editable Step Description */}
              <TextField
                value={step.stepDescription}
                onChange={(e) =>
                  handleStepUpdate(flow.taskFlowId, index, "stepDescription", e.target.value)
                }
                variant="outlined"
                fullWidth
                size="small"
                label="Step Description"
                multiline
                rows={2}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    );
  };

  const handleStepUpdate = (flowId, stepIndex, field, value) => {
    setEditingStates(prev => ({
      ...prev,
      [flowId]: {
        ...prev[flowId],
        taskFlowSteps: prev[flowId].taskFlowSteps.map((step, idx) => 
          idx === stepIndex ? { ...step, [field]: value } : step
        )
      }
    }));
  };

  const TaskFlowsDisplay = () => {
    return (
      <div className="task-flows-container">
        <Grid container spacing={2} sx={{ flexWrap: "nowrap", display: "flex" }}>
        {flowIds.map((fid) => {
          const flow = flowsMap[fid];
          if (!flow) return null;
            // return <MemoizedCard flow={flow} key={flow.taskFlowId}/>
          return (
            <Grid item key={flow.taskFlowId} sx={{ minWidth: 400, maxWidth: 500 }}>
            <Card
              key={flow.taskFlowId}
              onClick={() => {
                if (!flow.isEditing) {
                  setSelectedFlowId(flow.taskFlowId);
                  setSelectionChain({flowId: flow.taskFlowId, patternId: null, configId: null});
                }
              }}
              sx={{
                position: "relative",
                border: isFlowSelected(flow) && !flow.isEditing ? "2px solid blue" : "1px solid #ccc",
                backgroundColor: isFlowSelected(flow) && !flow.isEditing ? "#f0f8ff" : "#fff",
                cursor: "pointer",
                ":hover": { boxShadow: 3 },
              }}
            >
              {/* The top-right menu */}
              <FlowMenu flowId={flow.taskFlowId} />
              {flow.isEditing ? taskflowStepEditDisplay(flow) : taskflowStepDisplay(flow)}
              {/* {TaskflowStepCard(flow)} */}
              {/* <CardContent sx={{ paddingBottom: 0 }}>
                <Typography
                  variant="h6"
                  textAlign="left"
                  color="primary"
                  sx={{ wordWrap: "break-word", whiteSpace: "normal" }}
                >
                  Task Flow {flow.taskFlowId}
                </Typography>
                <Box mt={2}>
                  {flow.taskFlowSteps.map((step, index) => (
                    <Box
                      key={index}
                      sx={{
                        padding: 0,
                        marginBottom: 1,
                        borderRadius: "4px",
                        wordWrap: "break-word",
                      }}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        {step.stepName}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ wordWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {step.stepDescription}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent> */}

              <CardActions sx={{ paddingTop: 0 }}>
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    generatePatterns(flow);
                  }}
                  sx={{ textTransform: "none" }}
                >
                  CONTINUE
                </Button>
              </CardActions>
            </Card>
            </Grid>
          );
        })}
        </Grid>
      </div>
    );
  };

  const NoTaskFlows = () => (
    <p>No task flows available. Please generate flows for the selected task.</p>
  );

  const taskFlowsHeader = () => {
    return (
      <div
        className="task-flows-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h3 style={{ margin: 0 }}>Task Spliting</h3>
        {taskFlowsGenerate === 1 && flowIds.length > 0 && (
          <Box mt={2}>
            <Button
              variant="contained"
              onClick={() => loadMoreTaskFlows(selectedTask)}
              sx={{ textTransform: "none" }}
            >
              Load More Flows
            </Button>
          </Box>
        )}
      </div>
    );
  };

  // main returns
  return (
    <div className="task-flows-panel">
      {taskFlowsHeader()}

      {taskFlowsGenerate === -1 && <NoTaskFlows />}
      {taskFlowsGenerate === 0 && <p>Loading...</p>}
      {taskFlowsGenerate === 1 && flowIds.length > 0 && <TaskFlowsDisplay />}
      {taskFlowsGenerate === 1 && flowIds.length === 0 && <NoTaskFlows />}
    </div>
  );
};

export default TaskFlows;
