import { StateGraph, END, START } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

const compileWorkflow = async (designPatternNodes) => {

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


    let previousStep = designPatternNodes[0].name;
    stateGraph.addNode(START, designPatternNodes[0].name);
    for (const node of designPatternNodes) {
        const nodeName = node.name;
        stateGraph.addNode(nodeName, node.object);
        if (previousStep) {
            stateGraph.addEdge(previousStep, nodeName);
        }
        previousStep = nodeName;
    }
    stateGraph.addEdge(previousStep, END);
    const compiledGraph = stateGraph.compile();

    return compiledGraph;

}

export default compileWorkflow;