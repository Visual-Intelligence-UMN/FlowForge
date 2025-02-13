import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
// import { initialNodes } from "../nodes";
// import { initialEdges } from "../edges";
// import { initialTransformedNodes, initialTransformedEdges } from "../langgraph-test/TestNodesEdges";

export const selectedGraphAtom = atom(null);
// export const flowsAtom = atom({
//     "a": {nodes: initialNodes, edges: initialEdges, viewport: {x: 0, y: 0, zoom: 1}},
//     "b": {nodes: initialTransformedNodes, edges: initialTransformedEdges, viewport: {x: 0, y: 0, zoom: 1}}
// }); // {flowId: {nodes: [], edges: [], viewport: {x, y, zoom}}} // not used

// Task configuration
export const selectedTaskAtom = atomWithReset({});

export const taskList = [
  {
    id: "task1",
    name: "Generate Presentation Script",
    requiresUpload: false,
    description: "Generate a presentation script for a given topic.",
    uploadedFile: null,
  },
  {
    id: "task2",
    name: "Machine Learning Visualization",
    requiresUpload: true,
    description: "Visualize a given machine learning model.",
    uploadedFile: null,
  },
  {
    id: "task3",
    name: "Travel Planning",
    requiresUpload: false,
    description: "Plan a travel itinerary for a given destination.",
    uploadedFile: null,
  },
];

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