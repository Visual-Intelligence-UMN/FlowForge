import { useAtom } from "jotai";
import { taskFlowsAtom, taskFlowsGenerateAtom, selectedTaskAtom } from "../global/GlobalStates";

const TaskFlows = () => {
    const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
    const [taskFlows, setTaskFlows] = useAtom(taskFlowsAtom);
    const [selectedTask] = useAtom(selectedTaskAtom);

    async function generateTaskFlows(selectedTask) {
        if (!selectedTask || !selectedTask.id) {
            throw new Error("No valid task selected for flow generation.");
        }
        console.log("Generating task flows for", selectedTask);

        // Example dynamic task flow generation
        return [
            { id: 1, name: `Flow for task: ${selectedTask.name}` },
            { id: 2, name: `Another flow for task: ${selectedTask.name}` },
        ];
    }

    async function generateTaskFlowsHandler() {
        if (!selectedTask) {
            alert("Please select a task before generating task flows!");
            return;
        }

        setTaskFlowsGenerate(0); // Set loading state
        try {
            const flows = await generateTaskFlows(selectedTask);
            setTaskFlows(flows);
        } catch (error) {
            console.error("Failed to generate task flows:", error);
            setTaskFlows([]);
            setTaskFlowsGenerate(-1); // Set error state
        } finally {
            setTaskFlowsGenerate(1); // Set completed state
        }
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h1>Task Flows</h1>
            <p>
                Selected Task: <strong>{selectedTask?.name || "None"}</strong>
            </p>
            <button
                onClick={generateTaskFlowsHandler}
                disabled={taskFlowsGenerate === 0}
                style={{
                    padding: '10px 15px',
                    backgroundColor: taskFlowsGenerate === 0 ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: taskFlowsGenerate === 0 ? 'not-allowed' : 'pointer',
                }}
            >
                {taskFlowsGenerate === 0 ? "Generating..." : "Generate Task Flows"}
            </button>
            <div style={{ marginTop: '20px' }}>
                {taskFlowsGenerate === 0 && <p>Loading...</p>}
                {taskFlowsGenerate === -1 && (
                    <p style={{ color: 'red' }}>Error generating task flows. Please try again.</p>
                )}
                {taskFlowsGenerate === 1 && taskFlows && taskFlows.length > 0 && (
                    <ul>
                        {taskFlows.map((flow) => (
                            <li key={flow.id}>{flow.name}</li>
                        ))}
                    </ul>
                )}
                {taskFlowsGenerate === 1 && (!taskFlows || taskFlows.length === 0) && (
                    <p>No task flows available. Please generate flows for the selected task.</p>
                )}
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
