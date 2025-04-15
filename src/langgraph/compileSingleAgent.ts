import { createAgent, create_agent_node } from "./utils";
import { RunnableConfig } from "@langchain/core/runnables";
import { AgentsState } from "./states";
import { BaseMessage } from "@langchain/core/messages";
import { ToolMessage } from "@langchain/core/messages";
import { toolsMap, TavilySearchTool } from "./tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { Command, END } from "@langchain/langgraph/web";

const getInputMessagesForStep = async (state: typeof AgentsState.State, stepName: string, previousSteps: string[]) => {
    // For example, stepName might be "step1", "step2", etc.
    const stepMsgs = (state as any)[stepName] as BaseMessage[];
    let firstMsg = state.messages.slice(0, 1);
    console.log("firstMsg", firstMsg);
    // firstMsg = [] // ? 
    let invokeMsg = firstMsg;
    // const firstMsg = [] 
    // add inital msg or not?
    let inputMsgs = [];
    if (state.sender === "user") {
        return state.messages;
    }
   
    // If the step has no messages yet, use last message from the previous steps array.
    if (!stepMsgs || stepMsgs.length === 0) {

         // wait for the step to be done
        // for (const step of previousSteps) {
        //     if (step === 'step0') {
        //         continue;
        //     }
        //     const stepStatusKey = `${step}-status`;
        //     try {
        //         await waitForStepStatus(state, stepStatusKey);
        //     } catch (error) {
        //         console.error("Error waiting for step status", error);
        //         throw error;
        //     }
        // }
        console.log("no stepMsgs");
        const lastMsg = state.messages.slice(-1) as any;
        console.log("lastMsg", lastMsg);
        console.log("previousSteps", previousSteps);
        for (const step of previousSteps) {
            invokeMsg = invokeMsg.concat(state[step]?.slice(-1));
            console.log("invokeMsg plus step", step, invokeMsg);
        }
        // console.log("invokeMsg for step", invokeMsg);
        // console.log("last lastMsg", state.messages[state.messages.length - 1])
        // console.log(lastMsg)
        // console.log("lastMsg", lastMsg);
        let tool_msg = null;
        if (lastMsg[0]?.tool_calls) {
            // todo add tool msg 'tool_call_id'
            const tool_name = lastMsg[0].tool_calls[0]?.name;
            // console.log("tool_name", tool_name);
            switch (tool_name) {
                case "PDFLoader":
                    // console.log("tool_calls PDFLoader");
                    // const fileContent = await PDFLoaderTool(lastMsg[0].tool_calls[0].args);
                    // console.log("fileContent", fileContent);
                    // tool_msg = new ToolMessage({
                    //     content: "PDF file content: " + fileContent,
                    //     tool_call_id: lastMsg[0].tool_calls[0].id,
                    //     name: tool_name,
                    // });
                    // return [lastMsg[0], tool_msg];
                    return firstMsg.concat(lastMsg);
                case "WebSearch":
                    const result = await TavilySearchTool(lastMsg[0].tool_calls[0]?.args);
                    // const search = new TavilySearchResults({ maxResults: 3, apiKey: import.meta.env.VITE_TAVILY_API_KEY });
                    // const result = await search.invoke(lastMsg[0].tool_calls[0].args.query);
                    // console.log("result web", result);
                    tool_msg = new ToolMessage({
                        content: "Web search results: " + JSON.stringify(result),
                        tool_call_id: lastMsg[0].tool_calls[0]?.id,
                        name: tool_name,
                    });
                    // return [tool_msg];
                    // Note: the tool msg should be returned with the calling msg
                    return firstMsg.concat(lastMsg[0], tool_msg);
                default:
                    return firstMsg.concat(lastMsg);
            }
        } else {
            return invokeMsg;
        }
    }
    // if stepMsgs is not empty, return the last message
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
    parallelSteps: string[],
}) => {
    return async (state: typeof AgentsState.State) => {

        const responseSchema = z.object({
            response: z.string().describe(
            "Complete deliverable response aligned with the step description."
            ),
            goto: z.enum(params.destinations as [string, ...string[]]).describe("The next to call. Must be one of the specified values."),
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
        console.log("params.destinations", params.destinations);
        console.log("try to get input messages for", params.name);
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
       
        if (!response_goto.includes(currentStepId)) {
            response_goto = params.destinations.filter((d) => !d.includes(currentStepId)) as any;
            status = "done";
        }
        if (response_goto.includes("__end__")) {
            response_goto = END;
        }
        console.log("status in compileSingleAgent", status);
        console.log("response_goto in compileSingleAgent", response_goto);
        // console.log("discussion response", response);
        // console.log("state", state);

        for (const parallelStep of params.parallelSteps) {
            if (parallelStep === currentStep) {
                continue;
            }
            if (state[parallelStep+"-status"] !== "done") {
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
        // if all parallel steps are done, return the response_goto with goto
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


const compileSingleAgent = async (workflow, nodesInfo, stepEdges, inputEdges, parallelSteps, AgentsState) => {
    // console.log("nodesInfo in compileSingleAgent", nodesInfo);
    // console.log("stepEdges in compileSingleAgent", stepEdges);
    // console.log("nodesInfo in compileSingleAgent", nodesInfo, stepEdges);
    const previousSteps = inputEdges.map((edge) => 'step' + edge.id.split("->")[0].split("-")[1]);
    const uniquePreviousSteps = [...new Set(previousSteps)];
    console.log("previousSteps in compileSingleAgent", previousSteps);
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
        console.log("destinations in compileSingleAgent", destinations);
        const agentNode = makeAgentNode({
            name: node.id,
            destinations: destinations as string[],
            systemPrompt: node.data.systemPrompt,
            llmOption: node.data.llm,
            tools: node.data.tools,
            maxRound: node.data.maxRound,
            previousSteps: uniquePreviousSteps as string[],
            parallelSteps: parallelSteps,
        })
        workflow.addNode(node.id, agentNode, {
            ends: [...destinations]
        })
    }
    // for (const node of nodesInfo) {
    //     // console.log("node", node);
    //     const createdAgent = async () => await createAgent({
    //         llmOption: node.data.llm,
    //         tools: node.data.tools,
    //         systemMessage: node.data.systemPrompt,
    //         accessStepMsgs: false,
    //         previousSteps: uniquePreviousSteps as string[],
    //     });

    //     const agentNode = async (state:typeof AgentsState.State, config?:RunnableConfig) => {
    //         return create_agent_node({
    //             state: state,
    //             agent: await createdAgent(),
    //             name: node.id,
    //             config: config,
    //             previousSteps: previousSteps,
    //             changeStatus:  true,
    //         });
    //     }
    //     workflow.addNode(node.id, agentNode);
    // }
    // // console.log("workflow after single agent", workflow);
    // // direct next step edge
    // for (const edge of stepEdges) {
    //     workflow.addEdge(edge.source, edge.target);
    // } 
    return workflow;
};

export { compileSingleAgent };