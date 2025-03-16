import {
  ReactFlow,
  useViewport,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  SelectionMode,
  useReactFlow,
  //   useViewport,
  useStore,
  useStoreApi,
} from "@xyflow/react";
import { ViewportPortal } from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { getMultiLineLayoutedNodesAndEdges, zoomOutLayout } from "./layout";
import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";
import { Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";

import set from "lodash.set";

export function RflowComponent(props) {
  const targetWorkflow = props.targetWorkflow;

  // const { nodes: initialNodes, edges: initialEdges } =
  // convertToReactFlowFormat(targetWorkflow);
  const { fitView, setViewport, setCenter } = useReactFlow();

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

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );
  const previousNodeRef = useRef(null);
  const [animation, setAnimation] = useState(true);
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

    setTimeout(() => {
      if (nodes.length) {
        //   fitView({ padding: 0.5, duration: 1000 });
        setViewport({ x: 40, y: 20, zoom: 0.4 }, { duration: 600 });
        //   setCenter(0, 0, { duration: 1000 });
        //   zoomOut({ zoom: 1, duration: 1000 });
      }
      setAnimation(false);
    }, 100);
  }, [targetWorkflow, canvasPages.type, props.nodes, props.edges, fitView]);

  const handleSave = () => {
    const stepNodes = nodes.filter((node) => node.id !== "step-0");
    const updatedTaskFlowSteps = stepNodes.map((node) => ({
      stepName: node.data.stepName,
      stepLabel: node.data.stepLabel,
      stepDescription: node.data.stepDescription,
      pattern: node.data.pattern,
      config: node.data.config,
      template: node.data.template,
      nextSteps: node.data.nextSteps,
      stepId: node.id,
    }));
    const startNode = nodes.find((node) => node.id === "step-0");
    const startEdges = edges.filter((edge) => edge.source === "step-0");
    const updatedTaskFlowStart = {
      stepId: "step-0",
      nextSteps: startEdges.map((edge) => edge.target),
      input: {
        text: startNode.data.inputText,
        file: startNode.data.inputFile,
      },
    };
    const updatedTaskflow = {
      ...targetWorkflow,
      taskFlowSteps: updatedTaskFlowSteps,
      taskFlowStart: updatedTaskFlowStart,
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

  const zoomSelector = (s) => s.transform[2] >= 0.5;
  const showContent = useStore(zoomSelector);
  const zoomRatio = useStore((s) => s.transform[2]);

  const nodeListWithHandlers = nodes.map((node) => ({
    ...node,
    style: {
      ...(node.style || {}),
      transition: animation ? "transform 0.5s ease" : "none",
    },
    data: {
      ...node.data,
      updateNodeFieldset,
      showContent,
    },
  }));

  //   const defaultViewport = { x: 0, y: 0, zoom: 0.1 };
  const panOnDrag = [1, 2];

  const handleNodeClick = useCallback(
    (evt, node) => {
      if (node) {
        if (previousNodeRef.current && previousNodeRef.current.id === node.id) {
          console.log("Clicked the same node. View remains unchanged.");
          return; // Do nothing if it's the same node.
        }

        previousNodeRef.current = node;

        console.log("node", node);
        // const eventX = evt.clientX;
        // const eventY = evt.clientY;
        // const pattern = node.data.pattern.name;
        let x = node.position.x + node.measured.width / 2;
        let y = node.position.y + node.measured.height / 0.8;
        // console.log("zoomRatio", zoomRatio);

        if (zoomRatio < 0.7) {
          const zoom = 0.7;
          // todo: change the zoom ratio based on the pattern type?
          setCenter(x, y, { zoom, duration: 1000 });

          // setViewport({ x: eventX, y: eventY, zoom: 0.7 }, { duration: 1000 });
        } else {
          x = x * 1.1;
          y = y * 0.6;
          setCenter(x, y, { zoom: 0.7, duration: 1000 });
        }
      }
    },
    [setCenter]
  );

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
        onNodeClick={handleNodeClick}
        // defaultViewport={defaultViewport}
        panOnDrag={panOnDrag}
        panOnScroll
        selectionMode={SelectionMode.Partial}
        minZoom={0.2}
        // defaultZoom={0.1}
      >
        {/* <MiniMap /> */}
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
          p: 2,
        }}
      >
        CONTINUE
      </Button>
    </div>
  );
}
