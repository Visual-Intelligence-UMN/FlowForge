const randomCombinePatterns = (patternsFlow, numCombinations) => {
    const {taskFlowId, taskFlowName, taskFlowDescription, taskFlowSteps, taskFlowStart} = patternsFlow;
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
            taskFlowStart: taskFlowStart,
            taskFlowSteps: taskFlowSteps.map((step) => ({
                stepId: step.stepId,
                stepName: step.stepName,
                stepLabel: step.stepLabel,
                stepDescription: step.stepDescription,
                pattern: getRandomPatterns(step.designPatterns),
                nextSteps: step.nextSteps,
            })),
        }
        patterns.push(combinedPatterns);
    }
    return patterns;
}

export default randomCombinePatterns;