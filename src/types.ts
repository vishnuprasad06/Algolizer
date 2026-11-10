/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AlgorithmType = 'sorting' | 'graph' | 'ds';

export type AnimationStep = {
  description: string;
  activeIndices: number[];
  sortedIndices: number[];
  type: 'compare' | 'swap' | 'shift' | 'set' | 'visited' | 'complete';
  arrayState?: number[]; // For sorting
  lineHighlight?: number;
  stats?: {
    comparisons: number;
    swaps: number;
    operations: number;
  };
};

export type SortingAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap';

export interface Complexity {
  best: string;
  avg: string;
  worst: string;
  space: string;
  stability: boolean;
}

export const SORTING_COMPLEXITIES: Record<SortingAlgorithm, Complexity> = {
  bubble: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stability: true },
  selection: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stability: false },
  insertion: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stability: true },
  merge: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stability: true },
  quick: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stability: false },
  heap: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stability: false },
};

export interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  weight?: number;
}

export interface GraphStep extends AnimationStep {
  visitedNodes: string[];
  currentNodeId?: string;
}
