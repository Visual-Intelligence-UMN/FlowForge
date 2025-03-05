import { StateGraph } from "@langchain/langgraph/web";
import { Annotation } from "@langchain/langgraph/web";
import { BaseMessage } from "@langchain/core/messages";
import { START } from "@langchain/langgraph/web";

import { compileSingleAgent } from "../langgraph/compileSingleAgent";
import { compileReflection } from "../langgraph/compileReflection";
import { compileSupervision } from "../langgraph/compileSupervision";
import { compileDiscussion } from "../langgraph/compileDiscussion";
import { compileVoting } from "../langgraph/compileVoting";
import { AgentsState } from "../langgraph/states";

const CompileLanggraph = async (reactflowConfig) => {
    // reactflowConfig = {
    //     stepMetadata: {},
    //     graph: {
    //         nodes: [],
    //         edges: [],
    //     },
    //     configId: "",
    // }

    // console.log("reactflowConfig in compile langgraph", reactflowConfig[0]);
    const {stepMetadata, graph} = reactflowConfig[0];
    const stepNum = Object.keys(stepMetadata);
    const {nodes, edges} = graph;

    // add the step annotations to the BaseState
    stepNum.forEach((step) => {
        AgentsState.spec[step.split("-").join("")] = Annotation<BaseMessage[]>({
            default: () => [],
            reducer: (x,y) => x.concat(y),
        });
    });
    // console.log("AgentsState", AgentsState);

    let compiledWorkflow = new StateGraph(AgentsState);



    for (const key of Object.keys(stepMetadata)) {
        const stepEdges = edges.filter(edge => edge.id.startsWith(key));
        const {inputNodes,  pattern, stepNodes} = stepMetadata[key];
        const stepNodesInfo = stepNodes.map((id) => nodes.find((node) => node.id === id));
        
        // console.log(key,"stepEdges", stepEdges);
        // console.log(key,"stepNodesInfo", stepNodesInfo);
        // console.log(key,"inputNode", inputNode);
        // console.log(key,"outputNodes", outputNodes);

        // TODO: add the other patterns
        switch (pattern) {
            case "singleAgent":
                // handle single agent with tools or without tools
                compiledWorkflow = await compileSingleAgent(compiledWorkflow, stepNodesInfo, stepEdges, AgentsState);
                break;
            case "reflection":
                compiledWorkflow = await compileReflection(compiledWorkflow, stepNodesInfo, stepEdges, AgentsState);
                break;
            case "supervision":
                compiledWorkflow = await compileSupervision(compiledWorkflow, stepNodesInfo, stepEdges, AgentsState);
                break;
            case "discussion":
                compiledWorkflow = await compileDiscussion(compiledWorkflow, stepNodesInfo, stepEdges, AgentsState);
                break;
            case "voting":
                compiledWorkflow = await compileVoting(compiledWorkflow, stepNodesInfo, stepEdges, AgentsState);
                break;
        }

        if (key === "step-0" && inputNodes.length === 1) {
            compiledWorkflow.addEdge(START, inputNodes[0]);
        }
        // no need to add END edge for the last step because it is already added in the patterns
    }

    // const compiledLanggraph = singleAgentWithToolsGraph;
    // console.log("final Workflow before compile langgraph", compiledWorkflow);
    const compiledLanggraph = compiledWorkflow.compile();
    console.log("final Workflow after compile", compiledLanggraph);
    return compiledLanggraph;
}


export default CompileLanggraph;