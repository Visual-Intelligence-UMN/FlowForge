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
    patternsAtom,
  } from "../global/GlobalStates";
import { getMultiLineLayoutedNodesAndEdges , getLayoutedNodesAndEdges} from '../utils/dagreUtils';
import { nodeTypes } from "../nodes";
import Button from '@mui/material/Button';

import  set  from "lodash.set";

export function FlowComponentTask(props) {


    const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges || []);
    console.log("nodes", nodes);
    console.log("edges", edges);

    const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
    const [designPatterns, setDesignPatterns] = useAtom(patternsAtom);
    const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
    const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);

    
    const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);


    const targetWorkflow = props.targetWorkflow;

    const onConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    useEffect(() => {
        // To make sure the layout is always after the nodes and edges are set
        // 1) Set new nodes/edges from props
        const nextNodes = props.nodes || [];
        const nextEdges = props.edges || [];
        // setNodes(nextNodes);
        // setEdges(nextEdges);

        // 2) Immediately lay them out
        let layoutedNodes;
        let layoutedEdges;
        if (nextNodes.length > 3) {
            ({ nodes: layoutedNodes, edges: layoutedEdges } = getMultiLineLayoutedNodesAndEdges(nextNodes, nextEdges));
        } else {
            ({ nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedNodesAndEdges(nextNodes, nextEdges));
        }
       
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

      }, [targetWorkflow, canvasPages.type, props.nodes, props.edges]);
      

    const handleSave = () => {
        const updatedTaskFlowSteps = nodes.map((node) => ({
            stepName: node.data.stepName,
            stepLabel: node.data.stepLabel,
            stepDescription: node.data.stepDescription,
            pattern: node.data.pattern,
            config: node.data.config,
            template: node.data.template,
        }));
        const updatedTaskflow = {
            ...targetWorkflow,
            taskFlowSteps: updatedTaskFlowSteps,
        };

        setFlowsMap((prevFlows) => ({
            ...prevFlows,
            [Number(canvasPages.flowId)]: updatedTaskflow,
        }));
        setPatternsFlow(updatedTaskflow);
        setPatternsGenerate(0);
    }; 

    const updateNodeField = (nodeId, fieldName, newValue) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            // Update pattern fields
                            pattern: fieldName.startsWith("pattern.")
                                ? {
                                    ...node.data.pattern,
                                    [fieldName.split(".")[1]]: newValue, 
                                  }
                                : node.data.pattern,
    
                            config: fieldName.startsWith("config.")
                                ? {
                                    ...node.data.config,
                                    [fieldName.split(".")[1]]: newValue, 
                                  }
                                : node.data.config,

                            ...(fieldName.startsWith("pattern.") || fieldName.startsWith("config.")
                                ? {}
                                : { [fieldName]: newValue }),
                        },
                    }
                    : node
            )
        );
    };

    const updateNodeFieldset = (nodeId, fieldName, newValue) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) => {
                if (node.id !== nodeId) return node;
                const newData = { ...node.data };
                set(newData, fieldName, newValue); 
                return { ...node, data: newData };
            })
        );
    };
    

    const nodeListWithHandlers = nodes.map((node) => ({
        ...node,
        data: {
            ...node.data,
            updateNodeFieldset,
            updateNodeField,
        },
    }));

    return (
        <div className="reactflow-wrapper"
        style={{width: "1400px", height: "800px", 
        border: "1px solid #ddd",
        position: "relative",
        }}>
        <ReactFlow
         key={`${canvasPages.type}-${canvasPages.flowId || ''}-${canvasPages.patternId || ''}-${canvasPages.configId || ''}`}
         nodes={nodeListWithHandlers}
         edges={edges}
         nodeTypes={nodeTypes}
         onNodesChange={onNodesChange}
         onEdgesChange={onEdgesChange}
         onConnect={onConnect}
         fitView = {true}
         ></ReactFlow>

         <Button 
         size="large"
         onClick={(e) => {
            e.stopPropagation();
            handleSave();
         }}
         sx={{ 
            position: "absolute",     
            left: "50%",           
            transform: "translateX(-50%)", 
            textTransform: "none",
            pt: 3,
            }}
         >CONTINUE</Button>
         </div>
    )
}