import { Plus, Minus, Trash2, Search } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

type DSType = 'stack' | 'queue' | 'sll' | 'dll' | 'csll' | 'cdll' | 'bst';

const DS_COLORS: Record<DSType, string> = {
  stack: 'var(--accent)', queue: 'var(--cyan)', sll: 'var(--green)',
  dll: 'var(--yellow)', csll: 'var(--pink)', cdll: 'var(--orange)', bst: 'var(--red)',
};

const DS_LABELS: Record<DSType, string> = {
  stack: 'Stack', queue: 'Queue', sll: 'Singly Linked List',
  dll: 'Doubly Linked List', csll: 'Circular Singly Linked List',
  cdll: 'Circular Doubly Linked List', bst: 'Binary Search Tree',
};

const DS_INFO: Record<DSType, { access: string; insert: string; delete: string; space: string; desc: string; principle: string }> = {
  stack: { access: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)', principle: 'Last In, First Out (LIFO)', desc: 'A stack allows push and pop only at the top. Think of a stack of plates — you add and remove from the same end. Used in function call stacks, undo operations, and expression parsing.' },
  queue: { access: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)', principle: 'First In, First Out (FIFO)', desc: 'A queue adds at the rear (Enqueue) and removes from the front (Dequeue). Think of a checkout line. Used in BFS traversal, task scheduling, and print spooling.' },
  sll: { access: 'O(n)', insert: 'O(1)', delete: 'O(n)', space: 'O(n)', principle: 'Forward-only traversal', desc: 'Each node holds data and a pointer to the next node. Traversal is one-directional from HEAD to NULL. Efficient for insertions/deletions at head; used in hash table chaining.' },
  dll: { access: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)', principle: 'Bidirectional traversal', desc: 'Each node has both a next and a prev pointer. Supports forward and backward traversal. Used in browsers (back/forward history), music players, and LRU cache.' },
  csll: { access: 'O(n)', insert: 'O(1)', delete: 'O(n)', space: 'O(n)', principle: 'Circular forward traversal', desc: 'Like a singly linked list but the TAIL node points back to HEAD, forming a loop. No NULL terminator. Used in round-robin schedulers, circular buffers, and token rings.' },
  cdll: { access: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)', principle: 'Circular bidirectional traversal', desc: 'A doubly linked list where TAIL.next = HEAD and HEAD.prev = TAIL. Supports traversal in both directions indefinitely. Used in OS ready-queue management and advanced data structures like Fibonacci heaps.' },
  bst: { access: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)', principle: 'Left < Node < Right', desc: 'A binary tree where every left child is smaller and every right child is larger than the parent. Enables O(log n) search, insert, and delete on average. Used in databases, file systems, and sorted sets.' },
};

