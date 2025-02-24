import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";
import { z } from "zod";
import { AgentsState } from "./states";

// TODO: change how to compile discussion


const makeAgentNode = (params: {
    name: string,
    destinations: string[],
    systemPrompt: string,
    llmOption: string,
}) => {
    const possibleDestinations = ["__end__", ...params.destinations] as const;
    const responseSchema = z.object({
        response: z.string().describe(
          "A human readable response to the original question. Does not need to be a final response. Will be streamed back to the user."
        ),
        goto: z.enum(possibleDestinations).describe("The next agent to call, or __end__ if the user's query has been resolved. Must be one of the specified values."),
      });

}

const compileDiscussion = async (workflow, nodesInfo, stepEdges, AgentsState) => {
    for (const node of nodesInfo) {
        const createdAgent = async () => await createAgent({
            llmOption: node.data.llm,
            tools: node.data.tools,
            systemMessage: node.data.systemPrompt,
            accessStepMsgs: false,
        });

        const agentNode = async (state:typeof AgentsState.State, config?:RunnableConfig) => {
            return create_agent_node({
                state: state,
                agent: await createdAgent(),
                name: node.id,
                config: config,
            });
        }
        workflow.addNode(node.id, agentNode);
    }
    console.log("workflow after single agent", workflow);
    // direct next step edge
    for (const edge of stepEdges) {
        workflow.addEdge(edge.source, edge.target);
    } 
    return workflow;
}

export { compileDiscussion };