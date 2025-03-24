import { handlersMap } from "./handlers";

const GenerateRunnableConfig = async (workflow, runRealtime) => {
    const { taskId, taskFlowId, taskFlowName, taskFlowDescription, taskFlowSteps, taskFlowStart, patternId } = workflow;
    const agentsConfigs = [];
    const agentsConfig = {
        taskId,
        taskFlowId,
        taskFlowName,
        taskFlowDescription,
        taskFlowSteps: [],
        patternId,
        taskFlowStart,
    };
    // runtime, maxround can also dealt in compile langgraph
    for (const step of taskFlowSteps) {
        console.log("step in generate config", step);
        const { stepId, stepName, stepLabel, stepDescription, pattern, config, template, nextSteps } = step;
        let newConfig = {};
        if (handlersMap[pattern.name]) {
            newConfig = handlersMap[pattern.name](step);
        
            const { maxRound, type, nodes } = newConfig;
            let runtime = maxRound;
            let maxCalls = 1;
            switch (type) {
                case "reflection":
                    runtime = maxRound * 2;
                    maxCalls = runtime;
                    break;
                case "discussion":
                    runtime = maxRound * nodes.length;
                    maxCalls = runtime;
                    break;
                case "redundant":
                    runtime = 1;
                    maxCalls = nodes.length;
                    break;
                case "voting":
                    runtime = maxRound * nodes.length + 1;
                    maxCalls = runtime;
                    break;
                case "supervision":
                    runtime = maxRound * 2;
                    maxCalls = runtime;
                    break;
                default:
                    runtime = maxRound * nodes.length;
                    maxCalls = runtime;
            }
            newConfig.runtime = runtime;
            newConfig.maxCalls = maxCalls;
            
            agentsConfig.taskFlowSteps.push({
                stepId,
                stepName,
                stepLabel,
                stepDescription,
                pattern,
                config: newConfig,
                template,
                nextSteps,
            });
        } else {
            console.warn(`Unknown pattern: ${pattern.name}`);
        }
    }
    agentsConfigs.push(agentsConfig);
    return agentsConfigs;
};

export default GenerateRunnableConfig;
