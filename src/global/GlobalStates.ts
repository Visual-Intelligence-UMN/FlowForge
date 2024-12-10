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
export const taskFlowsAtom = atom([
    {
        taskId: 1,
        flowId: 1,
        name: "Task Flow 1",
        nodes: ["subtask1", "subtask2"],
        edges: ["edge1", "edge2"]
    },
    {
        taskId: 1,
        flowId: 2,
        name: "Task Flow 2",
        nodes: ["subtask1", "subtask2"],
        edges: ["edge1", "edge2"]
    },
    {
        taskId: 1,
        flowId: 3,
        name: "Task Flow 3",
        nodes: ["subtask1", "subtask2"],
        edges: ["edge1", "edge2"]
    },
    {
        taskId: 1,
        flowId: 4,
        name: "Task Flow 4",
        nodes: ["subtask1", "subtask2"],
        edges: ["edge1", "edge2"]
    }
]); // format: 


// Design patterns layer
export const patternsFlowAtom = atom(null);
export const patternsGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const patternsAtom = atom([]);

