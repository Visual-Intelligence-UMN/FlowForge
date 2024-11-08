import type { NodeTypes } from '@xyflow/react';

import { PositionLoggerNode } from './PositionLoggerNode';
import { TextUpdaterNode } from './CustomTextNode';
import { AppNode } from './types';
import TextResultNode from './TextResultNode';
import TextNode from './TextNode';
import UppercaseNode from './UppercaseNode';


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
  'uppercase': UppercaseNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
