"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp } from "@/lib/motion";

/**
 * Badge — Atomic chip/tag component
 *
 * Used for genre tags, status indicators, and small data labels.
 * Follows DESIGN_GUIDELINES.md §6.3 for genre badge spec.
 *
 * @example
 * <Badge>indie pop</Badge>
 * <Badge variant="outline">Jakarta</Badge>
 * <Badge variant="solid" color="success">Active</Badge>
 */

type BadgeVariant = "default" | "outline" | "solid";
type BadgeColor = "accent" | "success" | "warning" | "error" | "info";

const colorMap: Record<BadgeColor, { bg: string; border: string; text: string }> = {
  accent: {
    bg: "bg-[rgba(20,184,166,0.12)]",
    border: "border-(--color-border-accent)",
    text: "text-(--color-text-accent)",
  },
  success: {
    bg: "bg-[rgba(34,197,94,0.12)]",
    border: "border-[rgba(34,197,94,0.30)]",
    text: "text-(--color-success)",
  },
  warning: {
    bg: "bg-[rgba(245,158,11,0.12)]",
    border: "border-[rgba(245,158,11,0.30)]",
    text: "text-(--color-warning)",
  },
  error: {
    bg: "bg-[rgba(239,68,68,0.12)]",
    border: "border-[rgba(239,68,68,0.30)]",
    text: "text-(--color-error)",
  },
  info: {
    bg: "bg-[rgba(56,189,248,0.12)]",
    border: "border-[rgba(56,189,248,0.30)]",
    text: "text-(--color-info)",
  },
};

interface BadgeProps extends Omit<HTMLMotionProps<"span">, "ref"> {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Semantic color */
  color?: BadgeColor;
  /** Additional Tailwind classes */
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  color = "accent",
  className = "",
  children,
  ...motionProps
}: BadgeProps) {
  const c = colorMap[color];

  const variantSpecificClasses =
    variant === "outline"
      ? `bg-transparent border ${c.border} ${c.text}`
      : variant === "solid"
        ? `${c.bg} ${c.text}`
        : `${c.bg} border ${c.border} ${c.text}`;

  const classes = [
    "inline-flex items-center rounded-sm px-2 py-0.5 text-caption font-medium",
    variantSpecificClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.span
      className={classes}
      variants={fadeUp}
      {...motionProps}
    >
      {children}
    </motion.span>
  );
}
