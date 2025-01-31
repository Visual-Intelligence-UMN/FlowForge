import ReactFlow, {
    addEdge,
    useNodesState,
    useEdgesState,
    useReactFlow,
  } from "reactflow";
import { useCallback, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
    flowsMapAtom,
    canvasPagesAtom,
    patternsFlowAtom,
    patternsGenerateAtom,
  } from "../global/GlobalStates";
import isEqual from "lodash/isEqual";

import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";

export function RflowComponent(props) {

    const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges || []);

    const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
    const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
    const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
    const canvasPages = useAtomValue(canvasPagesAtom);

    const {flowId } = canvasPages || {};
    const taskflow = flowsMap[flowId];

    const onConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    useEffect(() => {
        setNodes(props.nodes || []);
        setEdges(props.edges || []);
    }, [taskflow]);

    const handleSave = () => {
        const updatedTaskFlowSteps = nodes.map((node) => ({
          stepName: node.data.stepName,
          stepLabel: node.data.stepLabel,
          stepDescription: node.data.stepDescription,
          pattern: node.data.pattern,
        }));

        const updatedTaskflow = {
            ...props.taskflow,
            taskFlowSteps: updatedTaskFlowSteps,
        };
        if (!isEqual(props.taskflow, updatedTaskflow)) {
            setFlowsMap((prevFlows) => ({
                ...prevFlows,
                [flowId]: updatedTaskflow,
            }));
        }
        setPatternsFlow({...updatedTaskflow});
        setPatternsGenerate(0);
    };

    


    return (
        <div className="reactflow-wrapper"style={{width: "800px", height: "800px", border: "1px solid #ddd"}}>
        <ReactFlow
         nodes={nodes}
         edges={edges}
         nodeTypes={nodeTypes}
         onNodesChange={onNodesChange}
         onEdgesChange={onEdgesChange}
         onConnect={onConnect}
         fitView
         ></ReactFlow>
         <button onClick={handleSave}>Save</button>
         </div>
    )
}