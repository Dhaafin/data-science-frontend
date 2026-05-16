"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp } from "@/lib/motion";

/**
 * GlassCard — Atomic card component with glassmorphism
 *
 * The foundational surface element of the design system.
 * Two variants from DESIGN_GUIDELINES.md §2.2:
 * - default: Subtle frosted glass
 * - accent: Teal glow border
 *
 * @example
 * <GlassCard>Content here</GlassCard>
 * <GlassCard variant="accent" animate>Highlighted</GlassCard>
 */

type GlassCardVariant = "default" | "accent";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  /** Glass variant */
  variant?: GlassCardVariant;
  /** Enable fade-up entrance animation */
  animate?: boolean;
  /** Additional Tailwind classes */
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({
  variant = "default",
  animate: shouldAnimate = false,
  className = "",
  children,
  ...motionProps
}: GlassCardProps) {
  const glassClass = variant === "accent" ? "glass-card-accent" : "glass-card";

  const classes = [glassClass, className].filter(Boolean).join(" ");

  return (
    <motion.div
      className={classes}
      {...(shouldAnimate
        ? { variants: fadeUp, initial: "hidden", animate: "visible" }
        : {})}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
