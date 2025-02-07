import { Typography } from "@mui/material";
import  StreamOutputRow  from "./StreamOutputRow";
import {DnDProvider} from "./DnDContext";
import {FlowWithProvider} from "./FlowWithProvider";
import { compiledConfigsAtom , canvasPagesAtom} from "../global/GlobalStates";
import '@xyflow/react/dist/style.css';
import { useAtom } from "jotai";

const PageCompiledCfg = () => {
    const [compiledConfigs, setCompiledConfigs] = useAtom(compiledConfigsAtom);
    const [canvasPages] = useAtom(canvasPagesAtom);
    const compiledConfig = compiledConfigs.find(compiledConfig => compiledConfig.configId === canvasPages.configId);
    const {reactflowDisplay, langgraphRun, configId} = compiledConfig;

    const updateNodeData = (nodeId, key, value) => {
        setCompiledConfigs((prevConfigs) =>
          prevConfigs.map((cfg) => {
            if (cfg.configId === configId) {
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
            <div>
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
        <div>
            {canvasDisplay()}
            {/* <StreamOutputRow langgraphRun={langgraphRun}/> */}
        </div>
    )
}

export default PageCompiledCfg;