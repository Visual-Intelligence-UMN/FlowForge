import dagre from 'dagre';
import Dagre from 'dagre';

export const getMultiLineLayoutedNodesAndEdges = (nodes, edges, nodesPerRow = 3) => {

    const horizontalSpacing = 800; // space between columns
    const verticalSpacing = 600;   // space between rows
  
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

  export const zoomOutLayout = (nodes, edges, nodesPerRow = 3) => {

    const horizontalSpacing = 800; // space between columns
    const verticalSpacing = 500;   // space between rows
  
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


  export const getLayeredLayout = (nodes, edges, direction = 'LR', verticalSpacing = 800, horizontalSpacing = 800) => {
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