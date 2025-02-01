
import React from "react";
import "reactflow/dist/style.css";
import { useAtom, useAtomValue } from "jotai";
import {
  canvasPagesAtom,
  patternsAtom,
} from "../global/GlobalStates";
import { RfWithProvider } from "./FlowWithProvider";

const convertToReactFlowFormat = (flowWithPatterns) => {
  const nodes = flowWithPatterns.taskFlowSteps.map((step, index) => ({
    id: `step-${index}`,
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
      ? { id: `edge-${index}`, source: node.id, target: nodes[index + 1].id }
      : null
  ).filter(Boolean);
  
  return { nodes, edges };
};

const PageRfPatterns = () => {

  const [flowsWithPatterns, setFlowsWithPatterns] = useAtom(patternsAtom);
  const canvasPages = useAtomValue(canvasPagesAtom);
  const { type, configId, patternId, flowId } = canvasPages || {};
  const flowWithPatterns = flowsWithPatterns.find(pattern => pattern.patternId === patternId);
  const { nodes: initialNodes, edges: initialEdges } = convertToReactFlowFormat(flowWithPatterns);

  return (
    <RfWithProvider nodes={initialNodes} edges={initialEdges} />
  );
};

export default React.memo(PageRfPatterns); 