
export const getMultiLineLayoutedNodesAndEdges = (nodes, edges, nodesPerRow = 3) => {

    const horizontalSpacing = 700; // space between columns
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
  