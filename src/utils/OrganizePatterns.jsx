import GeneratePatterns from "./GeneratePatterns";
import randomCombinePatterns from "./CombinePatterns";
import { designPatternsTemplate } from "../patterns/patternsData";
import GenerateTemplatesInfo from "./GenerateTemplates";
import sampleTaskFlowsReview from "../data/sample-taskflows-review.json";
import sampleTaskFlowsVis from "../data/sample-taskflows-vis.json";
const flowIdToPatternCounter = {};
// reassign pattern IDs for patterns of a specific flow
function reassignPatternIds(flowId, designPatterns, patterns) {
  console.log("reassignPatternIds", flowId);
  flowIdToPatternCounter[flowId] = designPatterns.filter(p => p.taskFlowId.toString().startsWith(flowId)).length + 1;
  // flowIdToPatternCounter[flowId] = 1;
  return patterns.map((pattern) => {
    const nextCount = flowIdToPatternCounter[flowId]++;
    return {
      ...pattern,
      taskFlowId: `${flowId}-${nextCount}`,
      patternId: `${flowId}-${nextCount}`,
    };
  });
}

const OrganizePatterns = async (flow, designPatterns, setDesignPatterns, runRealtime, selectedTask) => {
  // console.log("flow to organize patterns", flow);
  // TODO: remove the hardcoded patterns
  let exampleFlowsWithPatterns;
  if (!runRealtime) {
    const flowId = flow.taskFlowId;
    console.log("flowId", flowId);
    console.log("selectedTask", selectedTask);
    if (selectedTask.name.includes("Review a Paper")) {
      exampleFlowsWithPatterns = sampleTaskFlowsReview
      .flowsWithPatterns.filter(f => f.taskFlowId.toString().startsWith(flowId));
    } else if (selectedTask.name.includes("Visualization")) {
      exampleFlowsWithPatterns = sampleTaskFlowsVis
      .flowsWithPatterns.filter(f => f.taskFlowId.toString().startsWith(flowId));
    }
    // exampleFlowsWithPatterns = [
    //   {
    //     taskId: flow.taskFlowId,
    //     taskFlowId: flow.taskFlowId + "-1",
    //     taskFlowName: flow.taskFlowName,
    //     patternId: flow.patternId,
    //     taskFlowDescription: flow.taskFlowDescription,
    //     taskFlowSteps: flow.taskFlowSteps,
    //     taskFlowStart: flow.taskFlowStart,
    //   },
    //   {
    //     taskId: flow.taskFlowId,
    //     taskFlowId: flow.taskFlowId + "-2",
    //     taskFlowName: flow.taskFlowName,
    //     patternId: flow.patternId,
    //     taskFlowDescription: flow.taskFlowDescription,
    //     taskFlowSteps: flow.taskFlowSteps,
    //     taskFlowStart: flow.taskFlowStart,
    //   },
    // ];
  } else {
    const flowWithPatterns = await GeneratePatterns(flow);
    exampleFlowsWithPatterns = randomCombinePatterns(flowWithPatterns, 2);
  }

  console.log("generated flow with patterns", exampleFlowsWithPatterns);

  let exampleFlowsWithTemplates;
  if (!runRealtime) {
    exampleFlowsWithTemplates = exampleFlowsWithPatterns;
    // exampleFlowsWithTemplates = await Promise.all(
    //   exampleFlowsWithPatterns.map(async (flow) => {
    //     flow.taskFlowSteps.forEach((step) => {
    //       const templatesInfo = designPatternsTemplate[step.pattern.name];
    //       step.template = templatesInfo;
    //     });
    //     return flow;
    //   })
    // );
  } else {
    exampleFlowsWithTemplates = await Promise.all(
      exampleFlowsWithPatterns.map(async (flow) => {
        const templatesInfo = await GenerateTemplatesInfo(flow);
        return {
          ...flow,
          taskFlowSteps: templatesInfo,
        };
      })
    );
  }

  console.log("generated flows with templates", exampleFlowsWithTemplates);
  const reassignedPatterns = reassignPatternIds(
    flow.taskFlowId,
    designPatterns,
    exampleFlowsWithTemplates
  );
  console.log("reassigned patterns", reassignedPatterns);

  // Store generated workflow with patterns
  setDesignPatterns((previousPatterns) => {
    console.log("previousPatterns", previousPatterns);
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
  // console.log("updatedPatterns all", updatedPatterns);
};

export default OrganizePatterns;
