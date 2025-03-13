import dagre from 'dagre';

/**
 * Layout using Dagre, clustering nodes by step (ex: 'step-1-node-X' → step = '1')
 * and ensuring supervision pattern nodes (Supervisor + Workers) stay close.
 * Additionally, all step clusters are forced to share the same horizontal alignment.
 */
export const layoutDagre = (nodes, edges, direction = 'LR') => {
  // 1) Initialize Dagre with compound graph = true (so we can use clusters).
  const dagreGraph = new dagre.graphlib.Graph({ multigraph: true, compound: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const defaultNodeWidth = 300;
  const defaultNodeHeight = 510;

  // Tweak ranksep (distance between clusters/steps) and nodesep (distance between nodes in same cluster).
  dagreGraph.setGraph({
    rankdir: direction,  // 'LR' = left-to-right
    ranksep: 200,        // bigger gap between steps
    nodesep: 100         // smaller gaps among nodes within a step
  });

  // Separate group vs. non-group
  const groupNodes = nodes.filter((n) => n.type === 'group');
  const nonGroupNodes = nodes.filter((n) => n.type !== 'group');

  // Extract "step" from a node's ID, e.g. "step-1-node-Supervisor" -> step = "1"
  const getStepFromId = (nodeId) => {
    // Feel free to adjust this regex if your ID format is different
    const match = nodeId.match(/step-(\d+)/);
    return match?.[1] ?? 'unknown';
  };

  // 2) Collect unique steps
  const steps = new Set(nonGroupNodes.map((n) => getStepFromId(n.id)));

  // Add each step as a "cluster node" in Dagre
  steps.forEach((step) => {
    dagreGraph.setNode(`cluster-${step}`, {
      label: `step-${step}`,
      clusterLabelPos: 'top'
    });
  });

  // 3) Add non-group nodes into the graph
  nonGroupNodes.forEach((node) => {
    const width = node.measured?.width ?? defaultNodeWidth;
    const height = node.measured?.height ?? defaultNodeHeight;
    dagreGraph.setNode(node.id, { width, height });

    // Place into that step's cluster
    const step = getStepFromId(node.id);
    dagreGraph.setParent(node.id, `cluster-${step}`);
  });

  // 4) Add edges into Dagre
  edges.forEach((edge) => {
    // If you need distinct edges in a multigraph, pass a unique name as 4th param
    dagreGraph.setEdge(edge.source, edge.target, {}, edge.id || undefined);
  });

  // 5) Compute layout
  dagre.layout(dagreGraph);

  // 6) Apply the Dagre-computed positions to your non-group nodes
  let layoutedNonGroupNodes = nonGroupNodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    const w = node.measured?.width ?? defaultNodeWidth;
    const h = node.measured?.height ?? defaultNodeHeight;

    return {
      ...node,
      position: {
        x: dagreNode.x - w / 2,
        y: dagreNode.y - h / 2
      },
      style: {
        ...node.style,
        position: 'absolute'
      }
    };
  });

  // === Custom step: post-process each step to group Supervisor + Workers ===
  // For each step cluster, we look for "supervision-Supervisor" and any "supervision-Worker" nodes,
  // and forcibly place them close together (supervisor above, workers in a row).
  // This ensures they don't end up scattered by Dagre’s default approach.
  const verticalGap = 50;
  const horizontalGap = 50;

  steps.forEach((step) => {
    const clusterNodes = layoutedNonGroupNodes.filter(
      (n) => getStepFromId(n.id) === step
    );
    if (!clusterNodes.length) return;

    // Possibly you only expect one Supervisor per step, but we’ll gather them just in case
    const supervisorNodes = clusterNodes.filter(
      (n) => n.data?.pattern === 'supervision-Supervisor'
    );
    const workerNodes = clusterNodes.filter(
      (n) => n.data?.pattern?.includes('supervision-Worker')
    );

    // If exactly one supervisor, place the workers in a horizontal row below it
    if (supervisorNodes.length === 1 && workerNodes.length > 0) {
      const [supervisorNode] = supervisorNodes;
      const supWidth = supervisorNode.measured?.width ?? defaultNodeWidth;
      const supHeight = supervisorNode.measured?.height ?? defaultNodeHeight;

      // Keep the supervisor’s X from Dagre, and re-center the workers beneath it
      const supervisorCenterX = supervisorNode.position.x + supWidth / 2;
      const rowY = supervisorNode.position.y + supHeight + verticalGap;

      // Sort workers by their current X to keep them in a left-to-right sequence
      workerNodes.sort((a, b) => a.position.x - b.position.x);

      // Calculate total width of workers placed in a row
      const totalWorkersWidth = workerNodes.reduce((acc, wNode) => {
        const wW = wNode.measured?.width ?? defaultNodeWidth;
        return acc + wW;
      }, 0) + horizontalGap * (workerNodes.length - 1);

      // Starting X so that all workers are centered under the supervisor
      let curX = supervisorCenterX - totalWorkersWidth / 2;

      // Update worker positions
      workerNodes.forEach((wNode) => {
        const wW = wNode.measured?.width ?? defaultNodeWidth;
        wNode.position.x = curX;
        wNode.position.y = rowY;
        curX += wW + horizontalGap;
      });
    }
    // If multiple supervisors or none, you can skip or do your own logic.
  });

  // === New step: Adjust clusters to have the same horizontal (y) alignment ===
  // Determine a global baseline (smallest y among all clusters)...
  const allStepBaselines = [];
  steps.forEach((step) => {
    const clusterNodes = layoutedNonGroupNodes.filter(n => getStepFromId(n.id) === step);
    if (clusterNodes.length) {
      // Use the topmost (smallest) y value as the baseline for this cluster
      const baseline = Math.min(...clusterNodes.map(n => n.position.y));
      allStepBaselines.push(baseline);
    }
  });
  if (allStepBaselines.length) {
    const globalBaseline = Math.min(...allStepBaselines);
    // For each cluster, shift nodes so that their top aligns with the globalBaseline
    steps.forEach((step) => {
      const clusterNodes = layoutedNonGroupNodes.filter(n => getStepFromId(n.id) === step);
      if (clusterNodes.length) {
        const clusterBaseline = Math.min(...clusterNodes.map(n => n.position.y));
        const deltaY = globalBaseline - clusterBaseline;
        clusterNodes.forEach(n => {
          n.position.y += deltaY;
        });
      }
    });
  }

  // 7) Recombine potentially adjusted node positions
  layoutedNonGroupNodes = [...layoutedNonGroupNodes];

  // 8) Layout group nodes to encapsulate their children (same as your original logic)
  const layoutedGroupNodes = groupNodes.map((groupNode) => {
    const children = layoutedNonGroupNodes.filter(
      (n) => n.parentNode === groupNode.id || n.parentId === groupNode.id
    );
    if (!children.length) {
      return {
        ...groupNode,
        style: { ...groupNode.style, position: 'absolute' }
      };
    }

    const padding = 20;
    const minX = Math.min(...children.map((n) => n.position.x)) - padding;
    const minY = Math.min(...children.map((n) => n.position.y)) - padding;
    const maxX = Math.max(
      ...children.map((n) => n.position.x + (n.measured?.width ?? defaultNodeWidth))
    ) + padding;
    const maxY = Math.max(
      ...children.map((n) => n.position.y + (n.measured?.height ?? defaultNodeHeight))
    ) + padding;

    // Shift children to be relative to group top-left (0,0)
    children.forEach((child) => {
      child.position = {
        x: child.position.x - minX,
        y: child.position.y - minY
      };
    });

    return {
      ...groupNode,
      position: { x: minX, y: minY },
      style: {
        ...groupNode.style,
        width: maxX - minX,
        height: maxY - minY,
        position: 'absolute'
      }
    };
  });

  const layoutedNodes = [...layoutedNonGroupNodes, ...layoutedGroupNodes];
  return { nodes: layoutedNodes, edges };
};
