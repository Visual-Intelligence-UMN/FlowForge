import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";
import { AIMessage } from "@langchain/core/messages";

const compileReflection = async (workflow, nodesInfo, stepEdges, AgentState) => {
    const edgesDict: Record<string, { id: string; source: string; target: string; type: string; label: string }[]> = {};
    const reviewer = nodesInfo.find(node => node.type === "reviewer");
    // **Step 1: Add Nodes & Group Edges by Source**
    for (const node of nodesInfo) {
        const createdAgent = async () => await createAgent({
            llmOption: node.data.llm,
            tools: node.data.tools,
            systemMessage: node.data.systemPrompt,
        });

        const agentNode = async (state: typeof AgentState.State, config?: RunnableConfig) => {
            return create_agent_node({
                state: state,
                agent: await createdAgent(),
                name: node.id,
                config: config,
            });
        };

        workflow.addNode(node.id, agentNode);
        edgesDict[node.id] = stepEdges.filter(edge => edge.source === node.id) || [];
    }

    // **Step 2: Add Conditional Edges**
    let targetMapping = {};
    for (const edge of edgesDict[reviewer.id]) {
        if (edge.target.slice(0,6) !== edge.source.slice(0,6)) {
            targetMapping["Approve"] = edge.target;
        } else {
            targetMapping["SuggestToRevise"] = edge.target;
        }
    }

    for (const [source, edges] of Object.entries(edgesDict)) {
        if (edges.length === 1) { // Direct Edge
            workflow.addEdge(source, edges[0].target);
        }
    }

    const reviewerRouter = (input: typeof AgentState.State) => {
        const messages = input.messages;
        const lastMessage : AIMessage = messages[messages.length - 1];
        if (typeof lastMessage.content === "string" && lastMessage.content.includes("NOT GOOD")) {
            return "SuggestToRevise";
        }
        if (typeof lastMessage.content === "string" && lastMessage.content.includes("FINISH")) {
            return "Approve";
        }
        return "SuggestToRevise";
    }
    workflow.addConditionalEdges(reviewer.id, reviewerRouter, targetMapping);
    

    console.log("✅ Workflow after compiling reflection:", workflow);
    return workflow;
};

export { compileReflection };
