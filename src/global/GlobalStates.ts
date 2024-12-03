import { atom } from "jotai";
import { initialNodes } from "../nodes";
import { initialEdges } from "../edges";
import { initialTransformedNodes, initialTransformedEdges } from "./TestNodesEdges";

export const graphsAtom = atom([]);
export const selectedGraphAtom = atom(null);
export const flowsAtom = atom({
    "1": {nodes: initialNodes, edges: initialEdges, viewport: {x: 0, y: 0, zoom: 1}},
    "2": {nodes: initialTransformedNodes, edges: initialTransformedEdges, viewport: {x: 0, y: 0, zoom: 1}}
}); // {flowId: {nodes: [], edges: [], viewport: {x, y, zoom}}} 

export const flowsNodesAtom = atom({
    "1": initialNodes,
    "2": initialTransformedNodes
}); // {flowId: {nodes: []}}

export const flowsEdgesAtom = atom({
    "1": initialEdges,
    "2": initialTransformedEdges
}); // {flowId: {edges: []}}



// export const nodesAtom = atom(
//     (get) => {
//         const selectedGraph = get(selectedGraphAtom);
//         if (!selectedGraph) {
//             return [];
//         }
//         const graphs = get(graphsAtom);
//         const graph = graphs.find((g) => g.id === selectedGraph);
//         return graph?.nodes || [];
//     }, 
//     (get, set, updateNode) => {
//         const selectedGraph = get(selectedGraphAtom);
//         if (!selectedGraph) {
//             return;
//         }
//         set (graphsAtom, (prev) => 
//              prev.map((graph) => 
//                 graph.id === selectedGraph ? 
//                 {...graph, nodes: updateNode(graph.nodes)} : graph
//             )
//         );
//     }
// );