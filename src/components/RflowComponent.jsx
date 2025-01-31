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
import { getMultiLineLayoutedNodesAndEdges } from '../utils/dagreUtils';
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
            ...taskflow,
            taskFlowSteps: updatedTaskFlowSteps,
        };
        if (!isEqual(taskflow, updatedTaskflow)) {
            setFlowsMap((prevFlows) => ({
                ...prevFlows,
                [flowId]: updatedTaskflow,
            }));
        }
        console.log("updatedTaskflow", updatedTaskflow);
        setPatternsFlow({...updatedTaskflow});
        setPatternsGenerate(0);
    };

    useEffect(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getMultiLineLayoutedNodesAndEdges(
          nodes,
          edges
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        // layout only once 
    }, []);

    const updateNodeField = (nodeId, fieldName, newValue) => {
        setNodes((prevNodes) =>
        prevNodes.map((node) =>
            node.id === nodeId
            ? {
                ...node,
                data: {
                    ...node.data,
                    [fieldName]: newValue, // dynamic field
                },
                }
            : node
        )
        );
    };

    const nodeListWithHandlers = nodes.map((node) => ({
        ...node,
        data: {
            ...node.data,
            updateNodeField,
        },
    }));

    return (
        <div className="reactflow-wrapper"style={{width: "800px", height: "800px", border: "1px solid #ddd"}}>
        <ReactFlow
         nodes={nodeListWithHandlers}
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