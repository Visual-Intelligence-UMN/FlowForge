import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent, create_agent_node } from "./utils";
import { z } from "zod";
import { AgentsState } from "./states";
import { ChatOpenAI } from "@langchain/openai";
import { toolsMap } from "./tools";
import { BaseMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph/web";
import { loadKey } from "../utils/utils";
const getInputMessagesForStep = (state: typeof AgentsState.State, stepName: string, votingNum: number) => {

    const stepMsgs = (state as any)[stepName] as BaseMessage[];
    if (!stepMsgs || stepMsgs.length === 0) {
      return state.messages.slice(-1);
    }
    const previousVotingMsgs = state.messages.slice(-votingNum);
    return [...previousVotingMsgs];

  }

const makeAgentNode = (params: {
    name: string,
    destinations: string[],
    systemPrompt: string,
    llmOption: string,
    tools: string[],
    votingNum: number,
    maxRound: number,
}) => {
    return async (state: typeof AgentsState.State) => {


        const responseSchema = z.object({
            response: z.string().describe(
            "A human readable response to the original question. Does not need to be a final response. Will be streamed back to the user."
            ),
            goto: z.enum(params.destinations as [string, ...string[]]).describe("The next Agent to call. Must be one of the specified values."),
        });

        const agent = new ChatOpenAI({
            model: params.llmOption,
            temperature: 1,
            apiKey: loadKey("VITE_OPENAI_API_KEY"),
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
            ...getInputMessagesForStep(state, currentStep, params.votingNum),
        ]

        const response = await agent.withStructuredOutput(responseSchema, {name: params.name}).invoke(invokePayload);
        const aiMessage = {
            role: "assistant",
            content: response.response,
            name: params.name,
        }
        
        let response_goto = response.goto;
        if (state[currentStep].length / params.destinations.length === params.maxRound) {
            // finish one round of voting
            // console.log("finish one round of voting");
            response_goto = params.destinations.find((d) => d.includes("Aggregator"));
        }

        // console.log("voting response", response);
        // // console.log("state", state);
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

const compileVoting = async (workflow, nodesInfo, stepEdges, inputEdges, AgentsState, maxRound) => {
    // // console.log("nodesInfo in compileVoting", nodesInfo);
    // // console.log("stepEdges in compileVoting", stepEdges);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    const votingNode = nodesInfo.filter((node) => node.data.label.includes("Voting"));
    const aggregatorNode = nodesInfo.find((node) => node.data.label.includes("Aggregator"));
    const aggregatorTarget = stepEdges.filter((edge) => edge.source === aggregatorNode.id).map((edge) => edge.target);

    // // console.log("aggregatorNode", aggregatorNode);
    // // console.log("votingNode", votingNode);
    // // console.log("aggregatorTarget", aggregatorTarget);

    const createdAggregator = async () => await createAgent({
        llmOption: aggregatorNode.data.llm,
        tools: aggregatorNode.data.tools,
        systemMessage: aggregatorNode.data.systemPrompt,
        accessStepMsgs: votingNode.length,
        previousSteps: previousSteps,
    });

    const aggregatorAgentNode = async (state: typeof AgentsState.State, config?: RunnableConfig) => {
        return create_agent_node({
            state: state,
            agent: await createdAggregator(),
            name: aggregatorNode.id,
            config: config,
        });
    }

    workflow.addNode(aggregatorNode.id, aggregatorAgentNode)
    if (aggregatorTarget.length > 0) {
        workflow.addEdge(aggregatorNode.id, aggregatorTarget)
    } else {
        workflow.addEdge(aggregatorNode.id, "__end__")
        // or handle in compileLanggraph
    }

    for (const node of votingNode) {
        const destinations = Array.from(
            new Set(
              stepEdges
                .filter(edge => edge.source === node.id)
                .filter(edge => edge.target !== "Aggregator")
                .map(edge => edge.target)
            )
        );

        const agentNode = makeAgentNode({
            name: node.id,
            destinations: destinations as string[],
            votingNum: votingNode.length,
            systemPrompt: node.data.systemPrompt,
            llmOption: node.data.llm,
            tools: node.data.tools,
            maxRound: maxRound,
        })
        workflow.addNode(node.id, agentNode, {
            ends: [...destinations]
        });
    }
   
    return workflow;
}

export { compileVoting };