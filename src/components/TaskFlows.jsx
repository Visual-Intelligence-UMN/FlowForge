import { useAtom } from "jotai";
import { taskFlowsAtom, taskFlowsGenerateAtom, selectedTaskAtom, patternsGenerateAtom, patternsFlowAtom } from "../global/GlobalStates";
import { useEffect, useState } from "react";
import GenerateTaskFlows from "./GenerateTaskFlows";
const TaskFlows = () => {
    const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
    const [taskFlows, setTaskFlows] = useAtom(taskFlowsAtom);
    const [selectedTask] = useAtom(selectedTaskAtom);
    const [selectedFlowId, setSelectedFlowId] = useState(null);
    const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
    const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
    const generateTaskFlows = async (selectedTask) => {
        const taskFlows = await GenerateTaskFlows(selectedTask);
        // console.log(taskFlows);
        console.log("Generating task flows");
        const exampleTaskFlows = [
            {
                taskId: 1,
                flowId: 1,
                name: "Task Flow 1",
                nodes: ["subtask1", "subtask2"],
                edges: ["edge1", "edge2"]
            },
            {
                taskId: 1,
                flowId: 2,
                name: "Task Flow 2",
                nodes: ["subtask1", "subtask2"],
                edges: ["edge1", "edge2"]
            },
            {
                taskId: 1,
                flowId: 3,
                name: "Task Flow 3",
                nodes: ["subtask1", "subtask2"],
                edges: ["edge1", "edge2"]
            },
            {
                taskId: 1,
                flowId: 4,
                name: "Task Flow 4",
                nodes: ["subtask1", "subtask2"],
                edges: ["edge1", "edge2"]
            }
        ]
        setTaskFlows(exampleTaskFlows);
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
        console.log("Generating patterns for flow with ID:", flow.flowId);
        setPatternsGenerate(0);
        setPatternsFlow(flow);
    };

    const TaskFlowsDisplay = () => {
        return (
            <div className="task-flows-container">
                {taskFlows.map((flow) => (
                    <div
                        onClick={() => setSelectedFlowId(flow.flowId)}
                        style={{
                            border: selectedFlowId === flow.flowId ? "2px solid blue" : "1px solid #ccc",
                            backgroundColor: selectedFlowId === flow.flowId ? "#f0f8ff" : "#fff",
                        }}
                        className="task-flow-display"
                    >
                        <h4 style={{textAlign: "center"}}>{flow.name}</h4>
                        <div className="task-flow-nodes-links"> 
                            Nodes
                            {flow.nodes.map((node) => (
                                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{node}</p>
                            ))}
                            Edges
                            {flow.edges.map((edge) => (
                                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{edge}</p>
                            ))}
                        </div>

                        <button onClick={() => generatePatterns(flow)}>Generate</button>
                        <button onClick={(e) => {e.stopPropagation(); deleteFlow(flow.flowId);}}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        );

    };

    return (
        <div className="task-flows-panel" style={{ padding: '10px', border: '8px solid #ccc' }}>
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
