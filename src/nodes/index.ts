import type { NodeTypes } from '@xyflow/react';

import { PositionLoggerNode } from './unused/PositionLoggerNode';
import { TextUpdaterNode } from './unused/CustomTextNode';
import { AppNode } from './types';
import TextResultNode from './unused/TextResultNode';
import TextNode from './unused/TextNode';
import SingleAgentNode  from './SingleAgentNode';
import ExecutorNode from './ExecutorNode';
import ReviewerNode from './ReviewerNode';
import SupervisorNode from './SupervisorNode';

import { FlowStepNode } from './FlowStepNode';
import { FlowWithPatternsNode } from './FlowWithPatternsNode';
import { FlowConfigNode } from './FlowConfigNode';
export const initialNodes: AppNode[] = [
  { id: 'a', type: 'input', position: { x: 0, y: 0 }, data: { label: 'wire' } },
  {
    id: 'b',
    type: 'position-logger',
    position: { x: -100, y: 100 },
    data: { label: 'drag me!' },
  },
  { id: 'c', position: { x: 100, y: 100 }, data: { label: 'your ideas' } },
  {
    id: 'd',
    type: 'output',
    position: { x: 0, y: 200 },
    data: { label: 'with React Flow' },
  },
  {
    id: 'e',
    type: 'textUpdater',
    position: { x: 100, y: 0 },
    data: { label: 'text updater' },
  },
];

export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  'textUpdater': TextUpdaterNode,
  'textResult': TextResultNode,
  'text': TextNode,
  'singleAgent': SingleAgentNode,
  'executor': ExecutorNode,
  'reviewer': ReviewerNode,
  'supervisor': SupervisorNode,
  'flowStep': FlowStepNode,
  'patternsStep': FlowWithPatternsNode,
  'configStep': FlowConfigNode,
} satisfies NodeTypes;
