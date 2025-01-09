import { useAtom } from "jotai";
import {
  taskFlowsGenerateAtom,
  selectedTaskAtom,
  patternsGenerateAtom,
  patternsFlowAtom,
  selectionChainAtom,
} from "../global/GlobalStates";
import { useEffect, useState } from "react";
import GenerateTaskFlows from "./GenerateTaskFlows";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// --------------------------------------
// 1. Utility to reassign flow IDs
// --------------------------------------
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
  const [flowsMap, setFlowsMap] = useState({});
  const [flowIds, setFlowIds] = useState([]);

  const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
  const [selectedTask] = useAtom(selectedTaskAtom);
  const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
  const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);

  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [selectionChain, setSelectionChain] = useAtom(selectionChainAtom);

  // --------------------------------------
  // 2. Generate initial flows
  // --------------------------------------
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

  // --------------------------------------
  // 3. Load/Generate MORE flows
  // --------------------------------------
  const loadMoreTaskFlows = async (selectedTask) => {
    const moreData = await GenerateTaskFlows(selectedTask);
    const moreFlows = reassignFlowIds(moreData.taskFlows);

    setFlowsMap((prevMap) => {
      const { updatedMap, updatedIds } = mergeFlowsById(prevMap, flowIds, moreFlows);
      setFlowIds(updatedIds);
      return updatedMap;
    });
  };

  // --------------------------------------
  // 4. On mount or triggers, if we need initial flows
  // --------------------------------------
  useEffect(() => {
    if (taskFlowsGenerate === 0) {
      generateTaskFlows(selectedTask);
    }
  }, [taskFlowsGenerate]);

  // --------------------------------------
  // 5. Deleting a flow
  // --------------------------------------
  const deleteFlow = (flowId) => {
    setFlowsMap((prevMap) => {
      const updatedMap = { ...prevMap };
      delete updatedMap[flowId];
      return updatedMap;
    });
    setFlowIds((prevIds) => prevIds.filter((id) => id !== flowId));
    console.log("Deleting flow with ID:", flowId);
  };

  // --------------------------------------
  // 6. Generate patterns
  // --------------------------------------
  const generatePatterns = (flow) => {
    console.log("Generating patterns for flow with ID:", flow.taskFlowId);
    setPatternsGenerate(0);
    setPatternsFlow(flow);
  };

  // A small sub-component to render the “...” menu in the top-right
  const FlowMenu = ({ flowId }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
      event.stopPropagation(); // Prevent card click selection
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
  // 7. Rendering flows
  // --------------------------------------
  const isFlowSelected = (flow) => {
    return String(flow.taskFlowId) === String(selectionChain.flowId);
  };

  const TaskFlowsDisplay = () => {
    return (
      <div className="task-flows-container">
        {flowIds.map((fid) => {
          const flow = flowsMap[fid];
          if (!flow) return null;

          return (
            <Card
              key={flow.taskFlowId}
              onClick={() => {
                setSelectedFlowId(flow.taskFlowId);
                setSelectionChain({flowId: flow.taskFlowId, patternId: null, configId: null});
              }}
              sx={{
                position: "relative",
                border: isFlowSelected(flow) ? "2px solid blue" : "1px solid #ccc",
                backgroundColor: isFlowSelected(flow) ? "#f0f8ff" : "#fff",
                cursor: "pointer",
                ":hover": { boxShadow: 3 },
                marginBottom: "1px",
              }}
            >
              {/* The top-right menu */}
              <FlowMenu flowId={flow.taskFlowId} />

              <CardContent sx={{ paddingBottom: 0 }}>
                <Typography
                  variant="body1"
                  component="div"
                  textAlign="left"
                  sx={{ wordWrap: "break-word", whiteSpace: "normal" }}
                >
                  {flow.taskFlowName} - flow {flow.taskFlowId}
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
          );
        })}
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
        <h2 style={{ margin: 0 }}>Task Flows</h2>
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

  // --------------------------------------
  // 8. Main return
  // --------------------------------------
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
