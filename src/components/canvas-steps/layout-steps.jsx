import dagre from 'dagre';
import Dagre from 'dagre';
// Function to handle Dagre layout
const getLayoutedNodesAndEdges = (nodes, edges, direction = 'LR') => {
    // direction: TB (top to bottom), LR (left to right)

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 600; // Set your node width
    const nodeHeight = 100; // Set your node height
    
    dagreGraph.setGraph({ 
      rankdir: direction, 
      ranksep: 200,
      nodesep: 300
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

  const horizontalSpacing = 400; // space between columns
  const verticalSpacing = 400;   // space between rows

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

const getLayeredLayout = (nodes, edges, direction = 'LR', verticalSpacing = 280, horizontalSpacing = 200) => {
    const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction, ranksep: verticalSpacing, nodesep: horizontalSpacing });
   
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
      g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 0,
        height: node.measured?.height ?? 0,
      }),
    );
   
    Dagre.layout(g);
   
    return {
      nodes: nodes.map((node) => {
        const position = g.node(node.id);
        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        const x = position.x - (node.measured?.width ?? 0) / 2;
        const y = position.y - (node.measured?.height ?? 0) / 2;
   
        return { ...node, position: { x, y } };
      }),
      edges,
    };
  };
  
export { 
    getLayoutedNodesAndEdges, 
    getMultiLineLayoutedNodesAndEdges,
    getLayeredLayout
};