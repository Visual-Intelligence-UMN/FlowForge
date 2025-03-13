import dagre from 'dagre';
export const layoutDagre = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const defaultNodeWidth = 300;
  const defaultNodeHeight = 420;

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 300,
    nodesep: 200
  });

  const groupNodes = nodes.filter((node) => node.type === 'group');
  const nonGroupNodes = nodes.filter((node) => node.type !== 'group');

  // Set each non-group node in dagre
  nonGroupNodes.forEach((node) => {
    const width = node.measured?.width ?? defaultNodeWidth;
    const height = node.measured?.height ?? defaultNodeHeight;
    dagreGraph.setNode(node.id, { width, height });
  });

  // Set edges in dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Compute layout via dagre
  dagre.layout(dagreGraph);

  // Apply positions computed by dagre
  const layoutedNonGroupNodes = nonGroupNodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        // Adjust to get the top-left corner:
        x: dagreNode.x - (node.measured?.width ?? defaultNodeWidth) / 2,
        y: dagreNode.y - (node.measured?.height ?? defaultNodeHeight) / 2
      },
      style: {
        ...node.style,
        position: 'absolute'
      }
    };
  });

  // === Additional adjustment for supervision nodes ===
  // Identify the supervisor node and all worker nodes.
  const supervisorNode = layoutedNonGroupNodes.find(
    (node) => node.data.pattern === 'supervision-Supervisor'
  );
  const workerNodes = layoutedNonGroupNodes.filter(
    (node) => node.data.pattern.includes('supervision-Worker')
  );

  if (supervisorNode) {
    const verticalGap = 50; // gap between supervisor and workers
    const horizontalGap = 50; // gap between adjacent worker nodes
    const supervisorWidth = supervisorNode.measured?.width ?? defaultNodeWidth;
    const supervisorHeight = supervisorNode.measured?.height ?? defaultNodeHeight;
    const supervisorCenterX = supervisorNode.position.x + supervisorWidth / 2;
    
    // Try to locate the next step node:
    // (i.e. a node that is not a worker, not the supervisor itself, and that lies further right)
    const nextStepCandidate = layoutedNonGroupNodes
      .filter((node) => {
        return (
          node.id !== supervisorNode.id &&
          !node.data.pattern.includes('supervision-Worker') &&
          node.position.x > supervisorNode.position.x
        );
      })
      .sort((a, b) => a.position.x - b.position.x)[0];

    if (nextStepCandidate) {
      // Align the supervisor's y coordinate with that of the next step node.
      supervisorNode.position.y = nextStepCandidate.position.y;
    }

    // Arrange worker nodes under the supervisor:
    if (workerNodes.length > 0) {
      // Calculate total width required for worker nodes.
      const totalWorkersWidth =
        workerNodes.reduce(
          (sum, node) => sum + (node.measured?.width ?? defaultNodeWidth),
          0
        ) + horizontalGap * (workerNodes.length - 1);

      // The starting x coordinate for the first worker to center them under the supervisor.
      let currentX = supervisorCenterX - totalWorkersWidth / 2;
      // Place workers below the (possibly realigned) supervisor.
      const workerY = supervisorNode.position.y + supervisorHeight + verticalGap;

      workerNodes.forEach((workerNode) => {
        const nodeWidth = workerNode.measured?.width ?? defaultNodeWidth;
        workerNode.position.x = currentX;
        workerNode.position.y = workerY;
        currentX += nodeWidth + horizontalGap;
      });
    }
  }
  // =======================================================

  // Process group nodes to encapsulate their children.
  const layoutedGroupNodes = groupNodes.map((groupNode) => {
    const childNodes = layoutedNonGroupNodes.filter(
      (node) => node.parentNode === groupNode.id || node.parentId === groupNode.id
    );

    if (childNodes.length > 0) {
      const padding = 20;
      const minX = Math.min(...childNodes.map((n) => n.position.x)) - padding;
      const minY = Math.min(...childNodes.map((n) => n.position.y)) - padding;
      const maxX = Math.max(
        ...childNodes.map((n) => n.position.x + (n.measured?.width ?? defaultNodeWidth))
      ) + padding;
      const maxY = Math.max(
        ...childNodes.map((n) => n.position.y + (n.measured?.height ?? defaultNodeHeight))
      ) + padding;

      // Also adjust child nodes positions relative to the group node's new top-left
      childNodes.forEach((child) => {
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
    }

    return {
      ...groupNode,
      style: { ...groupNode.style, position: 'absolute' }
    };
  });

  const layoutedNodes = [...layoutedNonGroupNodes, ...layoutedGroupNodes];

  return { nodes: layoutedNodes, edges };
};
