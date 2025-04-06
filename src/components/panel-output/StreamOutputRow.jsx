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
  multiStreamOutputAtom,
  runRealtimeAtom,
  testAtom,
} from "../../patterns/GlobalStates";

import sampleOutputsReview from "../../data/stream/sample-outputs-review.json";

import CompileLanggraph from "../../utils/CompileLanggraph";
import generateGraphImage from "../../langgraph/utils";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import sampleOutputsVis from "../../data/stream/sample-outputs-vis.json";
import sampleOutputsPresentation from "../../data/stream/sample-outputs-presentation.json";
import ReactMarkdown from 'react-markdown';

import ExpandableTextBox from "./ExpandableText";
const WORD_LIMIT = 30; // For showing short content previews

const StreamOutput = ({ runConfig }) => {
  const [selectedTask] = useAtom(selectedTaskAtom);
  const [workflowInput] = useAtom(workflowInputAtom);
  const [canvasPages] = useAtom(canvasPagesAtom);
  const [runRealtime] = useAtom(runRealtimeAtom);
  const [test, setTest] = useAtom(testAtom);
  // This single global store holds *all* configs, keyed by configId.
  const [multiStreamOutput, setMultiStreamOutput] = useAtom(multiStreamOutputAtom);

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
    isVisible: false,
    // New additions:
    userRating: 0,     // store user rating
    timeUsed: 0,    // store time used for streaming in ms (or seconds)
  };
  let streamData;
  if (runRealtime) {
    streamData = multiStreamOutput[runConfig?.configId] || defaultData;
  } else {
    streamData = multiStreamOutput[runConfig?.configId] || defaultData;
  }

  // Helper: use functional updates so we don’t clobber concurrent changes
  // let streamData;
  // if (selectedTask?.name?.includes("Visualization")){
  //   streamData = sampleOutputsVis[runConfig?.configId] || defaultData;
  // } else {
  //   streamData = multiStreamOutput[runConfig?.configId] || defaultData;
  // }

  useEffect(() => {
    if (!runConfig?.configId) return; // no config yet
    // if (!selectedTask?.name?.includes("Visualization")) return;
    let sampleData;
    if (selectedTask?.name?.includes("Script")) {
      console.log("sampleOutputsPresentation", sampleOutputsPresentation);
      sampleData = sampleOutputsPresentation[runConfig.configId];
    } else if (selectedTask?.name?.includes("Review")) {
      sampleData = sampleOutputsReview[runConfig.configId];
    } else if (selectedTask?.name?.includes("Visualization")) {
      sampleData = sampleOutputsVis[runConfig.configId];
    }
    console.log("sampleData in output panel", sampleData);
    if (sampleData) {
      setMultiStreamOutput((prev) => {
        const alreadyHasData = prev[runConfig.configId];
        if (alreadyHasData) return prev; // keep existing if you prefer

        return {
          ...prev,
          [runConfig.configId]: {
            ...defaultData,
            ...sampleData,
          },
        };
      });
    }
  }, [runConfig?.configId, selectedTask?.name, setMultiStreamOutput]);



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

        if (messagesAll) { //&& messageContent !== lastContent
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
    setTest(true);
  };

  const handleTopicChange = (event) => {
    updateStreamData({ topic: event.target.value });
  };


  const toggleVisibility = async () => {
    updateStreamData((prev) => ({
      ...prev,
      isThreadActive: true,
    }));
    await new Promise(resolve => setTimeout(resolve, 3000));
    updateStreamData((prev) => ({
      ...prev,
      isVisible: true,
    }));
    updateStreamData((prev) => ({
      ...prev,
      isThreadActive: false,
    }));

  };

  const startNewThread = () => {
    console.log("startNewThread", streamData);
    // Clears out old messages, sets new blank input
    updateStreamData({
      inputMessage: { sender: "User", content: "", showFullContent: false },
      intermediaryMessages: [],
      finalMessage: { sender: "", content: "", showFullContent: false },
      isThreadActive: false,
      userRating: 0,
      timeUsed: null,
      isVisible: false,
      topic: "",
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
                    <ExpandableTextBox msg={msg} index={index} isLastItem={isLastItem}/>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Renders the form for user input
  const displayInputMessage = () => (
      <Grid container spacing={5} >
        <Grid item xs={8} sm={9} width="60%">
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
        <Grid item xs={4} sm={3}>
          {(streamData?.isThreadActive === true) ? (
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: 'grey.500',
                color: 'white',
                '&:hover': { backgroundColor: 'grey.700' },
              }}
            >
              Loading...
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              fullWidth
              // onClick ={handleFormSubmit}
              onClick={() => toggleVisibility()}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              Start
            </Button>
          )}
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
    <Grid sx={{ width: "100%", margin: "auto", textAlign: "left" }}>
      <Grid container spacing={2} alignItems="center" >
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" onClick={startNewThread} sx={{ m: 1 }}>
              New Thread
            </Button>
          </Box>
        </Grid>
      </Grid>
      {streamData && displayInputMessage()}
      {/* Only show the input form if isThreadActive */}
      <Box className='workflow-input' container spacing={2} alignItems="center">
        

        {/* The user’s initial input message */}
        <Grid container spacing={8} alignItems="center" p={1} sx={{display: streamData?.isVisible ? "flex" : "none"}}>
          <Grid item xs={4}>
            {streamData.timeUsed > 0 && (
              <Typography variant="h6">
                Time Used: {(streamData.timeUsed / 1000).toFixed(2)} s
              </Typography>
            )}
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Rating:
            </Typography>
            <Rating
              name="userRating"
              value={!test ? 0 : streamData.userRating}
              onChange={handleUserRatingChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField 
            size="small" 
            label="Topic" 
            variant="outlined" 
            value={!test ? "" : streamData.topic} 
            onChange={handleTopicChange} 
            sx={{ "& .MuiInputBase-root": { fontSize: "16px" } }}
            />
          </Grid>
        </Grid>


        {/* Intermediate messages */}
        {streamData.intermediaryMessages.length > 0 && streamData?.isVisible && displayIntermediaryMessages() }

        {/* Final output */}
        {streamData.finalMessage.content && streamData?.isVisible && (
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
    </Grid>
  );
};

export default StreamOutput;
