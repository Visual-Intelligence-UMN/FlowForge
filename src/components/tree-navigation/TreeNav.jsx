import { useAtom } from "jotai";
import {
  flowsMapAtom,
  patternsAtom,
  agentsConfigAtom,
  treeNavAtom,
  selectedTaskAtom,
  canvasPagesAtom,
  compiledConfigsAtom,
  flowUserRatingAtom,
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
  const [flowUserRating, setFlowUserRating] = useAtom(flowUserRatingAtom);

  const handleTreeNav = () => {
    const g = new Graph();
    g.setGraph({
      rankdir: "TB", // top to bottom
      nodesep: 30, // node spacing
      ranksep: 30, // level spacing
    });

    // TESTING ONLY
    setFlowUserRating({
      1: { compiledId: "1-1-1", userRating: "4" },
      2: { compiledId: "1-2-1", userRating: "5" },
    });

    if (Object.keys(selectedTask).length > 0) {
      g.setNode(`task-${selectedTask.id}`, {
        label: selectedTask.name,
        width: selectedTask.name.length * 8,
        height: 30,
        data: {
          type: "task",
        },
      });
    }

    Object.keys(flowsMap).forEach((flowId) => {
      if (!flowId) return;
      const flow = Object.values(flowsMap).find(
        (flow) => flow.taskFlowId.toString() === flowId
      );
      const steps = Object.keys(flow.taskFlowSteps).length;
      const label = `Flow ${flowId} (${steps} Steps)`;
      g.setNode(`flow-${flowId}`, {
        label: label,
        data: {
          id: flowId,
          type: "flow",
        },
        width: label.length * 8,
        height: 30,
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
      const configLabel = `Compiled Config ${configId}`;
      g.setNode(`compiled-${configId}`, {
        label: configLabel,
        width: configLabel.length * 8,
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

      const config = Object.values(flowUserRating).find(
        (config) => config.compiledId === configId
      );
      const rating = config?.userRating || null;
      const ratingLabel = rating
        ? `User Rating: ${config?.userRating} ⭐`
        : "User Rating: N/A";
      g.setNode(`compiled-${configId}-rating`, {
        label: ratingLabel,
        width: ratingLabel.length * 8,
        height: 30,
        data: {
          id: configId,
          type: "rating",
        },
      });
      g.setEdge(`compiled-${configId}`, `compiled-${configId}-rating`, {
        label: `compiled-${configId}-rating`,
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

  const handleDeleteNode = (selected) => {
    if (!selected || !selected.type) return;

    const {
      type: canvasType,
      flowId: canvasFlowId,
      patternId: canvasPatternId,
      configId: canvasConfigId,
    } = canvasPages;
    const { type, flowId, patternId, configId } = selected;

    switch (type) {
      case "task":
        alert("You cannot delete the task node!");
        break;

      case "flow":
        if (Object.keys(flowsMap).length == 1) {
          alert("You cannot delete the last remaining flow.");
          break;
        }
        setFlowsMap((prev) => {
          const copy = { ...prev };
          delete copy[flowId];
          if (flowId == canvasFlowId) {
            setCanvasPages({
              type: type,
              flowId: Object.keys(copy)[0],
              patternId: null,
              configId: null,
            });
          }
          return copy;
        });
        setPatterns((prev) =>
          prev.filter((p) => !p.patternId.startsWith(`${flowId}-`))
        );
        setAgentsConfig((prev) =>
          prev.filter((cfg) => !cfg.configId.startsWith(`${flowId}-`))
        );
        setCompiledConfigs((prev) =>
          prev.filter((c) => !c.configId.startsWith(`${flowId}-`))
        );
        break;

      case "pattern":
        setPatterns((prev) => {
          const copy = [...prev];
          const filteredCopy = copy.filter((p) => p.patternId !== patternId);
          if (patternId == canvasPatternId) {
            setCanvasPages({
              type: filteredCopy.length == 0 ? "flow" : "pattern",
              flowId: canvasFlowId,
              patternId: filteredCopy[0]?.patternId || null,
              configId: canvasConfigId,
            });
          }
          return filteredCopy;
        });
        setAgentsConfig((prev) =>
          prev.filter((cfg) => !cfg.configId.startsWith(patternId))
        );
        setCompiledConfigs((prev) =>
          prev.filter((c) => !c.configId.startsWith(patternId))
        );
        break;

      case "compiled":
        setCompiledConfigs((prev) => {
          const copy = [...prev];
          const filteredCopy = copy.filter((c) => c.configId !== configId);
          if (configId == canvasConfigId) {
            setCanvasPages({
              type: filteredCopy.length == 0 ? "pattern" : "compiled",
              flowId: canvasFlowId,
              patternId: canvasPatternId,
              configId: filteredCopy[0]?.configId || null,
            });
          }
          return filteredCopy;
        });
        break;

      default:
        break;
    }
  };

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
      console.log("flow node clicked", flowsMap);

      const flowId = node.data.id;
      // Find a patternId/configId you want as the default
      let patternId = null;
      let configId = null;

      // Example: pick the last pattern for that flow that has some agent configs
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
      console.log(
        "pattern node clicked",
        patterns.find((item) => item.patternId === node.data.id)
      );
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
      console.log(
        "compiled node clicked",
        compiledConfigs.find((item) => item.configId === configId)
      );
      setCanvasPages({
        type: "compiled",
        configId: configId,
        flowId: configId.split("-")[0],
        patternId: configId.split("-")[0] + "-" + configId.split("-")[1],
      });
    }
  };

  const handleRightClick = (event, node) => {
    event.preventDefault(); // Prevent browser context menu

    const layer = node.id.split("-")[0];
    let selectedNode = {
      type: null,
      flowId: null,
      patternId: null,
      configId: null,
    };

    if (layer === "flow") {
      console.log("flow node right-clicked", flowsMap);

      selectedNode.type = "flow";
      selectedNode.flowId = node.data.id;
    } else if (layer === "pattern") {
      console.log(
        "pattern node right-clicked",
        patterns.find((item) => item.patternId === node.data.id)
      );

      selectedNode.type = "pattern";
      selectedNode.patternId = node.data.id;
      selectedNode.flowId = node.data.id.split("-")[0];
    } else if (layer === "config") {
      console.log(
        "config node right-clicked",
        agentsConfig.find((item) => item.configId === node.data.id)
      );

      selectedNode.type = "config";
      selectedNode.configId = node.data.id;
      const [flowId, patternPart] = node.data.id.split("-");
      selectedNode.patternId = `${flowId}-${patternPart}`;
      selectedNode.flowId = flowId;
    } else if (layer === "compiled") {
      console.log(
        "compiled node right-clicked",
        compiledConfigs.find((item) => item.configId === node.data.id)
      );

      selectedNode.type = "compiled";
      selectedNode.configId = node.data.id;
      selectedNode.flowId = node.data.id.split("-")[0];
      selectedNode.patternId =
        node.data.id.split("-")[0] + "-" + node.data.id.split("-")[1];
    }

    if (!selectedNode.type) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedNode.type} ${selectedNode.flowId}?\n\nWARNING: All child nodes will be deleted.`
    );
    if (!confirmDelete) return;

    handleDeleteNode(selectedNode);
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

  const emptyTreeNav = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid #ddd",
        width: "100%",
        height: "70vh",
        color: "grey",
      }}
    >
      <Typography variant="h8" sx={{ p: 2 }}>
        Navigation Tree waits for task to be selected
      </Typography>
    </Box>
  );

  return (
    <>
      {treeNav.nodes?.length > 0 ? (
        <Box
          sx={{
            width: "100%",
            height: "70vh",
            justifyContent: "center",
            overflow: "auto",
            pl: 4,
            pr: 4,
          }}
        >
          <svg width={treeNav.width} height={treeNav.height}>
            {/* Edges */}
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

            {/* Nodes */}
            {treeNav.nodes?.map((node) => {
              const nodeX = node.x - node.width / 2;
              const nodeY = node.y - node.height / 2;

              return (
                <g
                  key={node.id}
                  transform={`translate(${nodeX}, ${nodeY})`}
                  className="node-group"
                  onContextMenu={(event) => handleRightClick(event, node)}
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
        </Box>
      ) : (
        emptyTreeNav()
      )}
    </>
  );
};

export default TreeNav;
