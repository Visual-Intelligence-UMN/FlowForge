
import React from "react";
import "reactflow/dist/style.css";
import { useAtom, useAtomValue } from "jotai";
import {
  flowsMapAtom,
  canvasPagesAtom,
} from "../global/GlobalStates";
import { RfWithProvider } from "./FlowWithProvider";

const convertToReactFlowFormat = (taskflow) => {
  const nodes = taskflow.taskFlowSteps.map((step, index) => ({
    id: `step-${index+1}`,
    type: "flowStep",
    position: { x: index * 250, y: 100 },
    data: {
      stepName: step.stepName || `Step ${index + 1}`,
      stepLabel: step.stepLabel || "",
      stepDescription: step.stepDescription || "",
      label: step.stepLabel || `Step ${index + 1}`,
      pattern: step.pattern || { name: "", description: "" },
    },
  }));
  
  const edges = nodes.map((node, index) =>
    index < nodes.length - 1
      ? { 
        id: `edge-${index}`, 
        source: node.id, 
        target: nodes[index + 1].id,
        animated: true,
      }
      : null
  ).filter(Boolean);
  
  return { nodes, edges };
};

const PageRfTaskFlow = () => {

  const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
  const canvasPages = useAtomValue(canvasPagesAtom);
  const { type, configId, patternId, flowId } = canvasPages || {};
  const taskflow = flowsMap[flowId];
  const { nodes: initialNodes, edges: initialEdges } = convertToReactFlowFormat(taskflow);
  return (
    <RfWithProvider nodes={initialNodes} edges={initialEdges} />
  );
};

export default React.memo(PageRfTaskFlow); 