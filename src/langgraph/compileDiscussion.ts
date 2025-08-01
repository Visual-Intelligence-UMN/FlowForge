import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";
import { z } from "zod";
import { AgentsState } from "./states";
import { ChatOpenAI } from "@langchain/openai";
import { toolsMap } from "./tools";
import { BaseMessage } from "@langchain/core/messages";
import { Command, END } from "@langchain/langgraph/web";
import { loadKey } from "../utils/utils";
// Example status check function using a promise-based wait
function waitForStepStatus(
    state: typeof AgentsState.State,
    stepStatusKey: string,
    { retries = 100, interval = 500 } = {}
): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      function checkStatus() {
        if (state[stepStatusKey] === 'done') {
            // console.log("status in waitForStepStatus", stepStatusKey, state[stepStatusKey]);
          resolve(true);
        } else if (attempts < retries) {
            // console.log("status in waitForStepStatus", stepStatusKey, state[stepStatusKey]);
          attempts++;
          setTimeout(checkStatus, interval);
        } else {
          reject(new Error(`Timeout waiting for ${stepStatusKey} to be done`));
        }
      }
      checkStatus();
    });
  }

const getInputMessagesForStep = async (state: typeof AgentsState.State, stepName: string, previousSteps: string[], name: string) => {
    // For example, stepName might be "step1", "step2", etc.
    const stepMsgs = (state as any)[stepName] as BaseMessage[];
    const firstMsg = state.messages.slice(0, 1);
    let invokeMsg = firstMsg;
    if (state.sender === "user") {
        return state.messages;
    }
    if (name.includes("Summary")) {
        return stepMsgs
    }
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
  }
  
