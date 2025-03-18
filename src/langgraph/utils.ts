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
    accessStepMsgs
  }: {
    llmOption: string;
    tools: string[];
    systemMessage: string;
    accessStepMsgs: boolean;
  }): Promise<Runnable> {

    const llm = new ChatOpenAI({
        modelName: llmOption,
        temperature: 1,
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,

    });
    const toolNames = tools.map((tool) => toolsMap[tool]).join(", ");
    const formattedTools = tools.map((t) => convertToOpenAITool(toolsMap[t]));
    console.log("formattedTools", formattedTools);
    if (tools.length === 0) {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", systemMessage],
            new MessagesPlaceholder("messages"),
            ...(accessStepMsgs ? [new MessagesPlaceholder("stepMsgs")] : []),
        ]);
        // console.log("prompt", prompt);
        return prompt.pipe(llm);
    } else {
        let prompt = ChatPromptTemplate.fromMessages([
            ["system", " You have access to the following tools: {tool_names}.\n{system_message}"],
            new MessagesPlaceholder("messages"),
            ...(accessStepMsgs ? [new MessagesPlaceholder("stepMsgs")] : []),
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

async function getInputMessagesForStep(state: typeof AgentsState.State, stepName: string) {
    // For example, stepName might be "step1", "step2", etc.
    const stepMsgs = (state as any)[stepName] as BaseMessage[];
  
    // If the step has no messages yet, use last message from the global messages array.
    if (!stepMsgs || stepMsgs.length === 0) {
        console.log("no stepMsgs");
        const lastMsg = state.messages.slice(-1);
        console.log(lastMsg)
        console.log("lastMsg", lastMsg);
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
                    return lastMsg;
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
                    return [lastMsg[0], tool_msg];
                default:
                    return lastMsg;
            }
        } else {
            return lastMsg;
        }
    }
    return stepMsgs.slice(-1);
  }
  

async function create_agent_node(props: {
    state: typeof AgentsState.State,
    agent: Runnable,
    name: string,
    config?: RunnableConfig,
}) {
    const {state, agent, name, config} = props;
    const current_step = 'step' + name.split("-")[1];

    const step_state = state[current_step] ?? [];

    const inputMsgs = await getInputMessagesForStep(state, current_step);

    const invokePayload = {messages: inputMsgs, sender: state.sender, stepMsgs: step_state};
    // const input_state = {messages: state.messages.slice(-1), sender: state.sender};
    // let response = await agent.invoke(input_state, config);
    // const input_state = {messages: state.messages.slice(-1), sender: state.sender};
    console.log("invokePayload", invokePayload);
    let response = await agent.invoke(invokePayload, config);
    const response_msg = handle_agent_response(response, name);
    return {
        messages: response_msg,
        sender: name,
        [current_step]: response_msg,
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