import { handlersMap } from "../langgraph/handlers";

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
    
    for (const step of taskFlowSteps) {
        const { stepName, stepLabel, stepDescription, pattern } = step;
        
        if (handlersMap[pattern.name]) {
            const config = handlersMap[pattern.name](step);
            agentsConfig.taskFlowSteps.push({
                stepName,
                stepLabel,
                stepDescription,
                pattern,
                config
            });
        } else {
            console.warn(`Unknown pattern: ${pattern.name}`);
        }
    }
    agentsConfigs.push(agentsConfig);
    return agentsConfigs;
};

export default GenerateRunnableConfig;
