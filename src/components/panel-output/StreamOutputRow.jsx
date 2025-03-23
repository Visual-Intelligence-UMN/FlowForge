import { useState, useEffect } from "react";
import { HumanMessage } from "@langchain/core/messages";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAtom } from "jotai";

import {
  selectedTaskAtom,
  workflowInputAtom,
  canvasPagesAtom,
} from "../../patterns/GlobalStates";
import { multiStreamOutputAtom } from "../../patterns/GlobalStates";

import CompileLanggraph from "../../utils/CompileLanggraph";
import generateGraphImage from "../../langgraph/utils";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

const WORD_LIMIT = 30; // For showing short content previews

const StreamOutput = ({ runConfig }) => {
  const [selectedTask] = useAtom(selectedTaskAtom);
  const [workflowInput] = useAtom(workflowInputAtom);
  const [canvasPages] = useAtom(canvasPagesAtom);

  // This single global store holds *all* configs, keyed by configId.
  const [multiStreamOutput, setMultiStreamOutput] = useAtom(multiStreamOutputAtom);

  // Pull out or initialize the data object for the current configId:
  const defaultData = {
    inputMessage: {
      sender: "User",
      content: "",
      showFullContent: false,
    },
    intermediaryMessages: [],
    finalMessage: {
      sender: "",
      content: "",
      showFullContent: false,
    },
    isThreadActive: false,
    isVisible: true,
    // New additions:
    userRating: 0,     // store user rating
    timeUsed: null,    // store time used for streaming in ms (or seconds)
  };

  const streamData = multiStreamOutput[runConfig?.configId] || defaultData;

  // Helper: use functional updates so we don’t clobber concurrent changes
  const updateStreamData = (updateOrFn) => {
    setMultiStreamOutput((prevAllConfigs) => {
      const prevConfigData = prevAllConfigs[runConfig?.configId] || defaultData;

      // If caller passed a function, invoke it with the old data
      const newConfigData =
        typeof updateOrFn === "function"
          ? updateOrFn(prevConfigData)
          : { ...prevConfigData, ...updateOrFn };

      return {
        ...prevAllConfigs,
        [runConfig?.configId]: newConfigData,
      };
    });
  };

  // Optionally, if you still want to override input from workflowInput externally:
  useEffect(() => {
    if (workflowInput && workflowInput !== streamData.inputMessage.content) {
      updateStreamData((prev) => ({
        ...prev,
        inputMessage: { ...prev.inputMessage, content: workflowInput },
      }));
    }
  }, [workflowInput]);

  // Helpers for content display
  const getPreviewContent = (content, isFull) => {
    if (!content) return "";
    if (isFull || content.split(" ").length <= WORD_LIMIT) {
      return content;
    }
    return content.split(" ").slice(0, WORD_LIMIT).join(" ") + "...";
  };


  const runStreaming = async (compiledLanggraph, totalMaxRound) => {
    // Mark the start time
    const startTime = Date.now();

    // Clear existing messages, set thread active
    updateStreamData((prev) => ({
      ...prev,
      intermediaryMessages: [],
      finalMessage: { sender: "", content: "", showFullContent: false },
      isThreadActive: true,
    }));

    const streamResults = compiledLanggraph.stream(
      { messages: [new HumanMessage({ content: streamData.inputMessage.content })] },
      { recursionLimit: totalMaxRound + 1 }
    );

    let lastSender = "";
    let lastContent = "";

    // For a *blocking* approach, we simply wait for the entire loop to finish.
    for await (const output of await streamResults) {
      for (const [key, value] of Object.entries(output)) {
        let sender = value.sender;
        const messagesAll = value.messages;
        let messageContent = "";

        console.log("output", output);
        console.log("messagesAll", messagesAll, sender);

        // Figure out the content. (Your original logic might vary.)
        if (Array.isArray(messagesAll) || sender === undefined) {
          sender = messagesAll?.[0]?.name || "Unknown";
          messageContent = messagesAll?.[1]?.content || "";
        } else {
          // Possibly the tool call
          if (!messagesAll.tool_calls || messagesAll.tool_calls.length === 0) {
            messageContent = messagesAll?.content || "";
          } else {
            const calledTool = messagesAll.tool_calls?.[0].name || "";
            const toolArgs = messagesAll.tool_calls?.[0].args || "";
            const toolArgsStr = JSON.stringify(toolArgs, null, 2);
            messageContent = `Call Tool: ${calledTool} ${toolArgsStr || ""}`;
          }
        }

        // Only add if new content
        if (messagesAll && messageContent !== lastContent) {
          updateStreamData((prev) => ({
            ...prev,
            intermediaryMessages: [
              ...prev.intermediaryMessages,
              { content: messageContent, sender },
            ],
          }));
        }

        lastSender = sender;
        lastContent = messageContent || lastContent;
      }
    }

    const endTime = Date.now();

    updateStreamData((prev) => ({
      ...prev,
      finalMessage: { sender: lastSender, content: lastContent },
      isThreadActive: false,
      timeUsed: endTime - startTime, // in ms
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const inputMessageContent = streamData.inputMessage.content || "";

    // If we have an uploaded file, process it
    if (selectedTask.uploadedFile) {
      console.log("selectedTask.uploadedFile", selectedTask.uploadedFile);

      // Convert to Blob and load via PDF loader
      const pdfBlob = new Blob([selectedTask.uploadedFile], {
        type: "application/pdf",
      });

      const pdfjs = await import("pdfjs-dist/build/pdf.min.mjs");
      const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.min.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

      const loader = new WebPDFLoader(pdfBlob, {
        splitPages: false,
        parsedItemSeparator: "",
        pdfjs: pdfjs,
      });

      const docs = await loader.load();
      const fileContent = docs.map((doc) => doc.pageContent).join("\n");

      // Append file content to the input
      const combinedInput = inputMessageContent + "\n" + fileContent;
      updateStreamData((prev) => ({
        ...prev,
        inputMessage: { ...prev.inputMessage, content: combinedInput },
      }));
    }

    console.log("Recompile runConfig for new langgraph run", runConfig);

    const { compiledLanggraph, totalMaxRound } = await CompileLanggraph(
      runConfig.reactflowDisplay
    );

    // If you want to store/generate an image
    // const graphImage = await generateGraphImage(compiledLanggraph);
    // updateStreamData({ graphImage });

    await runStreaming(compiledLanggraph, totalMaxRound);

    console.log("Done streaming. streamData is now:", streamData);
  };

  // UI Handlers
  const handleInputChange = (event) => {
    const value = event.target.value;
    updateStreamData((prev) => ({
      ...prev,
      inputMessage: { ...prev.inputMessage, content: value },
    }));
  };

  const handleUserRatingChange = (event, newValue) => {
    updateStreamData({ userRating: newValue });
  };

  const toggleVisibility = () => {
    updateStreamData((prev) => ({
      ...prev,
      isVisible: !prev.isVisible,
    }));
  };

  const startNewThread = () => {
    // Clears out old messages, sets new blank input
    updateStreamData({
      inputMessage: { sender: "User", content: "", showFullContent: false },
      intermediaryMessages: [],
      finalMessage: { sender: "", content: "", showFullContent: false },
      isThreadActive: true,
      userRating: 0,
      timeUsed: null,
    });
  };

  // Helper for rendering intermediate steps
  const displayIntermediaryMessages = () => {
    const { intermediaryMessages } = streamData;
    if (!intermediaryMessages.length) return null;

    return (
      <Box
        sx={{
          p: 1,
          backgroundColor: "#f5f5f5",
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        <Typography variant="h5" sx={{ mb: 1, mt: 1 }}>
          Messages
        </Typography>
        <Grid container spacing={2} sx={{ flexWrap: "nowrap", display: "flex" }}>
          {intermediaryMessages.map((msg, index) => {
            const isLastItem = index === intermediaryMessages.length - 1;
            return (
              <Grid item key={index} sx={{ minWidth: 450, maxWidth: 500 }}>
                <Card
                  elevation={3}
                  sx={{
                    width: "100%",
                    borderRadius: 2,
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    ":hover": { boxShadow: 3 },
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    backgroundColor: isLastItem ? "#ffeb9b" : "white",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                      {"Step" + Number(msg.sender.split("-")[1]) + " " + msg.sender.split("-")[3]}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        flexGrow: 1,
                      }}
                    >
                      {msg.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Renders the form for user input
  const displayInputMessage = () => (
    <Grid container spacing={2} alignItems="flex-start">
      <Grid item xs={12}>
        <form onSubmit={handleFormSubmit}>
          <Grid container spacing={3} alignItems="center">
            {/* TEXT INPUT */}
            <Grid item xs={10} sm={8}>
              <TextField
                fullWidth
                multiline
                minRows={1}
                maxRows={3}
                variant="outlined"
                value={streamData.inputMessage.content}
                onChange={handleInputChange}
                placeholder={selectedTask.description}
                sx={{ "& .MuiInputBase-root": { fontSize: "16px" } }}
              />
            </Grid>

            {/* USER RATING */}
            <Grid item xs={2} sm={2}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Rating:
              </Typography>
              <Rating
                name="userRating"
                value={streamData.userRating || 0}
                onChange={handleUserRatingChange}
              />
            </Grid>

            {/* SUBMIT BUTTON */}
            <Grid item xs={12} sm={2}>
              <Button type="submit" variant="contained" fullWidth>
                Start
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );

  // If the user is on certain pages, possibly hide
  const { type } = canvasPages || {};
  if (type === "pattern" || type === "flow" || !type) {
    return null;
  }

  // Render main
  return (
    <Box sx={{ width: "100%", margin: "auto", textAlign: "left" }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" onClick={startNewThread}>
              Start New Thread
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Only show the input form if isThreadActive */}
      <Box container spacing={2} alignItems="center">
        {streamData.isThreadActive && displayInputMessage()}

        {/* The user’s initial input message */}
        <Grid container spacing={2} alignItems="center" p={2}>
          
          {streamData.inputMessage?.content && (
              // <Grid container spacing={2} alignItems="center">
              <Grid item size={6}>
                <Typography variant="h6">Start Message: </Typography>
                {/* <Typography variant="subtitle2" color="textSecondary">
                  {streamData.inputMessage.sender}
                </Typography> */}
                <Typography variant="h6">
                  {getPreviewContent(
                    streamData.inputMessage.content,
                    streamData.inputMessage.showFullContent
                  )}
                </Typography>
              </Grid>
            )}
          {/* </Grid> */}
          <Grid item size={6}>
            {/* {streamData.userRating && (
              <Typography variant="h6">User Rating: {streamData.userRating} ⭐</Typography>
            )}
                         */}
            <Grid item xs={2} sm={2}>
              <Rating
                name="userRating"
                value={streamData.userRating || 0}
                onChange={handleUserRatingChange}
              />
            </Grid>
            
            {streamData.timeUsed && (
              <Typography variant="h6">Time Used: {(streamData.timeUsed / 1000).toFixed(2)} s</Typography>
            )}
          </Grid>
        </Grid>

        {/* Intermediate messages */}
        {streamData.intermediaryMessages.length > 0 && displayIntermediaryMessages()}

        {/* Final output */}
        {streamData.finalMessage.content && (
          <Card sx={{ backgroundColor: "#f5f5f5", mt: 1 }}>
            <CardContent>
              <Typography variant="h6">Final Output</Typography>
              <Typography variant="subtitle2" color="textSecondary">
                {streamData.finalMessage.sender}
              </Typography>
              <Typography variant="body1">
                {getPreviewContent(
                  streamData.finalMessage.content,
                  streamData.finalMessage.showFullContent
                )}
              </Typography>

              {/* Time usage display */}
              {streamData.timeUsed !== null && (
                <Typography variant="caption" color="textSecondary">
                  Time used: {streamData.timeUsed} ms
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default StreamOutput;
