import {memo, useEffect} from 'react';
import {AppNode} from './types';
import {isTextNode} from './types';
import {
    useReactFlow, 
    useHandleConnections,
    useNodesData,
    Handle,
    Position,
    type NodeProps
} from '@xyflow/react';

function UppercaseNode({id}: NodeProps) {
    const {updateNodeData} = useReactFlow();
    const connections = useHandleConnections({
        type: 'target',
    })
    const sourceId = connections?.[0]?.source || null;
    const nodesData = useNodesData<AppNode>(sourceId);
    const textNode = nodesData && isTextNode(nodesData) ? nodesData : null;
    const text = textNode?.data?.text || '';

    useEffect(() => {
        if (text) {
            updateNodeData(id, {text: text.toUpperCase()});
        }
        if (text === '') {
            updateNodeData(id, {text: ''});
        }
    }, [text, updateNodeData, id]);

    return (
        <div>
            <Handle type="target" 
                position={Position.Left} 
                isConnectable={!sourceId}
            />
            <div>
                &quot;- uppercase transform&quot;
            </div>
            <Handle type="source" 
                position={Position.Right}
            />
        </div>
    )
}

export default memo(UppercaseNode);