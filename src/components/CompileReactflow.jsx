
import { initialNodes } from "../nodes";
import { initialEdges } from "../edges";


const CompileReactflow = async (config) => {
    // TODO: remove the hardcoded graph and compile the actual reactflow with the config
    const compiledReactflow = [{
        configId: config.agentConfigId,
        key: [config.taskId, config.flowId , config.patternId, config.agentConfigId].join("-"),
        graph: {nodes: initialNodes, edges: initialEdges, viewport: {x: 0, y: 0, zoom: 1}},
    }]

    
    return compiledReactflow;
}

export default CompileReactflow;