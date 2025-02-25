import type { Node, BuiltInNode } from '@xyflow/react';
import { TextUpdaterNode } from './unused/CustomTextNode';

export type TextNode = Node<{text: string}, 'text'>;
export type TextResultNode = Node<{}, 'textResult'>;
export type UppercaseNode = Node<{text: string}, 'uppercase'>;
export type PositionLoggerNode = Node<{ label: string }, 'position-logger'>;
export type TextUpdaterNode = Node<{ label: string }, 'textUpdater'>;
export type SingleAgentNode = Node<{ agentName: string, systemMessage: string, model: string, temperature: number }, 'single-agent'>;
export type FlowStepNode = Node<{ stepName: string, stepLabel: string, stepDescription: string, pattern: { name: string, description: string } }, 'flowStep'>;
export type StepGroupNode = Node<{ label: string }, 'stepGroup'>;
export type AppNode = BuiltInNode | PositionLoggerNode | TextUpdaterNode | TextNode | UppercaseNode | TextResultNode | SingleAgentNode | FlowStepNode | StepGroup;
export type PatternNode = SingleAgentNode;

export function isTextNode(
    node: any,
  ): node is TextNode | UppercaseNode | undefined {
    return !node ? false : node.type === 'text' || node.type === 'uppercase';
  }