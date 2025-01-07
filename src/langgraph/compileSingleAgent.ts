import { create_agent, create_agent_node } from "./utils";
import { RunnableConfig } from "@langchain/core/runnables";

const compileSingleAgent = async (workflow, nodesInfo, edges, state) => {
    for (const node of nodesInfo) {
        const agent = await create_agent({
            llm: node.data.llm,
            tools: node.data.tools,
            systemMessage: node.data.systemPrompt,
        });

        const agentNode = await create_agent_node({
            state: state,
            agent: agent,
            name: node.label,
        });

        workflow.addNode(node.id, agentNode);
    }

    // Add relevant edges
    edges.forEach((edge) => {
        workflow.addEdge(edge.source, edge.target, edge.type);
    });

    return workflow;
};

export { compileSingleAgent };