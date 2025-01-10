import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
 
const handleStyle = { left: 10 };
const dragHandleStyle = { 
    display: 'inline-block',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', 
    height: '100%',   
    marginLeft: 0,
    borderRadius: '1%',
    color: 'black', 
    fontSize: '10px',   
    
};
 
export function TextUpdaterNode({ isConnectable}) {
  const onChange = useCallback((evt:any) => {
    console.log(evt.target.value);
  }, []);
 
  return (
    <div className="text-updater-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />

      <div style={{borderBottom: '1px solid #8ACE00', padding: '1px'}}>
        <span className = "custom-drag-handle" style = {dragHandleStyle} >
        Drag Handler
        </span>
      </div>

      <div style={{border: '0px solid #8ACE00', padding: '1px'}}>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>


      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
      />
    </div>
  );
}
 
