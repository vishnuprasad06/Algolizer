import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, BarChart2, Square, Info } from 'lucide-react';
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';
import { analyzeSortingInput } from '../algorithms/sortingAnalysis';
import { generateSteps } from '../algorithms/sorting';
import { AnimationStep, SORTING_COMPLEXITIES, SortingAlgorithm } from '../types';
import { Tile, Bar } from './Tile';

const PSEUDOCODE: Record<SortingAlgorithm, string[]> = {
  bubble: [
    'for i from 0 to n-1:',
    '  for j from 0 to n-i-1:',
    '    if arr[j] > arr[j+1]:',
    '      swap(arr[j], arr[j+1])',
    '  mark arr[n-i-1] as sorted',
  ],
  selection: [
    'for i from 0 to n-1:',
    '  minimum_index = i',
    '  for j from i+1 to n:',
    '    if arr[j] < arr[minimum_index]:',
    '      minimum_index = j',
    '  swap(arr[i], arr[minimum_index])',
    '  mark arr[i] as sorted',
  ],
  insertion: [
    'for i from 1 to n:',
    '  key = arr[i]',
    '  j = i - 1',
    '  while j >= 0 and arr[j] > key:',
    '    arr[j+1] = arr[j]   // shift right',
    '    j = j - 1',
    '  arr[j+1] = key        // place key',
    '  mark arr sorted up to i',
  ],
  merge: [
    'mergeSort(arr, low, high):',
    '  if low < high:',
    '    mid = (low + high) / 2',
    '    mergeSort(arr, low, mid)',
    '    mergeSort(arr, mid+1, high)',
    '    merge(arr, low, mid, high)',
  ],
  quick: [
    'quickSort(arr, low, high):',
    '  if low < high:',
    '    pivot_index = partition(arr, low, high)',
    '    quickSort(arr, low, pivot_index - 1)',
    '    quickSort(arr, pivot_index + 1, high)',
    'partition(arr, low, high):',
    '  pivot = arr[high]',
    '  i = low - 1',
    '  for j from low to high-1:',
    '    if arr[j] < pivot:',
    '      i++; swap(arr[i], arr[j])',
    '  swap(arr[i+1], arr[high]); return i+1',
  ],
  heap: [
    'heapSort(arr):',
    '  buildMaxHeap(arr)',
    '  for i from n-1 to 1:',
    '    swap(arr[0], arr[i])',
    '    maxHeapify(arr, 0, i)',
    'maxHeapify(arr, i, size):',
    '  largest = i',
    '  left = 2*i+1; right = 2*i+2',
    '  if left < size and arr[left] > arr[largest]:',
    '    largest = left',
    '  if right < size and arr[right] > arr[largest]:',
    '    largest = right',
    '  if largest != i: swap and heapify',
  ],
};

const ALGO_INFO: Record<SortingAlgorithm, { name: string; desc: string; when: string; avoid: string }> = {
  bubble: {
    name: 'Bubble Sort',
    desc: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The largest unsorted element "bubbles up" to its correct position each pass.',
    when: 'Use when the array is small or nearly sorted. Simple to implement and understand.',
    avoid: 'Avoid on large datasets — O(n²) comparisons make it very slow.',
  },
  selection: {
    name: 'Selection Sort',
    desc: 'Divides the array into a sorted and unsorted region. On each pass, finds the minimum element from the unsorted region and places it at the beginning of the sorted region.',
    when: 'Useful when memory writes are expensive, since it makes at most O(n) swaps.',
    avoid: 'Avoid when stability is required or when n is large — always O(n²).',
  },
  insertion: {
    name: 'Insertion Sort',
    desc: 'Builds the sorted array one element at a time by taking each element and inserting it into its correct position among the already-sorted elements.',
    when: 'Excellent for small arrays or nearly sorted data. Used as a base case in Timsort.',
    avoid: 'Avoid for large, randomly ordered data — worst case is O(n²).',
  },
  merge: {
    name: 'Merge Sort',
    desc: 'A divide-and-conquer algorithm that splits the array in half, recursively sorts each half, then merges the sorted halves. Guarantees O(n log n) in all cases.',
    when: 'Best when stability is required or when sorting linked lists. Preferred for external sorting.',
    avoid: 'Requires O(n) extra space — avoid in memory-constrained environments.',
  },
  quick: {
    name: 'Quick Sort',
    desc: 'Selects a pivot element and partitions the array around it so elements less than pivot are left and greater are right, then recursively sorts each partition.',
    when: 'Best general-purpose sort in practice — fast cache performance, in-place sorting.',
    avoid: 'Avoid without randomization — O(n²) worst case on already-sorted arrays.',
  },
  heap: {
    name: 'Heap Sort',
    desc: 'Builds a max-heap from the array, then repeatedly extracts the maximum element and rebuilds the heap. Achieves O(n log n) with O(1) extra space.',
    when: 'Use when guaranteed O(n log n) with no extra space is needed.',
    avoid: 'Avoid when cache performance matters — poor locality compared to Quick Sort.',
  },
};

