import GeneratePatterns from "./GeneratePatterns";
import randomCombinePatterns from "./CombinePatterns";
import { designPatternsTemplate } from "../pattern/patternsData";

const flowIdToPatternCounter = {};
// reassign pattern IDs for patterns of a specific flow
function reassignPatternIds(flowId, patterns) {
    if (!flowIdToPatternCounter[flowId]) {
      flowIdToPatternCounter[flowId] = 1;
    }
  
    return patterns.map((pattern) => {
      const nextCount = flowIdToPatternCounter[flowId]++;
      return {
        ...pattern,
        patternId: `${flowId}-${nextCount}`,
      };
    });
  }
  
const OrganizePatterns = async (flow, setDesignPatterns) => {
    // TODO: remove the hardcoded patterns
    // const patterns = await GeneratePatterns(flow);
    // const examplePatterns = randomCombinePatterns(flow, 2);

    const examplePatterns = [
        {
          taskId: flow.taskFlowId,
          taskFlowId: flow.taskFlowId + "1",
          taskFlowName: flow.taskFlowName,
          patternId: flow.taskFlowId + "-A", 
          taskFlowDescription: flow.taskFlowDescription,
          taskFlowSteps: flow.taskFlowSteps,
        },
        {
          taskId: flow.taskFlowId,
          taskFlowId: flow.taskFlowId + "2",
          taskFlowName: flow.taskFlowName,
          patternId: flow.taskFlowId + "-B", 
          taskFlowDescription: flow.taskFlowDescription,
          taskFlowSteps: flow.taskFlowSteps,
        },
      ];
    const examplePatternswithTemplates = examplePatterns.map((flow) => {
        return {
            ...flow,
            taskFlowSteps: flow.taskFlowSteps.map((step) => {
                return {
                    ...step,
                    template: designPatternsTemplate[step.pattern.name] || {},
                }
            }),
        }
    });
    const reassignedPatterns = reassignPatternIds(flow.taskFlowId, examplePatternswithTemplates);

    // Store generated workflow with patterns
    setDesignPatterns((previousPatterns) => {
        const updatedPatterns = [];
        let replaced = false;
  
        for (const pattern of previousPatterns) {
          if (pattern.taskFlowId === flow.taskFlowId && !replaced) {
            updatedPatterns.push(...reassignedPatterns);
            replaced = true;
          } else {
            updatedPatterns.push(pattern);
          }
        }
  
        if (!replaced) {
          updatedPatterns.push(...reassignedPatterns);
        }
  
        return updatedPatterns;
      });
}

export default OrganizePatterns;
