import { atom } from "jotai";
// import { initialNodes } from "../nodes";
// import { initialEdges } from "../edges";
// import { initialTransformedNodes, initialTransformedEdges } from "../langgraph-test/TestNodesEdges";

export const selectedGraphAtom = atom(null);
// export const flowsAtom = atom({
//     "a": {nodes: initialNodes, edges: initialEdges, viewport: {x: 0, y: 0, zoom: 1}},
//     "b": {nodes: initialTransformedNodes, edges: initialTransformedEdges, viewport: {x: 0, y: 0, zoom: 1}}
// }); // {flowId: {nodes: [], edges: [], viewport: {x, y, zoom}}} // not used

// Task configuration
export const selectedTaskAtom = atom({});

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

export const taskInputAtom = atom("");
export const uploadedFileAtom = atom(null);

// Taks flows panel
export const taskFlowsGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const taskFlowsAtom = atom([]); // format:
export const flowsMapAtom = atom({});
export const flowIdsAtom = atom([]);

// Workflows with Design patterns panel
export const patternsFlowAtom = atom(null);
export const patternsGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const patternsAtom = atom([]);

// Configs panel
export const agentsConfigPatternAtom = atom(null);
export const agentsConfigGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const agentsConfigAtom = atom([]);

// reactflow & langgraph panel
export const reactflowGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const selectedConfigAtom = atom(null);
export const langgraphGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated
export const langgraphRunAtom = atom([]);
export const reactflowDisplayAtom = atom([]);
export const compiledConfigsAtom = atom([]);
export const compliedGenerateAtom = atom(-1); // -1: not generating, 0: generating, 1: generated

// chain for highlighting
export const selectionChainAtom = atom({
  flowId: null,
  patternId: null,
  configId: null,
});

// stream output
export const streamOutputAtom = atom({
  inputMessage: { sender: "User", content: "" },
  intermediaryMessages: [],
  finalMessage: { sender: "", content: "" },
  isThreadActive: false,
  isVisible: false,
});

// tree nav
export const treeNavAtom = atom({
  nodes: [],
  edges: [],
  width: 1000,
  height: 1000,
});

export const canvasPagesAtom = atom({
  type: null,
  flowId: [],
  patternId: [],
  configId: [],
});