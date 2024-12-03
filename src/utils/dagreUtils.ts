import dagre from 'dagre';

// Dagre layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 100; // Set your node width
const nodeHeight = 36; // Set your node height

// Function to handle Dagre layout
export const getLayoutedNodesAndEdges = (nodes, edges, direction = 'TB') => {
    // direction: TB (top to bottom), LR (left to right)
  dagreGraph.setGraph({ 
    rankdir: direction, 
    ranksep: 120,
    nodesep: 120
  });

  // Add nodes to the graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, 
        { width: node.measured?.width ?? nodeWidth, 
        height: node.measured?.height ?? nodeHeight });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Update node positions
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      style: { ...node.style, position: 'absolute' },
    };
  });

  return { nodes: layoutedNodes, edges };
};
