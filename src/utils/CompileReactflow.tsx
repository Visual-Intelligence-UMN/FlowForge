
import { AppNode } from "../components/nodes/types";
import { Edge } from "@xyflow/react";
const CompileReactflow = async (FlowWithConfig) => {
    const { taskFlowSteps, taskFlowStart, configId } = FlowWithConfig;
    // const configId = [taskId, taskFlowId, patternId].join("_");

    // console.log("config to compile for reactflow", FlowWithConfig);

    const reactflowNodes: AppNode[] = [];
    const reactflowEdges: Edge[] = [];
    let stepMetadata = {}; //  Stores input node, output nodes, and output mode for each step

    let positionX = 0;
    let positionY = 0;
    // iterate over each step
    let stepGroupNodes = [];
    taskFlowSteps.forEach((step, stepIdx) => {
        // // console.log("step", step);

        stepIdx += 1;
        const { config, nextSteps, stepId } = step;
        if (!config) return;

        const { nodes, edges, type, maxRound, runtime, maxCalls } = config;
        const pattern = type;
        let stepNodeIds = [];
        let firstNodeIds = [];
        let outputNodeIds = [];
       
        let outputMode = "direct"; // from this step to next step, may not be used
        let nodeMap = new Map(); // Stores node → full IDs
        // add all nodes within this step

        const stepGroup = {
            id: `step-${stepIdx}`,
            data: {label: `Step ${stepIdx}`},
            position: {x: positionX, y: positionY},
            style: {width: 500, height: 500},
            type: "group",
            maxRound: maxRound,
        }
        reactflowNodes.push(stepGroup);
        stepGroupNodes.push(stepGroup); // for subgraph nodes no edges between 

        if (nodes?.length > 0) {
            nodes.forEach((node) => {
                const id = `step-${stepIdx}-node-${node.description}`;
                const type = node.type || "default";
                const position = { x: positionX, y: positionY };
                const data = {
                    label: node.description,
                    tools: node.tools || [],
                    llm: node.llm || "gpt-4o",
                    systemPrompt: node.systemPrompt || "",
                    maxRound: maxRound,
                    pattern: pattern+"-"+node.description,
                };
                const parentId = `step-${stepIdx}`;
                const extent = "parent";

                positionX += 400;
                positionY += 500;

                reactflowNodes.push({ id, type, position, data, parentId, extent});
                stepNodeIds.push(id);
                nodeMap.set(node.description, id);

                if (!firstNodeIds.length) {
                    firstNodeIds.push(id);
                }
            });
        }

        // identify input & output nodes in one step
        if (stepNodeIds.length === 1) {
            firstNodeIds.push(stepNodeIds[0]);
            outputNodeIds.push(stepNodeIds[0]);
        } else {
            edges?.forEach((edge) => {
                if (edge.source === "START") {
                    firstNodeIds.push(nodeMap.get(edge.target) || findNodeId(edge.target, reactflowNodes, stepIdx));
                }
                if (edge.target === "__end__") {
                    outputNodeIds.push(nodeMap.get(edge.source) || findNodeId(edge.source, reactflowNodes, stepIdx));
                    outputMode = edge.type || "default"; // Capture output mode
                    // TODO: change the edge types 

                }
            });
        }

        //  no need to set input node to "START", langgraph will handle it
        // if (stepIdx === 0) {
        //     firstNodeId = "START";
        // }
        if (stepIdx === taskFlowSteps.length) {
            outputNodeIds.push("END");
        }

        // store step metadata for langgraph
        stepMetadata[`step-${stepIdx}`] = {
            inputNodes: Array.from(new Set(firstNodeIds)),
            outputNodes: Array.from(new Set(outputNodeIds)),
            outputMode: outputMode,
            pattern: pattern,
            maxRound: maxRound,
            maxCalls: maxCalls,
            runtime: runtime,
            stepNodes: Array.from(nodeMap.values()), 
            nextSteps: nextSteps,
        };

        // process intra-step edges (exclude START/END, those are defined by handlers, but no need to enclose pattern later)  
        let processedEdges = [];
        edges?.forEach((edge) => {
            if (edge.source !== "START" && edge.target !== "__end__") {
                let sourceId = nodeMap.get(edge.source) || findNodeId(edge.source, reactflowNodes, stepIdx);
                let targetId = nodeMap.get(edge.target) || findNodeId(edge.target, reactflowNodes, stepIdx);
                const edgeId = `step-${stepIdx}-${edge.source}->${edge.target}`;
                processedEdges.push({ 
                    id: edgeId, 
                    source: sourceId, 
                    target: targetId, 
                    // type: edge.type, 
                    // TODO: change the edge types after customizing the edges
                    type: "default",
                    label: edge.label 
                });
            }
        });

        reactflowEdges.push(...processedEdges);
    });
    // process start edges
    stepMetadata["step-0"] = {
        inputNodes: ["step-0"],
        outputNodes: ["step-0"],
        outputMode: "default",
        pattern: "startStep",
        maxRound: 1,
        runtime: 1,
        stepNodes: ["step-0"], 
        nextSteps: taskFlowStart.nextSteps,
    };
    reactflowNodes.push({
        id: "step-0",
        type: "startStep",
        position: { x: 0, y: 0 },
        data: { 
            label: "START" , 
            inputText: taskFlowStart.input.text, 
            inputFile: taskFlowStart.input.file
        },
        deletable: false,
    });
    // process inter-step edges
    // console.log("stepMetadata", stepMetadata);
    let stepLabel = null;
    Object.keys(stepMetadata).forEach((stepKey, idx) => {
        if (stepKey === "step-0") {
            stepLabel = "START";
        } else {
            stepLabel = null;
        }
        idx += 1;
        // const nextStepKey = `step-${idx + 1}`;
        const nextStepsKeys = stepMetadata[stepKey]?.nextSteps || [];
        for (const nextStepKey of nextStepsKeys) {
            if (stepMetadata[nextStepKey]) {
                const { inputNodes } = stepMetadata[nextStepKey];
                let { outputNodes, outputMode } = stepMetadata[stepKey];
                // TODO: change the edge types after customizing the edges
                outputMode = "default";

                outputNodes.forEach((outputNode) => {
                    if (inputNodes.length === 1) {
                        const stepTransitionEdgeId = `${stepKey}->${nextStepKey}`;
                        reactflowEdges.push({
                            id: stepTransitionEdgeId,
                            source: outputNode,
                            target: inputNodes[0],
                            type: outputMode,
                            label: stepLabel || `${stepKey}->${nextStepKey}`,
                        });
                    } else {
                        inputNodes.forEach((inputNode) => {
                            const stepTransitionEdgeId = `${stepKey}->${nextStepKey}-${inputNode}`;
                            reactflowEdges.push({
                                id: stepTransitionEdgeId,
                                source: outputNode,
                                target: inputNode,
                                type: outputMode,
                                label: `${stepKey}->${nextStepKey}`,
                            });
                        });
                    }
                });
            }
        }
    });

    const edgesWithHandles = reactflowEdges.map(edge => {

        if (edge.id.includes("Supervisor->Worker")) {
          return {
            ...edge,
            sourceHandle: "bottom" + "-" + edge.source,
            targetHandle: "top" + "-" + edge.target,
            type: "default",
            animated: true,
          };
        }
  
        if (edge.id.includes("->Supervisor")) {
          return {
            ...edge,
            sourceHandle: "top" + "-" + edge.source,
            targetHandle: "bottom" + "-" + edge.target,
            type: "default",
            animated: true,
          };
        }
  
        if (edge.id.includes("Evaluator->Optimizer")) {
            return {
                ...edge,
                sourceHandle: "out-left" + "-" + edge.source,
                targetHandle: "in-right" + "-" + edge.target,
                type: "default",
                animated: true,
                style: {
                  stroke: "red",
                },
            };
        }
  
        if (edge.id.includes("Optimizer->Evaluator")) {
            return {
                ...edge,
                sourceHandle: "out-right" + "-" + edge.source,
                targetHandle: "in-left" + "-" + edge.target,
                type: "default",
                animated: true,
            };
        }
        if (edge.id.includes("->Aggregator")) {
            return {
                ...edge,
                type: "default",
                sourceHandle: "out-right" + "-" + edge.source,
                targetHandle: "in-left" + "-" + edge.target,
                animated: true,
            };
        }
        return edge;
        });


    // compile reactflow output
    const compiledReactflow = [{
        configId: configId,
        key: configId,
        graph: {
            nodes: reactflowNodes,
            edges: edgesWithHandles,
            // viewport: { x: 0, y: 0, zoom: 1 }
        },
        stepMetadata, // store the step metadata dictionary for langgraph
    }];

    // console.log("Compiled ReactFlow:", compiledReactflow);
    return compiledReactflow;
};

// helper function to find node ID 
const findNodeId = (description, nodes, stepIdx) => {
    const node = nodes.find(n => n.data.label === description);
    return node ? node.id : `step-${stepIdx}-node-default`;
};

export default CompileReactflow;
