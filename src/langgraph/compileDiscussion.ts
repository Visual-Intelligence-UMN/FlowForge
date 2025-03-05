import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";
import { z } from "zod";
import { AgentsState } from "./states";
import { ChatOpenAI } from "@langchain/openai";
import { toolsMap } from "./tools";
import { BaseMessage } from "@langchain/core/messages";
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
  
const makeAgentNode = (params: {
    name: string,
    destinations: string[],
    systemPrompt: string,
    llmOption: string,
    tools: string[],
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
        if (state[currentStep].length >= 10) {
            response_goto = params.destinations.find((d) => d.includes("Summary"));
        }

        // console.log("discussion response", response);
        // console.log("state", state);
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


const compileDiscussion = async (workflow, nodesInfo, stepEdges, AgentsState) => {
    // console.log("nodesInfo in compileDiscussion", nodesInfo);
    // console.log("stepEdges in compileDiscussion", stepEdges);
    const summaryNode = nodesInfo.find((node) => node.data.label === "Summary");
    const summaryTarget = stepEdges.filter((edge) => edge.source === summaryNode.id).map((edge) => edge.target);

    // console.log("summaryNode", summaryNode);
    // console.log("summaryTarget", summaryTarget);

    if (summaryNode) {
        const createdAgent = async () => await createAgent({
            llmOption: summaryNode.data.llm,
            tools: summaryNode.data.tools,
            systemMessage: summaryNode.data.systemPrompt,
            accessStepMsgs: true,
        });

        const agentNode = async (state: typeof AgentsState.State, config?: RunnableConfig) => {
            return create_agent_node({
                state: state,
                agent: await createdAgent(),
                name: summaryNode.id,
                config: config,
            });
        }
        workflow.addNode(summaryNode.id, agentNode)
        if (summaryTarget.length > 0) {
            workflow.addEdge(summaryNode.id, summaryTarget[0])
        } else {
            workflow.addEdge(summaryNode.id, "__end__")
        }
    }

    for (const node of nodesInfo) {
        const destinations = Array.from(
            new Set(
              stepEdges
                .filter(edge => edge.source === node.id)
                .map(edge => edge.target)
            )
          );
        const agentNode = makeAgentNode({
            name: node.id,
            destinations: destinations as string[],
            systemPrompt: node.data.systemPrompt,
            llmOption: node.data.llm,
            tools: node.data.tools,
        })
        if (node.data.label === "Summary") {
            continue;
        }
        workflow.addNode(node.id, agentNode, {
            ends: [...destinations]
        });
    }
   

    return workflow;
}

export { compileDiscussion };