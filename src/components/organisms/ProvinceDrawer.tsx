"use client";

import { motion, AnimatePresence } from "framer-motion";
import { slideInRight } from "@/lib/motion";
import { X, Users, Flame, MusicNotes, Sparkle } from "@phosphor-icons/react";
import { Text, Badge, Divider, AnimatedCounter } from "@/components/atoms";
import type { ArtistData } from "@/components/organisms/ArtistDrawer";

export interface ProvinceDetailData {
  name: string;
  artistCount: number;
  avgPopularity: number;
  totalFollowers: number;
  topGenres: { name: string; count: number; percentage: number }[];
  artists: ArtistData[];
}

interface ProvinceDrawerProps {
  /** Province analytics data, null = closed */
  province: ProvinceDetailData | null;
  /** Close handler */
  onClose: () => void;
  /** Drilldown handler to open an artist's full detail drawer */
  onArtistSelect: (artist: ArtistData) => void;
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

export function ProvinceDrawer({
  province,
  onClose,
  onArtistSelect,
}: ProvinceDrawerProps) {
  return (
    <AnimatePresence mode="wait">
      {province && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-[500px] max-w-full bg-(--color-bg-drawer) border-l border-(--color-border-default) flex flex-col overflow-hidden"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-(--color-border-default) bg-(--color-bg-surface)/10">
              <div className="flex flex-col gap-1 min-w-0">
                <Badge
                  color="accent"
                  className="self-start uppercase tracking-wider text-[10px] font-bold"
                >
                  Province Overview
                </Badge>
                <Text
                  as="h2"
                  variant="title"
                  color="primary"
                  className="truncate text-2xl font-bold uppercase tracking-tight mt-1"
                >
                  {province.name}
                </Text>
              </div>
              <motion.button
                onClick={onClose}
                className="flex items-center justify-center size-8 rounded-lg text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-surface) transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} weight="regular" />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Regional Performance Metrics */}
              <div className="grid grid-cols-3 gap-3 bg-(--color-bg-surface)/20 border border-(--color-border-default) rounded-xl p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-(--color-text-muted)">
                    <Users size={14} />
                    <Text variant="caption">Artists</Text>
                  </div>
                  <AnimatedCounter
                    value={province.artistCount}
                    className="text-xl font-bold text-white tracking-tight"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-(--color-accent-500)">
                    <Flame size={14} />
                    <Text variant="caption">Avg Pop</Text>
                  </div>
                  <AnimatedCounter
                    value={province.avgPopularity}
                    className="text-xl font-bold text-(--color-accent-500) tracking-tight"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-(--color-text-muted)">
                    <Sparkle size={14} />
                    <Text variant="caption">Followers</Text>
                  </div>
                  <AnimatedCounter
                    value={province.totalFollowers}
                    formatter={formatFollowers}
                    className="text-xl font-bold text-white tracking-tight"
                  />
                </div>
              </div>

              <Divider spacing="sm" />

              {/* Subcultural Genre Breakdown */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-(--color-text-primary)">
                  <MusicNotes size={16} className="text-(--color-accent-500)" />
                  <Text variant="label" className="font-semibold">
                    Local Subcultural Genre Mix
                  </Text>
                </div>

                {province.topGenres.length === 0 ? (
                  <Text variant="caption" color="muted">
                    No genres cataloged in this region.
                  </Text>
                ) : (
                  <div className="flex flex-col gap-3">
                    {province.topGenres.slice(0, 5).map((genre) => (
                      <div key={genre.name} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-white/90 capitalize">
                            {genre.name}
                          </span>
                          <span className="text-(--color-text-muted)">
                            {genre.count}x ({genre.percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            className="h-full bg-gradient-to-r from-(--color-accent-500) to-(--color-accent-400) rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${genre.percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Divider spacing="sm" />

              {/* Artist Roster Drilldown */}
              <div className="flex flex-col gap-3 flex-1 min-h-0">
                <Text variant="label" className="font-semibold text-white/95">
                  Top Regional Musicians ({province.artists.length})
                </Text>

                <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                  {province.artists.map((art) => (
                    <button
                      key={art.name}
                      onClick={() => onArtistSelect(art)}
                      className="flex items-center justify-between p-3 rounded-lg bg-(--color-bg-surface)/20 border border-(--color-border-default) hover:border-(--color-accent-500)/30 hover:bg-(--color-accent-500)/5 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            art.profilePicture ||
                            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&q=80"
                          }
                          alt={art.name}
                          className="size-10 rounded-full border border-white/10 object-cover group-hover:border-(--color-accent-500)/40 transition-colors"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-white group-hover:text-(--color-accent-400) transition-colors truncate">
                            {art.name}
                          </span>
                          <span className="text-xs text-(--color-text-muted) truncate">
                            {art.originCity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          color="accent"
                          className="font-medium text-[10px]"
                        >
                          Pop {art.popularity}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
