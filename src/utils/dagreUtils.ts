import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 300; // Set your node width
const nodeHeight = 300; // Set your node height

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

// Function to handle Dagre layout
const getLayoutedNodesAndEdgesInGroup = (nodes, edges, direction = 'LR') => {
dagreGraph.setGraph({ 
  rankdir: direction, 
  ranksep: 100,
  nodesep: 100
});

const nonGroupNodes = nodes.filter(node => node.type !== 'group');
const groupNodes = nodes.filter(node => node.type === 'group');

nonGroupNodes.forEach((node) => {
  dagreGraph.setNode(node.id, 
      { width: node.measured?.width ?? nodeWidth, 
      height: node.measured?.height ?? nodeHeight });
});

edges.forEach((edge) => {
  dagreGraph.setEdge(edge.source, edge.target);
});

dagre.layout(dagreGraph);

// Apply layout to non-group nodes
const layoutedNonGroupNodes = nonGroupNodes.map((node) => {
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

// Second pass: position group nodes to contain their children
const layoutedGroupNodes = groupNodes.map(groupNode => {
  const childNodes = layoutedNonGroupNodes.filter(node => node.parentId === groupNode.id);
  
  if (childNodes.length > 0) {

    const padding = 50;
    const minX = Math.min(...childNodes.map(n => n.position.x)) - padding;
    const minY = Math.min(...childNodes.map(n => n.position.y)) - padding;
    const maxX = Math.max(...childNodes.map(n => n.position.x + (n.width || nodeWidth))) + padding;
    const maxY = Math.max(...childNodes.map(n => n.position.y + (n.height || nodeHeight))) + padding;
    
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


export { getLayoutedNodesAndEdges, getMultiLineLayoutedNodesAndEdges, getLayoutedNodesAndEdgesInGroup };