import { handlersMap } from "./handlers";

const GenerateRunnableConfig = async (workflow) => {
    const { taskId, taskFlowId, taskFlowName, taskFlowDescription, taskFlowSteps, patternId } = workflow;
    const agentsConfigs = [];
    const agentsConfig = {
        taskId,
        taskFlowId,
        taskFlowName,
        taskFlowDescription,
        taskFlowSteps: [],
        patternId,
    };
    // runtime, maxround can also dealt in compile langgraph
    for (const step of taskFlowSteps) {
        const { stepName, stepLabel, stepDescription, pattern, config, template } = step;
        if (handlersMap[pattern.name]) {
            let newConfig = handlersMap[pattern.name](step);
           
            const { maxRound, type, nodes } = newConfig;
            let runtime = maxRound;
            switch (type) {
                case "reflection":
                    runtime = `${maxRound} * 2`;
                    break;
                case "discussion":
                    runtime = `${maxRound} * ${nodes.length}`;
                    break;
                case "parallel":
                    runtime = `1`;
                    break;
                case "voting":
                    runtime = `${maxRound} * ${nodes.length} + 1`;
                    break;
                case "supervision":
                    runtime = `${maxRound} * 2`;
                    break;
                default:
                    runtime = `${maxRound} * ${nodes.length}`;
            }
            newConfig.runtime = runtime;
            agentsConfig.taskFlowSteps.push({
                stepName,
                stepLabel,
                stepDescription,
                pattern,
                config: newConfig,
                template
            });
        } else {
            console.warn(`Unknown pattern: ${pattern.name}`);
        }
    }
    agentsConfigs.push(agentsConfig);
    return agentsConfigs;
};

export default GenerateRunnableConfig;
