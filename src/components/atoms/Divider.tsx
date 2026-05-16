"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/**
 * Divider — Atomic separator component
 *
 * Thin horizontal rule using the design system border color.
 *
 * @example
 * <Divider />
 * <Divider spacing="lg" />
 */

type DividerSpacing = "sm" | "md" | "lg";

const spacingClasses: Record<DividerSpacing, string> = {
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
};

interface DividerProps extends Omit<HTMLMotionProps<"hr">, "ref"> {
  /** Vertical margin */
  spacing?: DividerSpacing;
  /** Additional Tailwind classes */
  className?: string;
}

export function Divider({
  spacing = "md",
  className = "",
  ...motionProps
}: DividerProps) {
  const classes = [
    "border-0 h-px w-full bg-(--color-border-default)",
    spacingClasses[spacing],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <motion.hr className={classes} {...motionProps} />;
}