const makeAgentNode = (params: {
    name: string,
    destinations: string[],
    systemPrompt: string,
    llmOption: string,
    tools: string[],
    maxRound: number,
    previousSteps: string[],
    summaryOrNot: boolean,
    parallelSteps: string[],
    summaryNodeOrNot: boolean,
    nodesDescription: string,
}) => {
    return async (state: typeof AgentsState.State) => {

        const responseSchema = z.object({
            response: z.string().describe(
            "Complete deliverable response."
            ),
            goto: z.enum(params.destinations as [string, ...string[]]).describe("The next appropriate Agent or Summary to call. Must be one of the specified values."),
            });

        const responseSchemaSummary = z.object({
            response: z.string().describe(
            "A human readable response aligned with the step description."
            ),
            goto: z.enum(params.destinations as [string, ...string[]]).describe("The next Agent to call. Must be one of the specified values."),
        });

        const agent = new ChatOpenAI({
            model: params.llmOption,
            temperature: 0.5,
            apiKey: loadKey("VITE_OPENAI_API_KEY"),
        });

        if (params.tools.length > 0) {
            const formattedTools = params.tools.map((t) => (toolsMap[t]));
            agent.bindTools(formattedTools);
        }
        // console.log("try to get input messages for", params.name);
        // console.log("params.destinations for discussion", params.name, params.destinations);
        const currentStep = 'step' + params.name.split("-")[1];
        const currentStepId = 'step-' + params.name.split("-")[1];
        const invokePayload = [
            ...await getInputMessagesForStep(state, currentStep, params.previousSteps, params.name),
            {
                role:"system",
                content: params.systemPrompt + (params.summaryNodeOrNot ? "" : "\n" + params.nodesDescription),
            },
        ]
        // console.log("invokePayload for", params.name, invokePayload);

        const response = await agent.withStructuredOutput(
            params.summaryNodeOrNot ? responseSchemaSummary : responseSchema, 
            {name: params.name}).invoke(invokePayload);
        const aiMessage = {
            role: "assistant",
            content: response.response,
            name: params.name,
        }
        let status = "pending";
        let response_goto = response.goto;
        // console.log("intial goto for ", params.name, response_goto);
        // only summary can change the status to done if any
        // otherwise, the status is done when the round is over

        if (params.summaryNodeOrNot && params.summaryOrNot) {
            response_goto = params.destinations.filter((d) => !d.includes(currentStepId)) as any;
            status = "done";
        } else if (!params.summaryNodeOrNot && params.summaryOrNot) {
            if (state[currentStep].length >= params.maxRound) {
                response_goto = params.destinations.find((d) => d.includes("Summary"));
                status = "pending";
            }
        }
        if (response_goto.includes("__end__")) {
            response_goto = END;
        }
        // if (state[currentStep].length >= params.maxRound ) {
        //     // random call, so one msg means one round
        //     if (params.summaryOrNot) {
        //         response_goto = params.destinations.find((d) => d.includes("Summary"));
        //     } else {
        //         response_goto = params.destinations.filter((d) => !d.includes(currentStepId));
        //         status = "done";
        //         // console.log("status in compileDiscussion after summarization or no summary", status);
        //     }
        // } else {
        //     // console.log("params.name in compileDiscussion to summarize", params.name);
        //     // console.log("params.name.includes('Summary')", params.name.includes("Summary"));
        //     if (params.name.includes("Summary")) {
        //         // console.log("params.destinations in compileDiscussion to summarize", params.destinations);
        //         response_goto = params.destinations
        //         status = "done";
        //         // console.log("status in compileDiscussion with a summary node", status);
        //     }
        // }
        // console.log("response_goto in compileDiscussion", response_goto);
        if (status === "done") {
            for (const parallelStep of params.parallelSteps) {
                if (parallelStep === currentStep) {
                    continue;
                }
                if (state[parallelStep+"-status"] !== "done") {
                    // console.log("update status for parallel step as done as parallel step is pending", parallelStep);
                    // console.log("state[parallelStep]", state);
                    // console.log("state[currentStep] mark as done", currentStep);
                    return new Command({
                        goto: response_goto,
                        update: {
                            messages: aiMessage,
                            sender: params.name,
                            [currentStep]: aiMessage,
                            [currentStep+"-status"]: "done",
                        }
                    })
                }
            }
        }
        // console.log("status in compileDiscussion", status);
        // console.log("response_goto in compileDiscussion", response_goto);
        // // console.log("discussion response", response);
        // console.log("state", state);
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


const compileDiscussion = async (workflow, nodesInfo, stepEdges, inputEdges, parallelSteps, AgentsState, maxRound) => {
    // // console.log("nodesInfo in compileDiscussion", nodesInfo);
    // console.log("stepEdges in compileDiscussion", stepEdges, nodesInfo);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    const uniquePreviousSteps = [...new Set(previousSteps)];
    const summaryNode = nodesInfo.find((node) => node.data.label === "Summary");
    const summaryTarget = stepEdges.filter((edge) => edge.source === summaryNode.id).map((edge) => edge.target);
    const nodesDescription = "Call one of the most appropriate agent to continue iterate your deliverable to better align with the step description: " + nodesInfo.map((node) => node.id + " (" + node.data.systemPrompt.split("\n")[0] + ")").join("; ");
    // console.log("summaryNode", summaryNode);
    // console.log("summaryTarget", summaryTarget);

    if (summaryNode) {
        let destinations = Array.from(
            new Set(
              stepEdges
                .filter(edge => edge.source === summaryNode.id)
                .map(edge => edge.target)
            )
          );
        // console.log("summaryNode is not null");
        if (destinations.length === 0) {
            destinations = ["__end__"];
        }
        const agentNode = makeAgentNode({
            name: summaryNode.id,
            destinations: destinations as string[],
            systemPrompt: summaryNode.data.systemPrompt,
            llmOption: summaryNode.data.llm,
            tools: summaryNode.data.tools,
            maxRound: maxRound,
            previousSteps: uniquePreviousSteps as string[],
            summaryOrNot: true,
            parallelSteps: parallelSteps,
            summaryNodeOrNot: true,
            nodesDescription: nodesDescription,
        })
        workflow.addNode(summaryNode.id, agentNode, {
            ends: [...destinations]
        })

        // const createdAgent = async () => await createAgent({
        //     llmOption: summaryNode.data.llm,
        //     tools: summaryNode.data.tools,
        //     systemMessage: summaryNode.data.systemPrompt,
        //     accessStepMsgs: true,
        //     previousSteps: uniquePreviousSteps as string[],
        // });
        // const agentNode = async (state: typeof AgentsState.State, config?: RunnableConfig) => {
        //     return create_agent_node({
        //         state: state,
        //         agent: await createdAgent(),
        //         name: summaryNode.id,
        //         config: config,
        //         previousSteps: uniquePreviousSteps as string[],
        //         changeStatus: true,
        //     });
        // }
        // workflow.addNode(summaryNode.id, agentNode)
        // if (summaryTarget.length > 0) {
        //     // console.log("summaryTarget add edges", summaryTarget);
        //     for (const target of summaryTarget) {
        //         workflow.addEdge(summaryNode.id, target)
        //     }
        // } else {
        //     workflow.addEdge(summaryNode.id, "__end__")
        // }
    }

    for (const node of nodesInfo) {
        let destinations = Array.from(
            new Set(
              stepEdges
                .filter(edge => edge.source === node.id)
                .map(edge => edge.target)
            )
          );
        if (destinations.length === 0) {
            destinations = ["__end__"];
        }
        const agentNode = makeAgentNode({
            name: node.id,
            destinations: destinations as string[],
            systemPrompt: node.data.systemPrompt,
            llmOption: node.data.llm,
            tools: node.data.tools,
            maxRound: maxRound,
            previousSteps: uniquePreviousSteps as string[],
            summaryOrNot: summaryNode ? true : false,
            parallelSteps: parallelSteps,
            summaryNodeOrNot: false,
            nodesDescription: nodesDescription,
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