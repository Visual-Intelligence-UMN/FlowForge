import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";

const compileReflection = async (workflow, nodesInfo, stepEdges, AgentState) => {
    const edgesDict: Record<string, { id: string; source: string; target: string; type: string; label: string }[]> = {};
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
        edgesDict[node.id] = stepEdges.filter(edge => edge.source === node.id) || [];
    }
    for (const [source, edges] of Object.entries(edgesDict)) {
        if (edges.length === 1) {
            workflow.addEdge(source, edges[0].target);
        } else if (edges.length > 1) {
            // const {router, pathMap} = conditionalRouter(edges);
            // workflow.addConditionalEdges(source, router, pathMap);
        }
    }

    console.log("workflow after reflection", workflow);
    return workflow;
}

const conditionalRouter = (edges) => {
    const router = (edges) => { 
        
    }
    const pathMap = {
        "yes": edges[0].target,
        "no": edges[1].target,
    }
    return {router, pathMap};
}
export { compileReflection };
