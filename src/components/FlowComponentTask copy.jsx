import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  Controls,
} from "reactflow";
import { Box, Button } from "@mui/material";
import { set as lodashSet } from "lodash";

import {
  // your global Jotai atoms if you need them:
  flowsMapAtom,
  canvasPagesAtom,
  patternsFlowAtom,
  patternsGenerateAtom,
  patternsAtom,
} from "../global/GlobalStates";

import {
  getLayoutedNodesAndEdges,
  getMultiLineLayoutedNodesAndEdges,
} from "../utils/dagreUtils";

import { nodeTypes } from "../nodes";

// ------ Utility to create nodes from the domain steps array ------
function createNodesFromSteps(steps) {
  return steps.map((step, index) => ({
    id: `step-${index + 1}`,
    type: "flowStep", // match your nodeTypes key
    position: { x: 0, y: 0 }, // position will be set by layout
    data: {
      stepName: step.stepName,
      stepLabel: step.stepLabel,
      stepDescription: step.stepDescription,
      pattern: step.pattern || {},
      config: step.config || {},
      template: step.template || {},
    },
  }));
}
// 2) Create domain edges from steps
function createEdgesFromSteps(steps) {
  const edges = [];
  steps.forEach((step, idx) => {
    const currentId = `step-${idx + 1}`;

    if (Array.isArray(step.nextStepIndexes)) {
      step.nextStepIndexes.forEach((nextIdx) => {
        const targetId = `step-${nextIdx}`;
        edges.push({
          id: `edge-${currentId}-to-${targetId}`,
          source: currentId,
          target: targetId,
        });
      });
    }
  });
  return edges;
}

export function FlowComponentTask(props) {
  const { targetWorkflow, onSave } = props;

  // 1) Keep the workflow steps in local state as the single source of truth
  const [workflowSteps, setWorkflowSteps] = useState(
    targetWorkflow.taskFlowSteps || []
  );

  // 2) We generate the React Flow nodes from those steps,
  //    but store them in local React Flow state via useNodesState
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  // 3) Also store edges in local React Flow state, initially from props.edges
  //    so you can display edges that come from your parent if needed
  const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges || []);

  // 4) Re-generate nodes & re-run layout whenever workflowSteps or edges change
  const generateAndLayout = useCallback(() => {
    // Convert steps -> nodes
    const rawNodes = createNodesFromSteps(workflowSteps);
    const rawEdges = createEdgesFromSteps(workflowSteps);

    // We have edges in local state. If you want to also generate domain-based edges,
    // you can do that here and combine them with existing edges. For now, we
    // assume edges come from local state or user-dragging in the canvas.
    // const rawEdges = edges;

    // Use your layout function. Switch to multiLine if you prefer:
    let layouted;
    if (rawNodes.length > 3) {
      layouted = getMultiLineLayoutedNodesAndEdges(rawNodes, rawEdges);
    } else {
      layouted = getLayoutedNodesAndEdges(rawNodes, rawEdges);
    }

    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [workflowSteps, edges, setNodes, setEdges]);

  useEffect(() => {
    generateAndLayout();
    // If props.edges changes externally, store them in local state too
  }, [workflowSteps, edges, generateAndLayout]);

  // 5) Add a new step modifies the steps array, triggers re-render -> new nodes
  const handleAddStep = useCallback(() => {
    setWorkflowSteps((prev) => {
      const newIndex = prev.length + 1;
      return [
        ...prev,
        {
          stepName: `Step ${newIndex}`,
          stepLabel: `Step ${newIndex}`,
          stepDescription: `Description of Step ${newIndex}`,
        },
      ];
    });
  }, []);

  // 6) Called if user hits "delete" on a node in the canvas
  //    or from a custom button in the node calling handleRemoveStep(nodeId)
  const handleRemoveStep = useCallback(
    (nodeId) => {
      const indexToRemove = parseInt(nodeId.split("-")[1], 10) - 1;
      setWorkflowSteps((prevSteps) => {
        if (prevSteps.length <= 1) {
          // Ensure at least one step remains
          return prevSteps;
        }
        const newSteps = [...prevSteps];
        newSteps.splice(indexToRemove, 1);
        return newSteps;
      });
    },
    []
  );

  // A version that rewires edges from incomers -> outgoers on node delete
  const onNodesDelete = useCallback(
    (deletedNodes) => {
      // For each deleted node, remove it from the domain
      deletedNodes.forEach((node) => {
        handleRemoveStep(node.id);
      });

      // Re-wire edges if you want (or remove this logic if not needed).
      setEdges((prevEdges) =>
        deletedNodes.reduce((accEdges, node) => {
          const incomers = getIncomers(node, nodes, accEdges);
          const outgoers = getOutgoers(node, nodes, accEdges);
          const connectedEdges = getConnectedEdges([node], accEdges);

          const remainingEdges = accEdges.filter(
            (edge) => !connectedEdges.includes(edge)
          );

          // Re-wire: connect each incomer to each outgoer
          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, prevEdges)
      );
    },
    [nodes, handleRemoveStep, setEdges]
  );

  // 7) Let user drag edges in the UI
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // 8) Save merges the steps array back into targetWorkflow.taskFlowSteps
  const handleSave = () => {
    const updatedWorkflow = {
      ...targetWorkflow,
      taskFlowSteps: workflowSteps,
    };

    // if parent gave you an onSave callback
    onSave?.(updatedWorkflow);

    // or store in global state, e.g. setFlowsMapAtom(...) if you prefer
    console.log("Updated workflow steps:", updatedWorkflow.taskFlowSteps);
  };

  // 9) A field-updater for each node. If user edits "stepName" on node "step-2",
  //    we update the steps array accordingly.
  const updateNodeField = (nodeId, fieldName, newValue) => {
    const index = parseInt(nodeId.split("-")[1], 10) - 1;
    setWorkflowSteps((prevSteps) => {
      const newSteps = [...prevSteps];
      newSteps[index] = {
        ...newSteps[index],
        [fieldName]: newValue,
      };
      return newSteps;
    });
  };

  // Create a “decorated” list of nodes that includes the update function
  const decoratedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      updateNodeField,
      handleRemoveStep, // if you want a remove button in each node
    },
  }));

  return (
    <Box
      sx={{
        width: 1400,
        height: 800,
        border: "1px solid #ddd",
        position: "relative",
      }}
    >
      {/* Add a step */}
      <Button onClick={handleAddStep} variant="contained" sx={{ m: 1 }}>
        Add Step
      </Button>

      <ReactFlow
        nodes={decoratedNodes}
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

      {/* Save */}
      <Button
        onClick={handleSave}
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
    </Box>
  );
}
