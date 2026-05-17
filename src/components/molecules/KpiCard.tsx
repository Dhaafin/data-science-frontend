"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import type { Icon } from "@phosphor-icons/react";
import { Text, GlassCard, AnimatedCounter } from "@/components/atoms";

/**
 * KpiCard — Single KPI metric molecule
 *
 * Displays one headline metric inside a glass card
 * with an icon, label, and animated counter value.
 * DESIGN_GUIDELINES.md §4.2.
 */

interface KpiCardProps {
  /** Phosphor icon component (Bold weight, 24px) */
  icon: Icon;
  /** Metric label */
  label: string;
  /** Numeric value to animate */
  value: number;
  /** Decimal places for the counter */
  decimals?: number;
  /** Suffix appended to number */
  suffix?: string;
  /** Custom formatter */
  formatter?: (n: number) => string;
}

export function KpiCard({
  icon: IconComponent,
  label,
  value,
  decimals = 0,
  suffix,
  formatter,
}: KpiCardProps) {
  return (
    <GlassCard
      className="flex flex-col gap-2 min-w-0 flex-1 p-4"
      variants={fadeUp}
    >
      <div className="flex items-center gap-2">
        <motion.div
          className="flex items-center justify-center size-8 rounded-lg bg-(--color-accent-500)/10"
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <IconComponent size={24} weight="bold" className="text-(--color-accent-500)" />
        </motion.div>
        <Text as="span" variant="caption" color="secondary">
          {label}
        </Text>
      </div>
      <AnimatedCounter
        value={value}
        decimals={decimals}
        suffix={suffix}
        formatter={formatter}
        className="text-title text-(--color-text-primary)"
      />
    </GlassCard>
  );
}
