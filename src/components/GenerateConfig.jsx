import { handleSingleAgentWithWebSearchTool, handleSingleAgentWithPDFLoaderTool, handleReflection, handleSupervision, handleDiscussion, handleSingleAgent } from "../langgraph/handlers";

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

    const handlersMap = {
        "Single Agent with Web Search Tool": handleSingleAgentWithWebSearchTool,
        "Single Agent with PDF Loader Tool": handleSingleAgentWithPDFLoaderTool,
        "Reflection": handleReflection,
        "Supervision": handleSupervision,
        "Discussion": handleDiscussion,
        "Single Agent": handleSingleAgent,
    };

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
