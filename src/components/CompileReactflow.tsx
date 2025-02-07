import { AppNode } from "../nodes/types";
import { Edge } from "@xyflow/react";

const CompileReactflow = async (config) => {
    const { taskFlowSteps, configId } = config;
    // const configId = [taskId, taskFlowId, patternId].join("_");

    console.log("config to compile for reactflow", config);

    const reactflowNodes: AppNode[] = [];
    const reactflowEdges: Edge[] = [];
    let stepMetadata = {}; // Stores input node, output nodes, and output mode for each step

    let positionX = 0;
    let positionY = 0;
    // iterate over each step
    taskFlowSteps.forEach((step, stepIdx) => {
        const { config } = step;
        if (!config) return;

        const { nodes, edges, type } = config;
        let stepNodeIds = [];
        let firstNodeId = null;
        let outputNodeIds = [];
        let outputMode = "direct"; // from this step to next step, may not be used
        let nodeMap = new Map(); // Stores node → full IDs
        // add all nodes within this step
        if (nodes?.length > 0) {
            nodes.forEach((node) => {
                const id = `step-${stepIdx}-node-${node.description}`;
                const type = node.type || "default";
                const position = { x: positionX, y: positionY };
                const data = {
                    label: node.description,
                    tools: node.tools || [],
                    llm: node.llm || "gpt-4o-mini",
                    systemPrompt: node.systemPrompt || "",
                };

                positionX += 400;
                positionY += 500;

                reactflowNodes.push({ id, type, position, data });
                stepNodeIds.push(id);
                nodeMap.set(node.description, id);

                if (!firstNodeId) {
                    firstNodeId = id;
                }
            });
        }

        // identify input & output nodes in one step
        if (stepNodeIds.length === 1) {
            firstNodeId = stepNodeIds[0];
            outputNodeIds.push(stepNodeIds[0]);
        } else {
            edges?.forEach((edge) => {
                if (edge.source === "START") {
                    firstNodeId = nodeMap.get(edge.target) || findNodeId(edge.target, reactflowNodes, stepIdx);
                }
                if (edge.target === "END") {
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
        if (stepIdx === taskFlowSteps.length - 1) {
            outputNodeIds.push("END");
        }

        // store step metadata for langgraph
        stepMetadata[`step-${stepIdx}`] = {
            inputNode: firstNodeId,
            outputNodes: outputNodeIds,
            outputMode: outputMode,
            pattern: type,
            stepNodes: Array.from(nodeMap.values()), 
        };

        // process intra-step edges (exclude START/END, those are defined by handlers, but no need to enclose pattern later)  
        let processedEdges = [];
        edges?.forEach((edge) => {
            if (edge.source !== "START" && edge.target !== "END") {
                let sourceId = nodeMap.get(edge.source) || findNodeId(edge.source, reactflowNodes, stepIdx);
                let targetId = nodeMap.get(edge.target) || findNodeId(edge.target, reactflowNodes, stepIdx);
                const edgeId = `step-${stepIdx}-${edge.source}->${edge.target}`;
                processedEdges.push({ id: edgeId, source: sourceId, target: targetId, type: edge.type, label: edge.label });
            }
        });

        reactflowEdges.push(...processedEdges);
    });

    // process inter-step edges
    Object.keys(stepMetadata).forEach((stepKey, idx) => {
        const nextStepKey = `step-${idx + 1}`;
        if (stepMetadata[nextStepKey]) {
            const { inputNode } = stepMetadata[nextStepKey];
            let { outputNodes, outputMode } = stepMetadata[stepKey];
            // TODO: change the edge types after customizing the edges
            outputMode = "default";

            outputNodes.forEach((outputNode) => {
                const stepTransitionEdgeId = `${stepKey}->${nextStepKey}`;
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

    // console.log("Step Metadata Dictionary:", stepMetadata); 

    // compile reactflow output
    const compiledReactflow = [{
        configId: configId,
        key: configId,
        graph: {
            nodes: reactflowNodes,
            edges: reactflowEdges,
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
