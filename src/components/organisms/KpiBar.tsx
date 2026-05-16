"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import {
  UsersThree,
  ChartLineUp,
  MapTrifold,
  MusicNotes,
} from "@phosphor-icons/react";
import { KpiCard } from "@/components/molecules/KpiCard";

/**
 * KpiBar — Horizontal KPI overlay bar organism
 *
 * 4 headline metrics overlaid on the top of the map canvas.
 * DESIGN_GUIDELINES.md §4.2.
 */

interface KpiBarProps {
  totalArtists: number;
  avgPopularity: number;
  provincesCovered: number;
  topGenre: string;
}

export function KpiBar({
  totalArtists,
  avgPopularity,
  provincesCovered,
  topGenre,
}: KpiBarProps) {
  return (
    <motion.div
      className="flex gap-4 p-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <KpiCard
        icon={UsersThree}
        label="Total Artists"
        value={totalArtists}
      />
      <KpiCard
        icon={ChartLineUp}
        label="Avg. Popularity"
        value={avgPopularity}
        decimals={1}
      />
      <KpiCard
        icon={MapTrifold}
        label="Provinces"
        value={provincesCovered}
      />
      <KpiCard
        icon={MusicNotes}
        label="Top Genre"
        value={0}
        formatter={() => topGenre}
      />
    </motion.div>
  );
}
