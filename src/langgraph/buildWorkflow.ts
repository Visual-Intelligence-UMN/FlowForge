import { StateGraph, END, START, Annotation } from "@langchain/langgraph/web";
import { BaseMessage } from "@langchain/core/messages";

const compileWorkflow = async (config) => {

    const testState = Annotation.Root({
        messages: Annotation<BaseMessage[]> ({
        reducer: (x,y) => x.concat(y),
        }), 
        sender: Annotation<string>({
            reducer: (x,y) => y ?? x ?? "user",
            default: () => "user",
        }),
        next: Annotation<string>({
            reducer: (x,y) => y ?? x ?? "__end__",
            default: () => "__end__",
        })
    });
    const stateGraph = new StateGraph(testState);


    let previousStep = config[0].name;
    stateGraph.addNode(START, config[0].name);

    console.log("config in build workflow", config);
    // for (const node of config) {
    //     const nodeName = node.name;
    //     stateGraph.addNode(nodeName, node.object);
    //     if (previousStep) {
    //         stateGraph.addEdge(previousStep, nodeName);
    //     }
    //     previousStep = nodeName;
    // }
    // stateGraph.addEdge(previousStep, END);
    // const compiledGraph = stateGraph.compile();

    return stateGraph;

}

export default compileWorkflow;
