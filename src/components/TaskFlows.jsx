import { useAtom } from "jotai";
import { taskFlowsAtom, taskFlowsGenerateAtom, selectedTaskAtom } from "../global/GlobalStates";
import { useEffect } from "react";

const TaskFlows = () => {
    const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
    const [taskFlows, setTaskFlows] = useAtom(taskFlowsAtom);
    const [selectedTask] = useAtom(selectedTaskAtom);

    const generateTaskFlows = async () => {
        setTaskFlows([{
            id: 1,
            name: "Task Flow 1",
            description: "This is the first task flow",
            steps: [
                {
                    id: 1,
                    name: "Step 1",
                    description: "This is the first step",
                }
            ]
        },
        {
            id: 2,
            name: "Task Flow 2",
            description: "This is the second task flow",
            steps: [
                {
                    id: 1,
                    name: "Step 1",
                    description: "This is the first step",
                }
            ]
        }
    ]);
        setTaskFlowsGenerate(1);
    };

    useEffect(() => {
        if (taskFlowsGenerate === 0) {
            console.log("Generating task flows");
            generateTaskFlows();
        }
    }, [taskFlowsGenerate]);

    const NoTaskFlows = () => {
        return <p>No task flows available. Please generate flows for the selected task.</p>;
    };

    const TaskFlowsDisplay = () => {
        return (
            <ul>
                {taskFlows.map((flow) => (
                    <li key={flow.id}>{flow.name}</li>
                ))}
            </ul>
        );
    };

    return (
        <div style={{ padding: '10px', border: '8px solid #ccc' }}>
            <h2 style={{ margin: 0 }}>Task Flows</h2>

            <div style={{ marginTop: '10px' }}>
                {taskFlowsGenerate === -1 && <NoTaskFlows />}
                {taskFlowsGenerate === 0 && <p>Loading...</p>}
                {taskFlowsGenerate === 1 && taskFlows && taskFlows.length > 0 && <TaskFlowsDisplay />}
                {taskFlowsGenerate === 1 && (!taskFlows || taskFlows.length === 0) && <NoTaskFlows />}
            </div>

            {/* Debug Info */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', padding: '10px', fontSize: '12px', color: '#555' }}>
                <strong>Debug Info:</strong>
                <pre>{JSON.stringify(selectedTask, null, 2)}</pre>
            </div>
        </div>
    );
};

export default TaskFlows;
