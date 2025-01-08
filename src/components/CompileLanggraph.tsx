
import { singleAgentWithToolsGraph } from "../langgraph/graphs";
import { StateGraph } from "@langchain/langgraph/web";
import { Annotation } from "@langchain/langgraph/web";
import { BaseMessage } from "@langchain/core/messages";

import { compileSingleAgent } from "../langgraph/compileSingleAgent";
import { compileReflection } from "../langgraph/compileReflection";
import { compileSupervision } from "../langgraph/compileSupervision";
const CompileLanggraph = async (reactflowConfig) => {

    const AgentState = Annotation.Root({
        messages: Annotation<BaseMessage[]>({
            reducer: (x,y) => x.concat(y),
        }),
    });
    let compiledWorkflow = new StateGraph(AgentState);


    console.log("reactflowConfig in compile langgraph", reactflowConfig[0]);
    const {stepMetadata, graph} = reactflowConfig[0];
    const {nodes, edges} = graph;

    for (const key of Object.keys(stepMetadata)) {
        console.log("key in compile langgraph", key);
        const stepEdges = edges.filter(edge => edge.id.startsWith(key));
        const {inputNode, outputNodes, outputMode, pattern, stepNodes} = stepMetadata[key];
        const stepNodesInfo = stepNodes.map((id) => nodes.find((node) => node.id === id));
        
        // 1. inter-step edges and nodes
        // TODO: add the other patterns
        switch (pattern) {
            case "singleAgent":
                // handle single agent with tools or without tools
                compiledWorkflow = await compileSingleAgent(compiledWorkflow, stepNodesInfo, stepEdges, AgentState);
                break;
            case "reflection":
                compiledWorkflow = await compileReflection(compiledWorkflow, stepNodesInfo, stepEdges, AgentState);
                break;
            case "supervision":
                compiledWorkflow = await compileSupervision(compiledWorkflow, stepNodesInfo, stepEdges, AgentState);
                break;
        }

    }


    // target langgraph: compiled graph, 
    // should be dealt differently based on the patterns
    // TODO: remove the hardcoded graph and compile the actual langgraph with the config

    const compiledLanggraph = singleAgentWithToolsGraph;
    return compiledLanggraph;
}


export default CompileLanggraph;