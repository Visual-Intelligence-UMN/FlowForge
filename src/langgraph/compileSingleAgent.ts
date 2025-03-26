import { createAgent, create_agent_node } from "./utils";
import { RunnableConfig } from "@langchain/core/runnables";

const compileSingleAgent = async (workflow, nodesInfo, stepEdges, inputEdges, AgentsState) => {
    // console.log("nodesInfo in compileSingleAgent", nodesInfo);
    // console.log("stepEdges in compileSingleAgent", stepEdges);
    // console.log("nodesInfo in compileSingleAgent", nodesInfo, stepEdges);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    const uniquePreviousSteps = [...new Set(previousSteps)];
    console.log("previousSteps in compileSingleAgent", previousSteps);

    for (const node of nodesInfo) {
        // console.log("node", node);
        const createdAgent = async () => await createAgent({
            llmOption: node.data.llm,
            tools: node.data.tools,
            systemMessage: node.data.systemPrompt,
            accessStepMsgs: false,
            previousSteps: uniquePreviousSteps as string[],
        });

        const agentNode = async (state:typeof AgentsState.State, config?:RunnableConfig) => {
            return create_agent_node({
                state: state,
                agent: await createdAgent(),
                name: node.id,
                config: config,
                previousSteps: previousSteps,
                changeStatus:  true,
            });
        }
        workflow.addNode(node.id, agentNode);
    }
    // console.log("workflow after single agent", workflow);
    // direct next step edge
    for (const edge of stepEdges) {
        workflow.addEdge(edge.source, edge.target);
    } 
    return workflow;
};

export { compileSingleAgent };