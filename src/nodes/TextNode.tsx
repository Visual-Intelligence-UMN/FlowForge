import {memo, useCallback} from 'react';
import {
    Handle,
    Position,
    useReactFlow,
} from '@xyflow/react';
    
function TextNode({id, data}) {
    const {updateNodeData} = useReactFlow();

    const onChange = useCallback((evt: any) => {
        updateNodeData(id, {text: evt.target.value});
    }, [id, updateNodeData]);

    return (
        <div>
            <div>Node {id}</div>
            <div>
                <input 
                    type="text"
                    value={data.text}
                    onChange={onChange}
                    style={{display: 'block'}}
                />
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
}

export default memo(TextNode);