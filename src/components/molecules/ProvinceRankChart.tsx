"use client";

import { motion } from "framer-motion";
import { Text } from "@/components/atoms";

/**
 * ProvinceRankChart — Mini horizontal bar chart molecule
 *
 * Renders a compact set of animated horizontal bars ranking
 * the given province against others by artist count / popularity.
 * Used inside ArtistDrawer §4.3.
 *
 * All animation via Framer Motion. No external chart library.
 */

interface ProvinceBar {
  label: string;
  value: number;
  highlight?: boolean;
}

interface ProvinceRankChartProps {
  /** Province name to highlight */
  activeProvince: string;
}

/** Static mock data — will be replaced with real data in a future milestone */
const PROVINCE_DATA: ProvinceBar[] = [
  { label: "DKI Jakarta", value: 98 },
  { label: "Jawa Barat", value: 72 },
  { label: "Jawa Timur", value: 58 },
  { label: "Sumatera Utara", value: 41 },
  { label: "Sulawesi Selatan", value: 34 },
  { label: "Bali", value: 28 },
  { label: "Maluku", value: 18 },
];

const BAR_COLORS = {
  active: "var(--color-accent-500)",
  default: "var(--color-bg-surface)",
};

export function ProvinceRankChart({ activeProvince }: ProvinceRankChartProps) {
  const max = Math.max(...PROVINCE_DATA.map((d) => d.value));

  const data = PROVINCE_DATA.map((d) => ({
    ...d,
    highlight: d.label === activeProvince,
    pct: (d.value / max) * 100,
  }));

  return (
    <div className="flex flex-col gap-2">
      {data.map((item, i) => (
        <div key={item.label} className="flex items-center gap-2">
          {/* Label */}
          <Text
            as="span"
            variant="caption"
            color={item.highlight ? "accent" : "secondary"}
            className={`w-32 shrink-0 truncate ${item.highlight ? "font-semibold" : ""}`}
          >
            {item.label}
          </Text>

          {/* Bar track */}
          <div className="flex-1 h-1.5 rounded-full bg-(--color-bg-surface) overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: item.highlight
                  ? BAR_COLORS.active
                  : "var(--color-text-muted)",
                boxShadow: item.highlight
                  ? "0 0 8px var(--color-accent-glow)"
                  : "none",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${item.pct}%` }}
              transition={{
                duration: 0.7,
                delay: i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>

          {/* Value */}
          <Text
            as="span"
            variant="caption"
            color={item.highlight ? "accent" : "muted"}
            className="w-6 text-right shrink-0"
          >
            {item.value}
          </Text>
        </div>
      ))}
    </div>
  );
}