const ALGO_COLORS: Record<SortingAlgorithm, string> = {
  bubble: 'var(--accent)', selection: 'var(--cyan)', insertion: 'var(--green)',
  merge: 'var(--yellow)', quick: 'var(--red)', heap: 'var(--pink)',
};

export const SortingVisualizer: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('bubble');
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [speed, setSpeed] = useState(1);
const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [viewMode, setViewMode] = useState<'tile' | 'bar'>('tile');
 const [arraySize, setArraySize] = useState(6);
 const [arraySizeInput, setArraySizeInput] = useState("6");
  const [showInfo, setShowInfo] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const traceRef = useRef<HTMLDivElement>(null);
  const vizScrollRef = useRef<HTMLDivElement>(null);

const updateArraySize = () => {
  const parsed = Number(arraySizeInput);

  if (arraySizeInput.trim() === "" || !Number.isInteger(parsed)) {
    setArraySizeInput(String(arraySize));
    return;
  }

  const newSize = Math.max(2, Math.min(parsed, 20));

  setArraySize(newSize);
  setArraySizeInput(String(newSize));
};

  const generateRandomArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 85) + 10);
    setArray(newArray);
    setSteps(generateSteps(algorithm, newArray));
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [algorithm, arraySize]);

  useEffect(() => { generateRandomArray(); }, [generateRandomArray]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p); }
      if (e.code === 'ArrowRight') setCurrentStepIndex(p => Math.min(steps.length - 1, p + 1));
      if (e.code === 'ArrowLeft') setCurrentStepIndex(p => Math.max(0, p - 1));
      if (e.code === 'KeyR') generateRandomArray();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [steps.length, generateRandomArray]);

  const handleNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(p => p + 1);
    else setIsPlaying(false);
  }, [currentStepIndex, steps.length]);

  useEffect(() => {
  if (isPlaying) {
    timerRef.current = setInterval(
      handleNextStep,
      600 / speed
    );
  } else if (timerRef.current) {
    clearInterval(timerRef.current);
  }

  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [isPlaying, handleNextStep, speed]);

  useEffect(() => {
    if (traceRef.current) {
      const el = traceRef.current.querySelector(`[data-step="${currentStepIndex}"]`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  const setCustomArray = () => {
    const nums = inputValue.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    if (nums.length > 0) {
      const arr = nums.slice(0, 20);
      setArray(arr);
      setSteps(generateSteps(algorithm, arr));
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  };

  const currentStep = steps[currentStepIndex];
  const currentArray = currentStep?.arrayState || array;
  const complexity = SORTING_COMPLEXITIES[algorithm];
  const analysis = useMemo(
  () => analyzeSortingInput(algorithm, array),
  [algorithm, array]
);
  const maxVal = Math.max(...currentArray, 1);
  const accentColor = ALGO_COLORS[algorithm];
  const progress = steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;
  const algoInfo = ALGO_INFO[algorithm];

  return (
    <div 
    
   className="flex flex-col gap-4 p-4 w-full max-w-7xl min-w-0 mx-auto min-h-screen pb-12">
      <div className="glass p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value as SortingAlgorithm)}>
            <option value="bubble">Bubble Sort</option>
            <option value="selection">Selection Sort</option>
            <option value="insertion">Insertion Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="quick">Quick Sort</option>
            <option value="heap">Heap Sort</option>
          </select>
          <button onClick={generateRandomArray}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)' }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold">
            <RotateCcw className="w-4 h-4" /> Randomize
          </button>
          {/* Array Size Input */}
<div className="flex items-center gap-2">

  <label
    htmlFor="array-size"
    className="text-xs font-semibold"
    style={{ color: 'var(--text3)' }}
  >
    Size:
  </label>

  <input
    id="array-size"
    type="number"
    min={2}
    max={20}
    step={1}
    value={arraySizeInput}
    onChange={(e) => setArraySizeInput(e.target.value)}
    onBlur={updateArraySize}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        updateArraySize();
        e.currentTarget.blur();
      }
    }}
    className="w-16 px-2 py-2 rounded-lg text-sm font-mono text-center outline-none"
    style={{
      background: 'var(--bg3)',
      color: 'var(--text)',
      border: '1px solid var(--border2)'
    }}
  />

</div>
          {/* View toggle */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)' }} className="flex rounded-lg overflow-hidden">
            {(['tile', 'bar'] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                style={viewMode === v ? { background: accentColor, color: '#fff' } : { color: 'var(--text3)' }}
                className="px-3 py-2 text-xs font-semibold">
                {v === 'bar' ? <BarChart2 className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              </button>
            ))}
          </div>
          <button onClick={() => setShowInfo(p => !p)}
            style={showInfo ? { background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` } : { color: 'var(--text3)', border: '1px solid var(--border)' }}
            className="p-2 rounded-lg">
            <Info className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="e.g. 10, 25, 73, 5" value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setCustomArray()} className="w-44" />
          <button onClick={setCustomArray}
           style={{
  background: 'rgba(37,99,235,0.08)',
  color: 'var(--blue)',
  border: '1px solid var(--border2)'
}}
            className="px-4 py-2 rounded-lg text-sm font-semibold">Set Array</button>
        </div>
      </div>

      {/* Algorithm info panel */}
      {showInfo && (
        <div className="glass p-5 flex flex-col gap-3" style={{ borderLeft: `4px solid ${accentColor}` }}>
  <h3 className="font-bold text-base" style={{ color: accentColor }}>
    {algoInfo.name}
  </h3>

  <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
    {algoInfo.desc}
  </p>

  <div className="grid sm:grid-cols-2 gap-3 text-sm">

    {/* When to Use */}
    <div
      style={{
        background: 'rgba(22,163,74,0.06)',
        border: '1px solid rgba(22,163,74,0.2)'
      }}
      className="rounded-lg p-3 min-w-0 overflow-hidden"
    >
      <span style={{ color: 'var(--green)' }} className="font-bold text-xs uppercase tracking-wider">
        When to Use
      </span>

      <p style={{ color: 'var(--text2)' }} className="mt-1 text-xs leading-relaxed">
        {algoInfo.when}
      </p>
    </div>

    {/* When to Avoid */}
    <div
      style={{
        background: 'rgba(255,95,126,0.08)',
        border: '1px solid rgba(255,95,126,0.2)'
      }}
      className="rounded-lg p-3 min-w-0 overflow-hidden"
    >
      <span style={{ color: 'var(--red)' }} className="font-bold text-xs uppercase tracking-wider">
        When to Avoid
      </span>

      <p style={{ color: 'var(--text2)' }} className="mt-1 text-xs leading-relaxed">
        {algoInfo.avoid}
      </p>
    </div>

  </div>
</div>
)}

      {/* Progress bar */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} className="rounded-full h-1.5 overflow-hidden">
        <div style={{ width: `${progress}%`, background: accentColor, transition: 'width 0.2s' }} className="h-full rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full min-w-0">
        {/* Left: Visualizer + controls */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-w-0 w-full">
          <div className="glass p-4 flex flex-col gap-4">
            {/* Scrollable visualization area */}
            <div ref={vizScrollRef} className="overflow-x-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border2) transparent' }}>
              {viewMode === 'bar' ? (
                <div className="flex items-end gap-2 px-2 justify-start" style={{ minHeight: 220, minWidth: currentArray.length * 52 }}>
                  {currentArray.map((val, idx) => {
                    let status: 'default' | 'active' | 'sorted' | 'special' = 'default';
                    if (currentStep?.activeIndices.includes(idx)) status = 'active';
                    else if (currentStep?.sortedIndices.includes(idx)) status = 'sorted';
                    return <Bar key={idx} value={val} maxValue={maxVal} index={idx} highlight={status} />;
                  })}
                </div>
              ) : (
                <div className="flex gap-3 py-4 px-2 justify-start" style={{ minWidth: currentArray.length * 72 }}>
                  {currentArray.map((val, idx) => {
                    let status: 'default' | 'active' | 'sorted' | 'special' = 'default';
                    if (currentStep?.activeIndices.includes(idx)) status = 'active';
                    else if (currentStep?.sortedIndices.includes(idx)) status = 'sorted';
                    return <Tile key={idx} value={val} index={idx} highlight={status} />;
                  })}
                </div>
              )}
            </div>

            {/* Step description */}
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }} className="rounded-lg px-4 py-2 text-sm font-mono">
              <span style={{ color: 'var(--text3)' }}>Step {currentStepIndex + 1} of {steps.length} › </span>
              <span style={{ color: accentColor }}>{currentStep?.description || 'Press Play to begin'}</span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="glass p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentStepIndex(p => Math.max(0, p - 1))} disabled={currentStepIndex === 0}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)' }}
                className="p-2 rounded-lg disabled:opacity-30" title="Previous Step (←)">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setIsPlaying(!isPlaying)}
                style={{ background: accentColor, boxShadow: `0 0 16px ${accentColor}50` }}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white" title="Play/Pause (Space)">
                {isPlaying ? <Pause className="w-5 h-5" fill="white" /> : <Play className="w-5 h-5 ml-0.5" fill="white" />}
              </button>
              <button onClick={() => setCurrentStepIndex(p => Math.min(steps.length - 1, p + 1))} disabled={currentStepIndex === steps.length - 1}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)' }}
                className="p-2 rounded-lg disabled:opacity-30" title="Next Step (→)">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
                style={{ color: 'var(--text3)', border: '1px solid var(--border)' }} className="px-3 py-2 rounded-lg text-sm">Reset</button>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-4 font-mono text-sm">
                <span><span style={{ color: 'var(--text3)' }}>Comparisons: </span><span style={{ color: 'var(--cyan)' }}>{currentStep?.stats?.comparisons ?? 0}</span></span>
                <span><span style={{ color: 'var(--text3)' }}>Swaps: </span><span style={{ color: 'var(--yellow)' }}>{currentStep?.stats?.swaps ?? 0}</span></span>
                <span><span style={{ color: 'var(--text3)' }}>Operations: </span><span style={{ color: 'var(--green)' }}>{currentStep?.stats?.operations ?? 0}</span></span>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSpeedMenu(open => !open)}
                  aria-expanded={showSpeedMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border2)' }}
                >
                  Speed: {speed}× <span className="text-xs">▾</span>
                </button>

                {showSpeedMenu && (
                  <>
                    <button
                      type="button"
                      aria-label="Close speed menu"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setShowSpeedMenu(false)}
                      tabIndex={-1}
                    />
                    <div
                      className="absolute right-0 bottom-full mb-2 w-44 rounded-xl p-2 z-50 shadow-xl"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border2)' }}
                    >
                      <p className="text-xs font-semibold px-3 py-2" style={{ color: 'var(--text3)' }}>
                        Playback speed
                      </p>
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4].map(value => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => {
                            setSpeed(value);
                            setShowSpeedMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                          style={{ background: speed === value ? 'var(--bg3)' : 'transparent', color: 'var(--text)' }}
                        >
                          <span>{value === 1 ? 'Normal' : `${value}×`}</span>
                          {speed === value && <span style={{ color: 'var(--accent)' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="flex gap-3 flex-wrap px-1">
            {[['Space', 'Play / Pause'], ['← →', 'Step'], ['R', 'Randomize']].map(([k, v]) => (
              <span key={k} className="text-xs font-mono" style={{ color: 'var(--text3)' }}>
                <span style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', padding: '1px 6px', borderRadius: 4 }}>{k}</span> {v}
              </span>
            ))}
          </div>

          {/* Trace log */}
          <div className="glass flex flex-col overflow-hidden">
            <div style={{ borderBottom: '1px solid var(--border)' }} className="px-4 py-3">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--text3)' }}>// Execution Trace Log</h3>
            </div>
            <div ref={traceRef} className="h-44 overflow-y-auto px-3 pb-3 flex flex-col gap-0.5">
              {steps.map((step, idx) => (
                <div key={idx} data-step={idx}
                  onClick={() => { setCurrentStepIndex(idx); setIsPlaying(false); }}
                  style={idx === currentStepIndex
                    ? { background: 'rgba(37,99,235,0.08)', borderLeft: `3px solid ${accentColor}`, color: 'var(--text)' }
                    : { borderLeft: '3px solid transparent', color: 'var(--text3)' }}
                  className="px-3 py-1.5 rounded-r-lg cursor-pointer text-xs font-mono hover:bg-[var(--surface2)] transition-colors">
                  <span style={{ color: 'var(--text3)' }}>{String(idx + 1).padStart(3, '0')} › </span>{step.description}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 min-w-0 w-full">
          {/* Pseudocode */}

<div className="glass flex flex-col overflow-hidden min-w-0 w-full">

  {/* Pseudocode Header */}

  <div
    style={{ borderBottom: '1px solid var(--border)' }}
    className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap min-w-0"
  >
    <h3
      className="text-xs font-mono font-bold uppercase tracking-wider"
      style={{ color: 'var(--text3)' }}
    >
      // Pseudocode
    </h3>

    <span
      className="text-xs font-semibold uppercase"
      style={{ color: accentColor }}
    >
      {algoInfo.name}
    </span>
  </div>

  {/* Pseudocode Content */}

  <div
    className="p-4 font-mono text-xs flex flex-col gap-0.5 overflow-y-auto"
    style={{ maxHeight: 240 }}
  >
    {PSEUDOCODE[algorithm].map((line, idx) => (
      <div
        key={idx}
        style={
          currentStep?.lineHighlight === idx
            ? {
                background: `${accentColor}20`,
                borderLeft: `3px solid ${accentColor}`,
                color: 'var(--text)',
              }
            : {
                borderLeft: '3px solid transparent',
                color: 'var(--text2)',
              }
        }
        className="px-2 py-0.5 rounded-r transition-all"
      >
        <pre className="whitespace-pre-wrap break-words">
          {line}
        </pre>
      </div>
    ))}
  </div>

</div>
        </div>
      </div>
    </div>
  );
};
