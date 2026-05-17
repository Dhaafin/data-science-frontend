"use client";

import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { MusicNote, ArrowUp, ArrowDown } from "@phosphor-icons/react";
import { Text, GlassCard, Badge, Divider } from "@/components/atoms";

/**
 * GenreDeepDive — Genre distribution view organism
 *
 * Displays genre popularity data as an animated vertical bar chart
 * with supporting stat cards below.
 * Activated via sidebar nav → "Genre Deep-Dive".
 * DESIGN_GUIDELINES.md §9 — chart rules applied.
 */

interface GenreEntry {
  name: string;
  count: number;
  avgPopularity: number;
  trend: "up" | "down" | "stable";
}

/** Mock data — will be replaced with Supabase data in a future milestone */
const GENRE_DATA: GenreEntry[] = [
  { name: "Indo Pop", count: 142, avgPopularity: 68, trend: "up" },
  { name: "Indie Pop", count: 97, avgPopularity: 61, trend: "up" },
  { name: "R&B / Soul", count: 74, avgPopularity: 57, trend: "stable" },
  { name: "EDM / Electronic", count: 58, avgPopularity: 53, trend: "up" },
  { name: "Dangdut / Koplo", count: 51, avgPopularity: 70, trend: "up" },
  { name: "Reggae", count: 44, avgPopularity: 49, trend: "down" },
  { name: "Folk / Acoustic", count: 39, avgPopularity: 55, trend: "stable" },
  { name: "Jazz", count: 27, avgPopularity: 46, trend: "down" },
];

/** Data viz palette per DESIGN_GUIDELINES.md §9.1 */
const DATA_COLORS = [
  "var(--color-data-1)",
  "var(--color-data-2)",
  "var(--color-data-3)",
  "var(--color-data-4)",
  "var(--color-data-5)",
  "var(--color-data-1)",
  "var(--color-data-2)",
  "var(--color-data-3)",
];

const CHART_HEIGHT = 200;

export function GenreDeepDive() {
  const maxCount = Math.max(...GENRE_DATA.map((g) => g.count));

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 h-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Page header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MusicNote size={20} weight="bold" className="text-(--color-accent-500)" />
          <Text as="h1" variant="title" color="primary">
            Genre Deep-Dive
          </Text>
        </div>
        <Text variant="body" color="secondary">
          Distribusi popularitas genre di seluruh dataset artis Indonesia.
        </Text>
      </motion.div>

      <Divider spacing="sm" />

      {/* Bar chart */}
      <motion.div variants={fadeUp}>
        <GlassCard className="p-5">
          <Text variant="label" color="secondary" className="mb-4">
            Artist Count per Genre
          </Text>

          {/* Chart area */}
          <div
            className="flex items-end gap-3 w-full"
            style={{ height: CHART_HEIGHT }}
          >
            {GENRE_DATA.map((genre, i) => {
              const barHeightPct = (genre.count / maxCount) * 100;
              const barPx = (barHeightPct / 100) * CHART_HEIGHT;
              return (
                <div
                  key={genre.name}
                  className="flex flex-col items-center gap-1.5 flex-1 group cursor-default"
                >
                  {/* Count label */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
                  >
                    <Text as="span" variant="caption" color="muted">
                      {genre.count}
                    </Text>
                  </motion.div>

                  {/* Bar */}
                  <motion.div
                    className="w-full rounded-t-sm group-hover:opacity-90 transition-opacity"
                    style={{ background: DATA_COLORS[i] }}
                    initial={{ height: 0 }}
                    animate={{ height: barPx }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex gap-3 mt-2">
            {GENRE_DATA.map((genre, i) => (
              <div key={genre.name} className="flex-1 text-center">
                <Text
                  as="span"
                  variant="caption"
                  color="muted"
                  className="block truncate"
                  style={{ color: DATA_COLORS[i] }}
                >
                  {genre.name.split(" ")[0]}
                </Text>
              </div>
            ))}
          </div>

          {/* Grid baseline */}
          <div className="border-t border-(--color-border-default) mt-1" />
        </GlassCard>
      </motion.div>

      {/* Genre stat cards */}
      <motion.div
        className="grid grid-cols-2 xl:grid-cols-4 gap-4"
        variants={staggerContainer}
      >
        {GENRE_DATA.slice(0, 4).map((genre, i) => (
          <motion.div key={genre.name} variants={fadeUp}>
            <GlassCard
              variant="accent"
              className="flex flex-col gap-2 p-4"
            >
              <div className="flex items-center justify-between">
                <Badge color="accent">{genre.name}</Badge>
                {genre.trend === "up" ? (
                  <ArrowUp
                    size={14}
                    weight="bold"
                    className="text-(--color-success)"
                  />
                ) : genre.trend === "down" ? (
                  <ArrowDown
                    size={14}
                    weight="bold"
                    className="text-(--color-error)"
                  />
                ) : null}
              </div>
              <Text as="span" variant="hero" color="primary">
                {genre.avgPopularity}
              </Text>
              <Text variant="caption" color="secondary">
                avg. popularity
              </Text>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Full genre table */}
      <motion.div variants={fadeUp}>
        <GlassCard className="overflow-hidden">
          <div className="px-4 py-3 border-b border-(--color-border-default)">
            <Text variant="label" color="secondary">
              All Genres
            </Text>
          </div>
          {GENRE_DATA.map((genre, i) => (
            <div
              key={genre.name}
              className={`flex items-center justify-between px-4 py-3 border-b border-(--color-border-default) last:border-b-0 ${
                i % 2 === 0
                  ? "bg-(--color-bg-card)/60"
                  : "bg-(--color-bg-surface)/30"
              } hover:bg-(--color-bg-surface)/60 transition-colors`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-2 rounded-full shrink-0"
                  style={{ background: DATA_COLORS[i] }}
                />
                <Text variant="label" color="primary">
                  {genre.name}
                </Text>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <Text as="span" variant="label" color="primary">
                    {genre.count}
                  </Text>
                  <Text as="span" variant="caption" color="muted" className="ml-1">
                    artists
                  </Text>
                </div>
                <div className="text-right">
                  <Text as="span" variant="label" color="accent">
                    {genre.avgPopularity}
                  </Text>
                  <Text as="span" variant="caption" color="muted" className="ml-1">
                    pop
                  </Text>
                </div>
                <div className="w-4 flex justify-center">
                  {genre.trend === "up" ? (
                    <ArrowUp size={14} weight="bold" className="text-(--color-success)" />
                  ) : genre.trend === "down" ? (
                    <ArrowDown size={14} weight="bold" className="text-(--color-error)" />
                  ) : (
                    <span className="text-[10px] text-(--color-text-muted)">—</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
