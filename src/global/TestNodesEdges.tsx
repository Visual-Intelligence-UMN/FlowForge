import { transformLangGraphToReactFlow } from "../langgraph/graphUtils";
import { graphVizGraph } from "../langgraph/test-graph";

const {nodes: initialTransformedNodes, edges: initialTransformedEdges} = transformLangGraphToReactFlow(graphVizGraph);

export {initialTransformedNodes, initialTransformedEdges};