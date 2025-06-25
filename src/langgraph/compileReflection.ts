
import { BaseMessage } from "@langchain/core/messages";
import { AgentsState } from "./states";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import toolsMap from "./utils";
import { Command, END } from "@langchain/langgraph/web";
import { loadKey } from "../utils/utils";
// import END from "@langchain/langgraph/web";
// Example status check function using a promise-based wait
function waitForStepStatus(
    state: typeof AgentsState.State,
    stepStatusKey: string,
    { retries = 100, interval = 500 } = {}
) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      function checkStatus() {
        if (state[stepStatusKey] === 'done') {
          resolve(true);
        } else if (attempts < retries) {
          attempts++;
          setTimeout(checkStatus, interval);
        } else {
          reject(new Error(`Timeout waiting for ${stepStatusKey} to be done`));
        }
      }
      checkStatus();
    });
  }


const getInputMessagesForStep = async (state: typeof AgentsState.State, stepName: string, previousSteps: string[]) => {
    // For example, stepName might be "step1", "step2", etc.
    const stepMsgs = (state as any)[stepName] as BaseMessage[];
    const firstMsg = state.messages.slice(0, 1);
    let invokeMsg = firstMsg;
    if (state.sender === "user") {
        return state.messages;
    }
   
    // If the step has no messages yet, use last message from the previous steps array.
    if (!stepMsgs || stepMsgs.length === 0) {

        // for (const step of previousSteps) {
        //     if (step === "step0") {
        //         continue;
        //     }
        //     const statusKey = `${step}-status`;
        //     try {
        //         await waitForStepStatus(state, statusKey);
        //     } catch (error) {
        //         console.error(error);
        //         throw error;
        //     }
        // }

        for (const step of previousSteps) {
            invokeMsg = invokeMsg.concat(state[step]?.slice(-1));
        }
        return invokeMsg;
    }
    return stepMsgs.slice(-1);
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
    parallelSteps: string[],
}) => {
    return async (state: typeof AgentsState.State) => {

        const currentStepNum = params.name.split("-")[1];
        const currentStep = 'step' + currentStepNum;    
        const currentStepId = 'step-' + currentStepNum;
        const nextStep = 'step-' + (parseInt(currentStepNum) + 1);

        const responseSchema = z.object({
            response: z.string().describe(
            "Complete deliverable response."
            ),
            goto: z.enum(params.destinations as [string, ...string[]])
            .describe(params.responsePrompt),
        });
        // console.log("params destination null or not", params.destinations);

        const agent = new ChatOpenAI({
            model: params.llmOption,
            temperature: 0.6,
            apiKey: loadKey("VITE_OPENAI_API_KEY"),
        });

        if (params.tools.length > 0) {
            const formattedTools = params.tools.map((t) => (toolsMap[t]));
            agent.bindTools(formattedTools);
        }

        const invokePayload = [
            ...await getInputMessagesForStep(state, currentStep, params.previousSteps),
            {
                role:"system",
                content: params.systemPrompt,
            },
        ]
        // console.log("invokePayload for", params.name, invokePayload);
        const response = await agent.withStructuredOutput(responseSchema, {name: params.name}).invoke(invokePayload);
        const aiMessage = {
            role: "assistant",
            content: response.response,
            name: params.name,
        }
        
        let response_goto = response.goto;
        let status = "pending";
        // console.log("direct response_goto in compileReflection", response_goto);

        if (response_goto === "__end__") {
            // console.log("undefined response goto response_goto in compileReflection next steps", response_goto);
            status = "done";
        } else if (state[currentStep].length / 2 >= params.maxRound+1) {
            response_goto = params.destinations.filter((d) => !d.includes(currentStepId)) as any;
            // console.log("response_goto in compileReflection max round", response_goto);
            status = "done";
        } else if (!response_goto.includes(currentStepId)) {
            // console.log ("next steps")
            response_goto = params.destinations.filter((d) => !d.includes(currentStepId)) as any;
            // console.log("response_goto in compileReflection next steps", response_goto);
            status = "done";
        }

        if (response_goto.includes("__end__")) {
            response_goto = END;
        }
        
        // // console.log("response_goto in compileReflection", response_goto);
        // // console.log("reflection response", params.name, response);
        // // console.log("reflection response_goto", response_goto);
        // console.log("state in compileReflection", state);

        if (status === "done") {
            for (const parallelStep of params.parallelSteps) {
                if (parallelStep === currentStep) {
                    continue;
                }
                if (state[parallelStep+"-status"] !== "done") {
                    return new Command({
                        // goto: response_goto,
                        update: {
                            // messages: aiMessage,
                            // sender: params.name,
                            // [currentStep]: aiMessage,
                            [currentStep+"-status"]: "done",
                        }
                    })
                }
            }
        }   
        // only optimizer will update msgs
        return new Command({
            goto: response_goto,
            update: {
                messages: aiMessage,
                sender: params.name,
                [currentStep]: aiMessage,
                [currentStep+"-status"]: status,
            }
        })
    }
}


const compileReflection = async (workflow, nodesInfo, stepEdges, inputEdges, parallelSteps, AgentsState, maxRound) => {
    // console.log("nodesInfo in compileReflection", nodesInfo);
    // console.log("stepEdges in compileReflection", stepEdges);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    const uniquePreviousSteps = [...new Set(previousSteps)];
    // console.log("previousSteps in compileReflection", previousSteps);
    const nextStep = 'step-' + (parseInt(nodesInfo[0].id.split("-")[1]) + 1);
    const optimizerName = nodesInfo.find((n: any) => n.type === "optimizer")?.id;
    const evaluatorNode = nodesInfo.find((n: any) => n.data.label === "Evaluator");

    const evaluatorTarget = stepEdges.filter((edge) => edge.source === evaluatorNode.id).map((edge) => edge.target);
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
            let nextOne = destinations.find((d: string) => d.includes(nextStep));
            // console.log("nextOne in compileReflection", nextOne);
            if (nextOne === undefined) {
                nextOne = "__end__";
            }
            responsePrompt = "You should review the deliverable, if it is not aligned with the step description, you should call " + optimizerName 
            + " with the optimizer's deliverable along with your FEEDBACKS and suggestions, otherwise organize optimizer's deliverable align with step description with 'GOOD' without feedbacks and call for " + nextOne
        } else {
            responsePrompt = "You should always organize and concatenate your deliverable with the previous one, and call the Evaluator to get the feedbacks. "
        }
        // // console.log("destinations", node.id, destinations);
        const agentNode = makeAgentNode({
            name: node.id,
            destinations: destinations as string[],
            systemPrompt: node.data.systemPrompt,
            llmOption: node.data.llm,
            tools: node.data.tools,
            responsePrompt: responsePrompt,
            maxRound: maxRound,
            previousSteps: uniquePreviousSteps as string[],
            parallelSteps: parallelSteps,
        })
        workflow.addNode(node.id, agentNode, {
            ends: [...destinations]
        })
    }
    if (evaluatorTarget.length <= 1) {
        workflow.addEdge(evaluatorNode.id, "__end__")
    }
    return workflow;
};

export { compileReflection };
