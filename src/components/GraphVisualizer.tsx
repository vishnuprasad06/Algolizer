import { Play, RotateCcw, Pause, ChevronLeft, ChevronRight, Trash2, Info } from 'lucide-react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge, GraphStep } from '../types';

type GraphAlgo = 'bfs' | 'dfs' | 'dijkstra';

const ALGO_INFO: Record<GraphAlgo, { name: string; desc: string; when: string; complexity: string }> = {
  bfs: {
    name: 'Breadth-First Search',
    desc: 'Explores all neighbors at the current depth level before moving to nodes at the next depth level. Uses a Queue (FIFO) to track which node to visit next.',
    when: 'Finding shortest path in unweighted graphs, level-order traversal, finding all reachable nodes.',
    complexity: 'Time: O(V + E) · Space: O(V)',
  },
  dfs: {
    name: 'Depth-First Search',
    desc: 'Explores as far as possible along each branch before backtracking. Uses a Stack (or recursion) to track the path. May not find the shortest path.',
    when: 'Detecting cycles, topological sorting, finding connected components, maze solving.',
    complexity: 'Time: O(V + E) · Space: O(V)',
  },
  dijkstra: {
    name: "Dijkstra's Shortest Path",
    desc: 'Finds the shortest path from a source node to all other nodes in a weighted graph. Uses a greedy approach — always processes the unvisited node with the smallest known distance.',
    when: 'GPS navigation, network routing protocols, flight path optimization. Only works with non-negative weights.',
    complexity: 'Time: O((V + E) log V) · Space: O(V)',
  },
};

const GRAPH_PSEUDOCODE: Record<GraphAlgo, string[]> = {
  bfs: [
    'BFS(graph, start):',
    '  queue = [start]',
    '  visited = {start}',
    '',
    '  while queue is not empty:',
    '    current = queue.dequeue()   // FIFO',
    '    process(current)',
    '',
    '    for each neighbor of current:',
    '      if neighbor not in visited:',
    '        visited.add(neighbor)',
    '        queue.enqueue(neighbor)',
    '',
    'Result: Visits nodes level by level.',
    'Guarantees shortest path (unweighted).',
  ],
  dfs: [
    'DFS(graph, start):',
    '  stack = [start]',
    '  visited = {}',
    '',
    '  while stack is not empty:',
    '    current = stack.pop()       // LIFO',
    '    if current in visited: skip',
    '    visited.add(current)',
    '    process(current)',
    '',
    '    for each neighbor of current:',
    '      if neighbor not in visited:',
    '        stack.push(neighbor)',
    '',
    'Result: Explores deep before backtracking.',
    'Does NOT guarantee shortest path.',
  ],
  dijkstra: [
    "Dijkstra(graph, start):",
    '  dist[start] = 0',
    '  dist[all others] = ∞',
    '  unvisited = all nodes',
    '',
    '  while unvisited is not empty:',
    '    current = node with min dist',
    '    remove current from unvisited',
    '',
    '    for each neighbor of current:',
    '      new_dist = dist[current] + weight',
    '      if new_dist < dist[neighbor]:',
    '        dist[neighbor] = new_dist  // relax',
    '',
    'Result: Shortest distance from start',
    'to every other node in the graph.',
  ],
};

const ALGO_COLOR: Record<GraphAlgo, string> = {
  bfs: 'var(--cyan)', dfs: 'var(--accent)', dijkstra: 'var(--yellow)',
};

