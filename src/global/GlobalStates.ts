import { atom } from "jotai";
import { initialNodes } from "../nodes";
import { initialEdges } from "../edges";
import { initialTransformedNodes, initialTransformedEdges } from "./TestNodesEdges";

export const graphsAtom = atom([]);
export const selectedGraphAtom = atom(null);
export const flowsAtom = atom({
    "a": {nodes: initialNodes, edges: initialEdges, viewport: {x: 0, y: 0, zoom: 1}},
    "b": {nodes: initialTransformedNodes, edges: initialTransformedEdges, viewport: {x: 0, y: 0, zoom: 1}}
}); // {flowId: {nodes: [], edges: [], viewport: {x, y, zoom}}} 

export const flowsNodesAtom = atom({
    "a": initialNodes,
    "b": initialTransformedNodes
}); // {flowId: {nodes: []}}

export const flowsEdgesAtom = atom({
    "a": initialEdges,
    "b": initialTransformedEdges
}); // {flowId: {edges: []}}

// Task configuration
export const selectedTaskAtom = atom({
    id: "task1", 
    name: "Generate Presentation Script", 
    requiresUpload: false, 
    description: "Generate a presentation script for a given topic.", 
    uploadedFile: null
});
export const taskInputAtom = atom("");
export const uploadedFileAtom = atom(null);

// Taks flows layer
export const taskFlowsGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const taskFlowsAtom = atom([]); // format: 


// Design patterns layer
export const patternsFlowAtom = atom(null);
export const patternsGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const patternsAtom = atom([]);


// Agents layer
export const agentsConfigPatternAtom = atom(null);
export const agentsConfigGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const agentsConfigAtom = atom([]);

// reactflow layer 
export const reactflowGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const selectedConfigAtom = atom(null);
export const langgraphGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const langgraphRunAtom = atom([]);
export const reactflowDisplayAtom = atom([]);

// chain 
export const selectionChainAtom = atom({flowId: null, patternId:  null, configId: null});

// design patterns pool
export const designPatternsPool = [
    {
        name: "Single Agent with Web Search Tool",
        description: "This design pattern has a single agent to perform the task, and have the access to the web search tool to search for information.\
        It is useful when the task requires the agent to search for information on the web.",
    },
    {
        name: "Single Agent with PDF Loader Tool",
        description: "This design pattern has a single agent to perform the task, and have the access to the PDF loader tool to load the PDF files.\
        It is useful when the task requires the agent to read and understand the PDF files.",
    },
    {
        name: "Reflection",
        description: "This design pattern has a pair of agents, one is the main agent, and the other is the reflection agent. \
        The main agent is the one performing the task, and the reflection agent is the one observing and deciding the main agent's performance and providing iterative feedback to the main agent to improve its performance.\
        It is useful when the task is not too complex but requires iterations to get the best result.",
    },
    {
        name: "Supervision",
        description: "This design pattern has a supervisor agent, and two worker agents.\
        The supervisor agent is the one observing and routing the tasks to the worker agents,\
        and worker agents are the ones performing the tasks.\
        It is useful when the task has several focus points, and each focus point can be handled by a different worker agent.",
    },
    {
        name: "Discussion",
        description: "This design pattern has three agents with different personas or jobs or roles, \
        and they are debating and discussing multiple ideas, brainstorming, and generating diverse perspectives.\
        It is useful when the task requires creativity and diversity of perspectives.",
    },
]