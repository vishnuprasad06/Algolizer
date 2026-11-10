import { motion } from 'motion/react';
import React from 'react';

interface TileProps {
  value: number;
  index: number;
  highlight: 'default' | 'active' | 'sorted' | 'special';
}

const COLORS = {
  default: { bg: 'var(--surface2)', border: 'var(--border2)', text: 'var(--text)', shadow: 'none' },
  active: { bg: 'rgba(255,95,126,0.2)', border: 'var(--red)', text: 'var(--red)', shadow: '0 0 12px rgba(255,95,126,0.3)' },
  sorted: { bg: 'rgba(34,211,160,0.15)', border: 'var(--green)', text: 'var(--green)', shadow: '0 0 12px rgba(34,211,160,0.25)' },
  special: { bg: 'rgba(124,108,252,0.2)', border: 'var(--accent)', text: 'var(--accent2)', shadow: '0 0 12px rgba(124,108,252,0.3)' },
};

export const Tile: React.FC<TileProps> = ({ value, index, highlight }) => {
  const c = COLORS[highlight];
  return (
    <motion.div layout transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="flex flex-col items-center gap-1">
      <motion.div
        style={{ background: c.bg, border: `2px solid ${c.border}`, color: c.text, boxShadow: c.shadow }}
        className="w-14 h-14 flex items-center justify-center font-bold text-base rounded-lg transition-all duration-200 font-mono"
        animate={{ scale: highlight === 'active' ? 1.08 : 1 }}>
        {value}
      </motion.div>
      <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>{index}</span>
    </motion.div>
  );
};

// Bar chart representation
interface BarProps {
  value: number;
  maxValue: number;
  index: number;
  highlight: 'default' | 'active' | 'sorted' | 'special';
}

export const Bar: React.FC<BarProps> = ({ value, maxValue, index, highlight }) => {
  const c = COLORS[highlight];
  const heightPct = Math.max(8, (value / maxValue) * 100);
  return (
    <motion.div layout className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xs font-mono" style={{ color: highlight === 'default' ? 'var(--text3)' : c.text }}>{value}</span>
      <div className="relative w-full flex items-end" style={{ height: 160 }}>
        <motion.div className="w-full rounded-t-md transition-colors duration-200"
          style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: c.shadow, height: `${heightPct}%` }}
          animate={{ height: `${heightPct}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
      </div>
      <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>{index}</span>
    </motion.div>
  );
};
