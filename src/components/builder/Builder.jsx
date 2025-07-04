import TreeNav from "../tree-navigation/TreeNav";
import SharedCanvas from "../canvas/SharedCanvas";
import { Box } from "@mui/material";
import Grid from '@mui/material/Grid2';
import OrganizeTaskFlows from "../../utils/OrganizeTaskFlows";
import OrganizePatterns from "../../utils/OrganizePatterns";
import OrganizeConfig from "../../utils/OrganizeConfig";
import OrganizeReactflow from "../../utils/OrganizeReactflow";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  selectedTaskAtom,
  flowsMapAtom,
  flowIdsAtom,
  selectedConfigAtom,
  flowCounterAtom,
  runRealtimeAtom,
  patternsGenerateProgress
} from "../../patterns/GlobalStates";
import {
  taskFlowsGenerateAtom,
  patternsGenerateAtom,
  patternsFlowAtom,
  patternsAtom,
  agentsConfigGenerateAtom,
  agentsConfigPatternAtom,
  agentsConfigAtom,
  compiledConfigsAtom,
  compliedGenerateAtom,
  canvasPagesAtom,
  treeNavAtom,
} from "../../patterns/GlobalStates";
import StreamOutputRow from "../panel-output/StreamOutputRow";

const Builder = () => {
  // atoms for task flows
  const [flowCounter, setFlowCounter] = useAtom(flowCounterAtom);
  const [selectedTask] = useAtom(selectedTaskAtom);
  const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
  const [flowIds, setFlowIds] = useAtom(flowIdsAtom);
  const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(
    taskFlowsGenerateAtom
  );
  const [flowsCounter, setFlowsCounter] = useState(1);

  // atoms for patterns
  const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
  const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
  const [designPatterns, setDesignPatterns] = useAtom(patternsAtom);

  // atoms for agents config
  const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
  const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(
    agentsConfigGenerateAtom
  );
  const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(
    agentsConfigPatternAtom
  );

  const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
  const [compiledConfigs, setCompiledConfigs] = useAtom(compiledConfigsAtom);
  const [compliedGenerate, setCompliedGenerate] = useAtom(compliedGenerateAtom);

  const [langgraphRunSelected, setLanggraphRunSelected] = useState(null);
  // atoms for canvas pages
  const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);
  const [treeNav, setTreeNav] = useAtom(treeNavAtom);

  const [runRealtime, setRunRealtime] = useAtom(runRealtimeAtom);
  const [patternsProgress, setPatternsProgress] = useAtom(patternsGenerateProgress)

  useEffect(() => {
    setFlowsCounter(1);
  }, [flowsMap]);

  useEffect(() => {
    if (taskFlowsGenerate === 0) {
      setCanvasPages({
        type: "flow-generating",
        flowId: flowIds[0],
        patternId: [],
        configId: [],
      });
      // console.log("generate flow ing", canvasPages);
      OrganizeTaskFlows(
        selectedTask,
        setFlowsMap,
        flowIds,
        setFlowIds,
        flowsCounter,
        flowCounter,
        setFlowCounter,
        runRealtime,
        setRunRealtime
      );
      setTaskFlowsGenerate(1);
    }
  }, [taskFlowsGenerate]);

  useEffect(() => {

    // // console.log("builder task flows generate", taskFlowsGenerate);
    // // console.log("builder flows map", flowsMap.length, flowIds.length, flowIds, flowsMap);
    if (taskFlowsGenerate === 1 && flowIds.length > 0) {
      // TODO, display new generated flow
      const randomFlow =
        flowsMap[flowIds[Math.floor(Math.random() * flowIds.length)]];
      // // console.log("builder task flows generate", flowsMap);
      // console.log("builder task flows generate to set canvas", randomFlow);
      setCanvasPages({
        type: "flow",
        flowId: randomFlow.taskFlowId,
        patternId: [],
        configId: [],
      });
    }
  }, [flowIds.length, taskFlowsGenerate]);

  useEffect(() => {
    // // console.log("generate pattern ing", canvasPages);
    if (patternsGenerate === 0 && patternsFlow) {
      (async() => {
        console.log("generate pattern ing", canvasPages);
        setCanvasPages({
          type: "pattern-generating",
          flowId: canvasPages.flowId,
          patternId: canvasPages.patternId,
          configId: canvasPages.configId,
        });
        // console.log("builder pattern generating to set canvas", canvasPages);
        await OrganizePatterns(patternsFlow, designPatterns, setDesignPatterns, runRealtime, selectedTask, setPatternsProgress);
        setPatternsGenerate(1);
        setPatternsFlow(null);
      })();
    }
  }, [patternsGenerate, patternsFlow]);

  useEffect(() => {
    if (canvasPages.type === "pattern-generating" && designPatterns.length > 0 && patternsGenerate === 1) {
      // console.log(patternsGenerate, "patternGenerate")
      // console.log("builder task flows generate to set canvas after pattern generation", canvasPages);
      const newAddedPatterns = designPatterns.filter(
        (pattern) =>
          pattern.patternId.split("-")[0] === canvasPages.flowId.toString()
      );
      const randomPattern =
        newAddedPatterns[Math.floor(Math.random() * newAddedPatterns.length)];
      // console.log("builder task flows generate to set canvas after pattern generation 2", randomPattern);
      setCanvasPages({
        type: "pattern",
        flowId: canvasPages.flowId,
        patternId: randomPattern?.patternId,
        configId: [],
      });
    }
  }, [designPatterns.length, patternsGenerate]);

  useEffect(() => {
    if (agentsConfigGenerate === 0 && agentsConfigPattern) {
      // // console.log("builder config to set up", agentsConfigPattern);
      //   // console.log("agentsConfig", agentsConfig);
      // console.log("selectedTask in builder", selectedTask);
      OrganizeConfig(agentsConfigPattern, agentsConfig, setAgentsConfig, runRealtime);
      setAgentsConfigGenerate(1);
      setAgentsConfigPattern(null);
    }
  }, [agentsConfigGenerate, agentsConfigPattern]);

  useEffect(() => {
    if (compliedGenerate === 0 && selectedConfig) {
      // // console.log("builder config to compile", selectedConfig);
      OrganizeReactflow(selectedConfig, setCompiledConfigs);
      setCompliedGenerate(1);
      setSelectedConfig(null);
    }
  }, [compliedGenerate, selectedConfig]);





  useEffect(() => {
    if (canvasPages.type === "pattern" && agentsConfig.length > 0) {
      const newAddedConfigs = agentsConfig.filter(
        (config) =>
          config.patternId.split("-")[0] === canvasPages.flowId.toString() &&
          config.patternId === canvasPages.patternId.toString()
      );
      const newAddedConfig = newAddedConfigs[0];
      if (newAddedConfig == undefined) {
        return;
      }
      setSelectedConfig(newAddedConfig);
      setCompliedGenerate(0);
      // Remove the config stage
      setCanvasPages({
        type: "pattern",
        flowId: canvasPages.flowId,
        patternId: canvasPages.patternId,
        configId: newAddedConfig.configId,
      });
    }
  }, [agentsConfig]);

  useEffect(() => {
    // transit from the pattern stage to the compiled stage
    if (canvasPages.type === "pattern" && compiledConfigs.length > 0) {
      if (canvasPages.configId == undefined) {
        return;
      }
      const newAddedConfigs = compiledConfigs.filter(
        (config) => config.configId === canvasPages.configId.toString()
      );
      const newAddedConfig = newAddedConfigs[0];
      if (newAddedConfig == undefined) {
        return;
      }
      setCanvasPages({
        type: "compiled",
        flowId: canvasPages.flowId,
        patternId: canvasPages.patternId,
        configId: newAddedConfig.configId,
      });
    }
  }, [compiledConfigs]);

  useEffect(() => {
    if (canvasPages.type === "compiled") {
      const runConfig = compiledConfigs.find(
        (config) => config.configId === canvasPages.configId.toString()
      );
      setLanggraphRunSelected(runConfig);
    }
  }, [canvasPages, compiledConfigs]);

  return (
    <>
      <Grid container spacing={1}>
        <Grid item size={4} className="tree-nav grid-item">
          <TreeNav />
        </Grid>
        <Grid item size={8} className="canvas grid-item" sx={{ padding: 0 }}  >
          <SharedCanvas />
          <StreamOutputRow runConfig={langgraphRunSelected} />
        </Grid>
      </Grid>
    </>
  );
};

export default Builder;
