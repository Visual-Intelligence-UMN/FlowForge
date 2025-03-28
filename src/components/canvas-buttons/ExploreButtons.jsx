import { Button } from "@mui/material";
import { useAtom } from "jotai";
import {
  canvasPagesAtom,
  flowsMapAtom,
  patternsAtom,
  agentsConfigAtom,
  compiledConfigsAtom,
} from "../../patterns/GlobalStates";

function getSortedFlowIds(flowsMap) {
  const ids = Object.keys(flowsMap).sort((a, b) => parseInt(a) - parseInt(b));
  return ids;
}

function getSortedPatternsForFlow(flowPatterns, flowId) {
  const filtered = flowPatterns.filter((p) => {
    const [fPart] = p.patternId.split("-");
    return fPart === flowId;
  });
  // Sort by numeric pattern part
  filtered.sort((a, b) => {
    const aParts = a.patternId.split("-");
    const bParts = b.patternId.split("-");
    const aNum = parseInt(aParts[1], 10);
    const bNum = parseInt(bParts[1], 10);
    return aNum - bNum;
  });
  return filtered;
}

function getSortedConfigsForPattern(agentsConfig, patternId) {
  const filtered = agentsConfig.filter((cfg) => {
    return cfg.configId.startsWith(patternId + "-");
  });

  filtered.sort((a, b) => {
    const aParts = a.configId.split("-");
    const bParts = b.configId.split("-");
    const aNum = parseInt(aParts[2], 10);
    const bNum = parseInt(bParts[2], 10);
    return aNum - bNum;
  });
  return filtered;
}

function getPrevIndex(currentIndex) {
  return currentIndex > 0 ? currentIndex - 1 : 0;
}
function getNextIndex(currentIndex, maxIndex) {
  // return currentIndex < maxIndex ? currentIndex + 1 : maxIndex;
  return (currentIndex + 1) % maxIndex;
}


function ExploreButton() {
  const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);
  const [flowsMap] = useAtom(flowsMapAtom);
  const [flowsWithPatterns] = useAtom(patternsAtom);
  const [agentsConfig] = useAtom(agentsConfigAtom);
  const [compiledConfigs] = useAtom(compiledConfigsAtom);

  const { type, flowId, patternId, configId } = canvasPages || {};

  const handleButtonClick = () => {
    if (type === "flow") {
      const sortedFlowIds = getSortedFlowIds(flowsMap);
      const currentIndex = sortedFlowIds.indexOf(flowId);
      const newIndex = getNextIndex(currentIndex, sortedFlowIds.length);
      const newFlowId = sortedFlowIds[newIndex];

      const sortedPatterns = getSortedPatternsForFlow(
        flowsWithPatterns,
        newFlowId
      );
      let newPatternId = "";
      let newConfigId = "";

      if (sortedPatterns.length > 0) {
        newPatternId = sortedPatterns[0].patternId;
        const sortedConfigs = getSortedConfigsForPattern(
          agentsConfig,
          newPatternId
        );
        if (sortedConfigs.length > 0) {
          newConfigId = sortedConfigs[0].configId;
        }
      }

      setCanvasPages({
        type: "flow",
        flowId: newFlowId,
        patternId: newPatternId,
        configId: newConfigId,
      });
    } else if (type === "pattern") {
      const [flowPart, patternPart] = patternId.split("-");
      const sortedPatterns = getSortedPatternsForFlow(
        flowsWithPatterns,
        flowPart
      );
      const currentIndex = sortedPatterns.findIndex(
        (p) => p.patternId === patternId
      );
      const newIndex = getNextIndex(currentIndex, sortedPatterns.length);
      const newPatternId = sortedPatterns[newIndex].patternId;

      const sortedConfigs = getSortedConfigsForPattern(
        agentsConfig,
        newPatternId
      );
      let newConfigId = "";
      if (sortedConfigs.length > 0) {
        newConfigId = sortedConfigs[0].configId;
      }

      setCanvasPages({
        type: "pattern",
        flowId: flowPart,
        patternId: newPatternId,
        configId: newConfigId,
      });
    } else if (type === "config") {
      const [flowPart, patternPart, configPart] = configId.split("-");
      const basePatternId = `${flowPart}-${patternPart}`;
      const sortedConfigs = getSortedConfigsForPattern(
        agentsConfig,
        basePatternId
      );
      const currentIndex = sortedConfigs.findIndex(
        (c) => c.configId === configId
      );
      const newIndex = getNextIndex(currentIndex, sortedConfigs.length);
      const newConfigId = sortedConfigs[newIndex].configId;

      setCanvasPages({
        type: "config",
        flowId: flowPart,
        patternId: basePatternId,
        configId: newConfigId,
      });
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleButtonClick}
      size="small"
      sx={{ mr: -2 }}
    >
      Try another one
    </Button>
  );
}

