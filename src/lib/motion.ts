/**
 * Framer Motion Variants — DESIGN_GUIDELINES.md §7
 *
 * Canonical animation presets for the entire application.
 * Import these variants instead of defining inline motion props.
 */

import type { Variants, SpringOptions } from "framer-motion";

/** Standard fade-up entrance — cards, sections, any block element */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/** Staggered container — wrap around a list of animated children */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/** Slide-in from right — drawer, side panels */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: 60,
    transition: { duration: 0.25 },
  },
};

/** Slide-in from left — sidebar panels */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Scale entrance — map bubbles, icons on load */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

/** Fade only — simple opacity transitions */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/** Spring config for counter roll-up animations */
export const counterSpring: SpringOptions = {
  stiffness: 100,
  damping: 30,
};
