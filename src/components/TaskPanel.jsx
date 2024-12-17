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

    const handleTabClick = (task) => {
        setSelectedTask({ ...task, uploadedFile: null });
        setFilePreview(null);
    };

    const handleInputChange = (e) => {
        setSelectedTask((prev) => ({ ...prev, description: e.target.value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewURL = URL.createObjectURL(file);
        setFilePreview(previewURL);
        setSelectedTask((prev) => ({ ...prev, uploadedFile: file }));
    };

    const handleFileDelete = () => {
        setFilePreview(null);
        setSelectedTask((prev) => ({ ...prev, uploadedFile: null }));
    };

    const handleSubmit = () => {
        if (!selectedTask || !selectedTask.description.trim()) {
            alert('Please provide the necessary input!');
            return;
        }
        if (selectedTask.requiresUpload && !selectedTask.uploadedFile) {
            alert('Please upload the required file!');
            return;
        }
        setTaskFlowsGenerate(0);
        console.log('Submitting task:', selectedTask);
    };

    return (
        <div style={{ padding: '15px', borderRadius: '8px', fontSize: '14px', width: '70%', display: 'flex', gap: '15px' }}>
            {/* Left Column */}
            <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '10px', marginTop: '0px' }}>Task Panel</h3>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                    {taskList.map((task) => (
                        <button
                            key={task.id}
                            onClick={() => handleTabClick(task)}
                            style={{
                                flex: 1,
                                padding: '5px',
                                border: '1px solid #ccc',
                                backgroundColor: selectedTask?.id === task.id ? '#007bff' : '#f9f9f9',
                                color: selectedTask?.id === task.id ? '#fff' : '#000',
                                cursor: 'pointer',
                                fontSize: '12px',
                                borderRadius: '4px',
                            }}
                        >
                            {task.name}
                        </button>
                    ))}
                </div>

                {/* Task Input */}
                {selectedTask && (
                    <textarea
                        value={selectedTask.description}
                        onChange={handleInputChange}
                        placeholder="Enter task description"
                        style={{
                            width: '100%',
                            height: '30px',
                            marginBottom: '10px',
                            padding: '5px',
                            fontSize: '12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    />
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '8px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '12px',
                        width: '30%',
                    }}
                >
                    Submit Task
                </button>
            </div>
            

            {/* Right Column */}
            <div style={{ flex: 1 }}>
                {selectedTask?.requiresUpload && (
                    <>
                        <h4>Upload File</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                style={{ fontSize: '12px' }}
                            />
                            {filePreview && (
                                <>
                                    <span style={{ fontSize: '12px' }}>{selectedTask.uploadedFile.name}</span>
                                    <button
                                        onClick={handleFileDelete}
                                        style={{
                                            padding: '3px 6px',
                                            fontSize: '12px',
                                            backgroundColor: '#d9534f',
                                            color: '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        X
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}

                
            </div>
        </div>
    );
}

export default TaskPanel;
