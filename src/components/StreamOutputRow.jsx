import { useState } from "react";
import { HumanMessage } from "@langchain/core/messages";
import {Box,Button,Card, CardContent,Typography,TextField,Accordion,AccordionSummary,AccordionDetails,} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/Grid2";
import { useAtom } from "jotai";
import {selectedTaskAtom} from "../global/GlobalStates";

const WORD_LIMIT = 30; // Global word limit for preview

const StreamOutput = ({ langgraphRun }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [submittedInput, setSubmittedInput] = useState(null);
  const [intermediaryMessages, setIntermediaryMessages] = useState([]);
  const [finalMessage, setFinalMessage] = useState(null);
  const [isThreadActive, setIsThreadActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);

  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const startNewThread = () => {
    setInputMessage("");
    setIntermediaryMessages([]);
    setFinalMessage(null);
    setIsThreadActive(true);
    setSubmittedInput({ content: "", sender: "User" });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmittedInput({ content: inputMessage, sender: "User", showFullContent: false });
    setInputMessage(""); // Clear input field after submission
    setIntermediaryMessages([]);
    setFinalMessage(null);
    setSubmittedInput({content: selectedTask.description, sender: "User", showFullContent: false});

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
            messageContent = `Call Tool: ${calledTool} with args: ${messagesAll.tool_calls?.[0].args.input || ""}`;
          }
        }

        if (messagesAll && messageContent !== lastContent) {
          setIntermediaryMessages((prev) => [...prev, { content: messageContent, sender }]);
        }
        lastSender = sender;
        lastContent = messageContent || lastContent;
      }
    }

    setFinalMessage({ sender: lastSender, content: lastContent } || { sender: "System", content: "Process completed" });
    setIsThreadActive(false);
  };

  const getPreviewContent = (content, isFull) => {
    if (isFull || content?.split(" ").length <= WORD_LIMIT) {
      return content;
    }
    return content?.split(" ").slice(0, WORD_LIMIT).join(" ") + "...";
  };

  const displayIntermediaryMessages = () => {
    return (
        <Box sx={{ p: 1, backgroundColor: "#f5f5f5" }}>
        <Grid container spacing={2}>
            {intermediaryMessages.map((msg, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} sx={{ position: "relative" }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">{msg.sender}</Typography>
                        <Typography variant="body1">{msg.content}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            ))}
        </Grid>
    </Box>
    )
  }

  const displayInputMessage = () => {
    return (
        <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12}>
                    <form onSubmit={handleFormSubmit}>
                        <Grid container spacing={3} alignItems="center">
                            {/* TextField */}
                            <Grid item xs={10}> {/* Adjust xs value as needed */}
                                <TextField
                                fullWidth
                                multiline
                                minRows={1}
                                variant="outlined"
                                value={selectedTask.description}
                                onChange={handleInputChange}
                                placeholder={selectedTask.description}
                                sx={{'& .MuiInputBase-root': { fontSize: '16px' }}}
                            />
                            </Grid>
                            {/* Button */}
                            <Grid item xs={2}> {/* Adjust xs value as needed */}
                                <Button type="submit" variant="contained" fullWidth>
                                        Start
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
        </Grid>
    )
  }

  return (
    <Box sx={{ width: "100%", margin: "auto", textAlign: "left", mt: 2}}>
        <Grid container spacing={2} alignItems="center">
            {/* Button to Toggle Visibility */}
            <Grid item xs={6}>
                <Button variant="contained" onClick={toggleVisibility}>
                {isVisible ? "Hide Panel" : "Show Panel"}
                </Button>
            </Grid>
            {/* Conditional Panel */}
            {isVisible && (
                <Grid item xs={6}>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button variant="outlined" onClick={startNewThread}>
                    Start New Thread
                    </Button>
                </Box>
                </Grid>
            )}
        </Grid>


      {isVisible && (
        <Box sx={{gap: 1 , mt: 1}}>
           {isThreadActive && ( displayInputMessage() )}


          {/* User's Input Message */}
          {submittedInput && (
            <Card>
              <CardContent>
                <Typography variant="h6">Start Message</Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {submittedInput.sender}
                </Typography>
                <Typography variant="body1">{getPreviewContent(submittedInput.content, submittedInput.showFullContent)}</Typography>
              </CardContent>
            </Card>
          )}

          {/* Intermediate Messages */}
          {intermediaryMessages.length > 0 && (
            displayIntermediaryMessages()
          )}


          {/* Final Output */}
          {finalMessage && (
            <Card sx={{ backgroundColor: "#f5f5f5" }}>
              <CardContent>
                <Typography variant="h6">Final Output</Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {finalMessage.sender}
                </Typography>
                <Typography variant="body1">{getPreviewContent(finalMessage.content, finalMessage.showFullContent)}</Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StreamOutput;
