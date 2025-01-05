import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { loader_tool } from "./tools";
import { create_agent, create_agent_node, saveGraphImage} from "./utils";
import { AgentState } from "./states";
import type { RunnableConfig } from "@langchain/core/runnables";
import { StateGraph, END, START } from "@langchain/langgraph/web";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";


const search_tool = [
  new TavilySearchResults({ maxResults: 3, apiKey: import.meta.env.VITE_TAVILY_API_KEY }),
];

const llm_model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

const loader_toolNode = new ToolNode([loader_tool]);
const search_toolNode = new ToolNode(search_tool);

const agent_test = async () => await create_agent({
    llm: llm_model, 
    tools: [loader_tool, ...search_tool], 
    systemMessage: "You are a helpful assistant,\
     your task is to generate a presentation script for an academic paper,\
     do some research on the internet if needed, \
    you might be provided with a PDF file, if so, extract the text, then generate a presentation script."
});

const agent_test_node = async (state: typeof AgentState.State, config?: RunnableConfig) => {
    return  create_agent_node({
        state: state,
        agent: await agent_test(),
        name: "agent_test",
        config: config,
    });
}

const agent_test_conditional = (input: typeof AgentState.State) => {
    const messages = input.messages;
    const lastMessage : AIMessage = messages[messages.length - 1];
    const tool_calls = lastMessage?.tool_calls;
    if (tool_calls && tool_calls.length > 0) {
        if (tool_calls[0].name === "PDFloader") {
            return "LoadPDF";
        }
        if (tool_calls[0].name === "tavily_search_results_json") {
            return "Search";
        }
    }
    return "DoneWriting";
}

// const graphStructure = {
//     nodes: [],
//     edges: []
// }

// const create_workflow = (graphStructure)=>{
//     const workflow = new StateGraph(AgentState);
//  graphStructure.nodes.forEach(node=>
//  {workflow.addNode(node.id, node.node)}
//  )

//  graphStructure.edges.forEach(edge=>{
//     workflow.addEdge(edge.source, edge.target)
//  })

//  return workflow;
// }

const base_workflow = new StateGraph(AgentState)
    .addNode("loader_tool", loader_toolNode)
    .addNode("search_tool", search_toolNode)
    .addNode("agent_test", agent_test_node)
    .addConditionalEdges("agent_test", agent_test_conditional, {LoadPDF: "loader_tool", Search: "search_tool", DoneWriting: END})
    .addEdge("loader_tool", "agent_test")
    .addEdge("search_tool", "agent_test")
    .addEdge(START, "agent_test")

    
export const singleAgentWithToolsGraph = base_workflow.compile();
export const singleAgentWithToolsWorkflow = base_workflow;

// No need to get info from the langgraph graph, instead, build the graph from the config
// (async () => {
//     console.log("After compilation: ");
//     console.log(singleAgentWithToolsGraph);
//     console.log("Before compilation: ");
//     console.log(singleAgentWithToolsWorkflow);
// })();