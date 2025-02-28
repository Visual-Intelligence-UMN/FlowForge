const randomCombinePatterns = (patternsFlow, numCombinations) => {
    const {taskFlowId, taskFlowName, taskFlowDescription, taskFlowSteps} = patternsFlow;
    const patterns = [];
    const getRandomPatterns = (patterns) => {
        if (patterns.length === 0) {
            return {name: "Single Agent", description: "This design pattern has a single agent to perform the task."};
        } else {
            const randomIdx = Math.floor(Math.random() * patterns.length);
            return patterns[randomIdx];
        }
    }
    for (let i = 0; i < numCombinations; i++) {
        const combinedPatterns = {
            taskFlowId: taskFlowId,
            taskFlowName: taskFlowName,
            taskFlowDescription: taskFlowDescription,
            patternsId: taskFlowId + i,
            taskFlowSteps: taskFlowSteps.map((step) => ({
                stepName: step.stepName,
                stepLabel: step.stepLabel,
                stepDescription: step.stepDescription,
                pattern: getRandomPatterns(step.designPatterns),
            })),
        }
        patterns.push(combinedPatterns);
    }
    return patterns;
}

export default randomCombinePatterns;