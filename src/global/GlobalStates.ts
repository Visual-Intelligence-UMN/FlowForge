import { atom } from "jotai";

export const graphsAtom = atom([]);
export const selectedGraphAtom = atom(null);

export const nodesAtom = atom(
    (get) => {
        const selectedGraph = get(selectedGraphAtom);
        if (!selectedGraph) {
            return [];
        }
        const graphs = get(graphsAtom);
        const graph = graphs.find((g) => g.id === selectedGraph);
        return graph?.nodes || [];
    }, 
    (get, set, updateNode) => {
        const selectedGraph = get(selectedGraphAtom);
        if (!selectedGraph) {
            return;
        }
        set (graphsAtom, (prev) => 
             prev.map((graph) => 
                graph.id === selectedGraph ? 
                {...graph, nodes: updateNode(graph.nodes)} : graph
            )
        );
    }
);