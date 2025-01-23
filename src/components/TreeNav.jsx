import { useAtom } from "jotai";
import { flowsMapAtom, patternsAtom, agentsConfigAtom, treeNavAtom } from "../global/GlobalStates";
import { Graph } from "graphlib";
import * as dagre from "dagre";
import { useEffect } from "react";

const TreeNav = () => {
    const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
    const [patterns, setPatterns] = useAtom(patternsAtom);
    const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
    const [treeNav, setTreeNav] = useAtom(treeNavAtom);

    const handleTreeNav = () => {
        const g = new Graph();
        g.setGraph({
            rankdir: "TB",
            nodesep: 30,
            ranksep: 30,
        });

        Object.keys(flowsMap).forEach((flowId) => {
            if (!flowId) return;
            const label = `Task Flow ${flowId}`;
            g.setNode(`flow-${flowId}`, 
                { label: label, 
                  width: 80, 
                  height: 40, 
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
                });
            const flowId = patternID.split("-")[0];
            g.setEdge(`flow-${flowId}`, `pattern-${patternID}`);
        });

        agentsConfig.forEach((config) => {
            if (!config?.configId) return;
            const configId = config.configId;
            const label = `Agents Config ${configId}`;
            g.setNode(`config-${configId}`, 
                { label: label, 
                  width: 100, 
                  height: 30, 
                 });
            const [ flowId, patternPart ] = configId.split("-");
            const patternId = `${flowId}-${patternPart}`;
            g.setEdge(`pattern-${patternId}`, `config-${configId}`);
        });
        console.log("g.nodes()", g.nodes());
        console.log("g.edges()", g.edges());
        dagre.layout(g);

        const laidOutNodes = g.nodes().map((nodeId) => {
            const { x, y, width, height, label } = g.node(nodeId);
            return { id: nodeId, label, x, y, width, height };
          });
          console.log("laidOutNodes", laidOutNodes);
        const laidOutEdges = g.edges().map((edgeObj) => {
            const edgeData = g.edge(edgeObj);
            console.log("laidOutEdges", laidOutEdges);
            return { 
            from: edgeObj.v,
            to: edgeObj.w,
            points: edgeData.points
            };
        });
      
        const { width = 0, height = 0 } = g.graph();

        setTreeNav({
            nodes: laidOutNodes,
            edges: laidOutEdges,
            width: width,
            height: height,
        });
    }


    useEffect(() => {
        console.log("flowsMap", flowsMap);
        console.log("patterns", patterns);
        console.log("agentsConfig", agentsConfig);
    }, [flowsMap, patterns, agentsConfig]);

    useEffect(() => {
        handleTreeNav();
    }, [flowsMap, patterns, agentsConfig]);

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
  };

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
            // pointerEvents "none" ensures the path doesn't block the node's onClick
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
              fill="white"
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