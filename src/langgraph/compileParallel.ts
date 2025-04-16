import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";
import { z } from "zod";
import { AgentsState } from "./states";
import { ChatOpenAI } from "@langchain/openai";
import { toolsMap } from "./tools";
import { BaseMessage } from "@langchain/core/messages";
import { Command, END } from "@langchain/langgraph/web";
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
    if (name.includes("Aggregator")) {
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
}) => {
    return async (state: typeof AgentsState.State) => {

        const responseSchema = z.object({
            response: z.string().describe(
            "Complete deliverable response."
            ),
            goto: z.enum(params.destinations as [string, ...string[]]).describe("The next Agent to call. Must be one of the specified values."),
        });

        const agent = new ChatOpenAI({
            model: params.llmOption,
            temperature: 0.7,
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        });

        if (params.tools.length > 0) {
            const formattedTools = params.tools.map((t) => (toolsMap[t]));
            agent.bindTools(formattedTools);
        }
        // console.log("params.destinations", params.destinations);
        // console.log("try to get input messages for", params.name);
        const currentStep = 'step' + params.name.split("-")[1];
        const currentStepId = 'step-' + params.name.split("-")[1];
        const invokePayload = [
            ...await getInputMessagesForStep(state, currentStep, params.previousSteps, params.name),
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
        let status = "pending";
        let response_goto = response.goto;
       
        if (params.name.includes("Aggregator")) {
            response_goto = params.destinations.filter((d) => !d.includes(currentStepId)) as any;
            status = "done";
            if (response_goto.includes("__end__")) {
                response_goto = END;
            }
            // console.log("response_goto in compileParallel for aggregator", response_goto);
            for (const parallelStep of params.parallelSteps) {
                if (parallelStep === currentStep) {
                    continue;
                }
                if (state[parallelStep+"-status"] !== "done") {
                    // console.log("update status for parallel step as done as parallel step is pending", parallelStep);
                    // console.log("state[parallelStep]", state);
                    // console.log("state[currentStep] mark as done", currentStep);
                    return new Command({
                        // goto: response_goto,
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

        
        // console.log("status in compileParallel", status);
        // console.log("response_goto in compileParallel", response_goto);
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



const compileParallel = async (workflow, nodesInfo, stepEdges, inputEdges, parallelSteps, AgentsState) => {
    // console.log("nodesInfo in compileParallel", nodesInfo);
    // console.log("stepEdges in compileParallel", stepEdges);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    const uniquePreviousSteps = [...new Set(previousSteps)];
    // console.log("previousSteps in compileParallel", previousSteps);
    // console.log("uniquePreviousSteps in compileParallel", uniquePreviousSteps);
    const aggregatorNode = nodesInfo.find((node) => node.data.label === "Aggregator");
    const aggregatorTarget = stepEdges.filter((edge) => edge.source === aggregatorNode.id).map((edge) => edge.target);
    
    for (const node of nodesInfo) {
        let destinations = Array.from(
            new Set(
              stepEdges
                .filter(edge => edge.source === node.id)
                .map(edge => edge.target)
            )
          );
        // console.log("destinations in compileParallel", destinations);
        if (destinations.length === 0) {
            destinations = ["__end__"];
        }
        const agentNode = makeAgentNode({
            name: node.id,
            destinations: destinations as string[],
            systemPrompt: node.data.systemPrompt,
            llmOption: node.data.llm,
            tools: node.data.tools,
            maxRound: node.data.maxRound,
            previousSteps: uniquePreviousSteps as string[],
            summaryOrNot: false,
            parallelSteps: parallelSteps,
        })
        workflow.addNode(node.id, agentNode, {
            ends: [...destinations]
        })
    }
    
    // for (const node of nodesInfo) {
    //     const createdAgent = async () => await createAgent({
    //         llmOption: node.data.llm,
    //         tools: node.data.tools,
    //         systemMessage: node.data.systemPrompt,
    //         accessStepMsgs: true, // Aggregator can have the access to the step msgs
    //         previousSteps: uniquePreviousSteps as string[],
    //     });

    //     const agentNode = async (state: typeof AgentsState.State, config?: RunnableConfig) => {
    //         return create_agent_node({
    //             state: state,
    //             agent: await createdAgent(),
    //             name: node.id,
    //             config: config,
    //             previousSteps: uniquePreviousSteps as string[],
    //             changeStatus: node.data.label === "Aggregator" ? true : false
    //         });
    //     }

    //     workflow.addNode(node.id, agentNode);
    // }

    // for (const edge of stepEdges) {
    //     if (edge.target === aggregatorNode.id) {
    //         workflow.addEdge(edge.source, edge.target);
    //     }
    // }
    // if (aggregatorTarget.length > 0) {
    //     for (const target of aggregatorTarget) {
    //         workflow.addEdge(aggregatorNode.id, target)
    //     }
    // } else {
    //     workflow.addEdge(aggregatorNode.id, "__end__")
    // }
 
    return workflow;
    
    
}

export { compileParallel };
