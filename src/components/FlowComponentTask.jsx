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

const convertToReactFlowFormat = (taskflow) => {
        
    // console.log("taskflow to transform nodes and edges", taskflow);
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
        template: step.template || { persona: "Single Agent", goal: "Single Agent"},
        config: step.config || { type: "none", nodes: [], edges: [] },
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
    // console.log("nodes and edges after transform", nodes, edges);
    
    return { nodes, edges };
  };

export function FlowComponentTask(props) {
    // props: targetWorkflow, nodes, edges
    // targetWorkflow: {
    //      taskFlowName: "Task Flow 1",
    //      taskFlowDescription: "Task Flow 1 Description",
    //      taskFlowSteps: [
    //         {
    //             stepName: "Step 1",
    //             stepLabel: "Step 1",
    //             stepDescription: "Step 1",
    //             pattern: {},
    //             config: {},
    //             template: {},
    //         }, 
    //         ...
    //     ]
    // }

    console.log("props", props);

    const { initialNodes, initialEdges } = convertToReactFlowFormat(props.targetWorkflow);
    
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);
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
        const nextNodes = props.nodes || [];
        const nextEdges = props.edges || [];
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
      
    // Function to update the targetWorkflow in the parent component
    const updateTargetWorkflow = useCallback((updatedNodes, updatedEdges) => {
        // Convert nodes and edges back to taskFlowSteps format
        const updatedTaskFlowSteps = updatedNodes.map((node) => {
            // Find all outgoing connections for this node
            const outgoingConnections = updatedEdges
                .filter(edge => edge.source === node.id)
                .map(edge => edge.target);
                
            return {
                id: node.id,
                stepName: node.data.stepName,
                stepLabel: node.data.stepLabel,
                stepDescription: node.data.stepDescription,
                pattern: node.data.pattern || {},
                config: node.data.config || {},
                template: node.data.template || {},
                nextSteps: outgoingConnections,
            };
        });
        
        // Create the updated workflow
        const updatedWorkflow = {
            ...targetWorkflow,
            taskFlowSteps: updatedTaskFlowSteps,
        };
        
        // Update the global state
        setFlowsMap((prevFlows) => ({
            ...prevFlows,
            [Number(canvasPages.flowId)]: updatedWorkflow,
        }));
        setPatternsFlow(updatedWorkflow);
        
        // If props includes an onWorkflowUpdate callback, call it
        if (props.onWorkflowUpdate) {
            props.onWorkflowUpdate(updatedWorkflow);
        }
    }, [targetWorkflow, canvasPages.flowId, setFlowsMap, setPatternsFlow, props.onWorkflowUpdate]);

    // Enhance renumberNodes to update the targetWorkflow
    const renumberNodes = useCallback(() => {
        let updatedNodes = [];
        
        setNodes((prevNodes) => {
            // Sort nodes by their x position to maintain visual order
            const sortedNodes = [...prevNodes].sort((a, b) => a.position.x - b.position.x);
            
            updatedNodes = sortedNodes.map((node, index) => {
                const stepNumber = index + 1;
                // Only update the ID and step number references, preserve other content
                return {
                    ...node,
                    id: `step-${stepNumber}`,
                    data: {
                        ...node.data,
                        stepName: `Step ${stepNumber}`,
                        stepLabel: `Step ${stepNumber}`,
                        // Only replace the step number in the description, not the entire description
                        stepDescription: node.data.stepDescription.replace(/Step \d+/, `Step ${stepNumber}`),
                    }
                };
            });
            
            return updatedNodes;
        });
        
        // Update edges to use the new node IDs
        setEdges((prevEdges) => {
            const updatedEdges = prevEdges.map(edge => {
                // Find the nodes in the original array that match the source and target
                const sourceNodeIndex = nodes.findIndex(n => n.id === edge.source);
                const targetNodeIndex = nodes.findIndex(n => n.id === edge.target);
                
                // If we found the nodes, update the edge with the new IDs
                if (sourceNodeIndex !== -1 && targetNodeIndex !== -1) {
                    const newSourceId = `step-${sourceNodeIndex + 1}`;
                    const newTargetId = `step-${targetNodeIndex + 1}`;
                    
                    return {
                        ...edge,
                        id: `${newSourceId}->${newTargetId}`,
                        source: newSourceId,
                        target: newTargetId,
                    };
                }
                
                return edge;
            });
            
            // Update the targetWorkflow with the new nodes and edges
            setTimeout(() => updateTargetWorkflow(updatedNodes, updatedEdges), 0);
            
            return updatedEdges;
        });
    }, [nodes, setNodes, setEdges, updateTargetWorkflow]);

    // Enhance onNodesDelete to update the targetWorkflow after deletion
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
            
            // After updating edges, renumber the nodes
            setTimeout(() => renumberNodes(), 0);
        },
        [nodes, edges, renumberNodes],
    );

    // Now define addStep after updateTargetWorkflow has been defined
    const addStep = useCallback(() => {
        let newNode = null;
        let updatedNodes = [];
        
        setNodes((prevNodes) => {
            const newNodeId = `step-${prevNodes.length + 1}`;
            newNode = {
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
            
            updatedNodes = [...prevNodes, newNode];
            return updatedNodes;
        });
        
        // Add edge connecting the new node to the last node if there are existing nodes
        setEdges((prevEdges) => {
            if (nodes.length === 0) {
                // Update the targetWorkflow with just the new node
                setTimeout(() => updateTargetWorkflow(updatedNodes, prevEdges), 0);
                return prevEdges;
            }
            
            const lastNodeId = nodes[nodes.length - 1].id;
            const newNodeId = newNode.id;
            
            const newEdge = {
                id: `${lastNodeId}->${newNodeId}`,
                source: lastNodeId,
                target: newNodeId,
            };
            
            const updatedEdges = [...prevEdges, newEdge];
            
            // Update the targetWorkflow with the new nodes and edges
            setTimeout(() => updateTargetWorkflow(updatedNodes, updatedEdges), 0);
            
            return updatedEdges;
        });
    }, [nodes, setNodes, setEdges, updateTargetWorkflow]);

    const handleSave = () => {
        updateTargetWorkflow(nodes, edges);
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
            // console.log("new edges", newEdges);
            // Apply layout
            let layoutedNodes;
            let layoutedEdges;
            if (newNodes.length > 3) {
                ({ nodes: layoutedNodes, edges: layoutedEdges } = getMultiLineLayoutedNodesAndEdges(newNodes, newEdges));
            } else {
                ({ nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedNodesAndEdges(newNodes, newEdges));
            }
            // console.log("layout edges", layoutedEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }
    }, [targetWorkflow, convertTaskFlowToNodesAndEdges]);

    const updateNodeField = (nodeId, fieldName, newValue) => {
        setNodes((prevNodes) => {
            const updatedNodes = prevNodes.map((node) =>
                node.id === nodeId
                ? {
                    ...node,
                    data: {
                        ...node.data,
                        [fieldName]: newValue,
                    },
                }
                : node
            );
            
            // Update the targetWorkflow with the updated nodes
            setTimeout(() => updateTargetWorkflow(updatedNodes, edges), 0);
            
            return updatedNodes;
        });
    };
    

    const nodeListWithHandlers = nodes.map((node) => ({
        ...node,
        data: {
            ...node.data,
            updateNodeField,
        },
    }));

    // console.log("nodes", nodes);
    // console.log("edges", edges);

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