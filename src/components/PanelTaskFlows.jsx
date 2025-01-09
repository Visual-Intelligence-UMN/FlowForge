import { useAtom } from "jotai";
import { taskFlowsAtom, taskFlowsGenerateAtom, selectedTaskAtom, patternsGenerateAtom, patternsFlowAtom } from "../global/GlobalStates";
import { useEffect, useState } from "react";
import GenerateTaskFlows from "./GenerateTaskFlows";


import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";

const TaskFlows = () => {
    const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
    const [taskFlows, setTaskFlows] = useAtom(taskFlowsAtom);
    const [selectedTask] = useAtom(selectedTaskAtom);
    const [selectedFlowId, setSelectedFlowId] = useState(null);
    const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
    const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
    
    const generateTaskFlows = async (selectedTask) => {
        const taskFlows = await GenerateTaskFlows(selectedTask);
        const taskFlowsData = taskFlows.taskFlows;
        setTaskFlows(taskFlowsData);
        setTaskFlowsGenerate(1);
    };

    useEffect(() => {
        if (taskFlowsGenerate === 0) {
            generateTaskFlows(selectedTask);
        }
    }, [taskFlowsGenerate]);

    const NoTaskFlows = () => {
        return <p>No task flows available. Please generate flows for the selected task.</p>;
    };

    const deleteFlow = (flowId) => {
        setTaskFlows((prevTaskFlows) => prevTaskFlows.filter((flow) => flow.flowId !== flowId));
        console.log("Deleting flow with ID:", flowId);
    };

    const generatePatterns = (flow) => {
        console.log("Generating patterns for flow with ID:", flow.taskFlowId);
        setPatternsGenerate(0);
        setPatternsFlow(flow);
    };

    const TaskFlowsDisplay = () => {
        return (
            <div className="task-flows-container">
                {taskFlows.map((flow) => (
                    <Card
                        key={flow.taskFlowId}
                            onClick={() => setSelectedFlowId(flow.taskFlowId)}
                            sx={{
                                border: selectedFlowId === flow.taskFlowId ? "2px solid blue" : "1px solid #ccc",
                                backgroundColor: selectedFlowId === flow.taskFlowId ? "#f0f8ff" : "#fff",
                                cursor: "pointer",
                                ":hover": { boxShadow: 3 },
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="h5"
                                    component="div"
                                    textAlign="center"
                                    gutterBottom
                                    sx={{ wordWrap: "break-word", whiteSpace: "normal" }}
                                >
                                    {flow.taskFlowName}
                                </Typography>
                                {/* <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    textAlign="center"
                                    sx={{ wordWrap: "break-word", whiteSpace: "normal" }}
                                >
                                    {flow.taskFlowDescription}
                                </Typography> */}
                                <Box mt={2}>
                                    {flow.taskFlowSteps.map((step, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                padding: 0,
                                                marginBottom: 1,
                                                // backgroundColor: "#f9f9f9",
                                                borderRadius: "4px",
                                                wordWrap: "break-word",
                                            }}
                                        >
                                            <Typography variant="body1" fontWeight="bold">
                                                {step.stepName}  ({step.stepLabel})
                                            </Typography>
                                            <Typography variant="body1" sx={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                                                {step.stepDescription}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    onClick={() => generatePatterns(flow)}
                                    sx={{ textTransform: "none" }}
                                >
                                    Generate
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFlow(flow.taskFlowId);
                                    }}
                                    sx={{ textTransform: "none" }}
                                >
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                ))}
            </div>
        );

    };

    return (
        <div className="task-flows-panel">
            <h2 style={{ margin: 0 }}>Task Flows</h2>

                {taskFlowsGenerate === -1 && <NoTaskFlows />}
                {taskFlowsGenerate === 0 && <p>Loading...</p>}
                {taskFlowsGenerate === 1 && taskFlows && taskFlows.length > 0 && <TaskFlowsDisplay />}
                {taskFlowsGenerate === 1 && (!taskFlows || taskFlows.length === 0) && <NoTaskFlows />}

            {/* Debug Info */}
            {/* <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', padding: '10px', fontSize: '12px', color: '#555' }}>
                <strong>Debug Info:</strong>
                <pre>{JSON.stringify(selectedTask, null, 2)}</pre>
            </div> */}
        </div>
    );
};

export default TaskFlows;