const DS_PSEUDOCODE: Record<DSType, string[]> = {
  stack: [
    'Stack uses an array or linked list.',
    '',
    'push(value):',
    '  top = new Node(value)',
    '  top.next = stack_top',
    '  stack_top = top',
    '',
    'pop():',
    '  if stack is empty: error',
    '  value = stack_top.data',
    '  stack_top = stack_top.next',
    '  return value',
    '',
    'peek():',
    '  return stack_top.data',
  ],
  queue: [
    'Queue uses front and rear pointers.',
    '',
    'enqueue(value):',
    '  new_node = new Node(value)',
    '  if queue is empty:',
    '    front = rear = new_node',
    '  else:',
    '    rear.next = new_node',
    '    rear = new_node',
    '',
    'dequeue():',
    '  if queue is empty: error',
    '  value = front.data',
    '  front = front.next',
    '  return value',
  ],
  sll: [
    'Singly Linked List: HEAD → ... → NULL',
    '',
    'insert_at_head(value):',
    '  new_node = new Node(value)',
    '  new_node.next = head',
    '  head = new_node',
    '',
    'delete(value):',
    '  current = head',
    '  while current.next != NULL:',
    '    if current.next.data == value:',
    '      current.next = current.next.next',
    '      return',
    '    current = current.next',
    '',
    'search(value):',
    '  traverse from head until found or NULL',
  ],
  dll: [
    'Doubly Linked List: NULL ⇄ ... ⇄ NULL',
    '',
    'insert_at_head(value):',
    '  new_node = new Node(value)',
    '  new_node.next = head',
    '  if head != NULL: head.prev = new_node',
    '  head = new_node',
    '',
    'delete(node):',
    '  if node.prev: node.prev.next = node.next',
    '  if node.next: node.next.prev = node.prev',
    '  if node == head: head = node.next',
    '',
    'traverse_forward():  head → tail',
    'traverse_backward(): tail → head',
  ],
  csll: [
    'Circular Singly List: HEAD → ... → HEAD',
    '',
    'insert(value):',
    '  new_node = new Node(value)',
    '  if list is empty:',
    '    new_node.next = new_node  // self-loop',
    '    tail = new_node',
    '  else:',
    '    new_node.next = tail.next  // = head',
    '    tail.next = new_node',
    '    tail = new_node',
    '',
    'delete(value):',
    '  traverse until node before target',
    '  prev.next = target.next',
    '  if target == tail: tail = prev',
    '',
    'Note: No NULL — tail.next = head always',
  ],
  cdll: [
    'Circular Doubly List: HEAD ⇄ ... ⇄ HEAD',
    '',
    'insert(value):',
    '  new_node = new Node(value)',
    '  if list is empty:',
    '    new_node.next = new_node',
    '    new_node.prev = new_node',
    '    head = new_node',
    '  else:',
    '    tail = head.prev',
    '    tail.next = new_node',
    '    new_node.prev = tail',
    '    new_node.next = head',
    '    head.prev = new_node',
    '',
    'Note: tail.next = head, head.prev = tail',
  ],
  bst: [
    'Binary Search Tree: left < root < right',
    '',
    'insert(root, value):',
    '  if root == NULL: return new Node(value)',
    '  if value < root.data:',
    '    root.left = insert(root.left, value)',
    '  else if value > root.data:',
    '    root.right = insert(root.right, value)',
    '  return root',
    '',
    'search(root, value):',
    '  if root == NULL: return false',
    '  if value == root.data: return true',
    '  if value < root.data:',
    '    return search(root.left, value)',
    '  return search(root.right, value)',
    '',
    'Inorder traversal: left → root → right',
    '  produces sorted output',
  ],
};

// ── BST ──────────────────────────────────────────────────────────────────────
interface BSTNode { val: number; left: BSTNode | null; right: BSTNode | null; x?: number; y?: number; }

const bstInsert = (root: BSTNode | null, val: number): BSTNode => {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) return { ...root, left: bstInsert(root.left, val) };
  if (val > root.val) return { ...root, right: bstInsert(root.right, val) };
  return root;
};
const bstDelete = (root: BSTNode | null, val: number): BSTNode | null => {
  if (!root) return null;
  if (val < root.val) return { ...root, left: bstDelete(root.left, val) };
  if (val > root.val) return { ...root, right: bstDelete(root.right, val) };
  if (!root.left) return root.right;
  if (!root.right) return root.left;
  let min = root.right;
  while (min.left) min = min.left;
  return { ...root, val: min.val, right: bstDelete(root.right, min.val) };
};
// ── Dynamic BST Layout ─────────────────────────────────────────────

interface BSTPosition {
  node: BSTNode;
  x: number;
  y: number;
}

