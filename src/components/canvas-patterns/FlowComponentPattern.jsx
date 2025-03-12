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
    useStoreApi
} from "@xyflow/react";
import { ViewportPortal } from '@xyflow/react';
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
import {
     getMultiLineLayoutedNodesAndEdges, 
     zoomOutLayout
} from "./layout";
import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";
import { Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";

import set from "lodash.set";


export function RflowComponent(props) {

  const reactFlowInstance = useReactFlow();
  const store = useStoreApi();

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

  const {fitView, setViewport, zoomIn, zoomOut, setCenter} = useReactFlow();

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
      }, 100);

  }, [targetWorkflow, canvasPages.type, props.nodes, props.edges, fitView]);


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

  const zoomSelector = (s) => s.transform[2] >= 0.5;
  const showContent = useStore(zoomSelector);


//   useEffect(() => {
//     // console.log("showContent", showContent);

//     const doRelayout = async () => {
//       const { nodes: layoutedNodes, edges: layoutedEdges } = zoomOutLayout(nodes, edges);
//       setNodes(layoutedNodes);
//       setEdges(layoutedEdges);
//       setViewport({ x: 40, y: 20, zoom: 0.4 }, { duration: 600 });
//     };
  
//     doRelayout();
//   }, [showContent]);

  const nodeListWithHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      updateNodeFieldset,
      showContent,
    },
  }));

//   const defaultViewport = { x: 0, y: 0, zoom: 0.1 };
  const panOnDrag = [1, 2];


  const handleNodeClick = useCallback((evt, node) => {
    if (node){
        // const pattern = node.data.pattern.name;
        const x = node.position.x + node.measured.width / 2;
        const y = node.position.y + node.measured.height / 0.9;
        const zoom = 0.7;
        // todo: change the zoom ratio based on the pattern type?
        setCenter(x, y, { zoom, duration: 1000 });
    }
  }, [setCenter]);


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
          pt: 1,
        }}
      >
        CONTINUE
      </Button>
    </div>
  );
}
