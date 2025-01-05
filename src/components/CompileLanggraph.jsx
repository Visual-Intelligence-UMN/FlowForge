
import { singleAgentWithToolsGraph } from "../langgraph/graphs";

const CompileLanggraph = async (config) => {

    // config format // config format
    // {
    //     taskId: "1",
    //     taskFlowId: "1",
    //     taskFlowName: "Task Flow 1",
    //     taskFlowDescription: "Task Flow 1 Description",
    //     taskFlowSteps: [
    //         {
    //             stepName: "Step 1",
    //             stepLabel: "Step 1 Label",
    //             stepDescription: "Step 1 Description",
    //             pattern: {
    //                 name: "Single Agent with Web Search Tool",             
    //             },
    //             config: { 
    //                 nodes: array of nodes,
    //                 edges: array of edges,
    //                 type: string
    //             }
    //         }
    //     ]
    // }


    // target langgraph: compiled graph, 
    // should be dealt differently based on the patterns

    // TODO: remove the hardcoded graph and compile the actual langgraph with the config
    
    
    const compiledLanggraph = singleAgentWithToolsGraph;
    return compiledLanggraph;
}

export default CompileLanggraph;