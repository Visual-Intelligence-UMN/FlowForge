
import { singleAgentWithToolsGraph } from "../langgraph/graphs";
import { StateGraph } from "@langchain/langgraph/web";
import { Annotation } from "@langchain/langgraph/web";
import { BaseMessage } from "@langchain/core/messages";
import { compileSingleAgent } from "../langgraph/compileSingleAgent";


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
        const {inputNode, outputNodes, outputMode, pattern, stepNodes} = stepMetadata[key];
        const stepNodesInfo = stepNodes.map((id) => nodes.find((node) => node.id === id));
        switch (pattern) {
            case "singelAgent":
                compiledWorkflow = await compileSingleAgent(compiledWorkflow, stepNodesInfo, edges, AgentState);
                break;
        }
        // TODO: add the other patterns
    }



    // target langgraph: compiled graph, 
    // should be dealt differently based on the patterns
    // TODO: remove the hardcoded graph and compile the actual langgraph with the config


    
    const compiledLanggraph = singleAgentWithToolsGraph;
    return compiledLanggraph;
}


export default CompileLanggraph;