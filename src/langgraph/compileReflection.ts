
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
    maxRound: number,
}) => {
    return async (state: typeof AgentsState.State) => {

        const currentStepNum = params.name.split("-")[1];
        const currentStep = 'step' + currentStepNum;
        const nextStep = 'step-' + (parseInt(currentStepNum) + 1);

        const responseSchema = z.object({
            response: z.string().describe(
            "A human readable response to the original input. Will be streamed back to the user."
            ),
            goto: z.enum(params.destinations as [string, ...string[]])
            .describe(params.responsePrompt),
        });

        const agent = new ChatOpenAI({
            model: params.llmOption,
            temperature: 0.8,
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
        console.log("invokePayload", invokePayload);
        const response = await agent.withStructuredOutput(responseSchema, {name: params.name}).invoke(invokePayload);
        const aiMessage = {
            role: "assistant",
            content: response.response,
            name: params.name,
        }
        
        let response_goto = response.goto;
        if (state[currentStep].length / 2 >= params.maxRound) {
            response_goto = params.destinations.find((d) => d.includes(nextStep));
        }

        // console.log("reflection response", params.name, response);
        // console.log("reflection response_goto", response_goto);
        
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


const compileReflection = async (workflow, nodesInfo, stepEdges, AgentsState, maxRound) => {
    // console.log("nodesInfo in compileReflection", nodesInfo);
    // console.log("stepEdges in compileReflection", stepEdges);
    const nextStep = 'step-' + (parseInt(nodesInfo[0].id.split("-")[1]) + 1);
    const optimizerName = nodesInfo.find((n: any) => n.type === "optimizer")?.id;
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
            const nextOne = destinations.find((d: string) => d.includes(nextStep));
            responsePrompt = "You should call " + optimizerName + " with your feedbacks if NOT GOOD, otherwise organize your response and call for " + nextOne
        } else {
            responsePrompt = "You should always call the Evaluator to get the feedbacks. "
        }
        // console.log("destinations", node.id, destinations);
        const agentNode = makeAgentNode({
            name: node.id,
            destinations: destinations as string[],
            systemPrompt: node.data.systemPrompt,
            llmOption: node.data.llm,
            tools: node.data.tools,
            responsePrompt: responsePrompt,
            maxRound: maxRound,
        })
        workflow.addNode(node.id, agentNode, {
            ends: [...destinations]
        })
    }
    return workflow;
};

export { compileReflection };
