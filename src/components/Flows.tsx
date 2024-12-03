import React, { useEffect, useRef, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    useReactFlow,
    type OnConnect,
  } from '@xyflow/react';
import { nodeTypes } from '../nodes';
import { edgeTypes } from '../edges';
import { getLayoutedNodesAndEdges } from '../utils/dagreUtils';
import { useDnD } from './DnDContext';



export function FlowComponent(props) {
    const {screenToFlowPosition} = useReactFlow();
    let nodeId = 0;
    const getId = () => `dndnode_${nodeId++}`;
    const [nodes, setNodes, onNodesChange] = useNodesState(props.nodesState);
    const [edges, setEdges, onEdgesChange] = useEdgesState(props.edgesState);
    const [type] = useDnD();


    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((edges) => addEdge(connection, edges)),
        [setEdges]
    );

    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: any) => {
        event.preventDefault();
        if(!type) return;
    
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const newNode = {
          id: getId(),
          type,
          position,
          data: {label: `${type} node`},
        };
        setNodes((nds: any) => nds.concat(newNode));
      }, [type, screenToFlowPosition]);

    useEffect(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedNodesAndEdges(
          nodes,
          edges
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      }, []);

    return (
            <div className="reactflow-wrapper">
                <ReactFlow
                id = {props.id}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
                </ReactFlow>
            </div>

    )
}