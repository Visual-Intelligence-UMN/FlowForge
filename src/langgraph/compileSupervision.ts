import { createAgent, create_agent_node } from "./utils";
import { RunnableConfig } from "@langchain/core/runnables";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { AgentsState } from "./states";
import { BaseMessage } from "@langchain/core/messages";
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

const makeAgentNode = (params: {
    name: string,
    destinations: string[],
    systemPrompt: string,
    llmOption: string,
    tools: string[],
}) => {
    return async (state: typeof AgentsState.State) => {

        const responseSchema = z.object({
            // response: z.string().describe(
            // "A human readable response to the original question. Does not need to be a final response. Will be streamed back to the user."
            // ),
            goto: z.enum(params.destinations as [string, ...string[]]).describe("The next Agent to call or end. Must be one of the specified values."),
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
        const currentStepNum = params.name.split("-")[1];
        const currentStep = 'step' + currentStepNum;
        const nextStep = 'step-' + (parseInt(currentStepNum) + 1);

        const invokePayload = [
            {
                role:"system",
                content: params.systemPrompt,
            },
            ...getInputMessagesForStep(state, currentStep),
        ]

        const response = await agent.withStructuredOutput(responseSchema, {name: params.name}).invoke(invokePayload);
        // const aiMessage = {
        //     role: "assistant",
        //     content: response.response,
        //     name: params.name,
        // }
        // console.log("response", response);

        let response_goto = response.goto;
        if (state[currentStep].length >= 10) {
            response_goto = params.destinations.find((d) => d.includes(nextStep));
        }

        return new Command({
            goto: response_goto,
            // update: {
            //     messages: aiMessage,
            //     sender: params.name,
            //     [currentStep]: aiMessage,
            // }
        })
    }
}

const compileSupervision = async (workflow, nodesInfo, stepEdges, AgentState) => {

    const supervisorNode = nodesInfo.find(node => node.type === "supervisor");
    const agentsNodes = nodesInfo.filter(node => node.type !== "supervisor");
    const supervisorDestinations = Array.from(new Set(stepEdges.filter(edge => edge.source === supervisorNode.id).map(edge => edge.target)));
    // console.log("supervisorDestinations", supervisorDestinations);

    const supervisorAgent = makeAgentNode({
        name: supervisorNode.id,
        destinations: supervisorDestinations as string[],
        systemPrompt: supervisorNode.data.systemPrompt,
        llmOption: supervisorNode.data.llm,
        tools: supervisorNode.data.tools,
    });

    workflow.addNode(supervisorNode.id, supervisorAgent, {
        ends: [...supervisorDestinations],
    });

    for (const node of agentsNodes) {
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
        workflow.addEdge(node.id, supervisorNode.id);
    }
    return workflow;
}

export { compileSupervision };