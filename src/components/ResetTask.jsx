import { useAtom } from "jotai";
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
} from "../global/GlobalStates";
import { useResetAtom } from "jotai/utils";

export async function ResetTask() {
    useResetAtom(taskFlowsAtom);
    useResetAtom(patternsAtom);
    useResetAtom(agentsConfigAtom);
    useResetAtom(reactflowDisplayAtom);
    useResetAtom(langgraphRunAtom);
    useResetAtom(compiledConfigsAtom);
    useResetAtom(selectionChainAtom);
    useResetAtom(streamOutputAtom);
    useResetAtom(treeNavAtom);
    useResetAtom(canvasPagesAtom);
    useResetAtom(taskFlowsGenerateAtom);
    useResetAtom(patternsGenerateAtom);
    useResetAtom(agentsConfigGenerateAtom);
    useResetAtom(reactflowGenerateAtom);
    useResetAtom(langgraphGenerateAtom);
    useResetAtom(compliedGenerateAtom);
    useResetAtom(flowsMapAtom);
    useResetAtom(flowIdsAtom);
    useResetAtom(patternsFlowAtom);
    useResetAtom(agentsConfigPatternAtom);
    useResetAtom(selectedConfigAtom);
    useResetAtom(langgraphRunAtom);
    useResetAtom(reactflowDisplayAtom);

}