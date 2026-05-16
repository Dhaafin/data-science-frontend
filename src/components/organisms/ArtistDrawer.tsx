"use client";

import { motion, AnimatePresence } from "framer-motion";
import { slideInRight } from "@/lib/motion";
import { X } from "@phosphor-icons/react";
import { Text, Badge, Divider, AnimatedCounter } from "@/components/atoms";
import { ProvinceRankChart } from "@/components/molecules";

/**
 * ArtistDrawer — Slide-over detail panel organism
 *
 * Opens from the right when a map bubble or list item is clicked.
 * Shows full artist details: name, origin, stats, genre badges.
 * DESIGN_GUIDELINES.md §4.3.
 */

export interface ArtistData {
  name: string;
  originCity: string;
  province: string;
  popularity: number;
  followers: number;
  genres: string[];
}

interface ArtistDrawerProps {
  /** Artist data to display, null = closed */
  artist: ArtistData | null;
  /** Close handler */
  onClose: () => void;
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

export function ArtistDrawer({ artist, onClose }: ArtistDrawerProps) {
  return (
    <AnimatePresence mode="wait">
      {artist && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-[480px] max-w-full bg-(--color-bg-drawer) border-l border-(--color-border-default) flex flex-col overflow-y-auto"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-0">
              <div className="flex flex-col gap-1 min-w-0">
                <Text as="h2" variant="title" color="primary" className="truncate">
                  {artist.name}
                </Text>
                <Text variant="label" color="secondary">
                  {artist.originCity}, {artist.province}
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

            <div className="p-6 flex flex-col gap-5">
              <Divider spacing="sm" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Text variant="caption" color="secondary">Popularity</Text>
                  <AnimatedCounter
                    value={artist.popularity}
                    className="text-title text-(--color-accent-500) font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Text variant="caption" color="secondary">Followers</Text>
                  <AnimatedCounter
                    value={artist.followers}
                    formatter={formatFollowers}
                    className="text-title text-(--color-text-primary) font-semibold"
                  />
                </div>
              </div>

              <Divider spacing="sm" />

              {/* Genres */}
              <div className="flex flex-col gap-2">
                <Text variant="caption" color="secondary">Genres</Text>
                <div className="flex flex-wrap gap-1.5">
                  {artist.genres.map((genre) => (
                    <Badge key={genre} color="accent">{genre}</Badge>
                  ))}
                </div>
              </div>

              <Divider spacing="sm" />

              {/* Province context */}
              <div className="flex flex-col gap-2">
                <Text variant="caption" color="secondary">Province Rank (by Artist Count)</Text>
                <ProvinceRankChart activeProvince={artist.province} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
