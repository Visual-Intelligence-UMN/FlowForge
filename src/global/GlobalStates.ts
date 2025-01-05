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