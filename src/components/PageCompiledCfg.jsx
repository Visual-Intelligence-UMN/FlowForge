import { Typography } from "@mui/material";
import  StreamOutputRow  from "./StreamOutputRow";
import {DnDProvider} from "./DnDContext";
import {FlowWithProvider} from "./FlowWithProvider";
import '@xyflow/react/dist/style.css';

const PageCompiledCfg = ({compiledConfig,setCompiledConfigs}) => {
    // console.log("compiledConfig to display before", compiledConfig);
    const {reactflowDisplay, langgraphRun, configId} = compiledConfig;

    const updateNodeData = (nodeId, key, value) => {
        setCompiledConfigs((prevConfigs) =>
          prevConfigs.map((cfg) => {
            if (cfg.configId === configId) {
              // Expecting cfg.reactflow to be an array of flow objects
              return {
                ...cfg,
                reactflowDisplay: cfg.reactflowDisplay.map((flow) => {
                  return {
                    ...flow,
                    graph: {
                      ...flow.graph,
                      nodes: flow.graph.nodes.map((node) =>
                        node.id === nodeId
                          ? {
                              ...node,
                              data: {
                                ...node.data,
                                [key]: value,
                              },
                            }
                          : node
                      ),
                    },
                  };
                }),
              };
            }
            return cfg;
          })
        );
      };

    const canvasDisplay = () => {
        return (
            <div className="dndflow" style={{width: "100%", height: "100%"}}>
                <DnDProvider>
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
                {/* <StreamOutputRow langgraphRun={compiledConfig.langgraphRun}/> */}
            </div>
        )
    }

   
    return (
        <div style={{width: "100%", height: "100%"}}>
            {canvasDisplay()}
            {/* <StreamOutputRow langgraphRun={langgraphRun}/> */}
        </div>
    )
}

export default PageCompiledCfg;