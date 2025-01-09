import { useAtom } from "jotai";
import { reactflowGenerateAtom, selectedConfigAtom, reactflowDisplayAtom, langgraphGenerateAtom, langgraphRunAtom } from "../global/GlobalStates";
import {FlowWithProvider} from "./FlowWithProvider";
import { useEffect, useState } from "react";


import '@xyflow/react/dist/style.css';
import { DnDProvider } from "./DnDContext";
import  Sidebar  from "./Sidebar";
import  StreamOutput  from "./StreamOutput";

import CompileReactflow from "./CompileReactflow";
import CompileLanggraph from "./CompileLanggraph";
import { generateGraphImage } from "../langgraph/utils";
const ReactFlowPanel = () => {
    const [reactflowGenerate, setReactflowGenerate] = useAtom(reactflowGenerateAtom);
    const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
    const [reactflowDisplay, setReactflowDisplay] = useAtom(reactflowDisplayAtom);
    const [langgraphGenerate, setLanggraphGenerate] = useAtom(langgraphGenerateAtom);
    const [langgraphRun, setLanggraphRun] = useAtom(langgraphRunAtom);
    const [graphImage, setGraphImage] = useState(null);

    const generateReactflow = async (config) => {
        setReactflowGenerate(0);
        // TODO: generate reactflow
        console.log("config for reactflow and langgraph", config);
        const compiledReactflow = await CompileReactflow(config);
        setReactflowDisplay(compiledReactflow);
        setReactflowGenerate(-1);
        if (reactflowGenerate === -1) setSelectedConfig(null);

        setLanggraphGenerate(0);
        const runnableLanggraph = await CompileLanggraph(compiledReactflow);
        console.log("runnableLanggraph", runnableLanggraph);
        const graphImage = await generateGraphImage(runnableLanggraph);
        setGraphImage(graphImage);
        setLanggraphRun(runnableLanggraph);
        setLanggraphGenerate(-1);
    }

    useEffect(() => {
        if (reactflowGenerate === 0) {
            generateReactflow(selectedConfig);
        }
    }, [reactflowGenerate]);

    // to check if the reactflowDisplay is updated real time
    // useEffect(() => {
    //     console.log("updated", reactflowDisplay);
    // }, [reactflowDisplay]);

    // Ensure node updates modify reactflowDisplayAtom
    const updateNodeData = (flowId, nodeId, key, value) => {
        setReactflowDisplay((prevFlows) =>
            prevFlows.map((flow) =>
                flow.configId === flowId
                    ? {
                          ...flow,
                          graph: {
                              ...flow.graph,
                              nodes: flow.graph.nodes.map((node) =>
                                  node.id === nodeId
                                      ? { ...node, data: { ...node.data, [key]: value } }
                                      : node
                              ),
                          },
                      }
                    : flow
            )
        );
    };

    const canvasDisplay = () => {
        return (
            <div className="dndflow">
                <DnDProvider>
                    <Sidebar />
                    {reactflowDisplay.map((flow) => (
                        <div className="reactflow-wrapper" key={flow.key}>
                            <FlowWithProvider 
                                key={flow.key} 
                                id = {flow.configId} 
                                graph={flow.graph}
                                updateNodeData={updateNodeData}
                            />
                        </div>
                    ))}
                </DnDProvider>
                {/* TODO: streamout should have args: langgraph runnable graph */}
                <StreamOutput langgraphRun={langgraphRun}/>
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
            {graphImage && <img src={graphImage} alt="workflow graph" />}
            {reactflowDisplay.length > 0 ? 
            canvasDisplay()
         : 
         noFlowDisplay()}   
        </div>
    )
}

export default ReactFlowPanel;