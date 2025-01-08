import { createAgent, create_agent_node } from "./utils";
import { RunnableConfig } from "@langchain/core/runnables";

const compileSingleAgent = async (workflow, nodesInfo, stepeEges, AgentState) => {
    for (const node of nodesInfo) {
        const createdAgent = async () => await createAgent({
            llmOption: node.data.llm,
            tools: node.data.tools,
            systemMessage: node.data.systemPrompt,
        });

        const agentNode = async (state:typeof AgentState.State, config?:RunnableConfig) => {
            return create_agent_node({
                state: state,
                agent: await createdAgent(),
                name: node.label,
                config: config,
            });
        }
        workflow.addNode(node.id, agentNode);
    }
    console.log("workflow in compileSingleAgent", workflow);
    return workflow;
};

export { compileSingleAgent };