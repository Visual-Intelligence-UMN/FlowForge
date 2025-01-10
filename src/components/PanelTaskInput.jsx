import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { selectedTaskAtom, taskFlowsGenerateAtom } from '../global/GlobalStates';
import {
  Box,
  Button,
  TextField,
  Typography,
  Input,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

function TaskPanel() {
  const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);
  const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
  const [filePreview, setFilePreview] = useState(null);

  const [selectedIndex, setSelectedIndex] = useState(null);

  const taskList = [
        { id: 'task1', name: 'Generate Presentation Script', requiresUpload: false, description: 'Generate a presentation script for a given topic.', uploadedFile: null },
        { id: 'task2', name: 'Machine Learning Visualization', requiresUpload: true, description: 'Visualize a given machine learning model.', uploadedFile: null },
        { id: 'task3', name: 'Travel Planning', requiresUpload: false, description: 'Plan a travel itinerary for a given destination.', uploadedFile: null },
    ];

  // Called when one of the “bubble” buttons is clicked
  const handleTaskSelect = (index) => {
    setSelectedIndex(index);
    const task = taskList[index];
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
    <Box sx={{ width: '100%', maxWidth: 1000, padding: 2 }}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Left Column (or Main Column) */}
        <Grid item xs={12}>
          {/* Description text field */}
          {selectedTask && (
            <TextField
              value={selectedTask.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              multiline
              minRows={1}
              fullWidth
              sx={{ mt: 1, '& .MuiInputBase-root': { fontSize: '16px' } }}
            />
          )}

          {/* Task selection buttons */}
          <Box sx={{ mb: 2, padding: 1, marginBottom: 1, marginTop: 1, gap:1,display: 'flex', justifyContent: 'flex-start' }}>
            {taskList.map((task, index) => (
              <Button
                key={task.id}
                variant={selectedIndex === index ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleTaskSelect(index)}
                sx={{
                  borderRadius: '10px',
                  fontSize: '12px',
                  marginLeft: 1,
                }}
              >
                {task.name}
              </Button>
            ))}
          </Box>

          {/* Submit button + conditional file upload */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
              onClick={handleSubmit}
              color="primary"
              variant="outlined"
              sx={{
                fontSize: '12px',
                padding: '12px 12px',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Submit Task
            </Button>
            {selectedTask?.requiresUpload && (
              <Box
                sx={{
                  marginLeft: 'auto',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: 1,
                  mt: 0,
                }}
              >
                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
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
                      {/* <Typography sx={{ fontSize: '12px', textWrap: 'wrap'}}>
                        {selectedTask.uploadedFile?.name}
                      </Typography> */}
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

            
          </Box>
        </Grid>
        
      </Grid>
    </Box>
  );
}

export default TaskPanel;
