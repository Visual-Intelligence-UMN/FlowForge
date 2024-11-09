import type { Node, BuiltInNode } from '@xyflow/react';
import { TextUpdaterNode } from './CustomTextNode';

export type TextNode = Node<{text: string}, 'text'>;
export type TextResultNode = Node<{}, 'textResult'>;
export type UppercaseNode = Node<{text: string}, 'uppercase'>;
export type PositionLoggerNode = Node<{ label: string }, 'position-logger'>;
export type TextUpdaterNode = Node<{ label: string }, 'textUpdater'>;
export type AppNode = BuiltInNode | PositionLoggerNode | TextUpdaterNode | TextNode | UppercaseNode | TextResultNode;

export function isTextNode(
    node: any,
  ): node is TextNode | UppercaseNode | undefined {
    return !node ? false : node.type === 'text' || node.type === 'uppercase';
  }