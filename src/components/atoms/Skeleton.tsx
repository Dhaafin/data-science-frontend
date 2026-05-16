"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/**
 * Skeleton — Atomic loading placeholder
 *
 * Shimmer effect for data-loading states. Uses the surface color
 * with a subtle pulse animation.
 *
 * @example
 * <Skeleton className="h-8 w-32" />
 * <Skeleton className="h-4 w-full" />
 * <Skeleton variant="circle" className="size-10" />
 */

type SkeletonVariant = "rect" | "circle";

interface SkeletonProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  /** Shape of the skeleton */
  variant?: SkeletonVariant;
  /** Additional Tailwind classes — use to set width/height */
  className?: string;
}

export function Skeleton({
  variant = "rect",
  className = "",
  ...motionProps
}: SkeletonProps) {
  const shapeClass = variant === "circle" ? "rounded-full" : "rounded-lg";

  const classes = [
    "bg-(--color-bg-surface)",
    shapeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      className={classes}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      {...motionProps}
    />
  );
}
