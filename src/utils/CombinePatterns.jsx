const randomCombinePatterns = (patternsFlow, numCombinations) => {
    const { taskFlowId, taskFlowName, taskFlowDescription, taskFlowSteps, taskFlowStart } = patternsFlow;
    const patterns = [];
    const isSingleStep = taskFlowSteps.length === 1;

    const getRandomPattern = (designPatterns, idx, isSingleStep) => {
        if (designPatterns.length === 0) {
            return { 
                name: "Single Agent", 
                description: "This design pattern has a single agent to perform the task." 
            };
        } else if (isSingleStep && designPatterns.length === 2) {
            return designPatterns[idx % designPatterns.length];
        } else {
            const randomIdx = Math.floor(Math.random() * designPatterns.length);
            return designPatterns[randomIdx];
        }
    };

    for (let i = 0; i < numCombinations; i++) {
        console.log("designPatterns for step0", taskFlowSteps[0].designPatterns);
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
                pattern: step.designPatterns[i],
                // pattern: getRandomPattern(step.designPatterns, i, isSingleStep),
                nextSteps: step.nextSteps,
            })),
        };
        patterns.push(combinedPatterns);
    }
    return patterns;
};

export default randomCombinePatterns;
