import { useState } from "react";
import { HumanMessage } from "@langchain/core/messages";
import { useAtom } from "jotai";
import { canvasPagesAtom } from "../../patterns/GlobalStates";

const WORD_LIMIT = 30; // Global parameter for word limit

const StreamOutput = ({ langgraphRun }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [submittedInput, setSubmittedInput] = useState("");
  const [intermediaryMessages, setIntermediaryMessages] = useState([]);
  const [finalMessage, setFinalMessage] = useState("");
  const [isThreadActive, setIsThreadActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible); // Toggle panel visibility
  };

  const startNewThread = () => {
    setInputMessage("");
    setIntermediaryMessages([]);
    setFinalMessage({ sender: "", content: "" });
    setIsThreadActive(true);
    setSubmittedInput({ content: "", sender: "User" });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    setSubmittedInput({
      content: inputMessage,
      sender: "User",
      showFullContent: false,
    });
    setInputMessage(""); // Clear input field after submission

    setIntermediaryMessages([]);
    setFinalMessage({ sender: "", content: "" });

    // TODO: args should include graphviz graph
    const streamResults = langgraphRun.stream(
      { messages: [new HumanMessage({ content: inputMessage })] },
      { recursionLimit: 10 }
    );
    let lastSender = "";
    let lastContent = "";

    for await (const output of await streamResults) {
      for (const [key, value] of Object.entries(output)) {
        // console.log("key", key);
        // console.log("value", value);
        // console.log("output", output);
        // console.log("--------------------------------");
        let sender = value.sender;
        const messagesAll = value.messages;
        // console.log("sender", sender);
        // console.log("messagesAll", messagesAll);

        let messageContent = "";
        if (Array.isArray(messagesAll) || sender === undefined) {
          sender = messagesAll[0].name;
          messageContent = messagesAll[0].content;
        } else {
          if (!messagesAll.tool_calls || messagesAll.tool_calls.length === 0) {
            messageContent = messagesAll?.content || "";
          } else {
            const calledTool = messagesAll.tool_calls?.[0].name || "";
            messageContent =
              "Call Tool:" +
              calledTool +
              " with args:" +
              messagesAll.tool_calls?.[0].args.input || "";
          }
        }

        if (messagesAll && messageContent != lastContent) {
          setIntermediaryMessages((prev) => [
            ...prev,
            { content: messageContent, sender },
          ]);
        }
        lastSender = sender;
        lastContent = messageContent || lastContent;
      }
    }

    setFinalMessage(
      { sender: lastSender, content: lastContent } || "Process completed"
    );
    setIsThreadActive(false);
  };
  const toggleContent = (index, isFinal = false) => {
    if (isFinal) {
      setFinalMessage((prev) => ({
        ...prev,
        showFullContent: !prev.showFullContent,
      }));
    } else {
      setIntermediaryMessages((prev) =>
        prev.map((msg, i) =>
          i === index ? { ...msg, showFullContent: !msg.showFullContent } : msg
        )
      );
    }
  };

  const getPreviewContent = (content, isFull) => {
    if (isFull || content?.split(" ").length <= WORD_LIMIT) {
      return content;
    }
    return content?.split(" ").slice(0, WORD_LIMIT).join(" ") + "...";
  };

  const [canvasPages] = useAtom(canvasPagesAtom);
  const { type } = canvasPages || {};

  if (type == 'pattern' || type == 'flow') {
    return null;
  }

  return (
    <div>
      <button onClick={toggleVisibility} className="toggle-panel-button">
        {isVisible ? "Hide Panel" : "Show Panel"}
      </button>

      {isVisible && (
        <div className="chat-panel">
          <div className="thread-control">
            <button onClick={startNewThread} className="thread-button">
              Start New Thread
            </button>
          </div>

          {isThreadActive && (
            <form onSubmit={handleFormSubmit} className="message-form">
              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder="Type your message here"
                className="message-input"
              />
              <button type="submit" className="submit-button">
                Submit
              </button>
            </form>
          )}

          {/* Separate Section for User's Input Message */}
          {submittedInput && (
            <div className="input-message">
              <h2>Start Message</h2>
              <div className={`chat-bubble user`}>
                <strong>{submittedInput.sender}</strong>
                <p>
                  {getPreviewContent(
                    submittedInput.content,
                    submittedInput.showFullContent
                  )}
                </p>
                {submittedInput.content &&
                  submittedInput.content.split(" ").length > WORD_LIMIT && (
                    <button
                      onClick={() => toggleContent("input")}
                      className="toggle-content-button"
                    >
                      {submittedInput.showFullContent
                        ? "Show Less"
                        : "Show More"}
                    </button>
                  )}
              </div>
            </div>
          )}

          {/* Intermediate Messages */}
          <div className="chat-messages">
            <h2>Intermediary Messages</h2>
            {intermediaryMessages.map((msg, index) => (
              // console.log("msg", msg),
              <div
                key={index}
                className={`chat-bubble ${msg.sender === "User" ? "user" : "system"
                  }`}
              >
                <strong>{msg.sender}</strong>
                <p>{getPreviewContent(msg.content, msg.showFullContent)}</p>
                {msg.content && msg.content.split(" ").length > WORD_LIMIT && (
                  <button
                    onClick={() => toggleContent(index)}
                    className="toggle-content-button"
                  >
                    {msg.showFullContent ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="final-output">
            <h2>Final Output</h2>
            <div
              className={`chat-bubble final ${finalMessage.sender === "User" ? "user" : "system"
                }`}
            >
              <strong>{finalMessage.sender}</strong>
              <p>
                {getPreviewContent(
                  finalMessage.content,
                  finalMessage.showFullContent
                )}
              </p>
              {finalMessage.content?.split(" ").length > WORD_LIMIT && (
                <button
                  onClick={() => toggleContent(0, true)}
                  className="toggle-content-button"
                >
                  {finalMessage.showFullContent ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamOutput;
