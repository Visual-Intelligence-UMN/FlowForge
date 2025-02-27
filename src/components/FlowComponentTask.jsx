import ReactFlow, {
    addEdge,
    useNodesState,
    useEdgesState,
    useReactFlow,
    getIncomers,
    getOutgoers,
    getConnectedEdges,
    Controls,
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

    console.log("props", props);


    const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges || []);
    // console.log("nodes", nodes);
    // console.log("edges", edges);

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
    // const onConnect = useCallback(
    //     (params) => setEdges(addEdge(params, edges)),
    //     [edges],
    //   );

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
      
    const addStep = useCallback(() => {
        setNodes((prevNodes) => {
            const newNodeId = `step-${prevNodes.length + 1}`;
            const newNode = {
                id: newNodeId,
                type: "flowStep",
                position: {
                    x: prevNodes.length * 200,
                    y: prevNodes.length * 100,
                },
                data: {
                    stepName: `Step ${prevNodes.length + 1}`,
                    stepLabel: `Step ${prevNodes.length + 1}`,
                    stepDescription: `Step ${prevNodes.length + 1}`,
                    pattern: {},
                    config: {},
                    template: {},
                },
            };
            
            return [...prevNodes, newNode];
        });
        
        // Add edge connecting the new node to the last node if there are existing nodes
        setEdges((prevEdges) => {
            if (nodes.length === 0) return prevEdges;
            
            const lastNodeId = nodes[nodes.length - 1].id;
            const newNodeId = `step-${nodes.length + 1}`;
            
            const newEdge = {
                id: `${lastNodeId}->${newNodeId}`,
                source: lastNodeId,
                target: newNodeId,
            };
            
            return [...prevEdges, newEdge];
        });
    }, [nodes, setNodes, setEdges]);

    const onNodesDelete = useCallback(
        (deleted) => {
          setEdges(
            deleted.reduce((acc, node) => {
              const incomers = getIncomers(node, nodes, edges);
              const outgoers = getOutgoers(node, nodes, edges);
              const connectedEdges = getConnectedEdges([node], edges);
     
              const remainingEdges = acc.filter(
                (edge) => !connectedEdges.includes(edge),
              );
     
              const createdEdges = incomers.flatMap(({ id: source }) =>
                outgoers.map(({ id: target }) => ({
                  id: `${source}->${target}`,
                  source,
                  target,
                })),
              );
     
              return [...remainingEdges, ...createdEdges];
            }, edges),
          );
        },
        [nodes, edges],
      );
     

    const handleSave = () => {
        const updatedTaskFlowSteps = nodes.map((node) => {
            // Find all outgoing connections for this node
            const outgoingConnections = edges
                .filter(edge => edge.source === node.id)
                .map(edge => edge.target);
                
            return {
                id: node.id, // Store the node ID to maintain connections
                stepName: node.data.stepName,
                stepLabel: node.data.stepLabel,
                stepDescription: node.data.stepDescription,
                pattern: node.data.pattern || {},
                config: node.data.config || {},
                template: node.data.template || {},
                nextSteps: outgoingConnections, // Store connections
            };
        });
        
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
    
    const convertTaskFlowToNodesAndEdges = useCallback((taskFlow) => {
        if (!taskFlow || !taskFlow.taskFlowSteps) return { nodes: [], edges: [] };
        
        const newNodes = taskFlow.taskFlowSteps.map((step, index) => ({
            id: step.id || `step-${index + 1}`,
            type: "flowStep",
            position: { x: 0, y: 0 }, // Will be laid out by dagre
            data: {
                stepName: step.stepName,
                stepLabel: step.stepLabel,
                stepDescription: step.stepDescription,
                pattern: step.pattern || {},
                config: step.config || {},
                template: step.template || {},
            },
        }));
        
        const newEdges = nodes.map((node, index) =>
            index < nodes.length - 1
              ? { 
                id: `edge-${index}`, 
                source: node.id, 
                target: nodes[index + 1].id,
                animated: true,
              }
              : null
          ).filter(Boolean);
        
        
        return { nodes: newNodes, edges: newEdges };
    }, []);
    
    useEffect(() => {
        if (targetWorkflow && targetWorkflow.taskFlowSteps) {
            const { nodes: newNodes, edges: newEdges } = convertTaskFlowToNodesAndEdges(targetWorkflow);
            console.log("new edges", newEdges);
            // Apply layout
            let layoutedNodes;
            let layoutedEdges;
            if (newNodes.length > 3) {
                ({ nodes: layoutedNodes, edges: layoutedEdges } = getMultiLineLayoutedNodesAndEdges(newNodes, newEdges));
            } else {
                ({ nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedNodesAndEdges(newNodes, newEdges));
            }
            console.log("layout edges", layoutedEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }
    }, [targetWorkflow, convertTaskFlowToNodesAndEdges]);

    const updateNodeField = (nodeId, fieldName, newValue) => {
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    // If it's a direct property (e.g. "stepName"):
                    [fieldName]: newValue,
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

    // console.log("nodes", nodes);
    console.log("edges", edges);

    return (
        <div className="reactflow-wrapper"
        style={{width: "1400px", height: "800px", 
        border: "1px solid #ddd",
        position: "relative",
        }}>


        <Button onClick={addStep}>Add Step</Button>

        <ReactFlow
         key={`${canvasPages.type}-${canvasPages.flowId || ''}-${canvasPages.patternId || ''}-${canvasPages.configId || ''}`}
         nodes={nodeListWithHandlers}
         edges={edges}
         nodeTypes={nodeTypes}
         onNodesChange={onNodesChange}
         onEdgesChange={onEdgesChange}
         onConnect={onConnect}
         onNodesDelete={onNodesDelete}
         fitView = {true}

         >
         <Controls />
         </ReactFlow>

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