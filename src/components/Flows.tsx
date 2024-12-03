import React, { useEffect, useRef, useCallback, useState} from 'react';
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
    Panel,
  } from '@xyflow/react';
import { nodeTypes } from '../nodes';
import { edgeTypes } from '../edges';
import { getLayoutedNodesAndEdges } from '../utils/dagreUtils';
import { useDnD } from './DnDContext';
import { useAtom } from 'jotai';
import { flowsAtom } from '../global/GlobalStates';

let nodeId = 0;

export function FlowComponent(props) {
    const {screenToFlowPosition, setViewport} = useReactFlow();
    const flowId = props.id;
    const [flows, setFlows] = useAtom(flowsAtom);
    
    const [nodes, setNodes, onNodesChange] = useNodesState(flows[flowId].nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(flows[flowId].edges);
    const [type] = useDnD();
    const [rfInstance, setRfInstance] = useState(null);

    const getId = (id: string) => `dndnode_${id}_${nodeId++}`;

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
          id: getId(props.id),
          type,
          position,
          data: {label: `${type} node`},
        };
        setNodes((nds: any) => nds.concat(newNode));
    }, [type, screenToFlowPosition]);
    
    const onSave = useCallback(() => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            console.log("target saved flow", flow);
            console.log("flows atom", flows);
            localStorage.setItem(`flow_${props.id}`, JSON.stringify(flow));
            setFlows((prev) => ({...prev, [props.id]: flow}));
        }
    }, [rfInstance]);


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
                onInit={setRfInstance}
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
                <Panel position="top-right">
                    <button onClick={onSave}>Save</button>
                </Panel>
            </ReactFlow>
        </div>

    )
}