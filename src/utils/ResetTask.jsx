import { useResetAtom } from "jotai/utils";
import {
  taskFlowsAtom, 
  taskFlowsGenerateAtom,
  flowsMapAtom,
  flowIdsAtom,
  patternsAtom, 
  patternsFlowAtom,
  patternsGenerateAtom,
  agentsConfigAtom, 
  agentsConfigPatternAtom,
  agentsConfigGenerateAtom,
  reactflowGenerateAtom,
  selectedConfigAtom,
  langgraphGenerateAtom,
  compliedGenerateAtom,
  reactflowDisplayAtom,
  langgraphRunAtom,
  compiledConfigsAtom,
  selectionChainAtom,
  streamOutputAtom,
  treeNavAtom,
  canvasPagesAtom,
} from "../patterns/GlobalStates";

export function useResetTask() {
 // only the selectedTaskAtom is not reset
  const resetTaskFlows = useResetAtom(taskFlowsAtom);
  const resetPatterns = useResetAtom(patternsAtom);
  const resetAgentsConfig = useResetAtom(agentsConfigAtom);
  const resetReactflowDisplay = useResetAtom(reactflowDisplayAtom);
  const resetLanggraphRun = useResetAtom(langgraphRunAtom);
  const resetCompiledConfigs = useResetAtom(compiledConfigsAtom);
  const resetSelectionChain = useResetAtom(selectionChainAtom);
  const resetStreamOutput = useResetAtom(streamOutputAtom);
  const resetTreeNav = useResetAtom(treeNavAtom);
  const resetCanvasPages = useResetAtom(canvasPagesAtom);
  const resetTaskFlowsGenerate = useResetAtom(taskFlowsGenerateAtom);
  const resetPatternsGenerate = useResetAtom(patternsGenerateAtom);
  const resetAgentsConfigGenerate = useResetAtom(agentsConfigGenerateAtom);
  const resetReactflowGenerate = useResetAtom(reactflowGenerateAtom);
  const resetLanggraphGenerate = useResetAtom(langgraphGenerateAtom);
  const resetCompliedGenerate = useResetAtom(compliedGenerateAtom);
  const resetFlowsMap = useResetAtom(flowsMapAtom);
  const resetFlowIds = useResetAtom(flowIdsAtom);
  const resetPatternsFlow = useResetAtom(patternsFlowAtom);
  const resetAgentsConfigPattern = useResetAtom(agentsConfigPatternAtom);
  const resetSelectedConfig = useResetAtom(selectedConfigAtom);

  // Optionally, you can memoize the function if needed
  const resetTask = () => {
    resetTaskFlows();
    resetPatterns();
    resetAgentsConfig();
    resetReactflowDisplay();
    resetLanggraphRun();
    resetCompiledConfigs();
    resetSelectionChain();
    resetStreamOutput();
    resetTreeNav();
    resetCanvasPages();
    resetTaskFlowsGenerate();
    resetPatternsGenerate();
    resetAgentsConfigGenerate();
    resetReactflowGenerate();
    resetLanggraphGenerate();
    resetCompliedGenerate();
    resetFlowsMap();
    resetFlowIds();
    resetPatternsFlow();
    resetAgentsConfigPattern();
    resetSelectedConfig();
  };

  return resetTask;
}
