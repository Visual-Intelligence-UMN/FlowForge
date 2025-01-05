
import { initialNodes } from "../nodes";
import { initialEdges } from "../edges";


const CompileReactflow = async (config) => {
    // config format
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

    // target reactflow format
    // {
    //     configId: "1",
    //     key: "1-1-1-1",
    //     graph: {nodes: array of nodes, edges: array of edges, viewport: {x: 0, y: 0, zoom: 1}}
    // }

    // TODO: remove the hardcoded graph and compile the actual reactflow with the config
    const compiledReactflow = [{
        configId: config.agentConfigId,
        key: [config.taskId, config.flowId , config.patternId, config.agentConfigId].join("-"),
        graph: {nodes: initialNodes, edges: initialEdges, viewport: {x: 0, y: 0, zoom: 1}},
    }]


    return compiledReactflow;
}

export default CompileReactflow;