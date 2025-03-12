import TreeNav from "../tree-navigation/TreeNav";
import SharedCanvas from "../canvas/SharedCanvas";
import { Box } from "@mui/material";
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

  useEffect(() => {
    setFlowsCounter(1);
  }, [flowsMap]);

  useEffect(() => {
    if (taskFlowsGenerate === 0) {
      OrganizeTaskFlows(
        selectedTask,
        setFlowsMap,
        flowIds,
        setFlowIds,
        flowsCounter,
        flowCounter,
        setFlowCounter,
        runRealtime
      );
      setTaskFlowsGenerate(1);
    }
  }, [taskFlowsGenerate]);

  useEffect(() => {
    if (patternsGenerate === 0 && patternsFlow) {
      OrganizePatterns(
        patternsFlow, 
        setDesignPatterns,
        runRealtime
    );
      setPatternsGenerate(1);
      setPatternsFlow(null);
    }
  }, [patternsGenerate, patternsFlow]);

  useEffect(() => {
    if (agentsConfigGenerate === 0 && agentsConfigPattern) {
      // console.log("builder config to set up", agentsConfigPattern);
      OrganizeConfig(agentsConfigPattern, setAgentsConfig);
      setAgentsConfigGenerate(1);
      setAgentsConfigPattern(null);
    }
  }, [agentsConfigGenerate, agentsConfigPattern]);

  useEffect(() => {
    if (compliedGenerate === 0 && selectedConfig) {
      // console.log("builder config to compile", selectedConfig);
      OrganizeReactflow(selectedConfig, setCompiledConfigs);
      setCompliedGenerate(1);
      setSelectedConfig(null);
    }
  }, [compliedGenerate, selectedConfig]);

  useEffect(() => {
    if (taskFlowsGenerate === 1 && flowIds.length > 0) {
      const randomFlow =
        flowsMap[flowIds[Math.floor(Math.random() * flowIds.length)]];
      setCanvasPages({
        type: "flow",
        flowId: randomFlow.taskFlowId,
        patternId: [],
        configId: [],
      });
    }
  }, [flowsMap]);

  useEffect(() => {
    if (canvasPages.type === "flow" && designPatterns.length > 0) {
      const newAddedPatterns = designPatterns.filter(
        (pattern) =>
          pattern.patternId.split("-")[0] === canvasPages.flowId.toString()
      );
      const randomPattern =
        newAddedPatterns[Math.floor(Math.random() * newAddedPatterns.length)];
      setCanvasPages({
        type: "pattern",
        flowId: canvasPages.flowId,
        patternId: randomPattern.patternId,
        configId: [],
      });
    }
  }, [designPatterns]);

  useEffect(() => {
    if (canvasPages.type === "pattern" && agentsConfig.length > 0) {
      const newAddedConfigs = agentsConfig.filter(
        (config) =>
          config.patternId.split("-")[0] === canvasPages.flowId.toString() &&
          config.patternId === canvasPages.patternId.toString()
      );
      const newAddedConfig = newAddedConfigs[0];
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
      const newAddedConfigs = compiledConfigs.filter(
        (config) => config.configId === canvasPages.configId.toString()
      );
      const newAddedConfig = newAddedConfigs[0];
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
      <Box
        sx={{ width: "100%", display: "flex", flexDirection: "row", gap: 8 }}
      >
        <Box
          sx={{
            width: "30%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 5,
          }}
        >
          <TreeNav />
        </Box>
        <Box
          sx={{
            width: "80%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingRight: 5,
          }}
        >
          <SharedCanvas />
        </Box>
      </Box>
      <Box
        sx={{
          width: "90%",
          display: "flex",
          flexDirection: "row",
          gap: 3,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StreamOutputRow runConfig={langgraphRunSelected} />
      </Box>
    </>
  );
};

export default Builder;
