import React, { useState } from "react";
import { useAtom } from "jotai";
import {
  selectedTaskAtom,
  taskFlowsGenerateAtom,
} from "../../patterns/GlobalStates";
import {
  Box,
  Button,
  TextField,
  Typography,
  Input,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { taskList } from "../../patterns/GlobalStates";
import { useResetTask } from "../../utils/ResetTask";
function TaskPanel() {
  const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);
  const [, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
  const [filePreview, setFilePreview] = useState(null);
  const [exampleIndex, setExampleIndex] = useState(null);

  // Local state for description
  const [localTaskDescription, setLocalTaskDescription] = useState(
    selectedTask?.description || ""
  );
  const [localSelectedTask, setLocalSelectedTask] = useState(
    selectedTask || {}
  );

  const resetTask = useResetTask();

  // Called when one of the “bubble” buttons is clicked
  const handleTaskSelect = (e) => {
    const index = e.target.value;
    setExampleIndex(index);
    console.log(index);
    const task = taskList[index];
    setLocalSelectedTask({ ...task, uploadedFile: null });
    setLocalTaskDescription(task.description || "");
    setFilePreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setFilePreview(previewURL);
    setLocalSelectedTask((prev) => ({ ...prev, uploadedFile: file }));
  };

  const handleFileDelete = () => {
    setFilePreview(null);
    setLocalSelectedTask((prev) => ({ ...prev, uploadedFile: null }));
  };

  const handleInputChange = (e) => {
    setLocalTaskDescription(e.target.value);
    setExampleIndex(null);
  };

  const handleSubmit = () => {
    resetTask();
    if (!localTaskDescription.trim()) {
      alert("Please provide the necessary input!");
      setSelectedTask({});
      setLocalSelectedTask({});
      return;
    }
    if (localSelectedTask.requiresUpload && !localSelectedTask.uploadedFile) {
      alert("Please upload the required file!");
      setSelectedTask({});
      setLocalSelectedTask({});
      return;
    }
    if (exampleIndex >= 0 && exampleIndex !== null) {
      setSelectedTask({
        ...localSelectedTask,
        description: localTaskDescription.trim(),
      });
    } else {
      setSelectedTask({
        id: "customTask",
        name: "Custom Task",
        requiresUpload: false,
        description: localTaskDescription.trim(),
        uploadedFile: null,
      });
    }
    setTaskFlowsGenerate(0);
    console.log("Submitting task:", selectedTask);
  };

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <h3> Define the Task!</h3>
      {/* Description text field */}
      <Grid container spacing={6}>
        <Grid item xs={9}>
          <TextField
            variant="filled"
            value={localTaskDescription}
            onChange={handleInputChange}
            placeholder="Enter your task description, or select one from the examples provided below."
            minRows={2}
            sx={{ width: "800px" }}
          />

          <Box
            sx={{
              mb: 2,
              padding: 1,
              marginBottom: 1,
              marginTop: 1,
              gap: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button onClick={handleSubmit} color="primary" variant="outlined">
              Submit Task
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center", // Align label and select vertically
                gap: 1, // Add spacing between label and select
              }}
            >
              <InputLabel id="task-select-label">Example Tasks</InputLabel>
              <Select
                value={localSelectedTask.index ?? ""}
                sx={{ minWidth: "200px", height: "50px", color: "#777" }}
                variant="standard"
                onChange={handleTaskSelect}
              >
                {taskList.map((task, index) => (
                  <MenuItem key={task.id} value={index}>
                    {task.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={3}>
          {" "}
          {/* conditional file upload */}
          <Box>
            <Typography sx={{ fontSize: "14px", color: "#333" }}>
              Example Input (Optional)
            </Typography>
            <TextField></TextField>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Input
                type="file"
                onChange={handleFileChange}
                sx={{ fontSize: "12px" }}
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
                    sx={{ fontSize: "10px", padding: "2px 6px" }}
                  >
                    X
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TaskPanel;
