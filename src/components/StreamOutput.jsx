import { singleAgentWithToolsGraph } from '../langgraph/graphs/';
import { useState } from 'react';
import { HumanMessage } from '@langchain/core/messages';

const StreamOutput = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [intermediaryMessages, setIntermediaryMessages] = useState([]);
  const [finalMessage, setFinalMessage] = useState("");
  const [isThreadActive, setIsThreadActive] = useState(false);

  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
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

    // Set the last message as the final message after the stream ends
    setFinalMessage({sender: lastSender, content: lastContent} || 'Process completed');
    setIsThreadActive(false); // End the thread after submission
  };

  return (
    <div>
      <h2>Thread Control</h2>
      <button onClick={startNewThread} style={{ padding: '10px 20px', marginBottom: '10px' }}>
        Start New Thread
      </button>

      {isThreadActive && (
        <form onSubmit={handleFormSubmit}>
          <h2>Enter Input Message</h2>
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type your message here"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button type="submit" style={{ padding: '10px 20px' }}>Submit</button>
        </form>
      )}

      <h2>Intermediary Steps</h2>
      <div>
        {intermediaryMessages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}</strong>
            <p>{msg.content}</p>
            <hr />
          </div>
        ))}
      </div>
      
      <h2>Final Output</h2>
      <div>
        <strong>{finalMessage.sender}</strong>
        <p>{finalMessage.content}</p>
      </div>
    </div>
  );
};

export default StreamOutput;
