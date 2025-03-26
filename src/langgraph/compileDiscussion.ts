import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";
import { z } from "zod";
import { AgentsState } from "./states";
import { ChatOpenAI } from "@langchain/openai";
import { toolsMap } from "./tools";
import { BaseMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph/web";

// Example status check function using a promise-based wait
function waitForStepStatus(
    state: typeof AgentsState.State,
    stepStatusKey: string,
    { retries = 10, interval = 500 } = {}
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

    // Check each previous step's status before proceeding
    for (const step of previousSteps) {
        const statusKey = `${step}-status`;
        try {
            await waitForStepStatus(state, statusKey);
        } catch (error) {
            console.error(error);
        }
    }
    if (!stepMsgs || stepMsgs.length === 0) {
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
            temperature: 0.7,
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        });

        if (params.tools.length > 0) {
            const formattedTools = params.tools.map((t) => (toolsMap[t]));
            agent.bindTools(formattedTools);
        }

        const currentStep = 'step' + params.name.split("-")[1];
        const currentStepId = 'step-' + params.name.split("-")[1];
        const invokePayload = [
            ...await getInputMessagesForStep(state, currentStep, params.previousSteps),
            {
                role:"system",
                content: params.systemPrompt,
            },
        ]
        console.log("invokePayload for", params.name, invokePayload);

        const response = await agent.withStructuredOutput(responseSchema, {name: params.name}).invoke(invokePayload);
        const aiMessage = {
            role: "assistant",
            content: response.response,
            name: params.name,
        }
        let status = "pending";
        let response_goto = response.goto;
        if (state[currentStep].length >= params.maxRound ) {
            // random call, so one msg means one round
            if (params.summaryOrNot) {
                response_goto = params.destinations.find((d) => d.includes("Summary"));
            } else {
                response_goto = params.destinations.filter((d) => !d.includes(currentStepId));
            }
            status = "done";
        } 
        if (!response_goto.includes(currentStepId)) {
            response_goto = params.destinations.filter((d) => !d.includes(currentStepId));
            status = "done";
        }
        console.log("response_goto in compileDiscussion", response_goto);
        // console.log("discussion response", response);
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


const compileDiscussion = async (workflow, nodesInfo, stepEdges, inputEdges, AgentsState, maxRound) => {
    // console.log("nodesInfo in compileDiscussion", nodesInfo);
    console.log("stepEdges in compileDiscussion", stepEdges, nodesInfo);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    const uniquePreviousSteps = [...new Set(previousSteps)];
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
            previousSteps: uniquePreviousSteps as string[],
        });

        const agentNode = async (state: typeof AgentsState.State, config?: RunnableConfig) => {
            return create_agent_node({
                state: state,
                agent: await createdAgent(),
                name: summaryNode.id,
                config: config,
                previousSteps: uniquePreviousSteps as string[],
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
            maxRound: maxRound,
            previousSteps: uniquePreviousSteps as string[],
            summaryOrNot: summaryNode ? true : false,
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