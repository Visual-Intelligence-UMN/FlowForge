import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  selectedTaskAtom,
  taskFlowsGenerateAtom,
  workflowInputAtom,
  runRealtimeAtom,
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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { taskList } from "../../patterns/GlobalStates";
import { useResetTask } from "../../utils/ResetTask";

function TaskPanel() {
  const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);
  const [, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);
  const [filePreview, setFilePreview] = useState(null);
  const [exampleIndex, setExampleIndex] = useState(null);
  const [fileName, setFileName] = useState("");

  const [runRealtime, setRunRealtime] = useAtom(runRealtimeAtom);

  // Local state for description
  const [localTaskDescription, setLocalTaskDescription] = useState(
    selectedTask?.description || ""
  );
  const [localSelectedTask, setLocalSelectedTask] = useState(
    selectedTask || {}
  );

  const resetTask = useResetTask();

  useEffect(() => {
    if (selectedTask && Object.keys(selectedTask).length > 0) {
      // console.log("resetting task");
      resetTask();
    }
  }, [selectedTask]);

  // Called when one of the “bubble” buttons is clicked
  const handleTaskSelect = (e) => {
    const index = e.target.value;
    setExampleIndex(index);
    const task = taskList[index];
    setLocalSelectedTask({ ...task, uploadedFile: null });
    setLocalTaskDescription(task.description || "");
    setFilePreview(null);
    setFileName("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Check if the file is a PDF
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    setFileName(file.name);
    const previewURL = URL.createObjectURL(file);
    setFilePreview(previewURL);
    setLocalSelectedTask((prev) => ({ ...prev, uploadedFile: file }));
    // Load and log PDF text
    // loadPdfText(file);
  };

  const handleFileDelete = () => {
    setFilePreview(null);
    setFileName("");
    setLocalSelectedTask((prev) => ({ ...prev, uploadedFile: null }));
  };

  const handleInputChange = (e) => {
    setLocalTaskDescription(e.target.value);
    setExampleIndex(null);
  };

  const handleSubmit = () => {
    if (!localTaskDescription.trim()) {
      alert("Please provide the necessary input!");
      // setSelectedTask({});
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

  // Add checkbox for real-time execution control
  const handleRealtimeToggle = (e) => {
    setRunRealtime(e.target.checked);
  };
  // ... existing code ...

  return (
    // <<<<<<< nick-work
    <Box
      sx={{
        width: "100%",
        padding: 2,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          variant="filled"
          value={localTaskDescription}
          onChange={handleInputChange}
          placeholder="Enter your task description, or select one from the examples provided."
          label="Task Description"
          size="small"
          multiline
          rows={2}
          sx={{ width: "550px" }}
        />

        {/* Submit Button */}

      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          size="small"
          sx={{ height: "30px" }}
        >
          Submit Task
        </Button>

        {/* Example Task Selector */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <InputLabel id="task-select-label">Example Tasks</InputLabel>
          <Select
            value={localSelectedTask.index ?? ""}
            sx={{ width: "140px", height: "30px", color: "#777" }}
            variant="standard"
            onChange={handleTaskSelect}
            size="small"
          >
            {taskList.map((task, index) => (
              <MenuItem key={task.id} value={index} style={{ fontSize: "14px" }}>
                {task.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      <Box sx={{ gap: 2 }}>
        <input
          type="checkbox"
          id="run-realtime"
          checked={runRealtime}
          onChange={handleRealtimeToggle}
        />
        <label style={{ marginLeft: 5 }}>Check to Run Real Time</label>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          sx={{ fontSize: "14px", color: "#333" }}
          onChange={(e) => setWorkflowInput(e.target.value)}
        >
          Example Input (Optional)
        </Typography>

        <TextField size="small" sx={{ width: "200px" }} />
        {/* File Upload Button */}
        <Button
          component={fileName ? undefined : "label"}
          color="primary"
          size="small"
          variant={fileName ? "contained" : "outlined"}
          role={undefined}
          startIcon={fileName ? <DeleteIcon /> : <CloudUploadIcon />}
          onClick={fileName ? handleFileDelete : undefined}
        >
          {fileName || "Upload Files"}
          {!fileName && (
            <Input
              type="file"
              onChange={handleFileChange}
              sx={{ display: "none" }}
            />
          )}
        </Button>
      </Box>
    </Box>
  );
}

export default TaskPanel;
