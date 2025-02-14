import React from 'react';
import { useDnD } from '../DnDContext';

 
export default () => {
  const [_, setType] = useDnD();
 
  const onDragStart = (event: any, nodeType: any) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
 
  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the right.</div>
      {/* <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'input')} draggable>
        Input Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Default Node
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Output Node
      </div> */}
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'position-logger')} draggable>
        Position Logger Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'textUpdater')} draggable>
        Text Updater Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'textResult')} draggable>
        Text Result Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'text')} draggable>
        Text Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'uppercase')} draggable>
        Uppercase Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'single-agent')} draggable>
        Single Agent Node
      </div>
    </aside>
  );
};