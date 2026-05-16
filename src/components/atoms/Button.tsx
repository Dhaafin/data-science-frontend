"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/**
 * Button — Atomic button component
 *
 * Three variants from DESIGN_GUIDELINES.md §6.2:
 * - primary: Teal accent, dark text
 * - ghost: Transparent with subtle border
 * - danger: Red, destructive actions
 *
 * @example
 * <Button variant="primary" onClick={handleClick}>Save</Button>
 * <Button variant="ghost" size="sm">Cancel</Button>
 */

type ButtonVariant = "primary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-(--color-accent-500)",
    "text-(--color-bg-canvas)",
    "hover:bg-(--color-accent-400)",
    "active:bg-(--color-accent-600)",
  ].join(" "),
  ghost: [
    "bg-transparent",
    "border",
    "border-(--color-border-default)",
    "text-(--color-text-primary)",
    "hover:bg-(--color-bg-surface)",
  ].join(" "),
  danger: [
    "bg-(--color-error)",
    "text-white",
    "hover:opacity-80",
    "active:opacity-70",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-caption gap-1",
  md: "px-4 py-2 text-label gap-1.5",
  lg: "px-5 py-2.5 text-body gap-2",
};

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Additional Tailwind classes */
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...motionProps
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center font-medium rounded cursor-pointer",
    "transition-colors duration-150",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.button
      className={classes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
