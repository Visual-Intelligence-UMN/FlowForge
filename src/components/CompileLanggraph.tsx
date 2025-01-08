import { StateGraph } from "@langchain/langgraph/web";
import { Annotation } from "@langchain/langgraph/web";
import { BaseMessage } from "@langchain/core/messages";
import { START } from "@langchain/langgraph/web";

import { compileSingleAgent } from "../langgraph/compileSingleAgent";
import { compileReflection } from "../langgraph/compileReflection";
import { compileSupervision } from "../langgraph/compileSupervision";
import { compileDiscussion } from "../langgraph/compileDiscussion";


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
        const stepEdges = edges.filter(edge => edge.id.startsWith(key));
        const {inputNode,  pattern, stepNodes} = stepMetadata[key];
        const stepNodesInfo = stepNodes.map((id) => nodes.find((node) => node.id === id));
        
        // console.log(key,"stepEdges", stepEdges);
        // console.log(key,"stepNodesInfo", stepNodesInfo);
        // console.log(key,"inputNode", inputNode);
        // console.log(key,"outputNodes", outputNodes);

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
            case "discussion":
                compiledWorkflow = await compileDiscussion(compiledWorkflow, stepNodesInfo, stepEdges, AgentState);
                break;
        }

        if (key === "step-0" && inputNode) {
            compiledWorkflow.addEdge(START, inputNode);
        }
        // no need to add END edge for the last step because it is already added in the patterns
    }

    // const compiledLanggraph = singleAgentWithToolsGraph;
    console.log("final Workflow before compile", compiledWorkflow);
    const compiledLanggraph = compiledWorkflow.compile();
    console.log("final Workflow after compile", compiledLanggraph);
    return compiledLanggraph;
}


export default CompileLanggraph;