import { useAtom } from "jotai";
import { reactflowGenerateAtom, selectedConfigAtom, reactflowDisplayAtom } from "../global/GlobalStates";
import {FlowWithProvider} from "./FlowWithProvider";
import { useEffect } from "react";

import { initialNodes } from "../nodes";
import { initialEdges } from "../edges";

import '@xyflow/react/dist/style.css';
import { DnDProvider } from "./DnDContext";
import  Sidebar  from "./Sidebar";

const ReactFlowPanel = () => {
    const [reactflowGenerate, setReactflowGenerate] = useAtom(reactflowGenerateAtom);
    const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
    const [reactflowDisplay, setReactflowDisplay] = useAtom(reactflowDisplayAtom);
    const generateReactflow = (config) => {
        setReactflowGenerate(0);
        // TODO: generate reactflow
        const exampleReactflow = {
            configId: config.agentConfigId,
            key: [config.taskId, config.flowId , config.patternId, config.agentConfigId].join("-"),
            graph: {nodes: initialNodes, edges: initialEdges, viewport: {x: 0, y: 0, zoom: 1}},
        }

        setReactflowDisplay(exampleReactflow);
        console.log("Reactflow display:", reactflowDisplay);
        setReactflowGenerate(-1);
        setSelectedConfig(null);
    }

    useEffect(() => {
        if (reactflowGenerate === 0) {
            generateReactflow(selectedConfig);
        }
    }, [reactflowGenerate]);

    const canvasDisplay = () => {
        return (
            <div className="reactflow-wrapper">
                <FlowWithProvider 
                    key={reactflowDisplay.key} 
                    id = {reactflowDisplay.configId} 
                    graph={reactflowDisplay.graph}
                />
            </div>
        )
    }

    return (
        <div>
            {reactflowDisplay ? 
            <div className="dndflow">
                <DnDProvider>
                    <Sidebar />
                    {canvasDisplay()}
                </DnDProvider>
            </div>
         : 
         null}
           
        </div>
    )
}

export default ReactFlowPanel;