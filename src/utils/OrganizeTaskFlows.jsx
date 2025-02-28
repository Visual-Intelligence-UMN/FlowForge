import GenerateTaskFlows from "./GenerateTaskFlows";

let flowCounter = 1;

function reassignFlowIds(flows) {
  return flows.map((flow) => {
    const newId = flowCounter++;
    return {
      ...flow,
      originalFlowId: flow.taskFlowId,
      taskFlowId: newId,
    };
  });
}

function mergeFlowsById(existingMap, existingIds, newFlows) {
  const updatedMap = { ...existingMap };
  let updatedIds = [...existingIds];

  for (const flow of newFlows) {
    const { taskFlowId } = flow;
    updatedMap[taskFlowId] = {
      ...updatedMap[taskFlowId],
      ...flow,
    };
    if (!updatedIds.includes(taskFlowId)) {
      updatedIds.push(taskFlowId);
    }
  }

  return { updatedMap, updatedIds };
}

const OrganizeTaskFlows = async (selectedTask, flowsMap, setFlowsMap, flowIds, setFlowIds) => {
    const newData = await GenerateTaskFlows(selectedTask);
    const incomingFlows = reassignFlowIds(newData.taskFlows);
    setFlowsMap((prevMap) => {
        const { updatedMap, updatedIds } = mergeFlowsById(prevMap, flowIds, incomingFlows);
        setFlowIds(updatedIds);
        return updatedMap;
    });
};

export default OrganizeTaskFlows;