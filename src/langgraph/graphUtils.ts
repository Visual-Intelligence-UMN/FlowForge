export const transformLangGraphToReactFlow = (graphData) => {
    const LangGraphNodes = graphData.nodes;
    const nodes = [];
    Object.keys(LangGraphNodes).forEach((node) => {
        let id = LangGraphNodes[node].id;
        let data = LangGraphNodes[node].data;
        let name = LangGraphNodes[node].name;
        let type = "";
        if (name !== "__start__" && name !== "__end__") {
            type = name.split("_")[0];
            if (type === "agent") {
                type = "textUpdater";
            } else {
                type = "text";
            }
        } else {
            type = "text";
        }
        nodes.push({
        id: id,
        type: type,
        data: {label:name},
        position: {
                x: Math.random() * 1000,
                y: Math.random() * 1000,
            }
        });
    });
    const edges = [];
    const LangGraphEdges = graphData.edges;
    LangGraphEdges.forEach((edge) => {
        edges.push({
            id: `${edge.source}->${edge.target}`,
            source: edge.source,
            target: edge.target,
            label: edge.data || " ",
            animated: true,
        }); 
    }); 
    return {nodes, edges};
}