export const GraphVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mode, setMode] = useState<'add-node' | 'add-edge' | 'delete'>('add-node');
  const [algorithm, setAlgorithm] = useState<GraphAlgo>('bfs');
  const [steps, setSteps] = useState<GraphStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [edgeWeight, setEdgeWeight] = useState('1');
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [showInfo, setShowInfo] = useState(false);
  const [showPseudo, setShowPseudo] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const getNodeColor = (id: string) => {
    if (currentStepIndex < 0 || !steps[currentStepIndex]) return 'var(--surface2)';
    const step = steps[currentStepIndex];
    if (step.currentNodeId === id) return 'var(--yellow)';
    if (step.visitedNodes?.includes(id)) return 'var(--green)';
    return 'var(--surface2)';
  };

  const getNodeTextColor = (id: string) => {
    if (currentStepIndex < 0 || !steps[currentStepIndex]) return 'var(--text)';
    const step = steps[currentStepIndex];
    if (step.currentNodeId === id || step.visitedNodes?.includes(id)) return '#000';
    return 'var(--text)';
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (mode !== 'add-node' || dragging) return;
    if (containerRef.current) {
      const svg = containerRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const cp = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      const newNode: Node = {
        id: Math.random().toString(36).substr(2, 9),
        x: cp.x, y: cp.y,
        label: String.fromCharCode(65 + (nodes.length % 26)),
      };
      setNodes(prev => [...prev, newNode]);
      resetSteps();
    }
  };

  const handleNodeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'delete') {
      setNodes(prev => prev.filter(n => n.id !== id));
      setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
      resetSteps(); return;
    }
    if (mode === 'add-edge') {
      if (!selectedNodeId) { setSelectedNodeId(id); return; }
      if (selectedNodeId === id) { setSelectedNodeId(null); return; }
      const exists = edges.find(e => (e.from === selectedNodeId && e.to === id) || (e.from === id && e.to === selectedNodeId));
      if (!exists) {
        const w = parseInt(edgeWeight) || 1;
        setEdges(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), from: selectedNodeId, to: id, weight: w }]);
        resetSteps();
      }
      setSelectedNodeId(null);
    }
  };

  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    if (mode !== 'add-node') return;
    e.preventDefault(); setDragging(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const svg = containerRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const cp = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: cp.x, y: cp.y } : n));
  };

  const handleMouseUp = () => setDragging(null);

  const resetSteps = () => { setSteps([]); setCurrentStepIndex(-1); setIsPlaying(false); setDistances({}); };

  const runBFS = (startId: string) => {
    const localSteps: GraphStep[] = [];
    const queue = [startId]; const visited = new Set<string>();
    localSteps.push({ description: `Breadth-First Search from node ${nodes.find(n => n.id === startId)?.label} — Initialize queue`, activeIndices: [], sortedIndices: [], type: 'set', visitedNodes: [], currentNodeId: startId });
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      localSteps.push({ description: `Dequeue and visit node ${nodes.find(n => n.id === cur)?.label}`, activeIndices: [], sortedIndices: [], type: 'visited', visitedNodes: [...visited], currentNodeId: cur });
      const neighbors = edges.filter(e => e.from === cur || e.to === cur).map(e => e.from === cur ? e.to : e.from);
      for (const nb of neighbors) {
        if (!visited.has(nb)) {
          queue.push(nb);
          localSteps.push({ description: `Enqueue neighbor ${nodes.find(n => n.id === nb)?.label} — not yet visited`, activeIndices: [], sortedIndices: [], type: 'compare', visitedNodes: [...visited], currentNodeId: nb });
        }
      }
    }
    localSteps.push({ description: 'Breadth-First Search complete — all reachable nodes visited', activeIndices: [], sortedIndices: [], type: 'complete', visitedNodes: [...visited] });
    setSteps(localSteps); setCurrentStepIndex(0); setIsPlaying(true);
  };

  const runDFS = (startId: string) => {
    const localSteps: GraphStep[] = [];
    const visited = new Set<string>();
    const dfs = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      localSteps.push({ description: `Visit node ${nodes.find(n => n.id === id)?.label} — push onto call stack`, activeIndices: [], sortedIndices: [], type: 'visited', visitedNodes: [...visited], currentNodeId: id });
      const neighbors = edges.filter(e => e.from === id || e.to === id).map(e => e.from === id ? e.to : e.from);
      for (const nb of neighbors) {
        if (!visited.has(nb)) {
          localSteps.push({ description: `Explore unvisited neighbor ${nodes.find(n => n.id === nb)?.label}`, activeIndices: [], sortedIndices: [], type: 'compare', visitedNodes: [...visited], currentNodeId: nb });
          dfs(nb);
        }
      }
    };
    localSteps.push({ description: `Depth-First Search from node ${nodes.find(n => n.id === startId)?.label} — Initialize`, activeIndices: [], sortedIndices: [], type: 'set', visitedNodes: [], currentNodeId: startId });
    dfs(startId);
    localSteps.push({ description: 'Depth-First Search complete — all reachable nodes explored', activeIndices: [], sortedIndices: [], type: 'complete', visitedNodes: [...visited] });
    setSteps(localSteps); setCurrentStepIndex(0); setIsPlaying(true);
  };

  const runDijkstra = (startId: string) => {
    const localSteps: GraphStep[] = [];
    const dist: Record<string, number> = {};
    const unvisited = new Set(nodes.map(n => n.id));
    nodes.forEach(n => { dist[n.id] = n.id === startId ? 0 : Infinity; });
    localSteps.push({ description: `Dijkstra from ${nodes.find(n => n.id === startId)?.label} — Set all distances to ∞, start = 0`, activeIndices: [], sortedIndices: [], type: 'set', visitedNodes: [], currentNodeId: startId });
    while (unvisited.size > 0) {
      const cur = [...unvisited].reduce((a, b) => (dist[a] ?? Infinity) < (dist[b] ?? Infinity) ? a : b);
      if (dist[cur] === Infinity) break;
      unvisited.delete(cur);
      const curLabel = nodes.find(n => n.id === cur)?.label;
      localSteps.push({ description: `Process node ${curLabel} — current shortest distance = ${dist[cur]}`, activeIndices: [], sortedIndices: [], type: 'visited', visitedNodes: nodes.map(n => n.id).filter(id => !unvisited.has(id)), currentNodeId: cur });
      const neighbors = edges.filter(e => e.from === cur || e.to === cur);
      for (const edge of neighbors) {
        const nb = edge.from === cur ? edge.to : edge.from;
        if (!unvisited.has(nb)) continue;
        const alt = dist[cur] + (edge.weight || 1);
        if (alt < dist[nb]) {
          dist[nb] = alt;
          const nbLabel = nodes.find(n => n.id === nb)?.label;
          localSteps.push({ description: `Relax edge to ${nbLabel}: new shortest distance = ${alt}`, activeIndices: [], sortedIndices: [], type: 'compare', visitedNodes: nodes.map(n => n.id).filter(id => !unvisited.has(id)), currentNodeId: nb });
        }
      }
    }
    localSteps.push({ description: `Dijkstra complete — shortest paths computed from source`, activeIndices: [], sortedIndices: [], type: 'complete', visitedNodes: nodes.map(n => n.id) });
    setDistances(dist);
    setSteps(localSteps); setCurrentStepIndex(0); setIsPlaying(true);
  };

  const handleRun = () => {
    if (nodes.length === 0) return;
    const startId = nodes[0].id;
    if (algorithm === 'bfs') runBFS(startId);
    else if (algorithm === 'dfs') runDFS(startId);
    else runDijkstra(startId);
  };

  const handleNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(p => p + 1);
    else setIsPlaying(false);
  }, [currentStepIndex, steps.length]);

  useEffect(() => {
    if (isPlaying) timerRef.current = setInterval(handleNextStep, speed);
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, handleNextStep, speed]);

  const loadPreset = () => {
    const preset: Node[] = [
      { id: 'a', x: 160, y: 100, label: 'A' }, { id: 'b', x: 320, y: 80, label: 'B' },
      { id: 'c', x: 480, y: 100, label: 'C' }, { id: 'd', x: 200, y: 220, label: 'D' },
      { id: 'e', x: 400, y: 220, label: 'E' }, { id: 'f', x: 300, y: 320, label: 'F' },
    ];
    const pe: Edge[] = [
      { id: 'e1', from: 'a', to: 'b', weight: 4 }, { id: 'e2', from: 'a', to: 'd', weight: 2 },
      { id: 'e3', from: 'b', to: 'c', weight: 3 }, { id: 'e4', from: 'b', to: 'e', weight: 5 },
      { id: 'e5', from: 'd', to: 'e', weight: 1 }, { id: 'e6', from: 'e', to: 'c', weight: 2 },
      { id: 'e7', from: 'e', to: 'f', weight: 4 }, { id: 'e8', from: 'c', to: 'f', weight: 6 },
    ];
    setNodes(preset); setEdges(pe); resetSteps();
  };

  const ac = ALGO_COLOR[algorithm];
  const currentStep = steps[currentStepIndex];
  const visitedNodes = currentStep?.visitedNodes || [];
  const currentNodeId = currentStep?.currentNodeId;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="glass p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select value={algorithm} onChange={e => { setAlgorithm(e.target.value as GraphAlgo); resetSteps(); }}>
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS)</option>
            <option value="dijkstra">Dijkstra's Shortest Path</option>
          </select>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)' }} className="flex rounded-lg overflow-hidden text-sm">
            {(['add-node', 'add-edge', 'delete'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={mode === m ? { background: ac, color: '#000', fontWeight: 700 } : { color: 'var(--text3)' }}
                className="px-3 py-2 text-xs">
                {m === 'add-node' ? '+ Add Node' : m === 'add-edge' ? '⟶ Add Edge' : '✕ Delete'}
              </button>
            ))}
          </div>
          {mode === 'add-edge' && (
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: 'var(--text3)' }} className="text-xs">Edge Weight:</span>
              <input type="number" value={edgeWeight} onChange={e => setEdgeWeight(e.target.value)} className="w-16" min="1" />
            </div>
          )}
          <button onClick={loadPreset}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)' }}
            className="px-3 py-2 rounded-lg text-sm">Load Preset</button>
          <button onClick={() => { setNodes([]); setEdges([]); resetSteps(); }}
            style={{ border: '1px solid rgba(255,95,126,0.3)', color: 'var(--red)' }}
            className="px-3 py-2 rounded-lg text-sm flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Clear All
          </button>
          <button onClick={() => setShowInfo(p => !p)}
            style={showInfo ? { background: `${ac}20`, color: ac, border: `1px solid ${ac}40` } : { color: 'var(--text3)', border: '1px solid var(--border)' }}
            className="p-2 rounded-lg">
            <Info className="w-4 h-4" />
          </button>
        </div>
        <button onClick={handleRun} disabled={nodes.length === 0}
          style={{ background: ac, color: '#000', boxShadow: `0 0 16px ${ac}50` }}
          className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold disabled:opacity-40">
          <Play className="w-4 h-4" fill="black" /> Run {ALGO_INFO[algorithm].name.split(' ').slice(0, 2).join(' ')}
        </button>
      </div>

      {/* Algorithm info panel */}
      {showInfo && (
        <div className="glass p-5 flex flex-col gap-3" style={{ borderLeft: `4px solid ${ac}` }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-base" style={{ color: ac }}>{ALGO_INFO[algorithm].name}</h3>
              <p className="text-sm leading-relaxed mt-1" style={{ color: 'var(--text2)' }}>{ALGO_INFO[algorithm].desc}</p>
            </div>
            <span className="tag whitespace-nowrap" style={{ background: `${ac}20`, color: ac, border: `1px solid ${ac}40` }}>
              {ALGO_INFO[algorithm].complexity}
            </span>
          </div>
          <div style={{ background: 'rgba(34,211,160,0.08)', border: '1px solid rgba(34,211,160,0.2)' }} className="rounded-lg p-3">
            <span style={{ color: 'var(--green)' }} className="font-bold text-xs uppercase tracking-wider">Best Used For</span>
            <p style={{ color: 'var(--text2)' }} className="mt-1 text-xs leading-relaxed">{ALGO_INFO[algorithm].when}</p>
          </div>
        </div>
      )}

      {currentStep && (
        <div style={{ background: 'var(--surface)', border: `1px solid ${ac}40` }} className="rounded-lg px-4 py-2 text-sm font-mono">
          <span style={{ color: 'var(--text3)' }}>Step {currentStepIndex + 1} of {steps.length} › </span>
          <span style={{ color: ac }}>{currentStep.description}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Canvas */}
       <div
  className="lg:col-span-3 glass overflow-hidden rounded-xl"
  style={{ minHeight: 320, height: 320 }}
>
          <svg ref={containerRef} width="100%" height="440"
            onClick={handleCanvasClick} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
            style={{ cursor: mode === 'add-node' ? 'crosshair' : 'default' }}>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="var(--border2)" />
              </marker>
            </defs>
            {edges.map(edge => {
              const from = nodes.find(n => n.id === edge.from);
              const to = nodes.find(n => n.id === edge.to);
              if (!from || !to) return null;
              const isActive = visitedNodes.includes(edge.from) && visitedNodes.includes(edge.to);
              const mx = (from.x + to.x) / 2; const my = (from.y + to.y) / 2;
              return (
                <g key={edge.id}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={isActive ? ac : 'var(--border2)'} strokeWidth={isActive ? 2.5 : 1.5}
                    style={{ transition: 'stroke 0.3s' }} />
                  {algorithm === 'dijkstra' && (
                    <g>
                      <circle cx={mx} cy={my} r={11} fill="var(--bg3)" stroke="var(--border)" strokeWidth="1" />
                      <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--text3)" fontSize="10" fontFamily="JetBrains Mono" fontWeight="700">
                        {edge.weight ?? 1}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
            {nodes.map(node => {
              const isSelected = selectedNodeId === node.id;
              const nc = getNodeColor(node.id);
              const tc = getNodeTextColor(node.id);
              const isCurrent = currentNodeId === node.id;
              const dist = distances[node.id];
              const isStart = nodes[0]?.id === node.id;
              return (
                <g key={node.id} onClick={e => handleNodeClick(node.id, e)}
                  onMouseDown={e => handleNodeMouseDown(node.id, e)}
                  style={{ cursor: mode === 'add-node' ? 'grab' : 'pointer' }}>
                  {isStart && steps.length > 0 && (
                    <circle cx={node.x} cy={node.y} r={32} fill="none" stroke={ac} strokeWidth="1" strokeDasharray="4 4" opacity={0.4} />
                  )}
                  <circle cx={node.x} cy={node.y} r={24}
                    fill={nc} stroke={isSelected ? 'var(--yellow)' : isCurrent ? ac : 'var(--border2)'}
                    strokeWidth={isSelected || isCurrent ? 3 : 1.5}
                    style={{ filter: isCurrent ? `drop-shadow(0 0 8px ${ac})` : 'none', transition: 'all 0.3s' }} />
                  <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill={tc} fontSize="14" fontWeight="800" fontFamily="Space Grotesk"
                    style={{ transition: 'fill 0.3s', pointerEvents: 'none' }}>
                    {node.label}
                  </text>
                  {algorithm === 'dijkstra' && dist !== undefined && dist !== Infinity && (
                    <text x={node.x} y={node.y + 38} textAnchor="middle" fill={ac} fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">
                      dist={dist}
                    </text>
                  )}
                </g>
              );
            })}
            {nodes.length === 0 && (
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="var(--text3)" fontSize="14" fontFamily="Space Grotesk">
                Click canvas in "Add Node" mode to place nodes
              </text>
            )}
          </svg>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Playback */}
          <div className="glass p-4 flex flex-col gap-3">
            <h3 className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text3)' }}>// Playback</h3>
            <div className="flex items-center gap-2 justify-center">
              <button onClick={() => setCurrentStepIndex(p => Math.max(0, p - 1))} disabled={currentStepIndex <= 0}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)' }}
                className="p-2 rounded-lg disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} disabled={steps.length === 0}
                style={{ background: ac, color: '#000' }} className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button onClick={() => setCurrentStepIndex(p => Math.min(steps.length - 1, p + 1))} disabled={currentStepIndex >= steps.length - 1}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)' }}
                className="p-2 rounded-lg disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono" style={{ color: 'var(--text3)' }}>
                <span>Speed delay</span><span>{speed}ms</span>
              </div>
              <input type="range" min="100" max="2000" step="100" value={speed} onChange={e => setSpeed(+e.target.value)} className="w-full" />
            </div>
          </div>

          {/* Pseudocode */}
          <div className="glass flex flex-col overflow-hidden">
            <div style={{ borderBottom: '1px solid var(--border)' }} className="px-3 py-2 flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text3)' }}>// Pseudocode</h3>
              <button onClick={() => setShowPseudo(p => !p)} style={{ color: 'var(--text3)', fontSize: 11 }}>{showPseudo ? '▲' : '▼'}</button>
            </div>
            {showPseudo && (
              <div className="p-3 font-mono text-xs flex flex-col gap-0.5 overflow-y-auto" style={{ maxHeight: 220 }}>
                {GRAPH_PSEUDOCODE[algorithm].map((line, idx) => (
                  <div key={idx} style={{ color: line === '' ? 'transparent' : line.endsWith(':') ? ac : line.startsWith('Result:') || line.startsWith('Note:') ? 'var(--text3)' : line.startsWith('  //') ? 'var(--text3)' : 'var(--text2)' }}
                    className="px-1 py-0.5 leading-relaxed">
                    <pre className="whitespace-pre-wrap">{line || ' '}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="glass p-4 flex flex-col gap-2">
            <h3 className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text3)' }}>// Color Legend</h3>
            {[
              { c: 'var(--yellow)', l: 'Current Node (Processing)' },
              { c: 'var(--green)', l: 'Visited Node' },
              { c: 'var(--surface2)', l: 'Unvisited Node' },
              { c: ac, l: 'Active Edge' },
            ].map(l => (
              <div key={l.l} className="flex items-center gap-2 text-xs">
                <div style={{ background: l.c, width: 10, height: 10, borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ color: 'var(--text2)' }}>{l.l}</span>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="glass p-4 flex flex-col gap-2">
            <h3 className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text3)' }}>// How to Use</h3>
            <div className="text-xs flex flex-col gap-1.5" style={{ color: 'var(--text2)' }}>
              <p>① Select <strong>Add Node</strong> mode — click canvas to place nodes</p>
              <p>② Select <strong>Add Edge</strong> mode — click two nodes to connect them</p>
              <p>③ For Dijkstra, set edge weight before connecting</p>
              <p>④ In Add Node mode, drag nodes to reposition</p>
              <p>⑤ First node placed becomes the start node</p>
              <p>⑥ Hit <strong>Run</strong> to visualize the algorithm</p>
            </div>
          </div>

          {/* Trace */}
          {steps.length > 0 && (
            <div className="glass flex flex-col overflow-hidden">
              <div style={{ borderBottom: '1px solid var(--border)' }} className="px-3 py-2">
                <h3 className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text3)' }}>// Execution Trace</h3>
              </div>
              <div className="overflow-y-auto p-2 flex flex-col gap-0.5" style={{ maxHeight: 180 }}>
                {steps.map((s, i) => (
                  <div key={i} onClick={() => { setCurrentStepIndex(i); setIsPlaying(false); }}
                    style={i === currentStepIndex
                      ? { background: `${ac}15`, color: ac, borderLeft: `3px solid ${ac}` }
                      : { color: 'var(--text3)', borderLeft: '3px solid transparent' }}
                    className="text-xs font-mono px-2 py-1 rounded-r cursor-pointer">
                    {String(i + 1).padStart(2, '0')}. {s.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
