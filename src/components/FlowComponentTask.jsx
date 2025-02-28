import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  getConnectedEdges,
  Controls,
} from "reactflow";
import { useAtom } from "jotai";
import {
  flowsMapAtom,
  canvasPagesAtom,
  patternsFlowAtom,
  patternsGenerateAtom,
  patternsAtom,
} from "../global/GlobalStates";
import {
  getMultiLineLayoutedNodesAndEdges,
  getLayoutedNodesAndEdges,
} from "../utils/dagreUtils";
import { nodeTypes } from "../nodes";
import Button from "@mui/material/Button";

// Converts your workflow into initial nodes/edges
function convertToReactFlowFormat(taskflow) {
  const { taskFlowSteps = [] } = taskflow;
  const nodes = taskFlowSteps.map((step, index) => ({
    id: `step-${index + 1}`,
    type: "flowStep",
    position: { x: index * 250, y: 100 }, // Overridden by Dagre layout
    data: {
      stepName: step.stepName || `Step ${index + 1}`,
      stepLabel: step.stepLabel || "",
      stepDescription: step.stepDescription || "",
      label: step.stepLabel || `Step ${index + 1}`,
      pattern: step.pattern || { name: "", description: "" },
      template: step.template || {
        persona: "Single Agent",
        goal: "Single Agent",
      },
      config: step.config || { type: "none", nodes: [], edges: [] },
    },
  }));

  // For a simple linear chain: node i -> node i+1
  const edges = nodes
    .map((node, index) =>
      index < nodes.length - 1
        ? {
            id: `edge-${index}`,
            source: node.id,
            target: nodes[index + 1].id,
            animated: true,
          }
        : null
    )
    .filter(Boolean);

  return { nodes, edges };
}

export function FlowComponentTask(props) {
  const { targetWorkflow, onWorkflowUpdate } = props;

  const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
  const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
  const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
  const [canvasPages] = useAtom(canvasPagesAtom);

  // Build initial nodes & edges from the workflow
  const { nodes: initialNodes, edges: initialEdges } =
    convertToReactFlowFormat(targetWorkflow);

  // React Flow node/edge states
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Keep a single effect to layout on first render (or whenever the workflow changes)
  useEffect(() => {
    if (!targetWorkflow?.taskFlowSteps?.length) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: newNodes, edges: newEdges } =
      convertToReactFlowFormat(targetWorkflow);

    let layoutedNodes, layoutedEdges;
    if (newNodes.length > 3) {
      ({ nodes: layoutedNodes, edges: layoutedEdges } =
        getMultiLineLayoutedNodesAndEdges(newNodes, newEdges));
    } else {
      ({ nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedNodesAndEdges(newNodes, newEdges));
    }

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [targetWorkflow, setNodes, setEdges]);

  // Helper to update the overall "workflow" shape in global or parent
  const updateTargetWorkflow = useCallback(
    (updatedNodes, updatedEdges) => {
      const updatedTaskFlowSteps = updatedNodes.map((node) => {
        // find all outgoing connections for this node
        const outgoingConnections = updatedEdges
          .filter((edge) => edge.source === node.id)
          .map((edge) => edge.target);

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

      const updatedWorkflow = {
        ...targetWorkflow,
        taskFlowSteps: updatedTaskFlowSteps,
      };
      console.log("updatedWorkflow", updatedWorkflow);
      // Update global flows map
      setFlowsMap((prevFlows) => ({
        ...prevFlows,
        [Number(canvasPages.flowId)]: updatedWorkflow,
      }));
      // Store separately if needed
      setPatternsFlow(updatedWorkflow);

      // Callback to parent
      if (onWorkflowUpdate) {
        onWorkflowUpdate(updatedWorkflow);
      }
    },
    [targetWorkflow, canvasPages.flowId, setFlowsMap, setPatternsFlow, onWorkflowUpdate]
  );

  // Called by user to save current diagram back to workflow
  const handleSave = () => {
    updateTargetWorkflow(nodes, edges);
    setPatternsGenerate(0);
  };

  // Let ReactFlow handle the node & edge transformations, then we can call "update"
  const onConnect = useCallback(
    (connection) =>
      setEdges((prevEdges) => {
        const newEdges = addEdge(connection, prevEdges);
        // optionally update workflow here if you want immediate persistence
        updateTargetWorkflow(nodes, newEdges);
        return newEdges;
      }),
    [nodes, updateTargetWorkflow, setEdges]
  );

  // Add a new step at the end
  const addStep = useCallback(() => {
    setNodes((prevNodes) => {
      const newIndex = prevNodes.length + 1;
      const newNodeId = `step-${newIndex}`;
      const newNode = {
        id: newNodeId,
        type: "flowStep",
        position: { x: newIndex * 200, y: newIndex * 100 },
        data: {
          stepName: `Step Name`,
          stepLabel: `Step Label`,
          stepDescription: `Step Description`,
          pattern: { name: "Single Agent", description: "Single Agent" },
          config: { type: "none", nodes: [], edges: [] },
          template: { persona: "Single Agent", goal: "Single Agent" },
        },
      };

      const newNodes = [...prevNodes, newNode];

      // Also link it to the last existing node (if any)
      setEdges((prevEdges) => {
        if (!prevNodes.length) {
          // If this is the first node, just update
          updateTargetWorkflow(newNodes, prevEdges);
          return prevEdges;
        }
        const lastNodeId = prevNodes[prevNodes.length - 1].id;
        const newEdge = {
          id: `${lastNodeId}->${newNodeId}`,
          source: lastNodeId,
          target: newNodeId,
        };
        const newEdges = [...prevEdges, newEdge];
        updateTargetWorkflow(newNodes, newEdges);
        return newEdges;
      });

      return newNodes;
    });
  }, [updateTargetWorkflow, setNodes, setEdges]);

  // Delete nodes: remove their edges, do NOT auto-link incomers/outgoers or renumber
  const onNodesDelete = useCallback(
    (deletedNodes) => {
      setEdges((prevEdges) => {
        const nodeIdsToRemove = new Set(deletedNodes.map((n) => n.id));
        const newEdges = prevEdges.filter(
          (edge) =>
            !nodeIdsToRemove.has(edge.source) &&
            !nodeIdsToRemove.has(edge.target)
        );
        // Now we update the workflow to reflect the new state
        const newNodes = nodes.filter((n) => !nodeIdsToRemove.has(n.id));
        updateTargetWorkflow(newNodes, newEdges);
        return newEdges;
      });
    },
    [nodes, setEdges, updateTargetWorkflow]
  );

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
      updateTargetWorkflow(updatedNodes, edges);
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

  return (
    <div
      className="reactflow-wrapper"
      style={{
        width: "1400px",
        height: "800px",
        border: "1px solid #ddd",
        position: "relative",
      }}
    >
      <Button onClick={addStep} style={{ marginBottom: 8 }}>
        Add Step
      </Button>

      <ReactFlow
        key={`${canvasPages.type}-${canvasPages.flowId || ""}-${
          canvasPages.patternId || ""
        }-${canvasPages.configId || ""}`}
        nodes={nodeListWithHandlers}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        fitView
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
      >
        CONTINUE
      </Button>
    </div>
  );
}
