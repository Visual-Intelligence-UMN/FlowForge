import { ChatOpenAI } from "@langchain/openai";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { Runnable } from "@langchain/core/runnables";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolsMap, TavilySearchTool } from "./tools";
import { AgentsState } from "./states";
// import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ToolMessage } from "@langchain/core/messages";

// function to define the agent
async function createAgent({
    llmOption,
    tools,
    systemMessage,
    accessStepMsgs,
    previousSteps
  }: {
    llmOption: string;
    tools: string[];
    systemMessage: string;
    accessStepMsgs: boolean;
    previousSteps: string[];
  }): Promise<Runnable> {

    const llm = new ChatOpenAI({
        modelName: llmOption,
        temperature: 0.7,
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,

    });
    const toolNames = tools.map((tool) => toolsMap[tool]).join(", ");
    const formattedTools = tools.map((t) => convertToOpenAITool(toolsMap[t]));
    console.log("formattedTools", formattedTools);
    if (tools.length === 0) {
        const prompt = ChatPromptTemplate.fromMessages([
            new MessagesPlaceholder("messages"),
            ...(accessStepMsgs ? [new MessagesPlaceholder("stepMsgs")] : []),
            ["system", systemMessage],
        ]);
        // console.log("prompt", prompt);
        return prompt.pipe(llm);
    } else {
        let prompt = ChatPromptTemplate.fromMessages([
            // new MessagesPlaceholder("messages"),
            ...(accessStepMsgs ? [new MessagesPlaceholder("stepMsgs")] : [new MessagesPlaceholder("messages")]),
            ["system", " You have access to the following tools: {tool_names}.\n" + systemMessage],
        ]);
        prompt = await prompt.partial({
            tool_names: toolNames,
            system_message: systemMessage,
        });
        // console.log("prompt", prompt);
        return prompt.pipe(llm.bindTools(formattedTools, { parallel_tool_calls:false}));
    }
};


function handle_agent_response(result: any, name: string) {
    if (!result?.tool_calls || result.tool_calls.length === 0) {
        console.log("no tool_calls");
        result = new AIMessage({ ...result, name: name });
    } else {
        console.log("tool_calls");
        result = new AIMessage({ ...result, name: "tool" });
    }
    return result;
}

// Example status check function using a promise-based wait
function waitForStepStatus(
    state: typeof AgentsState.State,
    stepStatusKey: string,
    { retries = 100, interval = 500 } = {}
): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      function checkStatus() {
        if (state[stepStatusKey] === 'done') {
          console.log("status in waitForStepStatus", stepStatusKey, state[stepStatusKey]);
          resolve(true);
        } else if (attempts < retries) {
          console.log("status in waitForStepStatus", stepStatusKey, state[stepStatusKey]);
          attempts++;
          setTimeout(checkStatus, interval);
        } else {
          reject(new Error(`Timeout waiting for ${stepStatusKey} to be done`));
        }
      }
      checkStatus();
    });
  }

