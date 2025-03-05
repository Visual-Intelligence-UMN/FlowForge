
import { BaseMessage } from "@langchain/core/messages";
import { AgentsState } from "./states";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import toolsMap from "./utils";
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
    responsePrompt: string,
}) => {
    return async (state: typeof AgentsState.State) => {

        const currentStepNum = params.name.split("-")[1];
        const currentStep = 'step' + currentStepNum;
        const nextStep = 'step-' + (parseInt(currentStepNum) + 1);

        const responseSchema = z.object({
            response: z.string().describe(
            "A human readable response to the original question. Does not need to be a final response. Will be streamed back to the user."
            ),
            goto: z.enum(params.destinations as [string, ...string[]])
            .describe(params.responsePrompt + nextStep),
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
            response_goto = params.destinations.find((d) => d.includes(nextStep));
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


const compileReflection = async (workflow, nodesInfo, stepEdges, AgentsState) => {
    console.log("nodesInfo in compileReflection", nodesInfo);
    console.log("stepEdges in compileReflection", stepEdges);
    for (const node of nodesInfo) {
        const destinations = Array.from(
            new Set(
              stepEdges
                .filter(edge => edge.source === node.id)
                .map(edge => edge.target)
            )
        );
        let responsePrompt = "";
        if (node.type === "evaluator") {
            responsePrompt = "You should call the Optimizer with your feedbacks if NOT GOOD, otherwise call for next step: ."
        } else {
            responsePrompt = "You should call the Evaluator to get the feedbacks before next "
        }
        console.log("destinations", node.id, destinations);
        const agentNode = makeAgentNode({
            name: node.id,
            destinations: destinations as string[],
            systemPrompt: node.data.systemPrompt,
            llmOption: node.data.llm,
            tools: node.data.tools,
            responsePrompt: responsePrompt,
        })
        workflow.addNode(node.id, agentNode, {
            ends: [...destinations]
        })
    }
    return workflow;
};

export { compileReflection };
