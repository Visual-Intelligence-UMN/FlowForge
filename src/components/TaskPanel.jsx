import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { selectedTaskAtom, taskFlowsGenerateAtom } from '../global/GlobalStates';
import {
    Box,
    Button,
    Tabs,
    Tab,
    TextField,
    Typography,
    Input,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

function TaskPanel() {
    const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);
    const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
    const [filePreview, setFilePreview] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);

    const taskList = [
        { id: 'task1', name: 'Generate Presentation Script', requiresUpload: false, description: 'Generate a presentation script for a given topic.', uploadedFile: null },
        { id: 'task2', name: 'Machine Learning Visualization', requiresUpload: true, description: 'Visualize a given machine learning model.', uploadedFile: null },
        { id: 'task3', name: 'Travel Planning', requiresUpload: false, description: 'Plan a travel itinerary for a given destination.', uploadedFile: null },
    ];

    const handleTabClick = (event, newIndex) => {
        setTabIndex(newIndex);
        const task = taskList[newIndex];
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
        <Box sx={{ width: '100%', maxWidth: 1000, padding: 1 }}>
            <Grid container spacing={2} alignItems="flex-start">
                {/* Left Column */}
                <Grid item xs={8}>
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabClick}
                        variant="fullWidth"
                        sx={{ minHeight: '30px' }}
                    >
                        {taskList.map((task) => (
                            <Tab
                                key={task.id}
                                label={task.name}
                                sx={{
                                    fontSize: '15px',
                                    minHeight: '30px',
                                    textTransform: 'none',
                                }}
                            />
                        ))}
                    </Tabs>

                    {selectedTask && (
                        <TextField
                            value={selectedTask.description}
                            onChange={handleInputChange}
                            placeholder="Enter task description"
                            multiline
                            minRows={1}
                            fullWidth
                            sx={{ mt: 2, '& .MuiInputBase-root': { fontSize: '16px' } }}
                        />
                    )}

                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        sx={{
                            fontSize: '12px',
                            mt: 2,
                            padding: '4px 8px',
                        }}
                    >
                        Submit Task
                    </Button>
                </Grid>

                {/* Right Column */}
                <Grid item xs={6}>
                    {selectedTask?.requiresUpload && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                                Upload File
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Input
                                    type="file"
                                    onChange={handleFileChange}
                                    sx={{ fontSize: '12px' }}
                                />
                                {filePreview && (
                                    <>
                                        <Typography sx={{ fontSize: '12px' }}>
                                            {selectedTask.uploadedFile.name}
                                        </Typography>
                                        <Button
                                            onClick={handleFileDelete}
                                            size="small"
                                            variant="contained"
                                            color="error"
                                            sx={{ fontSize: '10px', padding: '2px 6px' }}
                                        >
                                            X
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}

export default TaskPanel;
