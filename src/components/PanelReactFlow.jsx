import { useAtom } from "jotai";
import { reactflowGenerateAtom, selectedConfigAtom, reactflowDisplayAtom, langgraphGenerateAtom, langgraphRunAtom } from "../global/GlobalStates";
import {FlowWithProvider} from "./FlowWithProvider";
import { useEffect, useState } from "react";


import '@xyflow/react/dist/style.css';
import { DnDProvider } from "./DnDContext";
import  Sidebar  from "./ReactflowSidebar";
import  StreamOutput  from "./StreamOutput";
import  StreamOutputRow  from "./StreamOutputRow";

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
        console.log("config for reactflow and langgraph", config);
        const compiledReactflow = await CompileReactflow(config);
        setReactflowDisplay(compiledReactflow);
        setReactflowGenerate(-1);
        if (reactflowGenerate === -1) setSelectedConfig(null);

        // generate langgraph based on syncronized reactflow
        setLanggraphGenerate(0);
        const runnableLanggraph = await CompileLanggraph(compiledReactflow);
        console.log("runnableLanggraph", runnableLanggraph);
        const graphImage = await generateGraphImage(runnableLanggraph);
        setGraphImage(graphImage); // debug graph building
        setLanggraphRun(runnableLanggraph);
        setLanggraphGenerate(-1);
    }

    useEffect(() => {
        if (reactflowGenerate === 0) {
            generateReactflow(selectedConfig);
        }
    }, [reactflowGenerate]);

    // to check if the reactflowDisplay is updated real time => done
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
            <div className="dndflow" style={{width: "100%", height: "100%"}}>
                <DnDProvider>
                    {/* <Sidebar /> */}
                    {reactflowDisplay.map((flow) => (
                        <div className="reactflow-provider-wrapper" key={flow.key}>
                            <FlowWithProvider 
                                key={flow.key} 
                                id = {flow.configId} 
                                graph={flow.graph}
                                updateNodeData={updateNodeData}
                            />
                        </div>
                    ))}
                </DnDProvider>
                {/* <StreamOutput langgraphRun={langgraphRun}/> */}
            </div>
        )
    }
    const noFlowDisplay = () => {
        return (
            <div className="no-flow-display">
                <p className="hint">No workflow generated</p>
            </div>
        )
    }

    return (
        <div className="reactflow-panel">
            <h2>Complete workflow</h2>
            {/* {graphImage && <img src={graphImage} alt="workflow graph" style={{width: "10%", height: "10%"}}/>} */}
            {reactflowDisplay.length > 0 ? 
            canvasDisplay()
         : 
         noFlowDisplay()}   
         <StreamOutputRow langgraphRun={langgraphRun}/>
        </div>
    )
}

export default ReactFlowPanel;