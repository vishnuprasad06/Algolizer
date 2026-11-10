import { Cpu, Hash, FlipHorizontal, Layers3, GitMerge, RefreshCw, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';

type DESection = 'gates' | 'kmap' | 'flipflop' | 'booleanalg';

const SECTION_COLORS: Record<DESection, string> = {
  gates: 'var(--cyan)',
  kmap: 'var(--yellow)',
  flipflop: 'var(--pink)',
  booleanalg: 'var(--orange)',
};

const SECTION_LABELS: Record<DESection, string> = {
  gates: 'Logic Gates',
  kmap: 'Karnaugh Map',
  flipflop: 'Flip-Flops',
  booleanalg: 'Boolean Algebra',
};

const SECTION_ICONS: Record<DESection, React.ReactNode> = {
  gates: <GitMerge className="w-4 h-4" />,
  kmap: <Layers3 className="w-4 h-4" />,
  flipflop: <FlipHorizontal className="w-4 h-4" />,
  booleanalg: <Cpu className="w-4 h-4" />,
};

// ─────────────────────────────────────────────────────────────────────────────
// Logic Gates
// ─────────────────────────────────────────────────────────────────────────────
type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR' | 'BUFFER';

const GATE_INFO: Record<GateType, { symbol: string; expr: string; desc: string; truthTable: { inputs: number[][]; output: number[] }; use: string }> = {
  AND:    { symbol: '&', expr: 'Y = A · B', desc: 'Output is HIGH only when ALL inputs are HIGH. Implements logical conjunction.', use: 'Enable circuits, multiplication in ALUs', truthTable: { inputs: [[0,0],[0,1],[1,0],[1,1]], output: [0,0,0,1] } },
  OR:     { symbol: '≥1', expr: 'Y = A + B', desc: 'Output is HIGH when ANY input is HIGH. Implements logical disjunction.', use: 'Fault detection, parallel enable circuits', truthTable: { inputs: [[0,0],[0,1],[1,0],[1,1]], output: [0,1,1,1] } },
  NOT:    { symbol: '1', expr: 'Y = A\'', desc: 'Inverts a single input. Output is always opposite to input. Also called Inverter.', use: 'Complementing signals, inverting logic', truthTable: { inputs: [[0],[1]], output: [1,0] } },
  NAND:   { symbol: '&̄', expr: 'Y = (A·B)\'', desc: 'NOT-AND. Universal gate — any Boolean function can be implemented using only NAND gates.', use: 'Universal building block, SRAM cells', truthTable: { inputs: [[0,0],[0,1],[1,0],[1,1]], output: [1,1,1,0] } },
  NOR:    { symbol: '≥1̄', expr: 'Y = (A+B)\'', desc: 'NOT-OR. Universal gate like NAND. Used to implement all Boolean functions.', use: 'Universal building block, NOR flash memory', truthTable: { inputs: [[0,0],[0,1],[1,0],[1,1]], output: [1,0,0,0] } },
  XOR:    { symbol: '=1', expr: 'Y = A ⊕ B', desc: 'Output is HIGH when inputs are DIFFERENT. Also called Exclusive-OR.', use: 'Parity checking, adder circuits, cryptography', truthTable: { inputs: [[0,0],[0,1],[1,0],[1,1]], output: [0,1,1,0] } },
  XNOR:   { symbol: '⊙', expr: 'Y = (A⊕B)\'', desc: 'Output is HIGH when inputs are SAME. Implements logical equivalence.', use: 'Equality comparators, error detection', truthTable: { inputs: [[0,0],[0,1],[1,0],[1,1]], output: [1,0,0,1] } },
  BUFFER: { symbol: '1', expr: 'Y = A', desc: 'Output equals input. Used to amplify signal strength (drive multiple loads) or introduce delay.', use: 'Signal buffering, bus drivers, clock distribution', truthTable: { inputs: [[0],[1]], output: [0,1] } },
};

function GateSVG({ gate, inputA, inputB }: { gate: GateType; inputA: number; inputB: number }) {
  const info = GATE_INFO[gate];
  const isUnary = gate === 'NOT' || gate === 'BUFFER';
  const output = isUnary ? info.truthTable.output[inputA] : info.truthTable.output[inputA * 2 + inputB];
  const HIGH = 'var(--cyan)';
  const LOW = 'var(--text3)';
  const colorA = inputA ? HIGH : LOW;
  const colorB = inputB ? HIGH : LOW;
  const colorOut = output ? HIGH : LOW;
  const isInverted = gate === 'NOT' || gate === 'NAND' || gate === 'NOR' || gate === 'XNOR';

  return (
    <svg viewBox="0 0 260 130" className="w-full max-w-xs mx-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.15))' }}>
      {/* Input A */}
      <line x1="20" y1={isUnary ? 65 : 45} x2="85" y2={isUnary ? 65 : 45} stroke={colorA} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy={isUnary ? 65 : 45} r="5" fill={inputA ? HIGH : 'var(--surface)'} stroke={colorA} strokeWidth="2" />
      <text x="14" y={isUnary ? 50 : 30} fontSize="11" fontFamily="JetBrains Mono" fill={colorA} textAnchor="middle" fontWeight="bold">A={inputA}</text>

      {/* Input B */}
      {!isUnary && <>
        <line x1="20" y1="85" x2="85" y2="85" stroke={colorB} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="85" r="5" fill={inputB ? HIGH : 'var(--surface)'} stroke={colorB} strokeWidth="2" />
        <text x="14" y="105" fontSize="11" fontFamily="JetBrains Mono" fill={colorB} textAnchor="middle" fontWeight="bold">B={inputB}</text>
      </>}

      {/* Gate Body */}
      {(gate === 'AND' || gate === 'NAND') && (
        <path d="M85 30 L85 100 L115 100 Q150 100 150 65 Q150 30 115 30 Z" fill="var(--surface2)" stroke="var(--border2)" strokeWidth="2" />
      )}
      {(gate === 'OR' || gate === 'NOR') && (
        <path d="M85 30 Q100 30 115 30 Q155 30 155 65 Q155 100 115 100 Q100 100 85 100 Q100 65 85 30 Z" fill="var(--surface2)" stroke="var(--border2)" strokeWidth="2" />
      )}
      {(gate === 'XOR' || gate === 'XNOR') && (
        <>
          <path d="M80 30 Q95 65 80 100" fill="none" stroke="var(--border2)" strokeWidth="2" />
          <path d="M88 30 Q103 30 118 30 Q158 30 158 65 Q158 100 118 100 Q103 100 88 100 Q103 65 88 30 Z" fill="var(--surface2)" stroke="var(--border2)" strokeWidth="2" />
        </>
      )}
      {(gate === 'NOT' || gate === 'BUFFER') && (
        <polygon points="85,35 85,95 145,65" fill="var(--surface2)" stroke="var(--border2)" strokeWidth="2" />
      )}

      {/* Gate label */}
      <text x={gate === 'NOT' || gate === 'BUFFER' ? 108 : 118} y={70} fontSize="13" fontFamily="JetBrains Mono" fill="var(--text2)" textAnchor="middle" fontWeight="bold">{gate}</text>

      {/* Inversion bubble */}
      {isInverted && <circle cx={gate === 'NOT' ? 150 : 158} cy="65" r="5" fill="var(--surface2)" stroke="var(--border2)" strokeWidth="2" />}

      {/* Output line */}
      <line x1={isInverted ? (gate === 'NOT' ? 155 : 163) : (gate === 'NOT' || gate === 'BUFFER' ? 145 : 155)} y1="65" x2="235" y2="65" stroke={colorOut} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="235" cy="65" r="6" fill={output ? HIGH : 'var(--surface)'} stroke={colorOut} strokeWidth="2.5" />
      <text x="235" y="50" fontSize="11" fontFamily="JetBrains Mono" fill={colorOut} textAnchor="middle" fontWeight="bold">Y={output}</text>
    </svg>
  );
}

function LogicGates() {
  const [gate, setGate] = useState<GateType>('AND');
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const info = GATE_INFO[gate];
  const isUnary = gate === 'NOT' || gate === 'BUFFER';
  const output = isUnary ? info.truthTable.output[a] : info.truthTable.output[a * 2 + b];

  return (
    <div className="flex flex-col gap-6">
      {/* Gate selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(GATE_INFO) as GateType[]).map(g => (
          <button key={g} onClick={() => setGate(g)}
            style={gate === g ? { background: 'rgba(56,189,248,0.2)', color: 'var(--cyan)', border: '1px solid rgba(56,189,248,0.4)' } : { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
            className="px-3 py-1.5 rounded-lg font-mono text-sm font-bold">{g}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Visualization */}
        <div className="glass p-5 flex flex-col gap-4">
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Gate Diagram</div>
          <GateSVG gate={gate} inputA={a} inputB={b} />
          {/* Input toggles */}
          <div className="flex gap-4 justify-center">
            <button onClick={() => setA(a => a ^ 1)}
              style={{ background: a ? 'rgba(56,189,248,0.2)' : 'var(--surface2)', color: a ? 'var(--cyan)' : 'var(--text2)', border: `1px solid ${a ? 'var(--cyan)' : 'var(--border)'}` }}
              className="px-5 py-2 rounded-lg font-mono font-bold text-sm">A = {a}</button>
            {!isUnary && (
              <button onClick={() => setB(b => b ^ 1)}
                style={{ background: b ? 'rgba(56,189,248,0.2)' : 'var(--surface2)', color: b ? 'var(--cyan)' : 'var(--text2)', border: `1px solid ${b ? 'var(--cyan)' : 'var(--border)'}` }}
                className="px-5 py-2 rounded-lg font-mono font-bold text-sm">B = {b}</button>
            )}
            <div style={{ background: output ? 'rgba(34,211,160,0.2)' : 'rgba(255,95,126,0.15)', color: output ? 'var(--green)' : 'var(--red)', border: `1px solid ${output ? 'var(--green)' : 'var(--red)'}` }}
              className="px-5 py-2 rounded-lg font-mono font-bold text-sm">Y = {output}</div>
          </div>
        </div>

        {/* Right: Info + Truth Table */}
        <div className="flex flex-col gap-4">
          <div className="glass p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="font-black text-lg" style={{ color: 'var(--cyan)' }}>{gate} Gate</span>
              <span className="tag font-mono" style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--cyan)', border: '1px solid rgba(56,189,248,0.3)' }}>{info.expr}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{info.desc}</p>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>
              <span className="font-bold" style={{ color: 'var(--yellow)' }}>Used in: </span>{info.use}
            </div>
          </div>

          {/* Truth Table */}
          <div className="glass p-4">
            <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text3)' }}>Truth Table</div>
            <table className="w-full text-sm font-mono">
              <thead>
                <tr>
                  <th className="text-left pb-2 font-bold" style={{ color: 'var(--cyan)' }}>A</th>
                  {!isUnary && <th className="text-left pb-2 font-bold" style={{ color: 'var(--cyan)' }}>B</th>}
                  <th className="text-left pb-2 font-bold" style={{ color: 'var(--green)' }}>Y</th>
                </tr>
              </thead>
              <tbody>
                {info.truthTable.inputs.map((inp, i) => {
                  const isActive = isUnary ? inp[0] === a : inp[0] === a && inp[1] === b;
                  return (
                    <tr key={i} style={{ background: isActive ? 'rgba(56,189,248,0.08)' : 'transparent' }}
                      className="border-t border-[var(--border)]">
                      <td className="py-1.5 pr-4" style={{ color: inp[0] ? 'var(--cyan)' : 'var(--text3)' }}>{inp[0]}</td>
                      {!isUnary && <td className="py-1.5 pr-4" style={{ color: inp[1] ? 'var(--cyan)' : 'var(--text3)' }}>{inp[1]}</td>}
                      <td className="py-1.5 font-bold" style={{ color: info.truthTable.output[i] ? 'var(--green)' : 'var(--red)' }}>
                        {info.truthTable.output[i]}
                        {isActive && <span className="ml-2 text-xs" style={{ color: 'var(--text3)' }}>← current</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Number System Converter + Calculator
// ─────────────────────────────────────────────────────────────────────────────
type NSBase = 'decimal' | 'binary' | 'octal' | 'hex';

const BASE_META: Record<NSBase, { label: string; short: string; radix: number; color: string; prefix: string; placeholder: string; pattern: string }> = {
  decimal: { label: 'Decimal', short: 'DEC', radix: 10, color: 'var(--green)',  prefix: '',   placeholder: 'e.g. 255',  pattern: '[0-9]*' },
  binary:  { label: 'Binary',  short: 'BIN', radix: 2,  color: 'var(--cyan)',   prefix: '0b', placeholder: 'e.g. 1010', pattern: '[01]*' },
  octal:   { label: 'Octal',   short: 'OCT', radix: 8,  color: 'var(--yellow)', prefix: '0o', placeholder: 'e.g. 377',  pattern: '[0-7]*' },
  hex:     { label: 'Hex',     short: 'HEX', radix: 16, color: 'var(--pink)',   prefix: '0x', placeholder: 'e.g. FF',   pattern: '[0-9A-Fa-f]*' },
};

function divSteps(n: number, base: number): { dividend: number; quotient: number; remainder: number }[] {
  const steps: { dividend: number; quotient: number; remainder: number }[] = [];
  let q = n;
  while (q > 0) {
    const rem = q % base;
    steps.push({ dividend: q, quotient: Math.floor(q / base), remainder: rem });
    q = Math.floor(q / base);
  }
  return steps; // LSB first → read bottom up = MSB first
}

function toBase(n: number, radix: number): string {
  if (n === 0) return '0';
  return n.toString(radix).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Karnaugh Map (2, 3, 4 variable)
// ─────────────────────────────────────────────────────────────────────────────
function KarnaughMap() {
  const [vars, setVars] = useState(4);
  // 4-variable: 16 cells, indexed by minterm m0-m15
  // Default: F = Σm(0,1,3,7,8,9,11,15) — simplifies to AB'+CD' + more
  const defaultMinterms4 = [0,1,3,7,8,9,11,15];
  const defaultMinterms3 = [0,1,3,5,7];
  const defaultMinterms2 = [0,3];
  const [minterms, setMinterms] = useState<number[]>(defaultMinterms4);

  // 4-variable K-Map layout (Gray code order): rows AB, cols CD
  const rows4 = ['00','01','11','10'];
  const cols4 = ['00','01','11','10'];
  const rowLabels4 = ['AB\\CD', '00', '01', '11', '10'];
  // Cell index = minterms
  // AB=00,CD=00 → m0; AB=00,CD=01 → m1; AB=00,CD=11 → m3; AB=00,CD=10 → m2
  // AB=01,CD=00 → m4; etc.
  const cell4 = (r: number, c: number) => {
    const ab = parseInt(rows4[r], 2);
    const cd = parseInt(cols4[c], 2);
    return (ab << 2) | cd;
  };

  // 3-variable: rows A, cols BC
  const rows3 = ['0','1'];
  const cols3 = ['00','01','11','10'];
  const cell3 = (r: number, c: number) => {
    const a = parseInt(rows3[r]);
    const bc = parseInt(cols3[c], 2);
    return (a << 2) | bc;
  };

  // 2-variable: rows A, cols B
  const rows2 = ['0','1'];
  const cols2 = ['0','1'];
  const cell2 = (r: number, c: number) => (parseInt(rows2[r]) << 1) | parseInt(cols2[c]);

  const toggleMinterm = (m: number) => {
    setMinterms(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m].sort((a,b)=>a-b));
  };

  const handleVarChange = (v: number) => {
    setVars(v);
    setMinterms(v === 4 ? defaultMinterms4 : v === 3 ? defaultMinterms3 : defaultMinterms2);
  };

  const maxMint = vars === 4 ? 16 : vars === 3 ? 8 : 4;
  const sop = minterms.length === 0 ? 'F = 0' : `F = Σm(${minterms.join(', ')})`;

  const cellClass = (m: number) => minterms.includes(m);

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="text-sm font-semibold" style={{ color: 'var(--text2)' }}>Variables:</div>
        {[2,3,4].map(v => (
          <button key={v} onClick={() => handleVarChange(v)}
            style={vars === v ? { background: 'rgba(245,200,66,0.2)', color: 'var(--yellow)', border: '1px solid rgba(245,200,66,0.4)' } : { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
            className="px-4 py-1.5 rounded-lg font-bold text-sm">{v}-Variable</button>
        ))}
        <button onClick={() => setMinterms([])}
          style={{ background: 'var(--surface2)', color: 'var(--text3)', border: '1px solid var(--border)' }}
          className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
          <RefreshCw className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* K-Map Grid */}
        <div className="glass p-5 flex flex-col gap-4 items-center">
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
            Click cells to toggle 1/0
          </div>

          {vars === 4 && (
            <div className="overflow-x-auto w-full">
              <table className="mx-auto border-collapse font-mono text-sm">
                <thead>
                  <tr>
                    <th className="p-2" style={{ color: 'var(--text3)', fontSize: 11 }}>AB\CD</th>
                    {cols4.map(c => <th key={c} className="p-2 w-14 text-center font-bold" style={{ color: 'var(--yellow)' }}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows4.map((r, ri) => (
                    <tr key={r}>
                      <td className="p-2 text-center font-bold" style={{ color: 'var(--yellow)' }}>{r}</td>
                      {cols4.map((c, ci) => {
                        const m = cell4(ri, ci);
                        const isOne = cellClass(m);
                        return (
                          <td key={c} onClick={() => toggleMinterm(m)}
                            className="w-14 h-14 text-center font-black text-lg cursor-pointer transition-all"
                            style={{ border: '2px solid var(--border)', background: isOne ? 'rgba(245,200,66,0.2)' : 'var(--surface)', color: isOne ? 'var(--yellow)' : 'var(--text3)', borderRadius: 6 }}>
                            {isOne ? 1 : 0}
                            <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 'normal' }}>m{m}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {vars === 3 && (
            <table className="mx-auto border-collapse font-mono text-sm">
              <thead>
                <tr>
                  <th className="p-2" style={{ color: 'var(--text3)', fontSize: 11 }}>A\BC</th>
                  {cols3.map(c => <th key={c} className="p-2 w-14 text-center font-bold" style={{ color: 'var(--yellow)' }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows3.map((r, ri) => (
                  <tr key={r}>
                    <td className="p-2 text-center font-bold" style={{ color: 'var(--yellow)' }}>{r}</td>
                    {cols3.map((c, ci) => {
                      const m = cell3(ri, ci);
                      const isOne = cellClass(m);
                      return (
                        <td key={c} onClick={() => toggleMinterm(m)}
                          className="w-14 h-14 text-center font-black text-lg cursor-pointer"
                          style={{ border: '2px solid var(--border)', background: isOne ? 'rgba(245,200,66,0.2)' : 'var(--surface)', color: isOne ? 'var(--yellow)' : 'var(--text3)', borderRadius: 6 }}>
                          {isOne ? 1 : 0}
                          <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 'normal' }}>m{m}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {vars === 2 && (
            <table className="mx-auto border-collapse font-mono text-sm">
              <thead>
                <tr>
                  <th className="p-2" style={{ color: 'var(--text3)', fontSize: 11 }}>A\B</th>
                  {cols2.map(c => <th key={c} className="p-2 w-14 text-center font-bold" style={{ color: 'var(--yellow)' }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows2.map((r, ri) => (
                  <tr key={r}>
                    <td className="p-2 text-center font-bold" style={{ color: 'var(--yellow)' }}>{r}</td>
                    {cols2.map((c, ci) => {
                      const m = cell2(ri, ci);
                      const isOne = cellClass(m);
                      return (
                        <td key={c} onClick={() => toggleMinterm(m)}
                          className="w-14 h-14 text-center font-black text-lg cursor-pointer"
                          style={{ border: '2px solid var(--border)', background: isOne ? 'rgba(245,200,66,0.2)' : 'var(--surface)', color: isOne ? 'var(--yellow)' : 'var(--text3)', borderRadius: 6 }}>
                          {isOne ? 1 : 0}
                          <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 'normal' }}>m{m}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-4">
          <div className="glass p-5 flex flex-col gap-3">
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Expression</div>
            <div className="font-black font-mono text-lg" style={{ color: 'var(--yellow)' }}>{sop}</div>
            <div className="text-sm" style={{ color: 'var(--text2)' }}>
              Active minterms: <span className="font-bold" style={{ color: 'var(--yellow)' }}>{minterms.length}</span> / {maxMint}
            </div>
          </div>
          <div className="glass p-5 flex flex-col gap-3">
            <div className="font-bold" style={{ color: 'var(--yellow)' }}>How to Use K-Maps</div>
            <div className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
              <p className="mb-2">1. Fill the table with 1s for minterms where output = 1.</p>
              <p className="mb-2">2. Group adjacent 1s in powers of 2 (1, 2, 4, 8…).</p>
              <p className="mb-2">3. Groups wrap around edges and corners.</p>
              <p className="mb-2">4. Each group eliminates one variable per doubling of size.</p>
              <p>5. Write one product term per group → Sum of Products (SOP).</p>
            </div>
          </div>
          <div className="glass p-4 flex flex-col gap-2">
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Gray Code Order (Why?)</div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
              K-Map columns/rows follow Gray code (00→01→11→10) so that adjacent cells differ by exactly 1 bit, enabling valid groupings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Flip-Flops
// ─────────────────────────────────────────────────────────────────────────────
type FFType = 'SR' | 'D' | 'JK' | 'T';

const FF_INFO: Record<FFType, { fullName: string; desc: string; excitation: string; use: string; table: { inputs: string[]; headers: string[]; rows: string[][] } }> = {
  SR: {
    fullName: 'SR (Set-Reset) Flip-Flop',
    desc: 'Basic memory element with Set and Reset inputs. S=1 sets output Q=1. R=1 resets Q=0. S=R=1 is an invalid/forbidden state.',
    excitation: 'Next State = S + R\'·Q  (with S·R = 0 constraint)',
    use: 'Basic latching, debouncing switches, simple flags',
    table: {
      headers: ['S', 'R', 'Q (now)', 'Q+ (next)', 'Comment'],
      rows: [
        ['0','0','0','0','No change'],
        ['0','0','1','1','No change'],
        ['0','1','0','0','Reset'],
        ['0','1','1','0','Reset'],
        ['1','0','0','1','Set'],
        ['1','0','1','1','Set'],
        ['1','1','0','?','INVALID'],
        ['1','1','1','?','INVALID'],
      ],
      inputs: ['S','R'],
    },
  },
  D: {
    fullName: 'D (Data) Flip-Flop',
    desc: 'Simplest flip-flop. Output Q follows input D on each clock edge. Eliminates the invalid state of SR by tying R = D\'.',
    excitation: 'Q+ = D',
    use: 'Registers, shift registers, pipeline stages, data storage',
    table: {
      headers: ['D', 'Q (now)', 'Q+ (next)', 'Comment'],
      rows: [
        ['0','0','0','Reset/Store 0'],
        ['0','1','0','Reset'],
        ['1','0','1','Set'],
        ['1','1','1','Set/Store 1'],
      ],
      inputs: ['D'],
    },
  },
  JK: {
    fullName: 'JK Flip-Flop',
    desc: 'Improved SR flip-flop that resolves the invalid state: J=K=1 toggles the output. Most versatile flip-flop.',
    excitation: 'Q+ = J·Q\' + K\'·Q',
    use: 'Counters, frequency dividers, shift registers, FSMs',
    table: {
      headers: ['J', 'K', 'Q (now)', 'Q+ (next)', 'Comment'],
      rows: [
        ['0','0','0','0','No change'],
        ['0','0','1','1','No change'],
        ['0','1','0','0','Reset'],
        ['0','1','1','0','Reset'],
        ['1','0','0','1','Set'],
        ['1','0','1','1','Set'],
        ['1','1','0','1','Toggle'],
        ['1','1','1','0','Toggle'],
      ],
      inputs: ['J','K'],
    },
  },
  T: {
    fullName: 'T (Toggle) Flip-Flop',
    desc: 'Output toggles when T=1 on clock edge, holds when T=0. Derived from JK with J=K=T. Used in binary counters.',
    excitation: 'Q+ = T ⊕ Q',
    use: 'Binary counters, frequency dividers, ripple counters',
    table: {
      headers: ['T', 'Q (now)', 'Q+ (next)', 'Comment'],
      rows: [
        ['0','0','0','No change'],
        ['0','1','1','No change'],
        ['1','0','1','Toggle'],
        ['1','1','0','Toggle'],
      ],
      inputs: ['T'],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Flip-Flop Circuit SVGs
// ─────────────────────────────────────────────────────────────────────────────
function FFCircuitSVG({ ff, inputs, q, qNext, isInvalid }: {
  ff: FFType; inputs: Record<string, number>; q: number; qNext: number; isInvalid: boolean;
}) {
  const HIGH = 'var(--pink)';
  const LOW = 'var(--text3)';
  const c = (v: number) => v ? HIGH : LOW;
  const fill = (v: number) => v ? 'rgba(244,114,182,0.25)' : 'var(--surface2)';
  const INV_COLOR = isInvalid ? 'var(--yellow)' : c(qNext);
  const INV_FILL = isInvalid ? 'rgba(245,200,66,0.2)' : fill(qNext);

  // Common box: x=100, y=35, w=100, h=90
  const BOX_X = 100, BOX_Y = 35, BOX_W = 100, BOX_H = 90;
  const MID_Y = BOX_Y + BOX_H / 2; // 80

  const inputLines = ff === 'SR' ? [
    { label: 'S', val: inputs['S'], y: BOX_Y + 22 },
    { label: 'R', val: inputs['R'], y: BOX_Y + 68 },
  ] : ff === 'JK' ? [
    { label: 'J', val: inputs['J'], y: BOX_Y + 22 },
    { label: 'K', val: inputs['K'], y: BOX_Y + 68 },
  ] : ff === 'D' ? [
    { label: 'D', val: inputs['D'], y: MID_Y },
  ] : [
    { label: 'T', val: inputs['T'], y: MID_Y },
  ];

  return (
    <svg viewBox="0 0 320 160" className="w-full max-w-sm mx-auto"
      style={{ filter: 'drop-shadow(0 0 10px rgba(244,114,182,0.12))' }}>

      {/* ─── FF Box ─── */}
      <rect x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx="8"
        fill="var(--surface2)" stroke="var(--border2)" strokeWidth="2" />
      <text x={BOX_X + BOX_W / 2} y={BOX_Y + 14} textAnchor="middle"
        fontSize="11" fontFamily="JetBrains Mono" fill="var(--text3)" fontWeight="bold">{ff}-FF</text>

      {/* ─── Clock line (bottom center of box) ─── */}
      <line x1={BOX_X + BOX_W / 2 - 10} y1={BOX_Y + BOX_H} x2={BOX_X + BOX_W / 2} y2={BOX_Y + BOX_H - 10} stroke="var(--text3)" strokeWidth="1.5" />
      <line x1={BOX_X + BOX_W / 2} y1={BOX_Y + BOX_H - 10} x2={BOX_X + BOX_W / 2 + 10} y2={BOX_Y + BOX_H} stroke="var(--text3)" strokeWidth="1.5" />
      <line x1={BOX_X + BOX_W / 2} y1={BOX_Y + BOX_H} x2={BOX_X + BOX_W / 2} y2={BOX_Y + BOX_H + 18} stroke="var(--text3)" strokeWidth="1.5" />
      <text x={BOX_X + BOX_W / 2 - 18} y={BOX_Y + BOX_H + 16} fontSize="10" fontFamily="JetBrains Mono" fill="var(--text3)">CLK▶</text>

      {/* ─── Input pins ─── */}
      {inputLines.map(({ label, val, y }) => (
        <g key={label}>
          <line x1="20" y1={y} x2={BOX_X} y2={y} stroke={c(val)} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy={y} r="6" fill={fill(val)} stroke={c(val)} strokeWidth="2" />
          <text x="13" y={y - 9} fontSize="11" fontFamily="JetBrains Mono" fill={c(val)} textAnchor="middle" fontWeight="bold">{label}</text>
          <text x="13" y={y + 18} fontSize="11" fontFamily="JetBrains Mono" fill={c(val)} textAnchor="middle" fontWeight="bold">{val}</text>
          <text x={BOX_X + 8} y={y + 4} fontSize="11" fontFamily="JetBrains Mono" fill="var(--text2)">{label}</text>
        </g>
      ))}

      {/* ─── Q output ─── */}
      <line x1={BOX_X + BOX_W} y1={BOX_Y + 25} x2="295" y2={BOX_Y + 25} stroke={c(qNext)} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="295" cy={BOX_Y + 25} r="7" fill={INV_FILL} stroke={INV_COLOR} strokeWidth="2.5" />
      <text x={BOX_X + BOX_W - 8} y={BOX_Y + 28} fontSize="11" fontFamily="JetBrains Mono" fill="var(--text2)" textAnchor="end">Q</text>
      <text x="295" y={BOX_Y + 9} fontSize="11" fontFamily="JetBrains Mono" fill={INV_COLOR} textAnchor="middle" fontWeight="bold">
        {isInvalid ? '?' : qNext}
      </text>

      {/* ─── Q' output ─── */}
      <line x1={BOX_X + BOX_W} y1={BOX_Y + 70} x2="295" y2={BOX_Y + 70} stroke={c(qNext ^ 1)} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="295" cy={BOX_Y + 70} r="7" fill={fill(isInvalid ? 0 : qNext ^ 1)} stroke={isInvalid ? 'var(--yellow)' : c(qNext ^ 1)} strokeWidth="2.5" />
      <text x={BOX_X + BOX_W - 8} y={BOX_Y + 73} fontSize="11" fontFamily="JetBrains Mono" fill="var(--text2)" textAnchor="end">Q'</text>
      <text x="295" y={BOX_Y + 54} fontSize="11" fontFamily="JetBrains Mono" fill={isInvalid ? 'var(--yellow)' : c(qNext ^ 1)} textAnchor="middle" fontWeight="bold">
        {isInvalid ? '?' : qNext ^ 1}
      </text>

      {/* ─── Current state label ─── */}
      <text x={BOX_X + BOX_W / 2} y={MID_Y + 4} textAnchor="middle"
        fontSize="22" fontFamily="JetBrains Mono" fill={c(q)} fontWeight="900">{q}</text>
      <text x={BOX_X + BOX_W / 2} y={MID_Y + 18} textAnchor="middle"
        fontSize="9" fontFamily="JetBrains Mono" fill="var(--text3)">Q now</text>

      {/* ─── Invalid warning ─── */}
      {isInvalid && (
        <text x={BOX_X + BOX_W / 2} y="152" textAnchor="middle"
          fontSize="10" fontFamily="JetBrains Mono" fill="var(--yellow)" fontWeight="bold">⚠ INVALID STATE</text>
      )}
    </svg>
  );
}

function FlipFlops() {
  const [ff, setFF] = useState<FFType>('JK');
  const [inputs, setInputs] = useState<Record<string, number>>({ J: 0, K: 0 });
  const [q, setQ] = useState(0);
  const [clkPulses, setClkPulses] = useState(0);
  const [history, setHistory] = useState<{ inputs: string; q: number; qNext: number }[]>([]);
  const info = FF_INFO[ff];

  const computeNext = (inp: Record<string, number>, qCurrent: number): number => {
    if (ff === 'SR') {
      const s = inp['S'], r = inp['R'];
      if (s === 1 && r === 1) return qCurrent;
      return s === 1 ? 1 : r === 1 ? 0 : qCurrent;
    }
    if (ff === 'D') return inp['D'];
    if (ff === 'JK') {
      const j = inp['J'], k = inp['K'];
      if (j === 0 && k === 0) return qCurrent;
      if (j === 0 && k === 1) return 0;
      if (j === 1 && k === 0) return 1;
      return qCurrent ^ 1;
    }
    if (ff === 'T') return inp['T'] ? qCurrent ^ 1 : qCurrent;
    return qCurrent;
  };

  const handleFFChange = (f: FFType) => {
    setFF(f);
    const defaultInputs: Record<string, number> = {};
    FF_INFO[f].table.inputs.forEach(i => defaultInputs[i] = 0);
    setInputs(defaultInputs);
    setQ(0);
    setHistory([]);
    setClkPulses(0);
  };

  const clock = () => {
    const qNext = computeNext(inputs, q);
    const isInvalid = ff === 'SR' && inputs['S'] === 1 && inputs['R'] === 1;
    setHistory(h => [...h.slice(-7), {
      inputs: info.table.inputs.map(i => `${i}=${inputs[i]}`).join(', '),
      q, qNext: isInvalid ? -1 : qNext,
    }]);
    if (!isInvalid) setQ(qNext);
    setClkPulses(c => c + 1);
  };

  const qNext = computeNext(inputs, q);
  const isInvalid = ff === 'SR' && inputs['S'] === 1 && inputs['R'] === 1;

  return (
    <div className="flex flex-col gap-6">
      {/* FF type selector */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(FF_INFO) as FFType[]).map(f => (
          <button key={f} onClick={() => handleFFChange(f)}
            style={ff === f ? { background: 'rgba(244,114,182,0.2)', color: 'var(--pink)', border: '1px solid rgba(244,114,182,0.4)' } : { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
            className="px-4 py-2 rounded-lg font-bold text-sm">{f} Flip-Flop</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT — Circuit + controls */}
        <div className="glass p-5 flex flex-col gap-5">
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Circuit Diagram</div>

          {/* SVG Circuit */}
          <FFCircuitSVG ff={ff} inputs={inputs} q={q} qNext={qNext} isInvalid={isInvalid} />

          {/* Input toggle buttons */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Toggle Inputs</div>
            <div className="flex gap-3 flex-wrap">
              {info.table.inputs.map(inp => (
                <button key={inp} onClick={() => setInputs(prev => ({ ...prev, [inp]: prev[inp] ^ 1 }))}
                  style={{
                    background: inputs[inp] ? 'rgba(244,114,182,0.2)' : 'var(--surface2)',
                    color: inputs[inp] ? 'var(--pink)' : 'var(--text2)',
                    border: `2px solid ${inputs[inp] ? 'rgba(244,114,182,0.5)' : 'var(--border)'}`,
                  }}
                  className="flex-1 py-3 rounded-xl font-mono font-black text-xl transition-all active:scale-95">
                  {inp} = {inputs[inp]}
                  <div className="text-xs font-normal mt-0.5" style={{ color: inputs[inp] ? 'var(--pink)' : 'var(--text3)' }}>
                    {inputs[inp] ? 'HIGH' : 'LOW'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Clock pulse button */}
          <button onClick={clock}
            style={{ background: 'rgba(244,114,182,0.15)', color: 'var(--pink)', border: '1px solid rgba(244,114,182,0.4)' }}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
            <span className="text-lg">⏱</span> Apply Clock Pulse #{clkPulses + 1}
          </button>

          {/* State history */}
          {history.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text3)' }}>State History</div>
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-mono py-1 px-2 rounded"
                  style={{ background: i === history.length - 1 ? 'rgba(244,114,182,0.08)' : 'transparent' }}>
                  <span style={{ color: 'var(--text3)' }}>CLK {i + 1}</span>
                  <span style={{ color: 'var(--text2)' }}>{h.inputs}</span>
                  <span style={{ color: 'var(--text3)' }}>Q:{h.q}</span>
                  <span style={{ color: 'var(--text3)' }}>→</span>
                  <span style={{ color: h.qNext === -1 ? 'var(--yellow)' : h.qNext ? 'var(--green)' : 'var(--red)' }}>
                    Q+:{h.qNext === -1 ? '?' : h.qNext}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Info + Truth table */}
        <div className="flex flex-col gap-4">
          <div className="glass p-5 flex flex-col gap-3">
            <div className="font-black text-base" style={{ color: 'var(--pink)' }}>{info.fullName}</div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{info.desc}</p>
            <div className="font-mono text-xs p-2 rounded" style={{ background: 'var(--bg3)', color: 'var(--pink)' }}>{info.excitation}</div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>
              <span className="font-bold" style={{ color: 'var(--yellow)' }}>Used in: </span>{info.use}
            </div>
          </div>

          <div className="glass p-4 overflow-x-auto">
            <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text3)' }}>Excitation / State Table</div>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr>{info.table.headers.map(h => (
                  <th key={h} className="text-left pb-2 pr-3 font-bold" style={{ color: 'var(--pink)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {info.table.rows.map((row, i) => {
                  const inpMatch = info.table.inputs.every((inp, j) => inputs[inp] === parseInt(row[j]));
                  const qMatch = row[info.table.inputs.length] === String(q);
                  const isActive = inpMatch && qMatch;
                  return (
                    <tr key={i} className="border-t border-[var(--border)]"
                      style={{ background: isActive ? 'rgba(244,114,182,0.08)' : 'transparent' }}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-1.5 pr-3"
                          style={{ color: cell === '?' ? 'var(--yellow)' : cell === '1' ? 'var(--green)' : cell === '0' ? 'var(--text3)' : 'var(--text2)' }}>
                          {cell}
                          {isActive && ci === row.length - 2 && <span className="ml-1 text-pink-400">←</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Boolean Algebra — clean focused reference
// ─────────────────────────────────────────────────────────────────────────────
function BooleanAlgebra() {
  const [activeGroup, setActiveGroup] = useState(0);

  const groups = [
    {
      label: 'Basic Laws',
      color: 'var(--accent2)',
      laws: [
        { name: 'Identity',      pairs: [['A + 0 = A', 'A · 1 = A']],                          note: 'OR with 0, AND with 1 — variable unchanged.' },
        { name: 'Null',          pairs: [['A + 1 = 1', 'A · 0 = 0']],                          note: 'OR with 1 always 1. AND with 0 always 0.' },
        { name: 'Idempotent',    pairs: [['A + A = A', 'A · A = A']],                          note: 'Variable OR/AND itself = itself.' },
        { name: 'Complement',    pairs: [["A + A' = 1", "A · A' = 0"]],                        note: 'Variable with its complement = 1 (OR) or 0 (AND).' },
        { name: 'Involution',    pairs: [["(A')' = A"]],                                       note: 'Double NOT cancels out.' },
        { name: 'Commutative',   pairs: [['A + B = B + A', 'A · B = B · A']],                 note: 'Order does not matter.' },
        { name: 'Associative',   pairs: [['(A+B)+C = A+(B+C)', '(A·B)·C = A·(B·C)']],        note: 'Grouping does not matter.' },
      ],
    },
    {
      label: 'Distributive & Absorption',
      color: 'var(--green)',
      laws: [
        { name: 'Distributive (AND over OR)', pairs: [['A·(B+C) = A·B + A·C']],              note: 'AND distributes over OR — like × over +.' },
        { name: 'Distributive (OR over AND)', pairs: [['A+(B·C) = (A+B)·(A+C)']],            note: 'OR distributes over AND — unlike normal algebra!' },
        { name: 'Absorption 1',  pairs: [['A + A·B = A']],                                    note: 'A absorbs A·B.' },
        { name: 'Absorption 2',  pairs: [['A·(A+B) = A']],                                    note: 'A absorbs A+B.' },
        { name: 'Elimination',   pairs: [["A + A'·B = A + B", "A·(A'+B) = A·B"]],            note: 'Complement term simplifies away.' },
      ],
    },
    {
      label: "De Morgan's Theorems",
      color: 'var(--pink)',
      laws: [
        { name: "1st Theorem",   pairs: [["(A·B)' = A' + B'"]],                               note: "Break bar, change operator · → +. NAND = OR of NOTs." },
        { name: "2nd Theorem",   pairs: [["(A+B)' = A' · B'"]],                               note: "Break bar, change operator + → ·. NOR = AND of NOTs." },
        { name: "For 3 vars",    pairs: [["(A·B·C)' = A'+B'+C'", "(A+B+C)' = A'·B'·C'"]],  note: "Generalize: break bar, change all operators." },
      ],
    },
    {
      label: 'SOP & POS Forms',
      color: 'var(--yellow)',
      laws: [
        { name: 'Minterm (SOP)', pairs: [['F = Σm(minterms)', 'Each term = AND of literals']],   note: 'Sum of Products: OR all rows where F=1.' },
        { name: 'Maxterm (POS)', pairs: [['F = ΠM(maxterms)', 'Each term = OR of literals']],    note: 'Product of Sums: AND all rows where F=0.' },
        { name: 'Duality',       pairs: [['Swap: 0↔1, AND↔OR']],                                 note: 'Every Boolean identity has a dual — swap operators and constants.' },
        { name: 'Consensus',     pairs: [["A·B + A'·C + B·C = A·B + A'·C"]],                     note: 'B·C is the consensus term — redundant, remove it.' },
      ],
    },
  ];

  const active = groups[activeGroup];

  return (
    <div className="flex flex-col gap-5">
      {/* Tab selector */}
      <div className="flex gap-2 flex-wrap">
        {groups.map((g, i) => (
          <button key={i} onClick={() => setActiveGroup(i)}
            style={activeGroup === i
              ? { background: `color-mix(in srgb, ${g.color} 20%, transparent)`, color: g.color, border: `1px solid color-mix(in srgb, ${g.color} 45%, transparent)` }
              : { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
            className="px-4 py-2 rounded-xl font-semibold text-sm transition-all">
            {g.label}
          </button>
        ))}
      </div>

      {/* Laws grid */}
      <AnimatePresence mode="wait">
        <motion.div key={activeGroup} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="grid sm:grid-cols-2 gap-3">
          {active.laws.map((law, i) => (
            <div key={i} className="glass p-4 flex flex-col gap-3"
              style={{ borderLeft: `3px solid ${active.color}` }}>
              <div className="font-bold text-sm" style={{ color: active.color }}>{law.name}</div>
              <div className="flex flex-col gap-2">
                {law.pairs.map((pair, pi) => (
                  <div key={pi} className="flex flex-wrap gap-2">
                    {pair.map((expr, ei) => (
                      <code key={ei} className="px-3 py-1.5 rounded-lg font-mono font-bold text-sm"
                        style={{ background: 'var(--bg3)', color: active.color, border: '1px solid var(--border)' }}>
                        {expr}
                      </code>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>{law.note}</p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Quick reference cheat card */}
      <div className="glass p-4 flex flex-col gap-3" style={{ borderTop: '2px solid var(--border)' }}>
        <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Quick Reference — Gate Equivalents</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { gate: 'AND',  expr: 'Y = A·B',         color: 'var(--cyan)' },
            { gate: 'OR',   expr: 'Y = A+B',         color: 'var(--cyan)' },
            { gate: 'NAND', expr: "Y = (A·B)'",      color: 'var(--pink)' },
            { gate: 'NOR',  expr: "Y = (A+B)'",      color: 'var(--pink)' },
            { gate: 'XOR',  expr: 'Y = A⊕B',         color: 'var(--yellow)' },
            { gate: 'XNOR', expr: "Y = (A⊕B)'",     color: 'var(--yellow)' },
            { gate: 'NOT',  expr: "Y = A'",          color: 'var(--orange)' },
            { gate: 'BUF',  expr: 'Y = A',           color: 'var(--green)' },
          ].map(g => (
            <div key={g.gate} className="flex flex-col gap-0.5 p-2 rounded-lg" style={{ background: 'var(--bg3)' }}>
              <span className="font-black font-mono text-xs" style={{ color: g.color }}>{g.gate}</span>
              <code className="font-mono text-xs" style={{ color: 'var(--text2)' }}>{g.expr}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main DigitalVisualizer component
// ─────────────────────────────────────────────────────────────────────────────
export function DigitalVisualizer() {
  const [section, setSection] = useState<DESection>('gates');

  const sectionInfo: Record<DESection, { desc: string }> = {
    gates: { desc: 'Explore all 8 logic gates — toggle inputs and see real-time output and truth tables.' },
    kmap: { desc: 'Build Karnaugh Maps for 2, 3, or 4 variables and learn SOP simplification.' },
    flipflop: { desc: 'Simulate SR, D, JK, and T flip-flops with clock pulses and state history.' },
    booleanalg: { desc: "All Boolean laws and De Morgan's theorems — the backbone of digital design." },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Header */}
      <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div style={{ background: 'rgba(56,189,248,0.15)', color: 'var(--cyan)', border: '1px solid rgba(56,189,248,0.3)' }}
            className="w-10 h-10 rounded-xl flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Digital <span style={{ color: 'var(--cyan)' }}>Electronics</span></h1>
            <p className="text-xs font-mono" style={{ color: 'var(--text3)' }}>EEE · EC · ETE — Logic Gates, Number Systems, K-Maps, Flip-Flops & Boolean Algebra</p>
          </div>
        </div>
      </motion.div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SECTION_LABELS) as DESection[]).map(s => (
          <button key={s} onClick={() => setSection(s)}
            style={section === s
              ? { background: `color-mix(in srgb, ${SECTION_COLORS[s]} 20%, transparent)`, color: SECTION_COLORS[s], border: `1px solid color-mix(in srgb, ${SECTION_COLORS[s]} 40%, transparent)` }
              : { background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all">
            {SECTION_ICONS[s]}
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: `color-mix(in srgb, ${SECTION_COLORS[section]} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${SECTION_COLORS[section]} 25%, transparent)` }}>
            <Info className="w-4 h-4 shrink-0" style={{ color: SECTION_COLORS[section] }} />
            <p className="text-sm" style={{ color: 'var(--text2)' }}>{sectionInfo[section].desc}</p>
          </div>

          {section === 'gates' && <LogicGates />}
          {section === 'kmap' && <KarnaughMap />}
          {section === 'flipflop' && <FlipFlops />}
          {section === 'booleanalg' && <BooleanAlgebra />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
