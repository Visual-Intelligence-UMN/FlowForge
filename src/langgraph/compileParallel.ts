import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";
const compileParallel = async (workflow, nodesInfo, stepEdges, inputEdges, AgentsState) => {
    console.log("nodesInfo in compileParallel", nodesInfo);
    console.log("stepEdges in compileParallel", stepEdges);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    const uniquePreviousSteps = [...new Set(previousSteps)];
    console.log("previousSteps in compileParallel", previousSteps);
    console.log("uniquePreviousSteps in compileParallel", uniquePreviousSteps);
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
                changeStatus: node.data.label === "Aggregator" ? true : false
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
        for (const target of aggregatorTarget) {
            workflow.addEdge(aggregatorNode.id, target)
        }
    } else {
        workflow.addEdge(aggregatorNode.id, "__end__")
    }
 
    return workflow;
    
    
}

export { compileParallel };
