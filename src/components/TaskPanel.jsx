import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { selectedTaskAtom, taskFlowsGenerateAtom } from '../global/GlobalStates';

function TaskPanel() {
    const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);
    const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
    const [filePreview, setFilePreview] = useState(null);

    const taskList = [
        { id: 'task1', name: 'Generate Presentation Script', requiresUpload: false, description: 'Generate a presentation script for a given topic.', uploadedFile: null },
        { id: 'task2', name: 'Machine Learning Visualization', requiresUpload: true, description: 'Visualize a given machine learning model.', uploadedFile: null },
        { id: 'task3', name: 'Travel Planning', requiresUpload: false, description: 'Plan a travel itinerary for a given destination.', uploadedFile: null },
    ];

    const handleTaskChange = (taskId) => {
        const task = taskList.find((t) => t.id === taskId);
        if (!task) return;

        // Resetting file and input on task change
        setSelectedTask({ ...task, uploadedFile: null });
        setFilePreview(null);
    };

    const handleInputChange = (e) => {
        const updatedTask = { ...selectedTask, description: e.target.value };
        setSelectedTask(updatedTask);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const previewURL = URL.createObjectURL(file);
        setFilePreview(previewURL);

        // Update the selected task with the uploaded file
        setSelectedTask({ ...selectedTask, uploadedFile: file });
    };

    const handleFileDelete = () => {
        setFilePreview(null);
        setSelectedTask({ ...selectedTask, uploadedFile: null });
    };

    const handleSubmit = () => {
        if (!selectedTask || !selectedTask.description.trim()) {
            alert('Please select a task and provide the necessary input!');
            return;
        }

        if (selectedTask.requiresUpload && !selectedTask.uploadedFile) {
            alert('Please upload the required file!');
            return;
        }

        setTaskFlowsGenerate(0); // Set the "loading" state
        console.log('Submitting task:', selectedTask);
        // Additional logic for submission can be added here
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h2>Task Selection Panel</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '20px' }}>
                    {/* Task Selection */}
                    <label htmlFor="task-select">Choose a Task:</label>
                    <select
                        id="task-select"
                        value={selectedTask?.id || ''}
                        onChange={(e) => handleTaskChange(e.target.value)}
                        style={{ margin: '10px 0', padding: '5px', width: '100%' }}
                    >
                        <option value="" disabled>
                            Select a task
                        </option>
                        {taskList.map((task) => (
                            <option key={task.id} value={task.id}>
                                {task.name}
                            </option>
                        ))}
                    </select>

                    {/* Task Input */}
                    <div style={{ margin: '10px 0' }}>
                        <label htmlFor="task-input">Task Input:</label>
                        <input
                            id="task-input"
                            type="text"
                            value={selectedTask?.description || ''}
                            onChange={handleInputChange}
                            style={{ marginLeft: '10px', padding: '5px', width: 'calc(100% - 10px)' }}
                            placeholder="Enter task description"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        style={{
                            marginTop: '10px',
                            padding: '10px 15px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '50%',
                        }}
                    >
                        Submit and Generate Task Flows
                    </button>
                </div>

                {/* File Upload and Preview */}
                <div style={{ flex: 1, paddingLeft: '20px' }}>
                    {selectedTask?.requiresUpload && (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div>
                                <label htmlFor="file-upload">Upload a File:</label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ display: 'block', marginTop: '10px' }}
                                />
                                {selectedTask.uploadedFile && (
                                    <>
                                        <p style={{ marginTop: '5px' }}>
                                            Uploaded File: <strong>{selectedTask.uploadedFile.name}</strong>
                                        </p>
                                        <button
                                            onClick={handleFileDelete}
                                            style={{
                                                marginTop: '10px',
                                                padding: '5px 10px',
                                                backgroundColor: '#d9534f',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Delete File
                                        </button>
                                    </>
                                )}
                            </div>
                            {filePreview && (
                                <div style={{ border: '1px solid #ccc', padding: '10px', width: '50%' }}>
                                    <h4 style={{ marginBottom: '0px' }}>File Preview:</h4>
                                    {selectedTask.uploadedFile.type.startsWith('image/') ? (
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: '100px' }}
                                        />
                                    ) : (
                                        <iframe
                                            src={filePreview}
                                            title="File Preview"
                                            style={{ width: '100%', height: '100px', border: 'none' }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Debug Info */}
            {/* <div style={{ marginTop: '20px', padding: '10px', borderTop: '1px solid #ccc', fontSize: '12px', color: '#555' }}>
                <strong>Debug Info:</strong>
                <pre>{JSON.stringify(selectedTask, null, 2)}</pre>
            </div> */}
        </div>
    );
}

export default TaskPanel;