function ExploreLeftButton() {
  const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);
  const [flowsMap] = useAtom(flowsMapAtom);
  const [flowsWithPatterns] = useAtom(patternsAtom);
  const [agentsConfig] = useAtom(agentsConfigAtom);
  const [compiledConfigs] = useAtom(compiledConfigsAtom);

  const { type, flowId, patternId, configId } = canvasPages || {};

  const handleLeftButtonClick = () => {
    if (type === "flow") {
      const sortedFlowIds = getSortedFlowIds(flowsMap);

      const currentIndex = sortedFlowIds.indexOf(flowId);

      const newIndex = getPrevIndex(currentIndex);
      const newFlowId = sortedFlowIds[newIndex];

      const sortedPatterns = getSortedPatternsForFlow(
        flowsWithPatterns,
        newFlowId
      );
      let newPatternId = "";
      let newConfigId = "";

      if (sortedPatterns.length > 0) {
        // For example, take the FIRST pattern in that flow
        newPatternId = sortedPatterns[0].patternId;
        // Then find the configs for that pattern
        const sortedConfigs = getSortedConfigsForPattern(
          agentsConfig,
          newPatternId
        );
        if (sortedConfigs.length > 0) {
          // For example, take the FIRST config
          newConfigId = sortedConfigs[0].configId;
        }
      }

      setCanvasPages({
        type: "flow",
        flowId: newFlowId,
        patternId: newPatternId,
        configId: newConfigId,
      });
    } else if (type === "pattern") {
      // 1) Identify the parent flow
      const [flowPart, patternPart] = patternId.split("-");
      const sortedPatterns = getSortedPatternsForFlow(
        flowsWithPatterns,
        flowPart
      );
      // 2) Current index
      const currentIndex = sortedPatterns.findIndex(
        (p) => p.patternId === patternId
      );
      // 3) Previous
      const newIndex = getPrevIndex(currentIndex);
      const newPatternId = sortedPatterns[newIndex].patternId;

      // Check configs for the new pattern
      const sortedConfigs = getSortedConfigsForPattern(
        agentsConfig,
        newPatternId
      );
      let newConfigId = "";
      if (sortedConfigs.length > 0) {
        // pick the first config or last config, up to you
        newConfigId = sortedConfigs[0].configId;
      }

      setCanvasPages({
        type: "pattern",
        flowId: flowPart, // the flow ID is still flowPart
        patternId: newPatternId,
        configId: newConfigId,
      });
    } else if (type === "config") {
      const [flowPart, patternPart, configPart] = configId.split("-");
      const basePatternId = `${flowPart}-${patternPart}`;

      const sortedConfigs = getSortedConfigsForPattern(
        agentsConfig,
        basePatternId
      );
      const currentIndex = sortedConfigs.findIndex(
        (c) => c.configId === configId
      );
      const newIndex = getPrevIndex(currentIndex);
      const newConfigId = sortedConfigs[newIndex].configId;

      setCanvasPages({
        type: "config",
        flowId: flowPart,
        patternId: basePatternId,
        configId: newConfigId,
      });
    }
  };

  return (
    <Button
      // variant="contained"
      onClick={handleLeftButtonClick}
      size="small"
      sx={{ mr: -2 }}
    >
      &lt; Prev
    </Button>
  );
}



function ExploreRightButton() {
  const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);
  const [flowsMap] = useAtom(flowsMapAtom);
  const [flowsWithPatterns] = useAtom(patternsAtom);
  const [agentsConfig] = useAtom(agentsConfigAtom);
  const [compiledConfigs] = useAtom(compiledConfigsAtom);

  const { type, flowId, patternId, configId } = canvasPages || {};

  const handleRightButtonClick = () => {
    if (type === "flow") {
      const sortedFlowIds = getSortedFlowIds(flowsMap);
      const currentIndex = sortedFlowIds.indexOf(flowId);
      const newIndex = getNextIndex(currentIndex, sortedFlowIds.length - 1);
      const newFlowId = sortedFlowIds[newIndex];

      const sortedPatterns = getSortedPatternsForFlow(
        flowsWithPatterns,
        newFlowId
      );
      let newPatternId = "";
      let newConfigId = "";

      if (sortedPatterns.length > 0) {
        newPatternId = sortedPatterns[0].patternId;
        const sortedConfigs = getSortedConfigsForPattern(
          agentsConfig,
          newPatternId
        );
        if (sortedConfigs.length > 0) {
          newConfigId = sortedConfigs[0].configId;
        }
      }

      setCanvasPages({
        type: "flow",
        flowId: newFlowId,
        patternId: newPatternId,
        configId: newConfigId,
      });
    } else if (type === "pattern") {
      const [flowPart, patternPart] = patternId.split("-");
      const sortedPatterns = getSortedPatternsForFlow(
        flowsWithPatterns,
        flowPart
      );
      const currentIndex = sortedPatterns.findIndex(
        (p) => p.patternId === patternId
      );
      const newIndex = getNextIndex(currentIndex, sortedPatterns.length - 1);
      const newPatternId = sortedPatterns[newIndex].patternId;

      const sortedConfigs = getSortedConfigsForPattern(
        agentsConfig,
        newPatternId
      );
      let newConfigId = "";
      if (sortedConfigs.length > 0) {
        newConfigId = sortedConfigs[0].configId;
      }

      setCanvasPages({
        type: "pattern",
        flowId: flowPart,
        patternId: newPatternId,
        configId: newConfigId,
      });
    } else if (type === "config") {
      const [flowPart, patternPart, configPart] = configId.split("-");
      const basePatternId = `${flowPart}-${patternPart}`;
      const sortedConfigs = getSortedConfigsForPattern(
        agentsConfig,
        basePatternId
      );
      const currentIndex = sortedConfigs.findIndex(
        (c) => c.configId === configId
      );
      const newIndex = getNextIndex(currentIndex, sortedConfigs.length - 1);
      const newConfigId = sortedConfigs[newIndex].configId;

      setCanvasPages({
        type: "config",
        flowId: flowPart,
        patternId: basePatternId,
        configId: newConfigId,
      });
    }
  };

  return (
    <Button onClick={handleRightButtonClick} size="small" sx={{ ml: -2 }}>
      Next &gt;
    </Button>
  );
}

export { ExploreLeftButton, ExploreRightButton, ExploreButton };