const BSTree: React.FC<{
  root: BSTNode | null;
  searchVal: number | null;
}> = ({ root, searchVal }) => {

  const NODE_RADIUS = 22;
  const HORIZONTAL_GAP = 76;
  const VERTICAL_GAP = 84;
  const PADDING_X = 55;
  const PADDING_Y = 55;

  const positions: BSTPosition[] = [];
  const positionMap = new Map<BSTNode, BSTPosition>();

  let maxDepth = 0;

  // Count nodes and determine maximum depth
  const measure = (node: BSTNode | null, depth = 0) => {
    if (!node) return;

    maxDepth = Math.max(maxDepth, depth);

    measure(node.left, depth + 1);
    measure(node.right, depth + 1);
  };

  measure(root);

  // Assign positions using inorder traversal
  // This guarantees that nodes remain horizontally ordered.
  let index = 0;

  const layout = (node: BSTNode | null, depth = 0) => {
    if (!node) return;

    layout(node.left, depth + 1);

    const position: BSTPosition = {
      node,
      x: PADDING_X + index * HORIZONTAL_GAP,
      y: PADDING_Y + depth * VERTICAL_GAP,
    };

    positions.push(position);
    positionMap.set(node, position);

    index++;

    layout(node.right, depth + 1);
  };

  layout(root);

  // Calculate canvas dimensions dynamically
  const contentWidth =
    positions.length > 0
      ? PADDING_X * 2 + (positions.length - 1) * HORIZONTAL_GAP
      : 560;

  const width = Math.max(560, contentWidth);

  const height = Math.max(
    300,
    PADDING_Y * 2 + maxDepth * VERTICAL_GAP
  );

  // Center small trees inside the canvas
  const offsetX = Math.max(0, (width - contentWidth) / 2);

  // Generate connecting edges
  const edges: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }[] = [];

  const collectEdges = (node: BSTNode | null) => {
    if (!node) return;

    const parent = positionMap.get(node);

    if (!parent) return;

    if (node.left) {
      const child = positionMap.get(node.left);

      if (child) {
        edges.push({
          x1: parent.x + offsetX,
          y1: parent.y,
          x2: child.x + offsetX,
          y2: child.y,
        });
      }
    }

    if (node.right) {
      const child = positionMap.get(node.right);

      if (child) {
        edges.push({
          x1: parent.x + offsetX,
          y1: parent.y,
          x2: child.x + offsetX,
          y2: child.y,
        });
      }
    }

    collectEdges(node.left);
    collectEdges(node.right);
  };

  collectEdges(root);

  return (
    <div className="w-full overflow-visible">

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          display: 'block',
          maxWidth: 'none',
          overflow: 'visible',
        }}
      >

        {/* Connecting edges */}

        {edges.map((edge, i) => (

          <line
            key={i}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="#93C5FD"
            strokeWidth="2"
          />

        ))}

        {/* Tree nodes */}

        {positions.map(({ node, x, y }) => {

          const hit =
            searchVal !== null && node.val === searchVal;

          const finalX = x + offsetX;

          return (

            <g key={`${node.val}-${finalX}`}>

              <circle
                cx={finalX}
                cy={y}
                r={NODE_RADIUS}
                fill={hit ? '#FEE2E2' : '#FFFFFF'}
                stroke={hit ? '#DC2626' : '#2563EB'}
                strokeWidth={hit ? 3 : 1.8}
                style={{
                  transition: 'all 0.25s ease',
                  filter: hit
                    ? 'drop-shadow(0 2px 5px rgba(220,38,38,0.25))'
                    : 'none',
                }}
              />

              <text
                x={finalX}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={hit ? '#DC2626' : '#1E40AF'}
                fontSize="13"
                fontWeight="700"
                fontFamily="monospace"
                pointerEvents="none"
              >
                {node.val}
              </text>

            </g>

          );

        })}

        {/* Empty tree message */}

        {!root && (

          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill="#64748B"
            fontSize="14"
          >
            Insert values to build the tree
          </text>

        )}

      </svg>

    </div>
  );
};



