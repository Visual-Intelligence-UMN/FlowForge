import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 600; // Set your node width
const nodeHeight = 600; // Set your node height

// Function to handle Dagre layout
const getLayoutedNodesAndEdges = (nodes, edges, direction = 'LR') => {
    // direction: TB (top to bottom), LR (left to right)
  dagreGraph.setGraph({ 
    rankdir: direction, 
    ranksep: 100,
    nodesep: 100
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, 
        { width: node.measured?.width ?? nodeWidth, 
        height: node.measured?.height ?? nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 10,
        y: nodeWithPosition.y - nodeHeight / 10,
      },
      style: { ...node.style, position: 'absolute' },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const getMultiLineLayoutedNodesAndEdges = (nodes, edges, nodesPerRow = 3) => {

  const horizontalSpacing = 750; // space between columns
  const verticalSpacing = 750;   // space between rows

  const layoutedNodes = nodes.map((node, index) => {
    const col = index % nodesPerRow;
    const row = Math.floor(index / nodesPerRow);

    return {
      ...node,
      position: {
        x: col * horizontalSpacing,
        y: row * verticalSpacing,
      },
      style: { ...node.style, position: 'absolute' },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export { getLayoutedNodesAndEdges, getMultiLineLayoutedNodesAndEdges };