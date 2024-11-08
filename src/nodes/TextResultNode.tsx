import {memo} from 'react';
import {useHandleConnections, useNodesData} from '@xyflow/react';
import {AppNode, isTextNode} from './types';
import {Handle, Position} from '@xyflow/react';

function TextResultNode() {
    const connections = useHandleConnections({
        type: 'target',
    });
    const nodesData = useNodesData<AppNode>(
        connections.map((c) => c.source)
    );
    const textNodes = nodesData.filter(isTextNode);

    return (
        <div>
            <Handle type="target" position={Position.Left} />
            <div>
                incoming texts: {" "}
                {textNodes.map(({data}, i) => <div key={i}>{data.text}</div>) || 'none'}
            </div>
        </div>
    );
}

export default memo(TextResultNode);