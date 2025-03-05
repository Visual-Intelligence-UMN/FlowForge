import { createAgent, create_agent_node } from "./utils";
import { RunnableConfig } from "@langchain/core/runnables";

const compileSingleAgent = async (workflow, nodesInfo, stepEdges, AgentState) => {
    // console.log("nodesInfo in compileSingleAgent", nodesInfo);
    // console.log("stepEdges in compileSingleAgent", stepEdges);
    for (const node of nodesInfo) {
        // console.log("node", node);
        const createdAgent = async () => await createAgent({
            llmOption: node.data.llm,
            tools: node.data.tools,
            systemMessage: node.data.systemPrompt,
            accessStepMsgs: false,
        });

        const agentNode = async (state:typeof AgentState.State, config?:RunnableConfig) => {
            return create_agent_node({
                state: state,
                agent: await createdAgent(),
                name: node.id,
                config: config,
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