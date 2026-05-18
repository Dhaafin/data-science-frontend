"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  UsersThree,
  ChartLineUp,
  MapTrifold,
  MusicNotes,
  Buildings,
  Fire,
  Users,
} from "@phosphor-icons/react";
import { KpiCard } from "@/components/molecules/KpiCard";

/**
 * KpiBar — Horizontal KPI overlay bar organism
 * Includes a segmented toggle control for Global Analytics Perspectives.
 */

interface KpiBarProps {
  mapMode: 'density' | 'popularity';
  onModeChange: (mode: 'density' | 'popularity') => void;
  // Density Metrics
  totalArtists: number;
  avgArtistsPerCity: number;
  mostDenseCity: string;
  provincesCovered: number;
  // Popularity Metrics
  avgPopularity: number;
  mostPopularCity: string;
  totalFollowers: string;
  topGenre: string;
}

export function KpiBar({
  mapMode,
  onModeChange,
  totalArtists,
  avgArtistsPerCity,
  mostDenseCity,
  provincesCovered,
  avgPopularity,
  mostPopularCity,
  totalFollowers,
  topGenre,
}: KpiBarProps) {
  return (
    <div className="flex gap-4 p-4 items-stretch">
      {/* Mode Selector Pillar */}
      <div className="flex flex-col gap-2 p-2 bg-[#121212]/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl min-w-[140px]">
        <button
          onClick={() => onModeChange('density')}
          className={`relative flex-1 px-4 py-3 text-xs font-bold rounded-xl transition-colors text-left overflow-hidden ${
            mapMode === 'density' ? 'text-teal-400' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          {mapMode === 'density' && (
            <motion.div layoutId="modePill" className="absolute inset-0 bg-teal-500/10 border border-teal-500/30 rounded-xl" />
          )}
          <span className="relative z-10 block">Density</span>
          <span className="relative z-10 block text-[9px] font-normal opacity-70">Demographic Vol.</span>
        </button>
        <button
          onClick={() => onModeChange('popularity')}
          className={`relative flex-1 px-4 py-3 text-xs font-bold rounded-xl transition-colors text-left overflow-hidden ${
            mapMode === 'popularity' ? 'text-rose-400' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          {mapMode === 'popularity' && (
            <motion.div layoutId="modePill" className="absolute inset-0 bg-rose-500/10 border border-rose-500/30 rounded-xl" />
          )}
          <span className="relative z-10 block">Popularity</span>
          <span className="relative z-10 block text-[9px] font-normal opacity-70">Cultural Influence</span>
        </button>
      </div>

      {/* Dynamic KPI Cards with smooth cross-fade */}
      <div className="flex flex-1 gap-4 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {mapMode === 'density' ? (
            <motion.div
              key="density-kpis"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-1 gap-4"
            >
              <KpiCard icon={UsersThree} label="Total Artists" value={totalArtists} />
              <KpiCard icon={Buildings} label="Avg Artists/City" value={avgArtistsPerCity} decimals={1} />
              <KpiCard icon={Fire} label="Most Dense City" value={0} formatter={() => mostDenseCity} />
              <KpiCard icon={MapTrifold} label="Provinces" value={provincesCovered} />
            </motion.div>
          ) : (
            <motion.div
              key="popularity-kpis"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-1 gap-4"
            >
              <KpiCard icon={ChartLineUp} label="Avg. Popularity" value={avgPopularity} decimals={1} />
              <KpiCard icon={Fire} label="Most Popular City" value={0} formatter={() => mostPopularCity} />
              <KpiCard icon={Users} label="Total Followers" value={0} formatter={() => totalFollowers} />
              <KpiCard icon={MusicNotes} label="Top Genre" value={0} formatter={() => topGenre} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
