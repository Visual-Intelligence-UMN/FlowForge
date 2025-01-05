
import { singleAgentWithToolsGraph } from "../langgraph/graphs";

const CompileLanggraph = async (config) => {
    // TODO: remove the hardcoded graph and compile the actual langgraph with the config
    const compiledLanggraph = singleAgentWithToolsGraph;
    return compiledLanggraph;
}

export default CompileLanggraph;