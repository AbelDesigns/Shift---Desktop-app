import type { Transition } from 'framer-motion';

/**
 * Precision motion tokens following Emil Kowalski & Impeccable craft principles:
 * - Never use ease-in for entering UI; always decelerate cleanly.
 * - Keep micro-interactions snappy (< 240ms) and interruptible.
 * - Springs tuned for zero sloppy overshoot on precision dark instrumentation.
 */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.19, 1, 0.22, 1];
export const EASE_OUT_CUBIC: [number, number, number, number] = [0.33, 1, 0.68, 1];

export const TRANSITION_FAST: Transition = {
  duration: 0.16,
  ease: EASE_OUT_CUBIC,
};

export const TRANSITION_VIEW: Transition = {
  duration: 0.2,
  ease: EASE_OUT_EXPO,
};

export const TRANSITION_SHEET: Transition = {
  duration: 0.24,
  ease: EASE_OUT_EXPO,
};

export const SPRING_INDICATOR: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 38,
  mass: 0.8,
};

export const SPRING_TOGGLE: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 36,
};
