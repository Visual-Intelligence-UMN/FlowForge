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
} from "../../patterns/GlobalStates";
import {
  getMultiLineLayoutedNodesAndEdges,
  getLayoutedNodesAndEdges,
} from "../../utils/layout/dagreUtils";
import { nodeTypes } from "../nodes";
import Button from "@mui/material/Button";

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

  const { nodes: initialNodes, edges: initialEdges } =
    convertToReactFlowFormat(targetWorkflow);

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
      // console.log("updatedWorkflow", updatedWorkflow);
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
    [
      targetWorkflow,
      canvasPages.flowId,
      setFlowsMap,
      setPatternsFlow,
      onWorkflowUpdate,
    ]
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
        // updateTargetWorkflow(nodes, newEdges);
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

  const onNodesDelete = useCallback(
    (deletedNodes) => {
      // Determine remaining nodes after deletion
      const remainingNodes = nodes.filter(
        (node) => !deletedNodes.some((del) => del.id === node.id)
      );

      // If deletion would remove all nodes and only one node was deleted…
      if (remainingNodes.length === 0 && deletedNodes.length === 1) {
        alert(
          "At least one step is required. Restoring the last deleted node."
        );
        // Restore by simply keeping the deleted node in the state.
        // (You could also choose to re-add it explicitly if ReactFlow has already removed it.)
        setNodes(() => {
          // If ReactFlow already removed it
          // so we explicitly add back the deleted node.
          const restoredNodes = [deletedNodes[0]];
          updateTargetWorkflow(restoredNodes, edges);
          return restoredNodes;
        });
        // No change to edges is needed since they would be removed along with the node.
        return;
      }
      // Otherwise, proceed normally by removing nodes and corresponding edges.
      const nodeIdsToRemove = new Set(deletedNodes.map((n) => n.id));
      const newEdges = edges.filter(
        (edge) =>
          !nodeIdsToRemove.has(edge.source) && !nodeIdsToRemove.has(edge.target)
      );
      updateTargetWorkflow(remainingNodes, newEdges);
      setNodes(remainingNodes);
      setEdges(newEdges);
    },
    [nodes, edges, updateTargetWorkflow, setNodes, setEdges]
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
      //   updateTargetWorkflow(updatedNodes, edges);
      // no need to update the workflow here, it will be updated when the user saves the workflow
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
        height: "57vh",
        border: "1px solid #ddd",
        position: "relative",
      }}
    >
      <Button
        onClick={addStep}
        sx={{ position: "absolute", zIndex: 1 }}
        size="small"
      >
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
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleSave();
        }}
        sx={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          textTransform: "none",
          pt: 1,
        }}
      >
        CONTINUE
      </Button>
    </div>
  );
}
