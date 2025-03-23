// Helper: determine the number of agents for a given step based on its template.
function getAgentCountForStep(step) {
    const template = step.template;
    if (!template) return 0;

    if (template.workers !== undefined) {
      return template.workers.length + (template.supervisor ? 1 : 0);
    }
    if (template.agents !== undefined) {
      const extra = (template.summary || template.aggregation) ? 1 : 0;
      return template.agents.length + extra;
    }
    if (template.evaluator && template.optimizer) {
      return 2;
    }
    if (template.persona) {
      return 1;
    }
    return 0;
}

export function getCallsCountForStep(step) {
    const template = step.template;
    const pattern = step.pattern;
    const maxRound = template?.maxRound;
    let runtime = maxRound;
    let maxCalls = 1;
    let agentCount = 0;
    switch (pattern?.name) {
        case "Reflection":
          maxCalls = maxRound * 2;
          runtime = maxRound * 2;
          agentCount = 2;
          console.log("Reflection", maxCalls, runtime, agentCount)
          break;
        case "Discussion":
          const {withSummary, agents} = template;
          maxCalls = maxRound * agents.length + (withSummary ? 1 : 0);
          runtime = maxRound * agents.length + (withSummary ? 1 : 0);
          agentCount = agents.length + (withSummary ? 1 : 0);
          break;
        case "Redundant":
          const {agents: agentsRedundant} = template;
          maxCalls = agentsRedundant.length * 1 + 1;
          runtime = 1 + 1;
          agentCount = agentsRedundant.length + 1;
          break;
        case "Supervision":
          const {workers} = template;
          maxCalls = maxRound * 2;
          runtime = maxRound * 2;
          agentCount = workers.length + 1;
          break;
        default:
          runtime = 1;
          agentCount = 1;
          maxCalls = 1;
      }
      return {maxCalls, runtime};
}
  
export function getTaskSteps(flow) {
    const stepNums = [];
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
}

export function getAgentSteps(flow) {
    const agentCounts = [];
    let currentSteps = flow.taskFlowStart.nextSteps;

    while (currentSteps && currentSteps.length > 0) {
        const uniqueSteps = [...new Set(currentSteps)];
        let levelAgentCount = 0;

        uniqueSteps.forEach(stepId => {
        const step = flow.taskFlowSteps.find(s => s.stepId === stepId);
        if (step) {
            levelAgentCount += getAgentCountForStep(step);
        }
        });
        agentCounts.push(levelAgentCount);

        const nextStepsSet = new Set();
        uniqueSteps.forEach(stepId => {
        const step = flow.taskFlowSteps.find(s => s.stepId === stepId);
        if (step && step.nextSteps && step.nextSteps.length > 0) {
            step.nextSteps.forEach(nextStep => nextStepsSet.add(nextStep));
        }
        });
        currentSteps = Array.from(nextStepsSet);
    }

    return agentCounts;
}

export function getAgentMaxCalls(flow) {
    const agentMaxCalls = [];
    let currentSteps = flow.taskFlowStart.nextSteps;

    while (currentSteps && currentSteps.length > 0) {
        const uniqueSteps = [...new Set(currentSteps)];
        let levelMaxCalls = 0;

        uniqueSteps.forEach(stepId => {
        const step = flow.taskFlowSteps.find(s => s.stepId === stepId);
        if (step) {
            const {maxCalls} = getCallsCountForStep(step);
            levelMaxCalls += maxCalls;
        }
        });
        agentMaxCalls.push(levelMaxCalls);

        const nextStepsSet = new Set();
        uniqueSteps.forEach(stepId => {
        const step = flow.taskFlowSteps.find(s => s.stepId === stepId);
        if (step && step.nextSteps && step.nextSteps.length > 0) {
            step.nextSteps.forEach(nextStep => nextStepsSet.add(nextStep));
        }
        });
        currentSteps = Array.from(nextStepsSet);
    }

    return agentMaxCalls;
}

