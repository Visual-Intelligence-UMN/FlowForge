import { singleAgentWithToolsGraph } from '../langgraph/graphs/';
import { useState } from 'react';
import { HumanMessage } from '@langchain/core/messages';

const StreamOutput = () => {
  const [inputMessage, setInputMessage] = useState("");
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
    setFinalMessage({sender: "", content: ""});
    setIsThreadActive(true);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    setIntermediaryMessages([]);
    setFinalMessage({sender: "", content: ""});

    let streamResults = singleAgentWithToolsGraph.stream(
      { messages: [new HumanMessage({ content: inputMessage })] },
      { recursionLimit: 5 }
    );
    let lastSender = "";
    let lastContent = "";
    let isFinalMessage = false;


    for await (const output of await streamResults) {
      for (const [key, value] of Object.entries(output)) {
        console.log("key", key);
        console.log("value", value);
        console.log("output", output);
        console.log("--------------------------------");
        const sender = value.sender;
        const messagesAll = value.messages
        console.log("sender", sender);
        console.log("messagesAll", messagesAll);

        let messageContent = "";
        if (Array.isArray(messagesAll)) {
          
          messageContent = messagesAll[0].content;
        } else {
          if (!messagesAll.tool_calls || messagesAll.tool_calls.length === 0) {
            messageContent = messagesAll?.content || "";
          } else {
            const calledTool = messagesAll.tool_calls?.[0].name || "";
            messageContent = "Call Tool:" + calledTool + " with args:" + messagesAll.tool_calls?.[0].args.input || "";
          }
        }


        if (messagesAll && messageContent != lastContent) {
          setIntermediaryMessages((prev) => 
            [...prev, {content: messageContent, sender}]);
        }
        lastSender = sender;
        lastContent = messageContent || lastContent;
      }
    }

    setFinalMessage({sender: lastSender, content: lastContent} || 'Process completed');
    setIsThreadActive(false); 
  };

  return (
    <div>
      <button onClick={toggleVisibility} className="toggle-panel-button">
        {isVisible ? 'Hide Panel' : 'Show Panel'}
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

          <div className="chat-messages">
            {intermediaryMessages.map((msg, index) => (
              <div key={index} className={`chat-bubble ${msg.sender === 'User' ? 'user' : 'system'}`}>
                <strong>{msg.sender}</strong>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>

          <div className="final-output">
            <h2>Final Output</h2>
            <div className={`chat-bubble final ${finalMessage.sender === 'User' ? 'user' : 'system'}`}>
              <strong>{finalMessage.sender}</strong>
              <p>{finalMessage.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamOutput;
