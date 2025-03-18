import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";
import { AgentsState } from "./states";
import { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { toolsMap } from "./tools";
import { Command } from "@langchain/langgraph/web";

const getInputMessagesForStep = (state: typeof AgentsState.State, stepName: string) => {
    // For example, stepName might be "step1", "step2", etc.
    const stepMsgs = (state as any)[stepName] as BaseMessage[];
  
    // If the step has no messages yet, use last message from the global messages array.
    if (!stepMsgs || stepMsgs.length === 0) {
      return state.messages.slice(-1);
    }
    return stepMsgs.slice(-1);
  }
  
const makeRecieveAgentNode = (params: {
    name: string,
    destinations: string[],
    systemPrompt: string,
    llmOption: string,
    tools: string[],
    maxRound: number,
}) => {
    return async (state: typeof AgentsState.State) => {

        const responseSchema = z.object({
            response: z.string().describe(
            "A human readable response to the original question. Does not need to be a final response. Will be streamed back to the user."
            ),
            goto: z.enum(params.destinations as [string, ...string[]]).describe("The next Agent or Summary to call. Must be one of the specified values."),
        });

        const agent = new ChatOpenAI({
            model: params.llmOption,
            temperature: 1,
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        });

        if (params.tools.length > 0) {
            const formattedTools = params.tools.map((t) => (toolsMap[t]));
            agent.bindTools(formattedTools);
        }

        const currentStep = 'step' + params.name.split("-")[1];
        const invokePayload = [
            {
                role:"system",
                content: params.systemPrompt,
            },
            ...getInputMessagesForStep(state, currentStep),
        ]
        const response = await agent.withStructuredOutput(responseSchema, {name: params.name}).invoke(invokePayload);
        const aiMessage = {
            role: "assistant",
            content: response.response,
            name: params.name,
        }
        let response_goto = response.goto;
        if (state[currentStep].length >= params.maxRound) {
            // random call, so one msg means one round
            response_goto = params.destinations.find((d) => d.includes("Summary"));
        }
        return new Command({
            goto: response_goto,
            update: {
                messages: aiMessage,
                sender: params.name,
                [currentStep]: aiMessage,
            }
        })
    }
}

const compileParallel = async (workflow, nodesInfo, stepEdges, AgentsState) => {
    // console.log("nodesInfo in compileParallel", nodesInfo);
    // console.log("stepEdges in compileParallel", stepEdges);
    const aggregatorNode = nodesInfo.find((node) => node.data.label === "Aggregator");
    const aggregatorTarget = stepEdges.filter((edge) => edge.source === aggregatorNode.id).map((edge) => edge.target);
    for (const node of nodesInfo) {
        const createdAgent = async () => await createAgent({
            llmOption: node.data.llm,
            tools: node.data.tools,
            systemMessage: node.data.systemPrompt,
            accessStepMsgs: true,
        });

        const agentNode = async (state: typeof AgentsState.State, config?: RunnableConfig) => {
            return create_agent_node({
                state: state,
                agent: await createdAgent(),
                name: node.id,
                config: config,
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

export { compileParallel };
