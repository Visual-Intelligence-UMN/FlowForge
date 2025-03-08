import { useState, useEffect } from "react";
import { HumanMessage } from "@langchain/core/messages";
import {
  Box, Button, Card, CardContent, Typography, TextField,
  Collapse, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAtom } from "jotai";
import { selectedTaskAtom, streamOutputAtom } from "../../patterns/GlobalStates";
import CompileLanggraph from "../../utils/CompileLanggraph";
import generateGraphImage from "../../langgraph/utils";
import { AgentsState } from "../../langgraph/states"; // <-- Your custom annotation
// ^ Make sure you import the correct annotation module

const WORD_LIMIT = 30; // Global word limit for preview

const Streaming = ({ runConfig }) => {
  const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);
  const [streamOutput, setStreamOutput] = useAtom(streamOutputAtom);

  // Local states
  const [inputMessage, setInputMessage] = useState("");
  const [graphImage, setGraphImage] = useState(null);

  // Load default input from selectedTask when it changes
  useEffect(() => {
    setInputMessage(selectedTask?.description || "");
  }, [selectedTask]);

  /* ------------------------ Handlers ------------------------ */

  // Toggle Panel
  const toggleVisibility = () => {
    setStreamOutput((prev) => ({
      ...prev,
      isVisible: !prev.isVisible,
    }));
  };

  // Start new "thread" or conversation
  const startNewThread = () => {
    setStreamOutput((prev) => ({
      ...prev,
      inputMessage: { sender: "User", content: "" },
      intermediaryMessages: [],
      finalMessage: { sender: "", content: "" },
      isThreadActive: true,
      // Initialize an empty AgentsState
      agentsState: AgentsState, 
    }));
    setInputMessage("");
  };

  // Submit user input
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log("recompile runConfig", runConfig);

    // 1) Compile (and optionally generate) the graph
    const langgraphRun = await CompileLanggraph(runConfig.reactflowDisplay);
    // const graphImage = await generateGraphImage(langgraphRun);
    // setGraphImage(graphImage);

    // 2) Update streamOutput with the brand-new user input
    setStreamOutput((prev) => ({
      ...prev,
      inputMessage: { sender: "User", content: inputMessage },
      intermediaryMessages: [],
      finalMessage: { sender: "", content: "" },
    }));

    // 3) Start streaming from langgraph
    const streamResults = langgraphRun.stream(
      { messages: [new HumanMessage({ content: inputMessage })] },
      { recursionLimit: 20 }
    );

    let lastSender = "";
    let lastContent = "";

    /* ------------------------ Streaming Loop ------------------------ */
    for await (const outputChunk of await streamResults) {
      // First, merge any new AgentsState chunk
      // (Assuming your run returns annotation data in `outputChunk` 
      // that matches your AgentsState schema.)
      setStreamOutput((prev) => {
        const prevAgents = prev.agentsState || AgentsState.createEmpty();
        // AgentsState.merge() uses your custom reducers
        const mergedAgents = AgentsState.merge(prevAgents, outputChunk);
        return { ...prev, agentsState: mergedAgents };
      });

      // Then, your existing logic for intermediary messages:
      for (const [key, value] of Object.entries(outputChunk)) {
        let sender = value.sender;
        const messagesAll = value.messages;
        let messageContent = "";

        // Same logic you had before:
        if (Array.isArray(messagesAll) || sender === undefined) {
          sender = messagesAll?.[0]?.name || "Unknown";
          messageContent = messagesAll?.[0]?.content || "";
        } else {
          if (!messagesAll.tool_calls || messagesAll.tool_calls.length === 0) {
            messageContent = messagesAll?.content || "";
          } else {
            const calledTool = messagesAll.tool_calls?.[0].name || "";
            const toolArgs = messagesAll.tool_calls?.[0].args || "";
            const toolArgsStr = JSON.stringify(toolArgs, null, 2);
            messageContent = `Call Tool: ${calledTool} ${toolArgsStr || ""}`;
          }
        }

        // Update your "intermediaryMessages" if there's new text
        if (messagesAll && messageContent !== lastContent) {
          setStreamOutput((prevStreamOutput) => ({
            ...prevStreamOutput,
            intermediaryMessages: [
              ...prevStreamOutput.intermediaryMessages,
              { content: messageContent, sender },
            ],
          }));
        }

        lastSender = sender;
        lastContent = messageContent || lastContent;
      }
    }

    // Once streaming ends, update final message
    setStreamOutput((prevStreamOutput) => ({
      ...prevStreamOutput,
      finalMessage: { sender: lastSender, content: lastContent },
      isThreadActive: false,
    }));
  };

  /* ------------------------ Helpers / Display ------------------------ */

  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
  };

  const getPreviewContent = (content, isFull) => {
    if (!content) return "";
    const words = content.split(" ");
    if (isFull || words.length <= WORD_LIMIT) {
      return content;
    }
    return words.slice(0, WORD_LIMIT).join(" ") + "...";
  };

  // Renders the text input form
  const displayInputMessage = () => (
    <Grid container spacing={2} alignItems="flex-start">
      <Grid item xs={12}>
        <form onSubmit={handleFormSubmit}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={11}>
              <TextField
                fullWidth
                multiline
                minRows={1}
                variant="outlined"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder={selectedTask?.description || "Enter your prompt..."}
                sx={{ "& .MuiInputBase-root": { fontSize: "16px" } }}
              />
            </Grid>
            <Grid item xs={1}>
              <Button type="submit" variant="contained" fullWidth>
                Start
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );

  // Renders your horizontally-scrolling "intermediaryMessages"
  const displayIntermediaryMessages = () => {
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
          {streamOutput.intermediaryMessages.map((msg, index) => {
            const isLastItem = index === streamOutput.intermediaryMessages.length - 1;
            const parts = msg.sender ? msg.sender.split("-") : [];
            const stepIndex = parts?.[1] ? Number(parts[1]) : index;
            const stepName = parts?.[3] ?? "Agent";

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
                      {"Step " + stepIndex + " " + stepName}
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

  /* ------------------------ Render UI ------------------------ */

  return (
    <Box sx={{ width: "100%", margin: "auto", textAlign: "left", mt: 2, pt: 6, mb: 6 }}>
      {/* Top row: toggle visibility & optional graphImage */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={1}>
          <Button variant="contained" onClick={toggleVisibility}>
            {streamOutput.isVisible ? "Hide Panel" : "Show Panel"}
          </Button>
        </Grid>
        {graphImage && (
          <Grid item xs={11}>
            <img
              src={graphImage}
              alt="workflow graph"
              style={{ width: "50%", height: "50%" }}
            />
          </Grid>
        )}

        {/* If panel is visible, show "Start New Thread" button */}
        {streamOutput.isVisible && (
          <Grid item xs={11}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={startNewThread}>
                Start New Thread
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {streamOutput.isVisible && (
        <Box sx={{ gap: 1, mt: 1 }}>
          {/* If a thread is active, show text input */}
          {streamOutput.isThreadActive && displayInputMessage()}

          {/* Show "Start Message" card */}
          {streamOutput.inputMessage?.content && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6">Start Message</Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {streamOutput.inputMessage.sender}
                </Typography>
                <Typography variant="body1">
                  {getPreviewContent(
                    streamOutput.inputMessage.content,
                    streamOutput.inputMessage.showFullContent
                  )}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Intermediate Messages */}
          {streamOutput.intermediaryMessages?.length > 0 && displayIntermediaryMessages()}

          {/* Final Output */}
          {streamOutput.finalMessage?.content && (
            <Card sx={{ backgroundColor: "#f5f5f5", mt: 2 }}>
              <CardContent>
                <Typography variant="h6">Final Output</Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {streamOutput.finalMessage.sender}
                </Typography>
                <Typography variant="body1">
                  {getPreviewContent(
                    streamOutput.finalMessage.content,
                    streamOutput.finalMessage.showFullContent
                  )}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* (Optional) Display AgentsState */}
          {streamOutput.agentsState && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6">AgentsState</Typography>
                {/* You can display specific fields like step2, messages, etc.
                    or just show the whole object for debugging */}
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", mt: 1 }}
                >
                  {JSON.stringify(streamOutput.agentsState, null, 2)}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Streaming;
