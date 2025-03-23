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
  multiStreamOutputAtom,
} from "../../patterns/GlobalStates";
import { Graph } from "graphlib";
import * as dagre from "dagre";
import { useEffect } from "react";
import "./tree.css";
import { Typography, Box } from "@mui/material";
import TreeNode from "./TreeNode";
import * as d3 from "d3";

import DimScatter from "./DimScatter";
import { 
  getTaskSteps,
  getAgentSteps,
  getCallsCountForStep,
  getAgentMaxCalls,
  getAgentRuntime
 } from "./helpers";

const TreeNav = () => {
  const [treeNav, setTreeNav] = useAtom(treeNavAtom);
  const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);
  const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
  const [patterns, setPatterns] = useAtom(patternsAtom);
  const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
  const [compiledConfigs, setCompiledConfigs] = useAtom(compiledConfigsAtom);
  const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);
  const [flowUserRating, setFlowUserRating] = useAtom(flowUserRatingAtom);
  const [multiStreamOutput, setMultiStreamOutput] = useAtom(multiStreamOutputAtom);


  const config = {
    minStepRadius: 5,
    maxStepRadius: 15,
    maxStepNodeWidth: 40
  }
  const NodeHeight = 40;
  const TextHeight = 15
  const RankSep = 40;

  let maxStepNum = 0
  Object.keys(flowsMap).forEach((flowId) => {
    if (!flowId) return;
    const flow = flowsMap[flowId];
    if (!flow || !Array.isArray(flow.taskFlowSteps)) return;  // ensure valid flow and steps array
    const steps = Object.keys(flow.taskFlowSteps).length;
    maxStepNum = Math.max(maxStepNum, steps);
  });


  let maxAgentSteps = 0
  patterns.forEach((pattern) => {
    if (!pattern?.patternId) return;
    const agentSteps = getAgentSteps(pattern)
    maxAgentSteps = Math.max(maxAgentSteps, agentSteps.length);
  });
 

  const stepRScale = d3.scalePow().exponent(1 / 2)
    .domain([0, maxStepNum])
    .range([0, config.maxStepRadius]);

  //TODO: remove dummy data later
  const dummyAgentSteps = [
    [1, 2, 1],
    [1, 4, 1, 2],
    [1, 2, 3, 2, 1],
    [1, 3, 4, 2, 2],
  ]
  const agentXScale = d3.scaleBand()
    // .domain(d3.range(0, Math.max(...dummyAgentSteps.map(d => d.length)) + 1)) // change to true number of agent steps later
    .domain(d3.range(0, maxStepNum + 1))
    .range([0, config.maxStepNodeWidth])
    .padding(0.1);

  const agentYScale = d3.scaleLinear()
    // .domain([0, Math.max(...dummyAgentSteps.flat())]) // change to true number of agent steps later
    .domain([0, maxAgentSteps + 1])
    .range([0, NodeHeight - 2]); // 2px padding


  const handleTreeNav = () => {
    const g = new Graph();
    g.setGraph({
      rankdir: "TB", // top to bottom
      nodesep: NodeHeight, // node spacing
      ranksep: RankSep, // level spacing
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
        height: NodeHeight + TextHeight,
        data: {
          type: "task",
        },
      });
    }


    
    Object.keys(flowsMap).forEach((flowId) => {
      if (!flowId) return;
      const flow = flowsMap[flowId];
      // if (!flow || !Array.isArray(flow.taskFlowSteps)) return;  // ensure valid flow and steps array
      const steps = Object.keys(flow.taskFlowSteps).length;
      const label = `Flow ${flowId}`;
      const taskSteps = getTaskSteps(flow)
      // taskSteps = Object.keys(flow.taskFlowSteps).map(_ => Math.random() < 0.5 ? 1 : 2) // TODO: replace with actual steps
      console.log("taskSteps for flow", flow, taskSteps)
      g.setNode(`flow-${flowId}`, {
        label: label,
        data: {
          ...flow.taskFlowSteps, // keep original data for easy access
          id: flowId,
          type: "flow",
          taskSteps,
          dims: {
            'taskStepNum': taskSteps.length
          }
        },
        // width: label.length * 8,
        width: stepRScale(steps) * 6,
        height: NodeHeight + TextHeight,
      });
      g.setEdge(`task-${selectedTask.id}`, `flow-${flowId}`, {
        label: `task-${selectedTask.id}-flow-${flowId}`,
      });
    });

    patterns.forEach((pattern) => {
      if (!pattern?.patternId) return;
      const patternID = pattern.patternId;
      const label = `Agents ${patternID}`;
      // const agentSteps = dummyAgentSteps[Math.floor(Math.random() * dummyAgentSteps.length)] //TODO: replace with actual agent steps
      const taskSteps = getTaskSteps(pattern)
      const agentSteps = getAgentSteps(pattern)
      const agentMaxCalls = getAgentMaxCalls(pattern)
      const agentRuntime = getAgentRuntime(pattern)
      console.log("maxCalls, runtime for pattern", pattern, agentMaxCalls, agentRuntime)
      // const agentStepNum = Math.max(...agentSteps)
      g.setNode(`pattern-${patternID}`, {
        label: label,
        // width: label.length * 8,
        width: Math.max(label.length * 8, agentXScale(agentSteps.length) + agentXScale.bandwidth()),
        height: NodeHeight + TextHeight,
        data: {
          ...pattern, // keep original data for easy access
          id: patternID,
          type: "pattern",
          //TODO: these dim info should be available in the pattern data (...pattern ), ideally no need to calculate again here
          agentSteps,
          //TODO: the pattern node should be able to access the task step number from the flow node
          dims: {
            'taskStepNum': taskSteps.length, 
            // 'agentStepNum': agentSteps.length,
            'agentStepNum': agentMaxCalls.reduce((acc, curr) => acc + curr, 0),
            'maxCalls': agentMaxCalls.reduce((acc, curr) => acc + curr, 0),
            'runtime': agentRuntime.reduce((acc, curr) => acc + curr, 0)
          }
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
    //           height: NodeHeight + TextHeight,
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
      const configLabel = `Config ${configId}`;

      const flowWithConfig = agentsConfig.find(item => item.configId === configId)
      console.log("flowWithConfig", flowWithConfig)
      const taskSteps = getTaskSteps(flowWithConfig)
      const agentSteps = getAgentSteps(flowWithConfig)
      // const {maxCalls, runtime} = getCallsCountForStep(flowWithConfig)

      console.log("multiStreamOutput", multiStreamOutput)
      const configOutput = multiStreamOutput[String(configId)]
      const userRating = configOutput?.userRating ?? 0
      const timeUsed = configOutput?.timeUsed ?? 0
      console.log("configOutput", configOutput)

      g.setNode(`compiled-${configId}`, {
        label: configLabel,
        width: configLabel.length * 8,
        height: NodeHeight + TextHeight,
        data: {
          id: configId,
          type: "compiled",
        },
        dims: {
          'taskStepNum': taskSteps.length,
          'agentStepNum': agentSteps.length,
          'userRating': userRating,
          'timeUsed': timeUsed,
          // 'maxCalls': maxCalls,
          // 'runtime': runtime,
        }
      });
      const [flowId, patternPart] = configId.split("-");
      const patternId = `${flowId}-${patternPart}`;
      g.setEdge(`pattern-${patternId}`, `compiled-${configId}`, {
        label: `pattern-${patternId}-compiled-${configId}`,
      });

      const ratingLabel = userRating
        ? `Running Results: ${userRating} ⭐`
        : "Running Results: N/A";
      g.setNode(`compiled-${configId}-rating`, {
        label: ratingLabel,
        width: ratingLabel.length * 8,
        height: NodeHeight + TextHeight,
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
  }, [flowsMap, patterns, agentsConfig, compiledConfigs, selectedTask, multiStreamOutput]);

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
      `M${first.x},${first.y} Q` + rest.map((p) => `${p.x},${p.y}`).join(" ")
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
      const flowWithConfig = agentsConfig.find((item) => item.configId === configId)
      console.log(
        "compiled node clicked (with config)",
        compiledConfigs.find((item) => item.configId === configId),
        flowWithConfig
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

  // console.info('treeNav', treeNav)
  return treeNav.nodes?.length > 0 &&
    <>
      <Box
        className="tree-nav"
        sx={{
          width: "100%",
          justifyContent: "center",
          height: (NodeHeight + TextHeight) * 5 + RankSep * 4,
          display: "flex",
          alignItems: "flex-start",
          overflow: "auto",
        }}
      >
        <svg width={treeNav.width + 10} height={treeNav.height + 10}>
          {/* Edges */}
          <g className="tree" transform="translate(5, 5)">
            <g className="edge-group">
              {treeNav.edges?.map((edge, idx) => {
                const pathData = buildEdgePath(edge.points);
                return (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={pathData}
                    strokeWidth={1}
                    fill="none"
                    style={{ pointerEvents: "none" }}
                    className="tree edge-path"
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g className="node-group">
              {treeNav.nodes?.map((node) => {
                const nodeX = node.x - node.width / 2;
                const nodeY = node.y - node.height / 2;

                return (
                  <g
                    key={node.label}
                    transform={`translate(${nodeX + node.width / 2}, ${nodeY + NodeHeight / 2})`}
                    className="node-group"
                    onContextMenu={(event) => handleRightClick(event, node)}
                    onClick={() => handleNodeClick(node)}
                  >
                    {node.data.type != 'task' && !node.label.includes("Running Results") &&
                      <TreeNode node={node} isHighlighted={isHighlighted(node)} stepRScale={stepRScale} agentXScale={agentXScale} agentYScale={agentYScale} />}


                    <text
                      x={0}
                      y={node.label.includes("Running Results") ? - 10 : NodeHeight / 2 + TextHeight / 2}
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
            </g>
          </g>
        </svg>
      </Box >
      <DimScatter treeNav={treeNav} isHighlighted={isHighlighted} stepRScale={stepRScale} agentXScale={agentXScale} agentYScale={agentYScale} />
    </>

};

export default TreeNav;
