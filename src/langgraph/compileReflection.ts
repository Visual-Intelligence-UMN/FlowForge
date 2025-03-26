
import { BaseMessage } from "@langchain/core/messages";
import { AgentsState } from "./states";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import toolsMap from "./utils";
import { Command } from "@langchain/langgraph/web";
const getInputMessagesForStep = (state: typeof AgentsState.State, stepName: string, previousSteps: string[]) => {
    // For example, stepName might be "step1", "step2", etc.
    const stepMsgs = (state as any)[stepName] as BaseMessage[];
    const firstMsg = state.messages.slice(0, 1);
    let invokeMsg = firstMsg;
    if (state.sender === "user") {
        return state.messages;
    }
    
    // If the step has no messages yet, use last message from the previous steps array.
    if (!stepMsgs || stepMsgs.length === 0) {
        for (const step of previousSteps) {
            invokeMsg = invokeMsg.concat(state[step]?.slice(0, 1));
        }
        return invokeMsg;
    }
    return stepMsgs.slice(-2);
    // get two previous msg
  }
  
const makeAgentNode = (params: {
    name: string,
    destinations: string[],
    systemPrompt: string,
    llmOption: string,
    tools: string[],
    responsePrompt: string,
    maxRound: number,
    previousSteps: string[],
}) => {
    return async (state: typeof AgentsState.State) => {

        const currentStepNum = params.name.split("-")[1];
        const currentStep = 'step' + currentStepNum;    
        const currentStepId = 'step-' + currentStepNum;
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
            temperature: 0.4,
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
            ...getInputMessagesForStep(state, currentStep, params.previousSteps),
        ]
        console.log("invokePayload for", params.name, invokePayload);
        const response = await agent.withStructuredOutput(responseSchema, {name: params.name}).invoke(invokePayload);
        const aiMessage = {
            role: "assistant",
            content: response.response,
            name: params.name,
        }
        
        let response_goto = response.goto;
        if (response_goto === undefined) {
            response_goto = "__end__";
            // console.log("response_goto in compileReflection next steps", response_goto);
        }
        if (state[currentStep].length / 2 >= params.maxRound) {
            response_goto = params.destinations.filter((d) => !d.includes(currentStepId));
            console.log("response_goto in compileReflection max round", response_goto);
        }
        if (!response_goto.includes(currentStepId)) {
            console.log ("next steps")
            response_goto = params.destinations.filter((d) => !d.includes(currentStepId));
            console.log("response_goto in compileReflection next steps", response_goto);
        }

        
        // console.log("response_goto in compileReflection", response_goto);
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


const compileReflection = async (workflow, nodesInfo, stepEdges, inputEdges, AgentsState, maxRound) => {
    console.log("nodesInfo in compileReflection", nodesInfo);
    console.log("stepEdges in compileReflection", stepEdges);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    console.log("previousSteps in compileReflection", previousSteps);
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
            previousSteps: previousSteps,
        })
        workflow.addNode(node.id, agentNode, {
            ends: [...destinations]
        })
    }
    return workflow;
};

export { compileReflection };
