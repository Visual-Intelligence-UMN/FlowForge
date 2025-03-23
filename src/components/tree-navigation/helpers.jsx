export function getTaskSteps(flow) {
    const stepNums = [];
  // Start from the initial nextSteps defined in taskFlowStart
  let currentSteps = flow.taskFlowStart.nextSteps;

  while (currentSteps && currentSteps.length > 0) {
    const uniqueSteps = [...new Set(currentSteps)];
    stepNums.push(uniqueSteps.length);
    const nextStepsSet = new Set();
    uniqueSteps.forEach(stepId => {
      const step = flow.taskFlowSteps.find(s => s.stepId === stepId);
      if (step && step.nextSteps && step.nextSteps.length > 0) {
        step.nextSteps.forEach(nextStep => nextStepsSet.add(nextStep));
      }
    });
    currentSteps = Array.from(nextStepsSet);
  }

  return stepNums;
  // return Object.keys(flow.taskFlowSteps).map(_ => Math.random() < 0.5 ? 1 : 2)
}