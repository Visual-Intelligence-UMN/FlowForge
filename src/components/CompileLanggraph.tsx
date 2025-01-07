
import { singleAgentWithToolsGraph } from "../langgraph/graphs";
// import { Annotation } from "@langchain/langgraph/web";
// import { BaseMessage } from "@langchain/core/messages";
// import { StateGraph } from "@langchain/langgraph";

const CompileLanggraph = async (reactflowConfig) => {

    // const AgentState = Annotation.Root({
    //     messages: Annotation<BaseMessage[]>({
    //         reducer: (x,y) => x.concat(y),
    //     }),
    //     sender: Annotation<string>({
    //         reducer: (x,y) => y ?? x ?? "user",
    //         default: () => "user",
    //     })
    // });

    // const wholeWorkflow = new StateGraph(AgentState);







    // target langgraph: compiled graph, 
    // should be dealt differently based on the patterns

    // TODO: remove the hardcoded graph and compile the actual langgraph with the config


    
    const compiledLanggraph = singleAgentWithToolsGraph;
    return compiledLanggraph;
}

export default CompileLanggraph;