async function getInputMessagesForStep(state: typeof AgentsState.State, stepName: string, previousSteps: string[]) {
    // For example, stepName might be "step1", "step2", etc.
    const stepMsgs = (state as any)[stepName] as BaseMessage[];
    let firstMsg = state.messages.slice(0, 1);
    console.log("firstMsg", firstMsg);
    // firstMsg = [] // ? 
    let invokeMsg = firstMsg;
    // const firstMsg = [] 
    // add inital msg or not?
    let inputMsgs = [];
    if (state.sender === "user") {
        return state.messages;
    }
   
    // If the step has no messages yet, use last message from the previous steps array.
    if (!stepMsgs || stepMsgs.length === 0) {

         // wait for the step to be done
        for (const step of previousSteps) {
            if (step === 'step0') {
                continue;
            }
            const stepStatusKey = `${step}-status`;
            try {
                await waitForStepStatus(state, stepStatusKey);
            } catch (error) {
                console.error("Error waiting for step status", error);
                throw error;
            }
        }
        console.log("no stepMsgs");
        const lastMsg = state.messages.slice(-1);
        console.log("lastMsg", lastMsg);
        console.log("previousSteps", previousSteps);
        for (const step of previousSteps) {
            invokeMsg = invokeMsg.concat(state[step]?.slice(-1));
            console.log("invokeMsg plus step", step, invokeMsg);
        }
        // console.log("invokeMsg for step", invokeMsg);
        // console.log("last lastMsg", state.messages[state.messages.length - 1])
        // console.log(lastMsg)
        // console.log("lastMsg", lastMsg);
        let tool_msg = null;
        if (lastMsg[0]?.tool_calls) {
            // todo add tool msg 'tool_call_id'
            const tool_name = lastMsg[0].tool_calls[0]?.name;
            // console.log("tool_name", tool_name);
            switch (tool_name) {
                case "PDFLoader":
                    // console.log("tool_calls PDFLoader");
                    // const fileContent = await PDFLoaderTool(lastMsg[0].tool_calls[0].args);
                    // console.log("fileContent", fileContent);
                    // tool_msg = new ToolMessage({
                    //     content: "PDF file content: " + fileContent,
                    //     tool_call_id: lastMsg[0].tool_calls[0].id,
                    //     name: tool_name,
                    // });
                    // return [lastMsg[0], tool_msg];
                    return firstMsg.concat(lastMsg);
                case "WebSearch":
                    const result = await TavilySearchTool(lastMsg[0].tool_calls[0]?.args);
                    // const search = new TavilySearchResults({ maxResults: 3, apiKey: import.meta.env.VITE_TAVILY_API_KEY });
                    // const result = await search.invoke(lastMsg[0].tool_calls[0].args.query);
                    // console.log("result web", result);
                    tool_msg = new ToolMessage({
                        content: "Web search results: " + JSON.stringify(result),
                        tool_call_id: lastMsg[0].tool_calls[0]?.id,
                        name: tool_name,
                    });
                    // return [tool_msg];
                    // Note: the tool msg should be returned with the calling msg
                    return firstMsg.concat(lastMsg[0], tool_msg);
                default:
                    return firstMsg.concat(lastMsg);
            }
        } else {
            return invokeMsg;
        }
    }
    // if stepMsgs is not empty, return the last message
    return stepMsgs.slice(-1);
  }
  

async function create_agent_node(props: {
    state: typeof AgentsState.State,
    agent: Runnable,
    name: string,
    config?: RunnableConfig,
    previousSteps?: string[],
    changeStatus?: boolean,
}) {
    const {state, agent, name, config, previousSteps, changeStatus} = props;
    const current_step = 'step' + name.split("-")[1];
    const current_step_status = `${current_step}-status`;

    const step_state = state[current_step] ?? [];
    console.log("name", name, "changeStatus?", changeStatus);

    const inputMsgs = await getInputMessagesForStep(state, current_step, previousSteps);

    const invokePayload = {messages: inputMsgs, sender: state.sender, stepMsgs: step_state};
    // const input_state = {messages: state.messages.slice(-1), sender: state.sender};
    // let response = await agent.invoke(input_state, config);
    // const input_state = {messages: state.messages.slice(-1), sender: state.sender};
    console.log("invokePayload for", name, invokePayload);
    let response = await agent.invoke(invokePayload, config);
    const response_msg = handle_agent_response(response, name);
    return {
        messages: response_msg,
        sender: name,
        [current_step]: response_msg,
        [current_step_status]: changeStatus ? "done" : "pending",
    };
};

import fs from "fs";

async function saveGraphImage(g: any, savePath = "graph_image.png") {
    try {
        console.log("Attempting to draw Mermaid PNG...");
        const graphViz = g.getGraph({xray: 1});
        if (!graphViz) {
            console.error("GraphViz is not ready");
            return;
        }
        const image = await graphViz.drawMermaidPng();
        console.log("Image obtained:", image);

        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFile(savePath, buffer, (err) => {
            if (err) {
                console.error(`Error saving the image to ${savePath}:`, err);
            } else {
                console.log(`Image saved successfully at ${savePath}`);
            }
        });
    } catch (error) {
        console.error("Error during graph drawing process:", error);
    }
}
async function generateGraphImage(g: any): Promise<string | null> {
    try {
        console.log("Attempting to draw Mermaid PNG...");
        const graphViz = g.getGraph({ xray: 1 });

        if (!graphViz) {
            console.error("GraphViz is not ready");
            return null;
        }

        const image = await graphViz.drawMermaidPng();
        console.log("Image obtained:", image);

        const arrayBuffer = await image.arrayBuffer();

        const base64Image = await convertArrayBufferToBase64(arrayBuffer);

        return `data:image/png;base64,${base64Image}`;
    } catch (error) {
        console.error("Error during graph drawing process:", error);
        return null;
    }
}


async function convertArrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve) => {
        const blob = new Blob([buffer], { type: "image/png" });
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result?.toString().split(",")[1] || "");
        };
        reader.readAsDataURL(blob);
    });
}

export default generateGraphImage;



export { create_agent_node, createAgent, saveGraphImage, generateGraphImage }