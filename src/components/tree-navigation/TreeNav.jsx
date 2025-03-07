import { useAtom } from "jotai";
import {
  flowsMapAtom,
  patternsAtom,
  agentsConfigAtom,
  treeNavAtom,
  selectedTaskAtom,
  canvasPagesAtom,
  compiledConfigsAtom,
} from "../../patterns/GlobalStates";
import { Graph } from "graphlib";
import * as dagre from "dagre";
import { useEffect } from "react";
import "./tree.css";
import { Typography, Box } from "@mui/material";

const TreeNav = () => {
  const [treeNav, setTreeNav] = useAtom(treeNavAtom);
  const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);
  const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
  const [patterns, setPatterns] = useAtom(patternsAtom);
  const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
  const [compiledConfigs, setCompiledConfigs] = useAtom(compiledConfigsAtom);
  const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);

  const handleTreeNav = () => {
    const g = new Graph();
    g.setGraph({
      rankdir: "TB", // top to bottom
      nodesep: 30, // node spacing
      ranksep: 30, // level spacing
    });

    if (Object.keys(selectedTask).length > 0) {
      g.setNode(`task-${selectedTask.id}`, {
        label: selectedTask.name,
        width: selectedTask.name.length * 8,
        height: 40,
        data: {
          type: "task",
        },
      });
    }

    Object.keys(flowsMap).forEach((flowId) => {
      if (!flowId) return;
      const label = `Flow ${flowId}`;
      g.setNode(`flow-${flowId}`, {
        label: label,
        data: {
          id: flowId,
          type: "flow",
        },
        width: label.length * 8,
        height: 40,
      });
      g.setEdge(`task-${selectedTask.id}`, `flow-${flowId}`, {
        label: `task-${selectedTask.id}-flow-${flowId}`,
      });
    });

    patterns.forEach((pattern) => {
      if (!pattern?.patternId) return;
      const patternID = pattern.patternId;
      const label = `Patterns ${patternID}`;
      g.setNode(`pattern-${patternID}`, {
        label: label,
        width: label.length * 8,
        height: 30,
        data: {
          id: patternID,
          type: "pattern",
        },
      });
      const flowId = patternID.split("-")[0];
      g.setEdge(`flow-${flowId}`, `pattern-${patternID}`, {
        label: `flow-${flowId}-pattern-${patternID}`,
      });
    });

    // agentsConfig.forEach((config) => {
    //     if (!config?.configId) return;
    //     const configId = config.configId;npm install -g npm@11.2.0
    //           height: 30,
    //           data: {
    //             id: configId,
    //             type: "config",
    //           },
    //          });
    //     const [ flowId, patternPart ] = configId.split("-");
    //     const patternId = `${flowId}-${patternPart}`;
    //     g.setEdge(`pattern-${patternId}`, `config-${configId}`, {
    //         label: `pattern-${patternId}-config-${configId}`,
    //     });
    // });

    compiledConfigs.forEach((compiledConfig) => {
      if (!compiledConfig?.configId) return;
      const configId = compiledConfig.configId;
      const label = `Compiled Config ${configId}`;
      g.setNode(`compiled-${configId}`, {
        label: label,
        width: label.length * 8,
        height: 30,
        data: {
          id: configId,
          type: "compiled",
        },
      });
      const [flowId, patternPart] = configId.split("-");
      const patternId = `${flowId}-${patternPart}`;
      g.setEdge(`pattern-${patternId}`, `compiled-${configId}`, {
        label: `pattern-${patternId}-compiled-${configId}`,
      });
    });

    dagre.layout(g);

    const laidOutNodes = g.nodes().map((nodeId) => {
      const { x, y, width, height, label } = g.node(nodeId);
      return {
        id: nodeId,
        label,
        x,
        y,
        width,
        height,
        data: g.node(nodeId).data,
      };
    });
    //   console.log("laidOutNodes", laidOutNodes);
    const laidOutEdges = g.edges().map((edgeObj) => {
      const edgeData = g.edge(edgeObj);
      return {
        from: edgeObj.v,
        to: edgeObj.w,
        points: edgeData.points,
      };
    });
    // console.log("laidOutEdges", laidOutEdges);

    const { width = 0, height = 0 } = g.graph();

    setTreeNav({
      nodes: laidOutNodes,
      edges: laidOutEdges,
      width: width,
      height: height,
    });
  };

  useEffect(() => {
    handleTreeNav();
  }, [flowsMap, patterns, agentsConfig, compiledConfigs, selectedTask]);

  // Helper to build a path string (M x0,y0 L x1,y1 ...)
  const buildEdgePath = (points) => {
    if (!points || points.length === 0) return "";
    const [first, ...rest] = points;
    return (
      `M${first.x},${first.y} ` + rest.map((p) => `L${p.x},${p.y}`).join(" ")
    );
  };

  // Example node click handler
  const handleNodeClick = (node) => {
    // console.log("Node clicked: ", node);
    const layer = node.id.split("-")[0];
    if (layer === "flow") {
      const flowId = node.data.id;
      // console.log("flow node clicked", flowsMap[flowId]);
      console.log("flowmap", flowsMap);
      let patternId = [];
      let configId = [];
      const childrenPatterns = patterns
        .filter((item) => item.patternId && item.patternId.startsWith(flowId))
        .reverse();
      for (const p of childrenPatterns) {
        const childrenConfigs = agentsConfig.filter((item) =>
          item.configId.startsWith(p.patternId)
        );
        if (childrenConfigs.length > 0) {
          patternId = p.patternId;
          configId = childrenConfigs[0]?.configId;
          break;
        }
      }
      setCanvasPages({
        type: "flow",
        flowId: flowId,
        patternId: patternId,
        configId: configId,
      });
      // console.log("canvasPages", canvasPages);
    } else if (layer === "pattern") {
      // console.log("canvasPages when pattern clicked", canvasPages);
      // console.log("flowsMap", flowsMap);
      // console.log("patterns", patterns);
      // console.log("agentsConfig", agentsConfig);
      // console.log("pattern node clicked", patterns.find(item => item.patternId === node.data.id));
      const patternId = node.data.id;
      const flowId = patternId.split("-")[0];
      const childrenConfigs = agentsConfig.filter(
        (item) => item.configId && item.configId.startsWith(patternId)
      );
      setCanvasPages({
        type: "pattern",
        flowId: flowId,
        patternId: patternId,
        configId: childrenConfigs[0]?.configId,
      });
    } else if (layer === "config") {
      // console.log("config node clicked", agentsConfig);
      const configId = node.data.id;
      // console.log("canvasPages when config clicked", canvasPages);
      // console.log("configs", agentsConfig);
      // console.log("config node clicked", agentsConfig.find(item => item.configId === configId));
      const [flowId, patternPart] = configId.split("-");
      const patternId = `${flowId}-${patternPart}`;
      setCanvasPages({
        type: "config",
        flowId: flowId,
        patternId: patternId,
        configId: configId,
      });
    } else if (layer === "compiled") {
      // console.log("compiled node clicked", compiledConfigs);
      const configId = node.data.id;
      // console.log("compiled node clicked", compiledConfigs.find(item => item.configId === configId));
      setCanvasPages({
        type: "compiled",
        configId: configId,
        flowId: configId.split("-")[0],
        patternId: configId.split("-")[0] + "-" + configId.split("-")[1],
      });
    }
  };

  useEffect(() => {
    // console.log("canvasPages", canvasPages);
  }, [canvasPages]);

  const isHighlighted = (node) => {
    // console.log("node", node);
    // console.log("canvasPages clicked", canvasPages);
    // console.log("flowmap", flowsMap);
    if (!canvasPages) {
      return false;
    }
    if (
      canvasPages.type === "flow" &&
      node.data.type === "flow" &&
      node.data.id === canvasPages.flowId.toString()
    ) {
      return true;
    } else if (
      canvasPages.type === "pattern" &&
      node.data.type === "pattern" &&
      node.data.id === canvasPages.patternId
    ) {
      return true;
    } else if (
      canvasPages.type === "config" &&
      node.data.type === "config" &&
      node.data.id === canvasPages.configId
    ) {
      return true;
    } else if (
      canvasPages.type === "compiled" &&
      node.data.type === "compiled" &&
      node.data.id === canvasPages.configId
    ) {
      return true;
    }
    return false;
  };

  const emptyTreeNav = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1px solid #ddd",
          width: "100%",
          height: "500px",
          color: "grey",
        }}
      >
        <Typography variant="h8" sx={{ p: 2 }}>
          Navigation Tree waits for task to be selected
        </Typography>
      </Box>
    );
  };

  return (
    <>
      {treeNav.nodes?.length > 0 ? (
        <svg width={treeNav.width} height={treeNav.height}>
          {/* Render Edges */}
          {treeNav.edges?.map((edge, idx) => {
            const pathData = buildEdgePath(edge.points);
            return (
              <path
                key={idx}
                d={pathData}
                stroke="black"
                fill="none"
                style={{ pointerEvents: "none" }}
                className="edge-path"
              />
            );
          })}

          {/* Render Nodes */}
          {treeNav.nodes?.map((node) => {
            const nodeX = node.x - node.width / 2;
            const nodeY = node.y - node.height / 2;

            return (
              <g
                key={node.id}
                transform={`translate(${nodeX}, ${nodeY})`}
                className="node-group"
              >
                <rect
                  className="node-rect"
                  width={node.width}
                  height={node.height}
                  fill={isHighlighted(node) ? "lightblue" : "white"}
                  stroke="black"
                  onClick={() => handleNodeClick(node)}
                />
                <text
                  x={node.width / 2}
                  y={node.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ pointerEvents: "none" }}
                  className="node-text"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        emptyTreeNav()
      )}
    </>
  );
};

export default TreeNav;
