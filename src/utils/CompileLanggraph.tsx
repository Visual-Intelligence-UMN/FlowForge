import { StateGraph } from "@langchain/langgraph/web";
import { Annotation } from "@langchain/langgraph/web";
import { BaseMessage } from "@langchain/core/messages";
import { START } from "@langchain/langgraph/web";

import { compileSingleAgent } from "../langgraph/compileSingleAgent";
import { compileReflection } from "../langgraph/compileReflection";
import { compileSupervision } from "../langgraph/compileSupervision";
import { compileDiscussion } from "../langgraph/compileDiscussion";
import { compileVoting } from "../langgraph/compileVoting";
// import { compileRedundant } from "../langgraph/compileRedundant";
import { compileParallel } from "../langgraph/compileParallel";
import { AgentsState } from "../langgraph/states";
import { computeParallelStepsForAll } from "./helpers";

const CompileLanggraph = async (reactflowConfig) => {
    let totalMaxRound = 0;
    // reactflowConfig = {
    //     stepMetadata: {},
    //     graph: {
    //         nodes: [],
    //         edges: [],
    //     },
    //     configId: "",
    // }

    const {stepMetadata, graph} = reactflowConfig[0];
    const startStep = stepMetadata["step-0"];
    const stepNum = Object.keys(stepMetadata);
    const {nodes, edges} = graph;

    stepNum.forEach((step) => {
        if (step === "step-0") {
            return;
        }
        AgentsState.spec[step.split("-").join("")] = Annotation<BaseMessage[]>({
            default: () => [],
            reducer: (x,y) => x.concat(y),
        });
        AgentsState.spec[step.split("-").join("")+"-status"] = Annotation<string>({
            default: () => "pending",
            reducer: (x,y) => y ?? x ?? "pending",
        });
    });
    console.log("AgentsState", AgentsState);

    let compiledWorkflow = new StateGraph(AgentsState);

    console.log("reactflow to compile to langgraph", reactflowConfig);
    const parallelMap = computeParallelStepsForAll(stepMetadata);
    console.log("parallelMap", parallelMap);

    for (const key of Object.keys(stepMetadata)) {
        if (key === "step-0") {
            continue;
        }
        // console.log("key", key);
        const stepEdges = edges.filter(edge => edge.id.startsWith(key));
        const inputEdges = edges.filter(edge => edge.id.includes("->"+key));
        const {inputNodes,  pattern, stepNodes, maxRound, runtime, nextSteps, maxCalls} = stepMetadata[key];
        const stepNodesInfo = stepNodes.map((id) => nodes.find((node) => node.id === id));
        // const passEdges = stepEdges.filter((edge) => edge.source === "step-0");
        totalMaxRound = Number(totalMaxRound) + Number(maxCalls);
        // console.log("inputEdges for ", key, inputEdges);
        // console.log("parallelSteps for ", key, parallelMap[key]);
        const parallelSteps = parallelMap[key].map((step) => step.split("-").join(""));
        console.log("parallelSteps for ", key, parallelSteps);

        // TODO: deal with total runtime here

        switch (pattern) {
            case "singleAgent":
                // handle single agent with tools or without tools
                compiledWorkflow = await compileSingleAgent(compiledWorkflow, stepNodesInfo, stepEdges, inputEdges, parallelSteps, AgentsState);
                break;
            case "reflection":
                compiledWorkflow = await compileReflection(compiledWorkflow, stepNodesInfo, stepEdges, inputEdges, parallelSteps, AgentsState, maxRound);
                break;
            case "supervision":
                compiledWorkflow = await compileSupervision(compiledWorkflow, stepNodesInfo, stepEdges, inputEdges, parallelSteps, AgentsState, maxRound);
                break;
            case "discussion":
                compiledWorkflow = await compileDiscussion(compiledWorkflow, stepNodesInfo, stepEdges, inputEdges, parallelSteps, AgentsState, maxRound);
                break;
            case "voting":
                compiledWorkflow = await compileVoting(compiledWorkflow, stepNodesInfo, stepEdges, AgentsState, maxRound);
                break;
            case "redundant":
                compiledWorkflow = await compileParallel(compiledWorkflow, stepNodesInfo, stepEdges, inputEdges, parallelSteps, AgentsState);
                break;
            default:
                compiledWorkflow = await compileSingleAgent(compiledWorkflow, stepNodesInfo, stepEdges, inputEdges, AgentsState);
                console.log("pattern not supported", pattern);
                break;
        }

        // no need to add END edge for the last step because it is already added in the patterns
    }

    console.log("stepMetadata in langgraph", stepMetadata);

    // add start step

    console.log("startStep", startStep);
    const startStepEdges = edges.filter(edge => edge.id.startsWith("step-0"));
    startStepEdges.forEach((edge) => {
        compiledWorkflow.addEdge(START, edge.target);
    });


    const compiledLanggraph = compiledWorkflow.compile();
    console.log("final Workflow after compile", compiledLanggraph);
    return {compiledLanggraph, totalMaxRound: Number(totalMaxRound)};
}


export default CompileLanggraph;