// @ts-nocheck
import type { Edge, EdgeTypes } from '@xyflow/react';


export const initialEdges: Edge[] = [
  { id: 'a->c', source: 'a', target: 'c', animated: true },
  { id: 'b->d', source: 'b', target: 'd' , markerStart: 'myCustomSvgMarker'},
  { id: 'c->d', source: 'c', target: 'd', animated: true },
  { id: 'e->d', source: 'e', sourceHandle: 'a', target: 'd', animated: true ,
    markerStart: {type: 'arrowclosed', color: '#8ACE00'}, 
    markerEnd: {type: 'arrow', color: '#8ACE00'} },
  { id: 'e->c', source: 'e', sourceHandle: 'b', target: 'c', animated: true },
];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
