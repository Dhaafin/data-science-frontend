"use client";

import { motion } from "framer-motion";
import type { Icon } from "@phosphor-icons/react";
import { Text } from "@/components/atoms";

/**
 * NavItem — Sidebar navigation link molecule
 *
 * Combines a Phosphor icon (Regular weight, 20px) with a label.
 * Active state uses accent color + surface background.
 */

interface NavItemProps {
  /** Phosphor icon component */
  icon: Icon;
  /** Navigation label */
  label: string;
  /** Whether this item is currently active */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export function NavItem({ icon: IconComponent, label, active = false, onClick }: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer",
        "transition-colors duration-150",
        active
          ? "bg-(--color-bg-surface) text-(--color-accent-500)"
          : "text-(--color-text-secondary) hover:bg-(--color-bg-surface)/50 hover:text-(--color-text-primary)",
      ].join(" ")}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <IconComponent size={20} weight={active ? "bold" : "regular"} />
      <Text as="span" variant="label" color={active ? "accent" : "secondary"} className="truncate">
        {label}
      </Text>
    </motion.button>
  );
}
