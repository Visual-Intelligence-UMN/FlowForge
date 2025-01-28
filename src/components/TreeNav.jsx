import { useAtom } from "jotai";
import { flowsMapAtom, patternsAtom, agentsConfigAtom, treeNavAtom, selectedTaskAtom, canvasPagesAtom, compiledConfigsAtom } from "../global/GlobalStates";
import { Graph } from "graphlib";
import * as dagre from "dagre";
import { useEffect } from "react";

const TreeNav = () => {
    const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
    const [patterns, setPatterns] = useAtom(patternsAtom);
    const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
    const [compiledConfigs, setCompiledConfigs] = useAtom(compiledConfigsAtom);
    const [selectedTask, setSelectedTask] = useAtom(selectedTaskAtom);
    const [treeNav, setTreeNav] = useAtom(treeNavAtom);
    const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);

    const handleTreeNav = () => {
        const g = new Graph();
        g.setGraph({
            rankdir: "TB",
            nodesep: 30,
            ranksep: 30,
        });

        if (Object.keys(selectedTask).length > 0) {
            // console.log("selectedTask", selectedTask);
            g.setNode(`task-${selectedTask.id}`, 
                { label: selectedTask.name, 
                  width: 80, 
                  height: 40, 
                  data: {
                    type: "task",
                  },
                });
        }


        Object.keys(flowsMap).forEach((flowId) => {
            if (!flowId) return;
            const label = flowId;
            g.setNode(`flow-${flowId}`, 
                { label: `Flow ${flowId}`, 
                  data: {
                    id: flowId,
                    type: "flow",
                  },
                  width: 80, 
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
            g.setNode(`pattern-${patternID}`, 
                { 
                    label: label, 
                    width: 100, 
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

        agentsConfig.forEach((config) => {
            if (!config?.configId) return;
            const configId = config.configId;
            const label = `Agents Config ${configId}`;
            g.setNode(`config-${configId}`, 
                { label: label, 
                  width: 100, 
                  height: 30, 
                  data: {
                    id: configId,
                    type: "config",
                  },
                 });
            const [ flowId, patternPart ] = configId.split("-");
            const patternId = `${flowId}-${patternPart}`;
            g.setEdge(`pattern-${patternId}`, `config-${configId}`, {
                label: `pattern-${patternId}-config-${configId}`,
            });
        });
        // console.log("g.nodes()", g.nodes());
        // console.log("g.edges()", g.edges());
        compiledConfigs.forEach((compiledConfig) => {
            if (!compiledConfig?.configId) return;
            const configId = compiledConfig.configId;
            const label = `Compiled Config ${configId}`;
            g.setNode(`compiled-${configId}`, 
                { label: label, 
                  width: 100, 
                  height: 30, 
                  data: {
                    id: configId,
                    type: "compiled",
                  },
                });
            g.setEdge(`config-${configId}`, `compiled-${configId}`, {
                label: `config-${configId}-compiled-${configId}`,
            });
        });

        dagre.layout(g);

        const laidOutNodes = g.nodes().map((nodeId) => {
            const { x, y, width, height, label } = g.node(nodeId);
            return { id: nodeId, label, x, y, width, height, data: g.node(nodeId).data};
          });
        //   console.log("laidOutNodes", laidOutNodes);
        const laidOutEdges = g.edges().map((edgeObj) => {
            const edgeData = g.edge(edgeObj);
            return { 
                from: edgeObj.v,
                to: edgeObj.w,
                points: edgeData.points
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
    }


    useEffect(() => {
        handleTreeNav();
    }, [flowsMap, patterns, agentsConfig, compiledConfigs, selectedTask]);

    // Helper to build a path string (M x0,y0 L x1,y1 ...)
  const buildEdgePath = (points) => {
    if (!points || points.length === 0) return "";
    const [first, ...rest] = points;
    return (
      `M${first.x},${first.y} ` +
      rest.map((p) => `L${p.x},${p.y}`).join(" ")
    );
  };

  // Example node click handler
  const handleNodeClick = (node) => {
    console.log("Node clicked: ", node);
    const layer = node.id.split("-")[0];
    if (layer === "flow") {
        const flowId = node.data.id;
        let patternId = [];
        let configId = [];
        const childrenPatterns = patterns.filter(
            (item) => item.patternId && item.patternId.startsWith(flowId)
        ).reverse();
        for (const p of childrenPatterns) {
            const childrenConfigs = agentsConfig.filter(
                (item) => item.configId.startsWith(p.patternId)
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
    } else if (layer === "pattern") {
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
        const configId = node.data.id;
        const [ flowId, patternPart ] = configId.split("-");
        const patternId = `${flowId}-${patternPart}`;
        setCanvasPages({
            type: "config",
            flowId: flowId,
            patternId: patternId,
            configId: configId,
        });
    } else if (layer === "compiled") {
        const configId = node.data.id;
        setCanvasPages({
            type: "compiled",
            configId: configId,
            ...canvasPages,
        });
    }
  };

  useEffect(() => {
    console.log("canvasPages", canvasPages);

  }, [canvasPages]);

  const isHighlighted = (node) => {
    if (canvasPages.type === "flow" && node.data.type === "flow" && node.data.id === canvasPages.flowId.toString()) {
        return true;
    } else if (canvasPages.type === "pattern" && node.data.type === "pattern" && node.data.id === canvasPages.patternId) {
        return true;
    } else if (canvasPages.type === "config" && node.data.type === "config" && node.data.id === canvasPages.configId) {
        return true;
    } else if (canvasPages.type === "compiled" && node.data.type === "compiled" && node.data.id === canvasPages.configId) {
        return true;
    }
    return false;
  }

  return (
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
          >
            <rect
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
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default TreeNav;