import { useAtom } from "jotai";
import { reactflowGenerateAtom, selectedConfigAtom, reactflowDisplayAtom } from "../global/GlobalStates";
import {FlowWithProvider} from "./FlowWithProvider";
import { useEffect } from "react";

import { initialNodes } from "../nodes";
import { initialEdges } from "../edges";

import '@xyflow/react/dist/style.css';
import { DnDProvider } from "./DnDContext";
import  Sidebar  from "./Sidebar";
import  StreamOutput  from "./StreamOutput";

const ReactFlowPanel = () => {
    const [reactflowGenerate, setReactflowGenerate] = useAtom(reactflowGenerateAtom);
    const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
    const [reactflowDisplay, setReactflowDisplay] = useAtom(reactflowDisplayAtom);
    const generateReactflow = async (config) => {
        setReactflowGenerate(0);
        // TODO: generate reactflow
        const exampleReactflow = [{
            configId: config.agentConfigId,
            key: [config.taskId, config.flowId , config.patternId, config.agentConfigId].join("-"),
            graph: {nodes: initialNodes, edges: initialEdges, viewport: {x: 0, y: 0, zoom: 1}},
        }]

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
            <div className="dndflow">
                <DnDProvider>
                    <Sidebar />
                    {reactflowDisplay.map((flow) => (
                        <div className="reactflow-wrapper">
                            <FlowWithProvider 
                                key={flow.key} 
                                id = {flow.configId} 
                                graph={flow.graph}
                            />
                        </div>
                    ))}
                </DnDProvider>
                <StreamOutput />
            </div>
        )
    }
    const noFlowDisplay = () => {
        return (
            <div className="no-flow-display">
                No workflow generated
            </div>
        )
    }

    return (
        <div className="reactflow-panel">
            <h2>Complete workflow</h2>
            {reactflowDisplay.length > 0 ? 
            canvasDisplay()
         : 
         noFlowDisplay()}   
        </div>
    )
}

export default ReactFlowPanel;