import { SortingAlgorithm } from "../types";

export type CaseType =
  | "Best Case"
  | "Average Case"
  | "Worst Case"
  | "Same for All Cases"
  | "Input-Dependent";

export interface SortingAnalysis {
  inputSize: number;
  comparisons: number;
  swaps: number;
  writes: number;
  executionTime: number;
  inputBehaviour: string;
  caseType: CaseType;
}

export function analyzeSortingInput(
  algorithm: SortingAlgorithm,
  input: number[]
): SortingAnalysis {

  const arr = [...input];

  let comparisons = 0;
  let swaps = 0;
  let writes = 0;

  const start = performance.now();

  const swap = (i: number, j: number) => {
    if (i === j) return;

    [arr[i], arr[j]] = [arr[j], arr[i]];

    swaps++;
    writes += 2;
  };

  // BUBBLE SORT
  if (algorithm === "bubble") {

    for (let i = 0; i < arr.length - 1; i++) {

      let swapped = false;

      for (let j = 0; j < arr.length - i - 1; j++) {

        comparisons++;

        if (arr[j] > arr[j + 1]) {
          swap(j, j + 1);
          swapped = true;
        }
      }

      if (!swapped) break;
    }
  }

  // SELECTION SORT
  else if (algorithm === "selection") {

    for (let i = 0; i < arr.length - 1; i++) {

      let minIndex = i;

      for (let j = i + 1; j < arr.length; j++) {

        comparisons++;

        if (arr[j] < arr[minIndex]) {
          minIndex = j;
        }
      }

      swap(i, minIndex);
    }
  }

  // INSERTION SORT
  else if (algorithm === "insertion") {

    for (let i = 1; i < arr.length; i++) {

      const key = arr[i];
      let j = i - 1;

      while (j >= 0) {

        comparisons++;

        if (arr[j] > key) {

          arr[j + 1] = arr[j];
          writes++;

          j--;

        } else {
          break;
        }
      }

      arr[j + 1] = key;
      writes++;
    }
  }

  // MERGE SORT
  else if (algorithm === "merge") {

    const merge = (
      left: number,
      mid: number,
      right: number
    ) => {

      const L = arr.slice(left, mid + 1);
      const R = arr.slice(mid + 1, right + 1);

      let i = 0;
      let j = 0;
      let k = left;

      while (i < L.length && j < R.length) {

        comparisons++;

        if (L[i] <= R[j]) {
          arr[k++] = L[i++];
        } else {
          arr[k++] = R[j++];
        }

        writes++;
      }

      while (i < L.length) {
        arr[k++] = L[i++];
        writes++;
      }

      while (j < R.length) {
        arr[k++] = R[j++];
        writes++;
      }
    };

    const mergeSort = (left: number, right: number) => {

      if (left >= right) return;

      const mid = Math.floor((left + right) / 2);

      mergeSort(left, mid);
      mergeSort(mid + 1, right);

      merge(left, mid, right);
    };

    mergeSort(0, arr.length - 1);
  }

  // QUICK SORT
  else if (algorithm === "quick") {

    const partition = (low: number, high: number) => {

      const pivot = arr[high];

      let i = low - 1;

      for (let j = low; j < high; j++) {

        comparisons++;

        if (arr[j] < pivot) {
          i++;
          swap(i, j);
        }
      }

      swap(i + 1, high);

      return i + 1;
    };

    const quickSort = (low: number, high: number) => {

      if (low < high) {

        const pivotIndex = partition(low, high);

        quickSort(low, pivotIndex - 1);
        quickSort(pivotIndex + 1, high);
      }
    };

    quickSort(0, arr.length - 1);
  }

  // HEAP SORT
  else if (algorithm === "heap") {

    const heapify = (size: number, root: number) => {

      let largest = root;

      const left = 2 * root + 1;
      const right = 2 * root + 2;

      if (left < size) {

        comparisons++;

        if (arr[left] > arr[largest]) {
          largest = left;
        }
      }

      if (right < size) {

        comparisons++;

        if (arr[right] > arr[largest]) {
          largest = right;
        }
      }

      if (largest !== root) {

        swap(root, largest);

        heapify(size, largest);
      }
    };

    const n = arr.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    // Extract maximum
    for (let i = n - 1; i > 0; i--) {

      swap(0, i);

      heapify(i, 0);
    }
  }

  const executionTime = performance.now() - start;

  // Analyse original input behaviour
  let ascending = true;
  let descending = true;

  for (let i = 1; i < input.length; i++) {

    if (input[i] < input[i - 1]) {
      ascending = false;
    }

    if (input[i] > input[i - 1]) {
      descending = false;
    }
  }

  let inputBehaviour = "Random / Mixed";

  if (ascending) {
    inputBehaviour = "Already Sorted";
  } else if (descending) {
    inputBehaviour = "Reverse Sorted";
  }

  let caseType: CaseType = "Input-Dependent";

switch (algorithm) {
  case "bubble":
  case "insertion":
    if (ascending) {
      caseType = "Best Case";
    } else if (descending) {
      caseType = "Worst Case";
    } else {
      caseType = "Average Case";
    }
    break;

  case "selection":
  case "merge":
  case "heap":
    caseType = "Same for All Cases";
    break;

  case "quick":
    caseType = ascending || descending
      ? "Worst Case"
      : "Average Case";
    break;
}

  return {
  inputSize: input.length,
  comparisons,
  swaps,
  writes,
  executionTime,
  inputBehaviour,
  caseType
};

}