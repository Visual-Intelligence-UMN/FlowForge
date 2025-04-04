import type { NodeTypes } from '@xyflow/react';

// import { PositionLoggerNode } from './unused/PositionLoggerNode';
// import { TextUpdaterNode } from './unused/CustomTextNode';
// import { AppNode } from './types';
// import TextResultNode from './unused/TextResultNode';
// import TextNode from './unused/TextNode';

import SingleAgentNode  from './node-agents/SingleAgentNode';
import ExecutorNode from './node-agents/ExecutorNode';
import ReviewerNode from './node-agents/ReviewerNode';
import SupervisorNode from './node-agents/SupervisorNode';

import { FlowStepNode } from './node-step/FlowStepNode';
import { FlowWithPatternsNode } from './node-pattern/FlowWithPatternsNode';
// import { FlowConfigNode } from './FlowConfigNode';
import { StartPoint } from './node-start/StartPoint';

export const nodeTypes = {
  // 'position-logger': PositionLoggerNode,
  // 'textUpdater': TextUpdaterNode,
  // 'textResult': TextResultNode,
  // 'text': TextNode,
  'singleAgent': SingleAgentNode,
  'optimizer': SingleAgentNode,
  'evaluator': SingleAgentNode,
  'supervisor': SupervisorNode,
  'flowStep': FlowStepNode,
  'patternsStep': FlowWithPatternsNode,
  'startStep': StartPoint,
  // 'configStep': FlowConfigNode,
} satisfies NodeTypes;
