/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimationStep, SortingAlgorithm } from '../types';

export const generateSteps = (
  algorithm: SortingAlgorithm,
  array: number[]
): AnimationStep[] => {
  const steps: AnimationStep[] = [];
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  let operations = 0;

  const addStep = (
    description: string,
    active: number[],
    sorted: number[],
    type: AnimationStep['type'],
    lineHighlight = 0
  ) => {
    steps.push({
      description,
      activeIndices: [...active],
      sortedIndices: [...sorted],
      type,
      arrayState: [...arr],
      lineHighlight,
      stats: { comparisons, swaps, operations }
    });
  };

  if (algorithm === 'bubble') {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
      addStep(`🔁 Starting Pass ${i + 1}`, [], Array.from({ length: i }, (_, k) => n - k - 1), 'set', 0);
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        operations++;
        comparisons++;
        addStep(`Comparing ${arr[j]} and ${arr[j + 1]}`, [j, j + 1], Array.from({ length: i }, (_, k) => n - k - 1), 'compare', 2);
        if (arr[j] > arr[j + 1]) {
          swaps++;
          swapped = true;
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          addStep(`Swap: ${arr[j + 1]} > ${arr[j]}`, [j, j + 1], Array.from({ length: i }, (_, k) => n - k - 1), 'swap', 3);
        }
      }
      addStep(`✅ Pass ${i + 1} complete. ${arr[n - i - 1]} is sorted`, [], Array.from({ length: i + 1 }, (_, k) => n - k - 1), 'complete', 4);
      if (!swapped) {
        addStep(`No swaps occurred in Pass ${i + 1}. Array is sorted!`, [], Array.from({ length: n }, (_, k) => k), 'complete', 0);
        break;
      }
    }
  } else if (algorithm === 'selection') {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      addStep(`🔁 Iteration ${i + 1}: Finding minimum from index ${i} to ${n-1}`, [i], Array.from({ length: i }, (_, k) => k), 'set', 1);
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        operations++;
        comparisons++;
        addStep(`Comparing current min ${arr[minIdx]} with ${arr[j]}`, [minIdx, j], Array.from({ length: i }, (_, k) => k), 'compare', 3);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          addStep(`New minimum ${arr[minIdx]} found at index ${j}`, [minIdx], Array.from({ length: i }, (_, k) => k), 'set', 4);
        }
      }
      if (minIdx !== i) {
        swaps++;
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        addStep(`Swap: Placing minimum ${arr[i]} at index ${i}`, [i, minIdx], Array.from({ length: i }, (_, k) => k), 'swap', 5);
      }
      addStep(`✅ Iteration ${i + 1} complete. ${arr[i]} is sorted`, [], Array.from({ length: i + 1 }, (_, k) => k), 'complete', 6);
    }
    addStep(`Final check complete. Array is sorted!`, [], Array.from({ length: n }, (_, k) => k), 'complete', 0);
  } else if (algorithm === 'insertion') {
    const n = arr.length;
    addStep(`Initial state: Index 0 is considered sorted`, [], [0], 'set', 0);
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      addStep(`📥 Iteration ${i}: Inserting ${key} into sorted portion`, [i], Array.from({ length: i }, (_, k) => k), 'set', 1);
      
      while (j >= 0 && arr[j] > key) {
        operations++;
        comparisons++;
        addStep(`Is ${arr[j]} > ${key}? Yes, shift right`, [j, j+1], Array.from({ length: i }, (_, k) => k), 'compare', 3);
        arr[j + 1] = arr[j];
        operations++;
        addStep(`Shifted ${arr[j]} to index ${j + 1}`, [j + 1], Array.from({ length: i }, (_, k) => k), 'shift', 4);
        j--;
      }
      arr[j + 1] = key;
      operations++;
      addStep(`Inserted ${key} at index ${j + 1}`, [j + 1], Array.from({ length: i + 1 }, (_, k) => k), 'set', 6);
      addStep(`✅ Iteration ${i} complete. First ${i + 1} elements are sorted`, [], Array.from({ length: i + 1 }, (_, k) => k), 'complete', 7);
    }
    addStep(`Final check complete. Array is sorted!`, [], Array.from({ length: n }, (_, k) => k), 'complete', 0);
  } else if (algorithm === 'merge') {
    const merge = (low: number, mid: number, high: number) => {
      let left = arr.slice(low, mid + 1);
      let right = arr.slice(mid + 1, high + 1);
      let i = 0, j = 0, k = low;

      while (i < left.length && j < right.length) {
        comparisons++;
        operations++;
        addStep(`Comparing ${left[i]} and ${right[j]}`, [low + i, mid + 1 + j], [], 'compare', 5);
        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        addStep(`Merging and placing ${arr[k]} at index ${k}`, [k], [], 'set', 5);
        k++;
      }

      while (i < left.length) {
        arr[k] = left[i];
        addStep(`Placing remaining left element ${arr[k]} at index ${k}`, [k], [], 'set', 5);
        i++;
        k++;
        operations++;
      }

      while (j < right.length) {
        arr[k] = right[j];
        addStep(`Placing remaining right element ${arr[k]} at index ${k}`, [k], [], 'set', 5);
        j++;
        k++;
        operations++;
      }
    };

    const sort = (low: number, high: number) => {
      if (low < high) {
        let mid = Math.floor((low + high) / 2);
        addStep(`Dividing at index ${mid}`, [], [], 'set', 2);
        sort(low, mid);
        sort(mid + 1, high);
        merge(low, mid, high);
      }
    };
    const n = arr.length;
    sort(0, n - 1);
    addStep(`Array is sorted`, [], Array.from({ length: n }, (_, k) => k), 'complete', 0);
  } else if (algorithm === 'quick') {
    const n = arr.length;
    const partition = (low: number, high: number) => {
      let pivot = arr[high];
      addStep(`Picking pivot ${pivot} at index ${high}`, [high], [], 'set', 6);
      let i = low - 1;
      for (let j = low; j < high; j++) {
        comparisons++;
        operations++;
        addStep(`Comparing ${arr[j]} with pivot ${pivot}`, [j, high], [], 'compare', 9);
        if (arr[j] < pivot) {
          i++;
          swaps++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          addStep(`Swapping ${arr[i]} and ${arr[j]}`, [i, j], [], 'swap', 10);
        }
      }
      swaps++;
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      addStep(`Placing pivot at its correct position ${i + 1}`, [i + 1, high], [], 'swap', 11);
      return i + 1;
    };

    const sort = (low: number, high: number) => {
      if (low < high) {
        addStep(`Partitioning range [${low}, ${high}]`, [], [], 'set', 2);
        let pi = partition(low, high);
        sort(low, pi - 1);
        sort(pi + 1, high);
      }
    };
    sort(0, n - 1);
    addStep(`Array is sorted`, [], Array.from({ length: n }, (_, k) => k), 'complete', 0);
  } else if (algorithm === 'heap') {
    const n = arr.length;
    const heapify = (size: number, i: number) => {
      let largest = i;
      let left = 2 * i + 1;
      let right = 2 * i + 2;

      if (left < size && arr[left] > arr[largest]) {
        largest = left;
      }

      if (right < size && arr[right] > arr[largest]) {
        largest = right;
      }

      if (largest !== i) {
        swaps++;
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        addStep(`Heapify: Swapping ${arr[i]} and ${arr[largest]}`, [i, largest], [], 'swap', 4);
        heapify(size, largest);
      }
    };

    addStep(`Building initial max heap`, [], [], 'set', 1);
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    for (let i = n - 1; i > 0; i--) {
      swaps++;
      [arr[0], arr[i]] = [arr[i], arr[0]];
      addStep(`Swapping root ${arr[0]} with index ${i}`, [0, i], [], 'swap', 3);
      heapify(i, 0);
    }
    addStep(`Array is sorted`, [], Array.from({ length: n }, (_, k) => k), 'complete', 0);
  }

  return steps;
};
