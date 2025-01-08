import { AppNode } from "../nodes/types";
import { Edge } from "@xyflow/react";

const CompileReactflow = async (config) => {
    const { taskId, taskFlowId, patternId, taskFlowSteps } = config;
    const configId = [taskId, taskFlowId, patternId].join("_");

    const reactflowNodes: AppNode[] = [];
    const reactflowEdges: Edge[] = [];
    let stepMetadata = {}; // Stores input node, output nodes, and output mode for each step

    let positionX = 0;
    let positionY = 0;
    // **Step 1: Process Nodes and Collect Metadata**
    taskFlowSteps.forEach((step, stepIdx) => {
        const { config } = step;
        if (!config) return;

        const { nodes, edges, type } = config;
        let stepNodeIds = [];
        let firstNodeId = null;
        let outputNodeIds = [];
        let outputMode = "direct"; // Default output mode
        let nodeMap = new Map(); // Stores node descriptions → full IDs

        // **Add all nodes**
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

        // **Identify Input & Output Nodes**
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

        // **For the first step, set input node to "START" for visualization**
        // if (stepIdx === 0) {
        //     firstNodeId = "START";
        // }
        if (stepIdx === taskFlowSteps.length - 1) {
            outputNodeIds.push("END");
        }

        // **Store Step Metadata**
        stepMetadata[`step-${stepIdx}`] = {
            inputNode: firstNodeId,
            outputNodes: outputNodeIds,
            outputMode: outputMode,
            pattern: type,
            stepNodes: Array.from(nodeMap.values()), 
        };

        // **Process Intra-Step Edges (Exclude START/END)**
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

    // **Step 2: Process Inter-Step Edges**
    Object.keys(stepMetadata).forEach((stepKey, idx) => {
        const nextStepKey = `step-${idx + 1}`;
        if (stepMetadata[nextStepKey]) {
            const { inputNode } = stepMetadata[nextStepKey];
            let { outputNodes, outputMode } = stepMetadata[stepKey];
            // TODO: change the edge types 
            outputMode = "default";
            // keep the stepMetadata as it is but to display reactflow with default for now. 

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

    console.log("Step Metadata Dictionary:", stepMetadata); 

    // **Compile ReactFlow Output**
    const compiledReactflow = [{
        configId,
        key: configId,
        graph: {
            nodes: reactflowNodes,
            edges: reactflowEdges,
            viewport: { x: 0, y: 0, zoom: 1 }
        },
        stepMetadata, // 🔹 Store the step metadata dictionary
    }];

    console.log("Compiled ReactFlow:", compiledReactflow);
    return compiledReactflow;
};

// **Helper function to find node ID or return a default node reference**
const findNodeId = (description, nodes, stepIdx) => {
    const node = nodes.find(n => n.data.label === description);
    return node ? node.id : `step-${stepIdx}-node-default`;
};

export default CompileReactflow;
