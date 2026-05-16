"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp } from "@/lib/motion";

/**
 * Text — Atomic typography component
 *
 * Maps the design system's type scale tokens to a polymorphic,
 * animated text element. Keeps all font-size/weight/line-height
 * decisions in one place.
 *
 * @example
 * <Text variant="hero">1,234</Text>
 * <Text variant="label" color="secondary">Origin City</Text>
 * <Text as="h2" variant="title">Section Heading</Text>
 */

type TextVariant = "hero" | "title" | "heading" | "body" | "label" | "caption";
type TextColor = "primary" | "secondary" | "muted" | "accent";
type TextElement = "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";

const variantClasses: Record<TextVariant, string> = {
  hero:    "text-hero",
  title:   "text-title",
  heading: "text-heading",
  body:    "text-body",
  label:   "text-label",
  caption: "text-caption",
};

const colorClasses: Record<TextColor, string> = {
  primary:   "text-(--color-text-primary)",
  secondary: "text-(--color-text-secondary)",
  muted:     "text-(--color-text-muted)",
  accent:    "text-(--color-text-accent)",
};

interface TextProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  /** Type scale token from the design system */
  variant?: TextVariant;
  /** Semantic color from the design system */
  color?: TextColor;
  /** HTML element to render */
  as?: TextElement;
  /** Enable Framer Motion entrance animation */
  animate?: boolean;
  /** Additional Tailwind classes */
  className?: string;
  children: React.ReactNode;
}

export function Text({
  variant = "body",
  color = "primary",
  as: Tag = "p",
  animate: shouldAnimate = false,
  className = "",
  children,
  ...motionProps
}: TextProps) {
  const classes = [
    variantClasses[variant],
    colorClasses[color],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const animationProps = shouldAnimate
    ? { variants: fadeUp, initial: "hidden" as const, animate: "visible" as const }
    : {};

  const sharedProps = { className, ...animationProps, ...motionProps };

  switch (Tag) {
    case "h1":   return <motion.h1   className={classes} {...animationProps} {...motionProps}>{children}</motion.h1>;
    case "h2":   return <motion.h2   className={classes} {...animationProps} {...motionProps}>{children}</motion.h2>;
    case "h3":   return <motion.h3   className={classes} {...animationProps} {...motionProps}>{children}</motion.h3>;
    case "h4":   return <motion.h4   className={classes} {...animationProps} {...motionProps}>{children}</motion.h4>;
    case "h5":   return <motion.h5   className={classes} {...animationProps} {...motionProps}>{children}</motion.h5>;
    case "h6":   return <motion.h6   className={classes} {...animationProps} {...motionProps}>{children}</motion.h6>;
    case "span": return <motion.span className={classes} {...animationProps} {...motionProps}>{children}</motion.span>;
    case "div":  return <motion.div  className={classes} {...animationProps} {...motionProps}>{children}</motion.div>;
    case "p":
    default:     return <motion.p    className={classes} {...animationProps} {...motionProps}>{children}</motion.p>;
  }
}