// ── Circular visualization ────────────────────────────────────────────────────
const CircularViz: React.FC<{ data: number[]; type: 'csll' | 'cdll'; color: string; searchVal: number | null }> = ({ data, type, color, searchVal }) => {
  const n = data.length;
  if (n === 0) return (
    <div className="flex items-center justify-center h-48" style={{ color: 'var(--text3)' }}>
      <p className="font-mono text-sm">Empty — add some values above</p>
    </div>
  );
  const cx = 200, cy = 150, r = 100;
  const nodes = data.map((val, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { val, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <svg width="400" height="300" viewBox="0 0 400 300" style={{ maxWidth: '100%' }}>
      {/* Circular path guide */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Edges / arrows */}
      {nodes.map((node, i) => {
        const next = nodes[(i + 1) % n];
        const dx = next.x - node.x; const dy = next.y - node.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len; const uy = dy / len;
        const x1 = node.x + ux * 20; const y1 = node.y + uy * 20;
        const x2 = next.x - ux * 20; const y2 = next.y - uy * 20;
        const mx = (x1 + x2) / 2 - uy * 18; const my = (y1 + y2) / 2 + ux * 18;
        return (
          <g key={`fwd-${i}`}>
            <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
              fill="none" stroke={color} strokeWidth="1.5"
              markerEnd="url(#circArrow)" />
          </g>
        );
      })}

      {/* Backward arrows for cdll */}
      {type === 'cdll' && nodes.map((node, i) => {
        const prev = nodes[(i - 1 + n) % n];
        const dx = prev.x - node.x; const dy = prev.y - node.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len; const uy = dy / len;
        const x1 = node.x + ux * 22; const y1 = node.y + uy * 22;
        const x2 = prev.x - ux * 22; const y2 = prev.y - uy * 22;
        const mx = (x1 + x2) / 2 + uy * 24; const my = (y1 + y2) / 2 - ux * 24;
        return (
          <path key={`bwd-${i}`} d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
            fill="none" stroke="var(--text3)" strokeWidth="1" strokeDasharray="3 3"
            markerEnd="url(#circArrowGray)" />
        );
      })}

      <defs>
        <marker id="circArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={color} />
        </marker>
        <marker id="circArrowGray" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill="var(--text3)" />
        </marker>
      </defs>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const isHead = i === 0;
        const hit = searchVal !== null && node.val === searchVal;
        return (
          <g key={`node-${i}`}>
            <circle cx={node.x} cy={node.y} r={20}
              fill={hit ? `${color}30` : isHead ? `${color}20` : 'var(--surface2)'}
              stroke={hit || isHead ? color : 'var(--border2)'} strokeWidth={hit || isHead ? 2.5 : 1.5}
              style={{ filter: isHead ? `drop-shadow(0 0 6px ${color})` : 'none' }} />
            <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle"
              fill={hit || isHead ? color : 'var(--text)'} fontSize="12" fontWeight="700" fontFamily="JetBrains Mono">
              {node.val}
            </text>
            {isHead && (
              <text x={node.x} y={node.y - 28} textAnchor="middle" fill={color} fontSize="10" fontWeight="700" fontFamily="Space Grotesk">
                HEAD
              </text>
            )}
          </g>
        );
      })}

      {/* Center label */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text3)" fontSize="10" fontFamily="Space Grotesk">circular</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--text3)" fontSize="10" fontFamily="Space Grotesk">{type === 'cdll' ? 'doubly' : 'singly'}</text>
    </svg>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const DSVisualizer: React.FC = () => {
  const [type, setType] = useState<DSType>('stack');
  const [data, setData] = useState<number[]>([]);
  const [bstRoot, setBstRoot] = useState<BSTNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchVal, setSearchVal] = useState<number | null>(null);
  const [trace, setTrace] = useState<string[]>([]);
  const ac = DS_COLORS[type];

  const reset = () => { setData([]); setBstRoot(null); setTrace([]); setSearchVal(null); };
  const switchType = (t: DSType) => { setType(t); reset(); };

  const handleAdd = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    const label = DS_LABELS[type];
    if (type === 'bst') {
      setBstRoot(prev => bstInsert(prev, val));
      setTrace(prev => [`Inserted ${val} into BST`, ...prev]);
    } else if (type === 'stack') {
      setData(prev => [val, ...prev]);
      setTrace(prev => [`Pushed ${val} onto the Stack (new TOP)`, ...prev]);
    } else if (type === 'queue') {
      setData(prev => [...prev, val]);
      setTrace(prev => [`Enqueued ${val} at REAR of Queue`, ...prev]);
    } else {
      setData(prev => [...prev, val]);
      setTrace(prev => [`Added node ${val} to ${label}`, ...prev]);
    }
    setInputValue('');
  };

  const handleRemove = () => {
    if (type === 'bst') {
      const val = parseInt(inputValue);
      if (!isNaN(val)) { setBstRoot(prev => bstDelete(prev, val)); setTrace(prev => [`Deleted ${val} from BST`, ...prev]); setInputValue(''); }
      return;
    }
    if (data.length === 0) return;
    if (type === 'stack') {
      const v = data[0]; setData(prev => prev.slice(1));
      setTrace(prev => [`Popped ${v} from Stack (was TOP)`, ...prev]);
    } else if (type === 'queue') {
      const v = data[0]; setData(prev => prev.slice(1));
      setTrace(prev => [`Dequeued ${v} from FRONT of Queue`, ...prev]);
    } else if (type === 'csll' || type === 'cdll') {
      const v = data[data.length - 1]; setData(prev => prev.slice(0, -1));
      setTrace(prev => [`Removed tail node ${v} from ${DS_LABELS[type]}`, ...prev]);
    } else {
      const v = data[data.length - 1]; setData(prev => prev.slice(0, -1));
      setTrace(prev => [`Removed tail node ${v}`, ...prev]);
    }
  };

  const handleSearch = () => {
    const val = parseInt(searchInput);
    if (isNaN(val)) return;
    setSearchVal(val);
    if (type === 'bst') setTrace(prev => [`Searched BST for ${val}`, ...prev]);
    else {
      const idx = data.indexOf(val);
      setTrace(prev => [idx >= 0 ? `Found ${val} at index ${idx}` : `${val} not found in structure`, ...prev]);
    }
  };

  const info = DS_INFO[type];
  const isCircular = type === 'csll' || type === 'cdll';
  const isBST = type === 'bst';

  const DS_GROUPS = [
    { label: 'Linear', items: ['stack', 'queue'] as DSType[] },
    { label: 'Linked Lists', items: ['sll', 'dll', 'csll', 'cdll'] as DSType[] },
    { label: 'Trees', items: ['bst'] as DSType[] },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="glass p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select value={type} onChange={e => switchType(e.target.value as DSType)}>
            <option value="stack">Stack</option>
            <option value="queue">Queue</option>
            <option value="sll">Singly Linked List</option>
            <option value="dll">Doubly Linked List</option>
            <option value="csll">Circular Singly Linked List</option>
            <option value="cdll">Circular Doubly Linked List</option>
            <option value="bst">Binary Search Tree</option>
          </select>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Value" value={inputValue} onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} className="w-24" />
            <button onClick={handleAdd}
              style={{ background: ac, color: '#000', boxShadow: `0 0 12px ${ac}40` }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm">
              <Plus className="w-4 h-4" />
              {type === 'stack' ? 'Push' : type === 'queue' ? 'Enqueue' : type === 'bst' ? 'Insert' : 'Add Node'}
            </button>
            <button onClick={handleRemove}
              style={{ border: '1px solid rgba(255,95,126,0.4)', color: 'var(--red)' }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm">
              <Minus className="w-4 h-4" />
              {type === 'stack' ? 'Pop' : type === 'queue' ? 'Dequeue' : type === 'bst' ? 'Delete' : 'Remove Node'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Search…" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} className="w-28" />
            <button onClick={handleSearch}
              style={{ border: `1px solid ${ac}60`, color: ac }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>
        <button onClick={reset}
          style={{ border: '1px solid var(--border2)', color: 'var(--text3)' }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm">
          <Trash2 className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Visualization and operation log */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Visualization + Status */}
          <div className="glass overflow-hidden">

  {/* Header */}
  <div
    style={{
      borderBottom: '1px solid var(--border)',
      borderLeft: `4px solid ${ac}`
    }}
    className="px-4 py-3 flex items-center justify-between"
  >
    <span className="text-sm font-bold" style={{ color: ac }}>
      {DS_LABELS[type]}
    </span>

    <span
      style={{ color: 'var(--text3)' }}
      className="text-xs font-mono"
    >
      Size: {isBST ? '(tree)' : data.length}
      <span className="ml-3">
        · {info.principle}
      </span>
    </span>
  </div>

  {/* Visualization Canvas */}
  <div
    className="p-6"
    style={{
      minHeight: 300,
      maxHeight: isBST ? 600 : undefined,
      overflow: isBST ? 'auto' : 'visible'
    }}
  >

    {/* Binary Search Tree */}
    {isBST && (
      <BSTree
        root={bstRoot}
        searchVal={searchVal}
      />
    )}

    {/* Circular Linked Lists */}
    {isCircular && (
      <div className="flex justify-center">
        <CircularViz
          data={data}
          type={type}
          color={ac}
          searchVal={searchVal}
        />
      </div>
    )}

    {/* Stack, Queue and Linear Linked Lists */}
    {!isBST && !isCircular && (
      <div className="flex items-center justify-center min-h-[240px]">

        {data.length === 0 ? (
          <p
            className="text-sm font-mono"
            style={{ color: 'var(--text3)' }}
          >
            Empty — add some values above
          </p>
        ) : (

          <div
            className={`flex gap-3 items-center ${
              type === 'stack'
                ? 'flex-col-reverse'
                : 'flex-row flex-wrap justify-center'
            }`}
          >

            {data.map((value, index) => {

              const isFound = searchVal === value;

              return (
                <React.Fragment key={`${index}-${value}`}>

                  {type !== 'stack' && index > 0 && (
                    <span
                      className="font-bold"
                      style={{ color: ac }}
                    >
                      →
                    </span>
                  )}

                  <div
                    className="flex flex-col items-center gap-1"
                  >

                    {(type === 'stack' && index === 0) && (
                      <span className="text-xs font-bold text-blue-600">
                        TOP
                      </span>
                    )}

                    {(type === 'queue' && index === 0) && (
                      <span className="text-xs font-bold text-green-600">
                        FRONT
                      </span>
                    )}

                    <motion.div
                      layout
                      className="w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold"
                      style={{
                        background: isFound ? '#FEE2E2' : '#EFF6FF',
                        border: `2px solid ${
                          isFound ? '#DC2626' : '#2563EB'
                        }`,
                        color: isFound ? '#DC2626' : '#1E40AF'
                      }}
                    >
                      {value}
                    </motion.div>

                    {(type === 'queue' && index === data.length - 1) && (
                      <span className="text-xs font-bold text-red-600">
                        REAR
                      </span>
                    )}

                    {(type === 'stack' && index === data.length - 1) && (
                      <span className="text-xs text-gray-500">
                        Bottom
                      </span>
                    )}

                  </div>

                </React.Fragment>
              );
            })}

          </div>
        )}

      </div>
    )}

  </div>

  {/* Status Bar */}
  <div
    style={{
      background: 'var(--bg3)',
      borderTop: '1px solid var(--border)'
    }}
    className="px-4 py-3 text-sm font-mono"
  >
    <span style={{ color: 'var(--text3)' }}>
      Latest ›
    </span>

    <span className="ml-2" style={{ color: ac }}>
      {trace[0] || 'Waiting for operations…'}
    </span>
  </div>

</div>

          

          {/* Operation log */}
          <div className="glass flex flex-col overflow-hidden">
            <div style={{ borderBottom: '1px solid var(--border)' }} className="px-4 py-2">
              <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text3)' }}>// Operation Log</span>
            </div>
            <div className="h-36 overflow-y-auto p-3 flex flex-col gap-0.5">
              {trace.map((msg, idx) => (
                <div key={idx} className="text-xs font-mono px-3 py-1.5 rounded"
                  style={{ color: idx === 0 ? 'var(--text)' : 'var(--text3)', background: idx === 0 ? 'var(--surface2)' : 'transparent' }}>
                  <span style={{ color: 'var(--text3)' }}>{String(trace.length - idx).padStart(3, '0')} › </span>{msg}
                </div>
              ))}
              {trace.length === 0 && <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>Operations will appear here…</span>}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Pseudocode */}
          <div className="glass flex flex-col overflow-hidden">
            <div style={{ borderBottom: '1px solid var(--border)' }} className="px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text3)' }}>// Pseudocode</h3>
              <span className="tag" style={{ background: `${ac}20`, color: ac, border: `1px solid ${ac}40` }}>{DS_LABELS[type]}</span>
            </div>
            <div className="p-3 font-mono text-xs flex flex-col gap-0.5 overflow-y-auto" style={{ maxHeight: 220 }}>
              {DS_PSEUDOCODE[type].map((line, idx) => (
                <div key={idx} style={{ color: line === '' ? 'transparent' : line.startsWith('//') || line.startsWith('Note:') ? 'var(--text3)' : line.endsWith(':') ? ac : 'var(--text2)' }}
                  className="px-1 py-0.5 leading-relaxed">
                  <pre className="whitespace-pre-wrap font-mono">{line || ' '}</pre>
                </div>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div className="glass p-4 flex flex-col gap-3">
            <h3 className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text3)' }}>// Time & Space Complexity</h3>
            {[
              { label: 'Access', val: info.access, color: 'var(--cyan)' },
              { label: 'Insert', val: info.insert, color: 'var(--green)' },
              { label: 'Delete', val: info.delete, color: 'var(--red)' },
              { label: 'Space', val: info.space, color: 'var(--accent2)' },
            ].map(c => (
              <div key={c.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }} className="rounded-lg px-4 py-2 flex justify-between items-center">
                <span style={{ color: 'var(--text3)' }} className="text-sm">{c.label}</span>
                <span style={{ color: c.color }} className="font-mono font-bold text-sm">{c.val}</span>
              </div>
            ))}
          </div>

          {/* Concept */}
          <div className="glass p-4 flex flex-col gap-2">
            <h3 className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text3)' }}>// Concept</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{info.desc}</p>
          </div>

          {/* Structure switcher */}
          <div className="glass p-4 flex flex-col gap-3">
            <h3 className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text3)' }}>// Switch Structure</h3>
            {DS_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>{group.label}</p>
                <div className="flex flex-col gap-1">
                  {group.items.map(t => (
                    <button key={t} onClick={() => switchType(t)}
                      style={type === t
                        ? { background: `${DS_COLORS[t]}20`, color: DS_COLORS[t], border: `1px solid ${DS_COLORS[t]}50` }
                        : { color: 'var(--text3)', border: '1px solid var(--border)' }}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-left">
                      {DS_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
