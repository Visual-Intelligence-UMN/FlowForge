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
    agentsConfigAtom,
    agentsConfigPatternAtom,
    agentsConfigGenerateAtom,
    compiledConfigsAtom,
    compliedGenerateAtom,
    selectedConfigAtom
  } from "../global/GlobalStates";
import isEqual from "lodash/isEqual";
import { getMultiLineLayoutedNodesAndEdges , getLayoutedNodesAndEdges} from '../utils/dagreUtils';
import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";
import { Box, Typography } from "@mui/material";
import Button from '@mui/material/Button';
export function RflowComponent(props) {

    const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges || []);

    const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
    const [designPatterns, setDesignPatterns] = useAtom(patternsAtom);
    const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
    const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
    const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
    const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(agentsConfigGenerateAtom);
    const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(agentsConfigPatternAtom);
    const [compiledConfigs, setCompiledConfigs] = useAtom(compiledConfigsAtom);
    const [compliedGenerate, setCompliedGenerate] = useAtom(compliedGenerateAtom);
    const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
    const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);
    const {flowId, patternId, configId } = canvasPages || {};

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
            ({ nodes: layoutedNodes, edges: layoutedEdges } = getMultiLineLayoutedNodesAndEdges(nextNodes, nextEdges));
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
        }));
        const updatedTaskflow = {
            ...targetWorkflow,
            taskFlowSteps: updatedTaskFlowSteps,
        };

        // console.log("change handleSave", updatedTaskflow);
        switch (canvasPages.type) {
            case "flow":
                setFlowsMap((prevFlows) => ({
                    ...prevFlows,
                    [Number(canvasPages.flowId)]: updatedTaskflow,
                }));
                    setPatternsFlow(updatedTaskflow);
                    setPatternsGenerate(0);
                    break;
    
                case "pattern":
                    setDesignPatterns(prevPatterns => prevPatterns.map(pattern =>
                        pattern.patternId === canvasPages.patternId ? updatedTaskflow : pattern
                    ));
                    setAgentsConfigPattern(updatedTaskflow);
                    setAgentsConfigGenerate(0);
                    break;
    
                case "config":
                    setAgentsConfig(prevConfigs => prevConfigs.map(config =>
                        config.configId === canvasPages.configId ? updatedTaskflow : config
                    ));
                    setSelectedConfig(updatedTaskflow);
                    setCompliedGenerate(0);
                    break;
    
                case "compiled":
                    setCompiledConfigs(prevConfigs => prevConfigs.map(config =>
                        config.configId === canvasPages.configId ? updatedTaskflow : config
                    ));
                    // setCompliedGenerate(0);
                    break;
    
                default:
                    console.warn("Unknown type:", canvasPages.type);
            }
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
    

    const nodeListWithHandlers = nodes.map((node) => ({
        ...node,
        data: {
            ...node.data,
            updateNodeField,
        },
    }));

    return (
        <div className="reactflow-wrapper"style={{width: "1000px", height: "800px", border: "1px solid #ddd"}}>
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
         size="small"
         onClick={(e) => {
            e.stopPropagation();
            handleSave();
         }}
         sx={{ textTransform: "none", pt: 2 }}
         >Continue</Button>
         </div>
    )
}