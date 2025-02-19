import {useInternalNode} from '@xyflow/react';

export function InternalNode() {
    const internalNode = useInternalNode("node_id");
    const absolutePosition = internalNode.internals.positionAbsolute;
 
  return (
    <div>
      The absolute position of the node is at:
      <p>x: {absolutePosition.x}</p>
      <p>y: {absolutePosition.y}</p>
    </div>
  );
}