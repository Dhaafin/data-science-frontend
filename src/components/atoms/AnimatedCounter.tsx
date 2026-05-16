"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { counterSpring } from "@/lib/motion";

/**
 * AnimatedCounter — Atomic KPI number component
 *
 * Renders a number that rolls up from 0 using spring physics.
 * Follows DESIGN_GUIDELINES.md §7.2: "KPI numbers: Always animate
 * with counter roll-up on mount and on data change."
 *
 * @example
 * <AnimatedCounter value={312} />
 * <AnimatedCounter value={72.5} decimals={1} suffix="%" />
 * <AnimatedCounter value={1200000} formatter={formatCompact} />
 */

interface AnimatedCounterProps {
  /** Target numeric value */
  value: number;
  /** Number of decimal places */
  decimals?: number;
  /** String prepended to the number */
  prefix?: string;
  /** String appended to the number */
  suffix?: string;
  /** Custom number formatter — overrides decimals */
  formatter?: (n: number) => string;
  /** Additional Tailwind classes */
  className?: string;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  formatter,
  className = "",
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, counterSpring);
  const display = useTransform(spring, (current) => {
    if (formatter) return `${prefix}${formatter(current)}${suffix}`;
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <motion.span className={`tabular-nums ${className}`}>
      {display}
    </motion.span>
  );
}
