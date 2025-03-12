import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import exampleTasks from "../data/example-tasks.json";

export const runRealtimeAtom = atomWithReset(true);

export const flowCounterAtom = atomWithReset(1);
export const selectedGraphAtom = atom(null);
export const selectedTaskAtom = atomWithReset({});
export const taskList = exampleTasks;
export const workflowInputAtom = atomWithReset("");

export const taskInputAtom = atomWithReset("");
export const uploadedFileAtom = atomWithReset(null);

// Taks flows panel
export const taskFlowsGenerateAtom = atomWithReset(-1); // -1: not generating, 0: generating, 1: generated
export const taskFlowsAtom = atomWithReset([]); // format:
export const flowsMapAtom = atomWithReset({});
export const flowIdsAtom = atomWithReset([]);

// Workflows with Design patterns panel
export const patternsFlowAtom = atomWithReset(null);
export const patternsGenerateAtom = atomWithReset(-1); // -1: not generating, 0: generating, 1: generated
export const patternsAtom = atomWithReset([]);

// Configs panel
export const agentsConfigPatternAtom = atomWithReset(null);
export const agentsConfigGenerateAtom = atomWithReset(-1); // -1: not generating, 0: generating, 1: generated
export const agentsConfigAtom = atomWithReset([]);

// reactflow & langgraph panel
export const reactflowGenerateAtom = atomWithReset(-1); // -1: not generating, 0: generating, 1: generated
export const selectedConfigAtom = atomWithReset(null);
export const langgraphGenerateAtom = atomWithReset(-1); // -1: not generating, 0: generating, 1: generated
export const langgraphRunAtom = atomWithReset([]);
export const reactflowDisplayAtom = atomWithReset([]);
export const compiledConfigsAtom = atomWithReset([]);
export const compliedGenerateAtom = atomWithReset(-1); // -1: not generating, 0: generating, 1: generated
export const maxRoundAtom = atomWithReset(1);
// chain for highlighting
export const selectionChainAtom = atomWithReset({
  flowId: null,
  patternId: null,
  configId: null,
});

// stream output
export const streamOutputAtom = atomWithReset({
  inputMessage: { sender: "User", content: "" },
  intermediaryMessages: [],
  finalMessage: { sender: "", content: "" },
  isThreadActive: false,
  isVisible: false,
});

// tree nav
export const treeNavAtom = atomWithReset({
  nodes: [],
  edges: [],
  width: 1000,
  height: 1000,
});

export const canvasPagesAtom = atomWithReset({
  type: null,
  flowId: [],
  patternId: [],
  configId: [],
});