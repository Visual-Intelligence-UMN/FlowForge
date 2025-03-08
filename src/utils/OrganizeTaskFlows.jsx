import GenerateTaskFlows from "./GenerateTaskFlows";


function reassignFlowIds(flows, flowsCounter, flowCounter, setFlowCounter) {

  return flows.map((flow) => {
    const newId = flowCounter++;
    setFlowCounter(flowCounter);
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


const OrganizeTaskFlows = async (
  selectedTask,
  setFlowsMap,
  flowIds,
  setFlowIds,
  flowsCounter,
  flowCounter,
  setFlowCounter
) => {
  const newData = await GenerateTaskFlows(selectedTask);
  const incomingFlows = reassignFlowIds(newData.taskFlows, flowsCounter, flowCounter, setFlowCounter);

  setFlowsMap((prevMap) => {
    const { updatedMap, updatedIds } = mergeFlowsById(
      prevMap,
      flowIds,
      incomingFlows
    );
    setFlowIds(updatedIds);
    return updatedMap;
  });

};

export default OrganizeTaskFlows;
