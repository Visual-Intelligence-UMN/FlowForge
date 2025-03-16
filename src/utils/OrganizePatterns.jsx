import GeneratePatterns from "./GeneratePatterns";
import randomCombinePatterns from "./CombinePatterns";
import { designPatternsTemplate } from "../patterns/patternsData";
import GenerateTemplatesInfo from "./GenerateTemplates";

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
  
const OrganizePatterns = async (flow, setDesignPatterns, runRealtime) => {
  // console.log("flow to organize patterns", flow);
    // TODO: remove the hardcoded patterns
    let exampleFlowsWithPatterns;
    if (!runRealtime) {
      exampleFlowsWithPatterns = [
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
    } else {
      const flowWithPatterns = await GeneratePatterns(flow);
      exampleFlowsWithPatterns = randomCombinePatterns(flowWithPatterns, 2);
    }

    console.log("generated flow with patterns", exampleFlowsWithPatterns);

    let exampleFlowsWithTemplates;
    if (!runRealtime) {
      exampleFlowsWithTemplates = await Promise.all(exampleFlowsWithPatterns.map(async (flow) => {
        flow.taskFlowSteps.forEach((step) => {
          const templatesInfo = designPatternsTemplate[step.pattern.name];
          step.template = templatesInfo;
        });
        return flow;
      }));
    } else {
      // TODO: remove the below comment for production
      exampleFlowsWithTemplates = await Promise.all(exampleFlowsWithPatterns.map(async (flow) => {
        const templatesInfo = await GenerateTemplatesInfo(flow);
        return {
          ...flow,
          taskFlowSteps: templatesInfo,
        }
      }));
    }

    console.log("generated flows with templates", exampleFlowsWithTemplates);
    const reassignedPatterns = reassignPatternIds(flow.taskFlowId, exampleFlowsWithTemplates);

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
