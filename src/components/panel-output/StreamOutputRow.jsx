import { useState, useEffect } from "react";
import { HumanMessage } from "@langchain/core/messages";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAtom } from "jotai";
import {
  selectedTaskAtom,
  streamOutputAtom,
} from "../../patterns/GlobalStates";
const WORD_LIMIT = 30; // Global word limit for preview
import CompileLanggraph from "../../utils/CompileLanggraph";
import generateGraphImage from "../../langgraph/utils";
const StreamOutput = ({ runConfig }) => {
  const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);
  const [inputMessage, setInputMessage] = useState(null);
  const [streamOutput, setStreamOutput] = useAtom(streamOutputAtom);
  const [graphImage, setGraphImage] = useState(null);
  useEffect(() => {
    setInputMessage(selectedTask.description);
  }, [selectedTask]);

  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
  };

  const toggleVisibility = () => {
    setStreamOutput({ ...streamOutput, isVisible: !streamOutput.isVisible });
    // setIsVisible(!isVisible);
  };

  const startNewThread = () => {
    setStreamOutput({
      ...streamOutput,
      inputMessage: { sender: "User", content: "" },
      intermediaryMessages: [],
      finalMessage: { sender: "", content: "" },
      isThreadActive: true,
    });
    setInputMessage("");
    // setIntermediaryMessages([]);
    // setFinalMessage(null);
    // setIsThreadActive(true);
    // setSubmittedInput({ content: "", sender: "User" });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log("recompile runConfig", runConfig);
    const langgraphRun = await CompileLanggraph(runConfig.reactflowDisplay);

    const graphImage = await generateGraphImage(langgraphRun);
    setGraphImage(graphImage); // debug graph building

    // setSubmittedInput({ content: inputMessage, sender: "User", showFullContent: false });
    setStreamOutput({
      ...streamOutput,
      inputMessage: { sender: "User", content: inputMessage },
      intermediaryMessages: [],
      finalMessage: { sender: "", content: "" },
    });
    // TODO: args should include graphviz graph
    const streamResults = langgraphRun.stream(
      { messages: [new HumanMessage({ content: inputMessage })] },
      { recursionLimit: 10 }
    );

    let lastSender = "";
    let lastContent = "";

    for await (const output of await streamResults) {
      for (const [key, value] of Object.entries(output)) {
        let sender = value.sender;
        const messagesAll = value.messages;
        let messageContent = "";

        if (Array.isArray(messagesAll) || sender === undefined) {
          sender = messagesAll[0]?.name || "Unknown";
          messageContent = messagesAll[0]?.content || "";
        } else {
          if (!messagesAll.tool_calls || messagesAll.tool_calls.length === 0) {
            messageContent = messagesAll?.content || "";
          } else {
            const calledTool = messagesAll.tool_calls?.[0].name || "";
            messageContent = `Call Tool: ${calledTool} with args: ${
              messagesAll.tool_calls?.[0].args.input || ""
            }`;
          }
        }

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
    setStreamOutput((prevStreamOutput) => ({
      ...prevStreamOutput,
      finalMessage: { sender: lastSender, content: lastContent },
      isThreadActive: false,
    }));
    // setFinalMessage({ sender: lastSender, content: lastContent } || { sender: "System", content: "Process completed" });
    // setIsThreadActive(false);
    // setStreamOutput({...streamOutput, isThreadActive: false});
  };

  const getPreviewContent = (content, isFull) => {
    if (isFull || content?.split(" ").length <= WORD_LIMIT) {
      return content;
    }
    return content?.split(" ").slice(0, WORD_LIMIT).join(" ") + "...";
  };

  const displayIntermediaryMessages1 = () => {
    return (
      <Box sx={{ p: 1, backgroundColor: "#f5f5f5" }}>
        <Grid container spacing={1}>
          {streamOutput.intermediaryMessages.map((msg, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
              sx={{ display: "flex" }}
            >
              <Accordion>
                <AccordionSummary>
                  <Typography variant="h6">{msg.sender}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">{msg.content}</Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

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
          {" "}
          Messages
        </Typography>
        <Grid
          container
          spacing={2}
          sx={{ flexWrap: "nowrap", display: "flex" }}
        >
          {streamOutput.intermediaryMessages.map((msg, index) => {
            const isLastItem =
              index === streamOutput.intermediaryMessages.length - 1;

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
                    backgroundColor: isLastItem ? "#ffeb9b" : "white", // Different background for last item
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                      {"Step" +
                        (Number(msg.sender.split("-")[1]) + 1) +
                        " " +
                        msg.sender.split("-")[3]}
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

  const displayInputMessage = () => {
    return (
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12}>
          <form onSubmit={handleFormSubmit}>
            <Grid container spacing={3} alignItems="center">
              {/* TextField */}
              <Grid item xs={11}>
                {" "}
                {/* Adjust xs value as needed */}
                <TextField
                  fullWidth
                  multiline
                  minRows={1}
                  variant="outlined"
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder={selectedTask.description}
                  sx={{ "& .MuiInputBase-root": { fontSize: "16px" } }}
                />
              </Grid>
              {/* Button */}
              <Grid item xs={1}>
                {" "}
                {/* Adjust xs value as needed */}
                <Button type="submit" variant="contained" fullWidth>
                  Start
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        margin: "auto",
        textAlign: "left",
        ml: 5,
        mt: 2,
        mb: 6,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Button to Toggle Visibility */}
        <Grid item xs={1}>
          <Button variant="contained" onClick={toggleVisibility}>
            {streamOutput.isVisible ? "Hide Panel" : "Show Panel"}
          </Button>
        </Grid>
        {/* Conditional Panel */}
        {graphImage && (
          <img
            src={graphImage}
            alt="workflow graph"
            style={{ width: "50%", height: "50%" }}
          />
        )}
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
          {streamOutput.isThreadActive && displayInputMessage()}

          {/* User's Input Message */}
          {streamOutput.inputMessage && (
            <Card>
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
          {streamOutput.intermediaryMessages.length > 0 &&
            displayIntermediaryMessages()}

          {/* Final Output */}
          {streamOutput.finalMessage && (
            <Card sx={{ backgroundColor: "#f5f5f5" }}>
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
        </Box>
      )}
    </Box>
  );
};

export default StreamOutput;
