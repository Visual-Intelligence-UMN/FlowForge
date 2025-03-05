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

    // generate the config (nodes, edges) for each step based on its pattern
    // TODO: adjust the config based on the template info
    
    for (const step of taskFlowSteps) {
        const { stepName, stepLabel, stepDescription, pattern, config, template } = step;
        // console.log("template", template);
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
