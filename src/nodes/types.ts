import type { Node, BuiltInNode } from '@xyflow/react';
import { TextUpdaterNode } from './CustomTextNode';

export type PositionLoggerNode = Node<{ label: string }, 'position-logger'>;
export type TextUpdaterNode = Node<{ label: string }, 'textUpdater'>;
export type AppNode = BuiltInNode | PositionLoggerNode | TextUpdaterNode;
