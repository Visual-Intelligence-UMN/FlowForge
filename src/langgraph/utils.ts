import { ChatOpenAI } from "@langchain/openai";
import { StructuredTool } from "@langchain/core/tools";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { Runnable } from "@langchain/core/runnables";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage } from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolsMap } from "./tools";
import { InputAnnotation } from "./states";


// function to define the agent
async function createAgent({
    llmOption,
    tools,
    systemMessage
  }: {
    llmOption: string;
    tools: string[];
    systemMessage: string;
  }): Promise<Runnable> {

    const llm = new ChatOpenAI({
        modelName: llmOption,
        temperature: 1,
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });

    const toolNames = tools.map((tool) => toolsMap[tool]).join(", ");
    const formattedTools = tools.map((t) => convertToOpenAITool(toolsMap[t]));

    let prompt = ChatPromptTemplate.fromMessages([
        ["system", " You have access to the following tools: {tool_names}.\n{system_message}"],
        new MessagesPlaceholder("messages"),
    ]);
    prompt = await prompt.partial({
        tool_names: toolNames,
        system_message: systemMessage,
    });
    return prompt.pipe(llm.bind({ tools: formattedTools }));
};


// function to define the agent
async function create_agent({
    llm,
    tools,
    systemMessage
  }: {
    llm: ChatOpenAI;
    tools: StructuredTool[];
    systemMessage: string;
  }): Promise<Runnable> {
    const toolNames = tools.map((tool) => tool.name).join(", ");
    const formattedTools = tools.map((t) => convertToOpenAITool(t));
    let prompt = ChatPromptTemplate.fromMessages([
        ["system", " You have access to the following tools: {tool_names}.\n{system_message}"],
        new MessagesPlaceholder("messages"),
    ]);
    prompt = await prompt.partial({
        tool_names: toolNames,
        system_message: systemMessage,
    });
    return prompt.pipe(llm.bind({ tools: formattedTools }));
};

function handle_agent_response(result: any, name: string) {
    if (!result?.tool_calls || result.tool_calls.length === 0) {
        result = new AIMessage({ ...result, name: name });
    }
    // } else {
    //     result = new AIMessage({ ...result, name: name });
    // }
    return result;
}

async function create_agent_node(props: {
    state: typeof InputAnnotation.State,
    agent: Runnable,
    name: string,
    config?: RunnableConfig,
}) {
    const {state, agent, name, config} = props;
    // const input_state = {messages: state.messages.slice(-1), sender: state.sender};
    // let response = await agent.invoke(input_state, config);
    const input_state = {messages: state.messages.slice(-1), sender: state.sender};
    console.log("input_state", input_state);
    let response = await agent.invoke(input_state, config);
    const response_msg = handle_agent_response(response, name);
    return {
        messages: response_msg,
        sender: name,
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



export { create_agent, create_agent_node, createAgent, saveGraphImage, generateGraphImage };