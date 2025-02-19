import {memo, useEffect} from 'react';
import {AppNode} from './types';
import {isTextNode} from './types';
import {
    useReactFlow, 
    useHandleConnections,
    useNodesData,
    Handle,
    Position,
} from '@xyflow/react';

function UppercaseNode({id}) {
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
                 uppercase transform
            </div>
            <Handle type="source" 
                position={Position.Right}
            />
        </div>
    )
}

export default memo(UppercaseNode);