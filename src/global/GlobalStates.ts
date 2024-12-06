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

