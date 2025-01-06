
import { initialNodes } from "../nodes";
import { initialEdges } from "../edges";

// import { AppNode } from "../nodes/types";

const CompileReactflow = async (config) => {

    const {taskId, taskFlowId, taskFlowName, taskFlowDescription, taskFlowSteps, patternId} = config;
    const configId = [taskId, taskFlowId, patternId].join("-");

    const reactflowNodes = [];
    const reactflowEdges = [];

    let positionX = 0;
    let positionY = 0;

    let previousLastNodeId = null;

    taskFlowSteps.forEach((step, stepIdx) => {
        const {config} = step;
        if (!config) {return;}

        const {nodes, edges, type} = config;
        let stepNodeIds = [];

        if (nodes) {
            nodes.forEach((node) => {
                const id = `step-${stepIdx}-node-${node.description}`;
                const type = node.type;
                const position = {x: positionX, y: positionY};
                const data = {
                    label: node.description,
                    tools: node.tools || [],
                    llm: node.llm || "gpt-4o-mini",
                    systemPrompt: node.systemPrompt || ""
                }
                positionX += 100; positionY += 100;

                const reactflowNode = {id, type, position, data};
                stepNodeIds.push(id);
                reactflowNodes.push(reactflowNode);
            });
        } else {
            console.log("No nodes found for step", stepIdx);
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
        }



        if (edges && edges.length > 0) {
            edges?.forEach((edge) => {
                const id = `step-${stepIdx}-${edge.source}->${edge.target}`;
                const source = edge.source;
                const target = edge.target;
                const type = edge.type  || "default";
                const label = edge.label || "";

                const reactflowEdge = {id, source, target, type, label};
                reactflowEdges.push(reactflowEdge);
            });
        } else {
            console.log("No edges found for step", stepIdx);
        }
    })

    const compiledReactflow = [{
        configId: config.agentConfigId,
        key: configId,
        graph: {nodes: reactflowNodes, edges: reactflowEdges, viewport: {x: 0, y: 0, zoom: 1}},
    }]

    console.log("compiledReactflow", compiledReactflow);

    // const compiledReactflow = [{
    //     configId: config.agentConfigId,
    //     key: [config.taskId, config.flowId , config.patternId, config.agentConfigId].join("-"),
    //     graph: {nodes: initialNodes, edges: initialEdges, viewport: {x: 0, y: 0, zoom: 1}},
    // }]

    return compiledReactflow;
}

export default CompileReactflow;