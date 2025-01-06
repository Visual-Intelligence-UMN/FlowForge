import { initialNodes } from "../nodes";
import { initialEdges } from "../edges";

import { AppNode } from "../nodes/types";
import { Edge } from "@xyflow/react";

const CompileReactflow = async (config) => {
    const { taskId, taskFlowId, patternId, taskFlowSteps } = config;
    const configId = [taskId, taskFlowId, patternId].join("_");

    const reactflowNodes: AppNode[] = [];
    const reactflowEdges: Edge[] = [];

    let positionX = 0;
    let positionY = 0;
    let previousLastNodeId = null; // Track last node of previous step

    taskFlowSteps.forEach((step, stepIdx) => {
        const { config } = step;
        if (!config) return;

        const { nodes, edges } = config;
        let stepNodeIds = []; // Store node IDs for this step
        let firstNodeId = null; // Track first node of this step

        if (nodes?.length > 0) {
            nodes.forEach((node, nodeIdx) => {
                const id = `step-${stepIdx}-node-${node.description}`;
                const type = node.type || "default";
                const position = { x: positionX, y: positionY };
                const data = {
                    label: node.description,
                    tools: node.tools || [],
                    llm: node.llm || "gpt-4o-mini",
                    systemPrompt: node.systemPrompt || "",
                };

                positionX += 100;
                positionY += 100;

                reactflowNodes.push({ id, type, position, data });
                stepNodeIds.push(id);

                if (!firstNodeId) {
                    firstNodeId = id; // Set first node ID
                }
            });
        }

        // If no nodes exist, add a default node
        if (stepNodeIds.length === 0) {
            console.log(`No nodes found for step ${stepIdx}, adding default node.`);
            const defaultNodeId = `step-${stepIdx}-node-default`;
            reactflowNodes.push({
                id: defaultNodeId,
                type: "default",
                position: { x: positionX, y: positionY },
                data: { label: `Default Node for Step ${stepIdx}` },
            });

            positionX += 200;
            positionY += 100;
            stepNodeIds.push(defaultNodeId);
            firstNodeId = defaultNodeId;
        }

        let processedEdges = [];

        if (edges?.length > 0) {
            edges.forEach((edge) => {
                let source = edge.source;
                let target = edge.target;

                // Replace "START" with last node of previous step
                if (source === "START") {
                    if (previousLastNodeId) {
                        source = previousLastNodeId;
                    } else {
                        console.warn(`START found in step ${stepIdx}, but no previous node exists.`);
                        return;
                    }
                }
                // Replace "END" with first node of the next step (temporary placeholder)
                if (target === "END") {
                    target = `step-${stepIdx + 1}-node-placeholder`;
                } else {
                    target = findNodeId(target, reactflowNodes, stepIdx);
                }

                const edgeId = `step-${stepIdx}-${edge.source}->${edge.target}`;
                processedEdges.push({ id: edgeId, source, target, type: "default", label: edge.label || "" });
            });
        } else {
            console.log(`No edges found for step ${stepIdx}.`);
        }

        // Ensure connection from previous step's last node to this step's first node
        if (previousLastNodeId && firstNodeId) {
            const stepTransitionEdgeId = `step-${stepIdx - 1}->step-${stepIdx}`;
            reactflowEdges.push({
                id: stepTransitionEdgeId,
                source: previousLastNodeId,
                target: firstNodeId,
                type: "default",
                label: `Step ${stepIdx - 1}->Step ${stepIdx}`,
            });
        }

        reactflowEdges.push(...processedEdges);
        previousLastNodeId = stepNodeIds[stepNodeIds.length - 1]; // Update last node of this step
    });

    // Update edges that had "END" placeholders
    reactflowEdges.forEach((edge) => {
        if (edge.target.includes("node-placeholder")) {
            const stepIdx = parseInt(edge.target.split("-")[1]);
            const nextStepNodes = reactflowNodes.filter(n => n.id.startsWith(`step-${stepIdx}`));
            if (nextStepNodes.length > 0) {
                edge.target = nextStepNodes[0].id; // Replace with first node of next step
            }
        }
    });

    const compiledReactflow = [{
        configId,
        key: configId,
        graph: {
            nodes: reactflowNodes,
            edges: reactflowEdges,
            viewport: { x: 0, y: 0, zoom: 1 }
        },
    }];

    console.log("Compiled ReactFlow:", compiledReactflow);
    return compiledReactflow;
};

// Helper function to find node ID or return a default node reference
const findNodeId = (description, nodes, stepIdx) => {
    const node = nodes.find(n => n.data.label === description);
    return node ? node.id : `step-${stepIdx}-node-default`; // Fallback to default node
};

export default CompileReactflow;
