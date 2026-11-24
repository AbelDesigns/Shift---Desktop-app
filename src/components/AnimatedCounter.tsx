import React from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_CUBIC } from '../lib/motion';

interface AnimatedCounterProps {
  value: number;
  pad?: boolean;
  className?: string;
}

/**
 * Tabular-nums counter with crisp micro vertical tick when count updates.
 * Uses direct keyed mount animation (no popLayout) so it never blocks parent unmounts.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  pad = false,
  className = '',
}) => {
  const formatted = pad ? String(value).padStart(2, '0') : String(value);

  return (
    <span className={`relative inline-flex overflow-hidden font-mono tabular-nums ${className}`}>
      <motion.span
        key={formatted}
        initial={{ y: -4, opacity: 0.35 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.14, ease: EASE_OUT_CUBIC }}
        className="inline-block"
      >
        {formatted}
      </motion.span>
    </span>
  );
};
