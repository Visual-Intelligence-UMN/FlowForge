import { createAgent, create_agent_node } from "./utils";
import { RunnableConfig } from "@langchain/core/runnables";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { AgentsState } from "./states";
import { BaseMessage } from "@langchain/core/messages";
import { toolsMap } from "./tools";
import { Command } from "@langchain/langgraph/web";

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
          console.log("status in waitForStepStatus", stepStatusKey, state[stepStatusKey]);
          resolve(true);
        } else if (attempts < retries) {
          console.log("status in waitForStepStatus", stepStatusKey, state[stepStatusKey]);
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

 
    // If the step has no messages yet, use last message from the global messages array.
    if (!stepMsgs || stepMsgs.length === 0) {
               // Check each previous step's status before proceeding
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

        console.log("stepMsgs is empty, use previous steps", previousSteps);
        console.log("state", state);
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
    supervisorOrNot: boolean,
    parallelSteps: string[],
}) => {
    return async (state: typeof AgentsState.State) => {

        const responseSchema = z.object({
            // response: z.string().describe(
            // "A human readable response to the original question. Does not need to be a final response. Will be streamed back to the user."
            // ),
            goto: z.enum(params.destinations as [string, ...string[]]).describe("The next Agent to call or end. Must be one of the specified values."),
        });

        const workerResponseSchema = z.object({
            response: z.string().describe(
                "Complete deliverable response."
            ),
            goto: z.enum(params.destinations as [string, ...string[]]).describe("The next most appropriate Agent to call."),
        });


        const agent = new ChatOpenAI({
            model: params.llmOption,
            temperature: 0.1,
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        });

        if (params.tools.length > 0) {
            const formattedTools = params.tools.map((t) => (toolsMap[t]));
            agent.bindTools(formattedTools);
        }
        const currentStepNum = params.name.split("-")[1];
        const currentStep = 'step' + currentStepNum;
        const currentStepId = 'step-' + currentStepNum;
        const nextStep = 'step-' + (parseInt(currentStepNum) + 1); 

        const invokePayload = [
            ...await getInputMessagesForStep(state, currentStep, params.previousSteps),
            {
                role:"system",
                content: params.systemPrompt,
            },
        ]
        console.log("invokePayload for", params.name, invokePayload);
        const response = await agent.withStructuredOutput(
            params.supervisorOrNot ? responseSchema : workerResponseSchema, 
            {name: params.name}).invoke(invokePayload);
        // const aiMessage = {
        //     role: "assistant",
        //     content: response.response,
        //     name: params.name,
        // }
        // console.log("response", response);

        let response_goto = response.goto;
        let status = "pending";
        if (state[currentStep].length  >= params.maxRound && params.supervisorOrNot) {
            // one round of supervision means one call from the supervisor, and one response from the agent
            // but only the response is added to the state
            response_goto = params.destinations.filter((d) => !d.includes(currentStepId));
            status = "done";
        } else if (!response_goto.includes(currentStepId) && params.supervisorOrNot) {
            response_goto = params.destinations.filter((d) => !d.includes(currentStepId));
            status = "done";
        }

        console.log("state in compileSupervision", state);
        if (params.supervisorOrNot) {
            if (status === "done") {
                for (const parallelStep of params.parallelSteps) {
                    if (parallelStep === currentStep) {
                        continue;
                    }
                    if (state[parallelStep+"-status"] !== "done") {
                        return new Command({
                            // goto: response_goto,
                            update: {
                                [currentStep+"-status"]: status,
                            }
                        })
                    }
                }
                return new Command({
                    goto: response_goto,
                    update: {
                        [currentStep+"-status"]: status,
                    }
                })

            } else {
                return new Command({
                    goto: response_goto,
                    update: {
                        [currentStep+"-status"]: status,
                    }
                })
            }
        } else {
            const aiMessage = {
                role: "assistant",
                content: response.response,
                name: params.name
            }
            return new Command({
                goto: response_goto,
                update: {
                    messages: aiMessage,
                    sender: params.name,
                    // [currentStep+"-status"]: status,
                    [currentStep]: aiMessage,
                }
            })
        }
        return new Command({
            goto: response_goto,
            update: {
                [currentStep+"-status"]: status,
            }
            // update: {
            //     messages: aiMessage,
            //     sender: params.name,
            //     [currentStep]: aiMessage,
            // }
        })
    }
}

const compileSupervision = async (workflow, nodesInfo, stepEdges, inputEdges, parallelSteps, AgentsState, maxRound) => {
    console.log("nodesInfo in compileSupervision", nodesInfo);
    console.log("stepEdges in compileSupervision", stepEdges);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    const uniquePreviousSteps = [...new Set(previousSteps)];
    const supervisorNode = nodesInfo.find(node => node.type === "supervisor");
    const agentsNodes = nodesInfo.filter(node => node.type !== "supervisor");
    const supervisorDestinations = Array.from(new Set(stepEdges.filter(edge => edge.source === supervisorNode.id).map(edge => edge.target)));
    // console.log("supervisorDestinations", supervisorDestinations);
    console.log("destinations in compileSupervision", supervisorDestinations);

    const supervisorAgent = makeAgentNode({
        name: supervisorNode.id,
        destinations: supervisorDestinations as string[],
        systemPrompt: supervisorNode.data.systemPrompt,
        llmOption: supervisorNode.data.llm,
        tools: supervisorNode.data.tools,
        maxRound: maxRound,
        previousSteps: uniquePreviousSteps as string[],
        supervisorOrNot: true,
        parallelSteps: parallelSteps,
    });

    workflow.addNode(supervisorNode.id, supervisorAgent, {
        ends: [...supervisorDestinations],
    });
    // TODO: fix this, supervisor should be able to call next few nodes.

    for (const node of agentsNodes) {
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
            maxRound: node.data.maxRound,
            previousSteps: uniquePreviousSteps as string[],
            supervisorOrNot: false,
            parallelSteps: parallelSteps,
        })
        workflow.addNode(node.id, agentNode, {
            ends: [...destinations]
        })

        // const createdAgent = async () => await createAgent({
        //     llmOption: node.data.llm,
        //     tools: node.data.tools,
        //     systemMessage: node.data.systemPrompt,
        //     accessStepMsgs: true,
        //     previousSteps: previousSteps,
        // });

        // const agentNode = async (state:typeof AgentsState.State, config?:RunnableConfig) => {
        //     return create_agent_node({
        //         state: state,
        //         agent: await createdAgent(),
        //         name: node.id,
        //         config: config,
        //         previousSteps: previousSteps,
        //         changeStatus: false, // worker agents can not change status
        //     });
        // }
        // workflow.addNode(node.id, agentNode);
        // workflow.addEdge(node.id, supervisorNode.id);
    }
    return workflow;
}

export { compileSupervision };