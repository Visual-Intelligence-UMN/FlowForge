import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  SelectionMode,
//   useViewport,
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
  selectedConfigAtom,
} from "../../patterns/GlobalStates";
import isEqual from "lodash/isEqual";
import { getMultiLineLayoutedNodesAndEdges } from "./layout";
import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";
import { Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";

import set from "lodash.set";

export function RflowComponent(props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges || []);

  const [designPatterns, setDesignPatterns] = useAtom(patternsAtom);
  const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
  const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(
    agentsConfigGenerateAtom
  );
  const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(
    agentsConfigPatternAtom
  );
  const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);
  const { flowId, patternId, configId } = canvasPages || {};
  const targetWorkflow = props.targetWorkflow;

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

//   const { fitView } = useViewport();

  useEffect(() => {
    // To make sure the layout is always after the nodes and edges are set
    // 1) Set new nodes/edges from props
    const nextNodes = props.nodes || [];
    const nextEdges = props.edges || [];
    // setNodes(nextNodes);
    // setEdges(nextEdges);

    // 2) Immediately lay them out
    // TODO: change the layout function
    let layoutedNodes;
    let layoutedEdges;
    if (nextNodes.length > 3) {
      ({ nodes: layoutedNodes, edges: layoutedEdges } =
        getMultiLineLayoutedNodesAndEdges(nextNodes, nextEdges));
    } else {
      ({ nodes: layoutedNodes, edges: layoutedEdges } =
        getMultiLineLayoutedNodesAndEdges(nextNodes, nextEdges));
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
      template: node.data.template,
    }));
    const updatedTaskflow = {
      ...targetWorkflow,
      taskFlowSteps: updatedTaskFlowSteps,
    };

    // console.log("change handleSave", updatedTaskflow);
    setDesignPatterns((prevPatterns) =>
      prevPatterns.map((pattern) =>
        pattern.patternId === canvasPages.patternId ? updatedTaskflow : pattern
      )
    );
    setAgentsConfigPattern(updatedTaskflow);
    setAgentsConfigGenerate(0);
  };

  const updateNodeFieldset = (nodeId, fieldName, newValue) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== nodeId) return node;
        const newData = { ...node.data };
        set(newData, fieldName, newValue);
        return { ...node, data: newData };
      })
    );
  };

  const nodeListWithHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      updateNodeFieldset,
    },
  }));

  const defaultViewport = { x: 0, y: 0, zoom: 1 };
  const panOnDrag = [1, 2];

  return (
    <div
      className="reactflow-wrapper"
      style={{
        height: "57vh",
        border: "1px solid #ddd",
        position: "relative",
      }}
    >
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
        defaultViewport={defaultViewport}
        // fitView={fitView}
        panOnDrag={panOnDrag}
        panOnScroll
        selectionMode={SelectionMode.Partial}
      ></ReactFlow>

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
