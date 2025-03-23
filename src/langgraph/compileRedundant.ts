import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";
const compileRedundant = async (workflow, nodesInfo, stepEdges, inputEdges, AgentsState) => {
    console.log("nodesInfo in compileRedundant", nodesInfo);
    console.log("stepEdges in compileRedundant", stepEdges);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    const uniquePreviousSteps = [...new Set(previousSteps)];
    console.log("previousSteps in compileRedundant", previousSteps);
    console.log("uniquePreviousSteps in compileRedundant", uniquePreviousSteps);
    const aggregatorNode = nodesInfo.find((node) => node.data.label === "Aggregator");
    const aggregatorTarget = stepEdges.filter((edge) => edge.source === aggregatorNode.id).map((edge) => edge.target);
    for (const node of nodesInfo) {
        const createdAgent = async () => await createAgent({
            llmOption: node.data.llm,
            tools: node.data.tools,
            systemMessage: node.data.systemPrompt,
            accessStepMsgs: true, // Aggregator can have the access to the step msgs
            previousSteps: uniquePreviousSteps as string[],
        });

        const agentNode = async (state: typeof AgentsState.State, config?: RunnableConfig) => {
            return create_agent_node({
                state: state,
                agent: await createdAgent(),
                name: node.id,
                config: config,
                previousSteps: uniquePreviousSteps as string[],
            });
        }

        workflow.addNode(node.id, agentNode);
    }

    for (const edge of stepEdges) {
        if (edge.target === aggregatorNode.id) {
            workflow.addEdge(edge.source, edge.target);
        }
    }
    if (aggregatorTarget.length > 0) {
        workflow.addEdge(aggregatorNode.id, aggregatorTarget[0])
    } else {
        workflow.addEdge(aggregatorNode.id, "__end__")
    }
 
    return workflow;
    
    
}

export { compileRedundant };
