"use client";

import { motion, AnimatePresence } from "framer-motion";
import { slideInRight } from "@/lib/motion";
import { X } from "@phosphor-icons/react";
import { Text, Badge, Divider, AnimatedCounter } from "@/components/atoms";
import { ProvinceRankChart } from "@/components/molecules";

export interface ArtistData {
  name: string;
  profilePicture: string;
  originCity: string;
  province: string;
  popularity: number;
  followers: number;
  genres: string[];
}

interface DrawerProps {
  /** Controlling visibility */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Title text/node */
  title?: React.ReactNode;
  /** Subtitle text/node */
  subtitle?: React.ReactNode;
  /** Optional badge */
  badge?: React.ReactNode;
  /** Custom children content */
  children: React.ReactNode;
  /** Width style (defaults to w-[480px]) */
  width?: string;
  /** Optional overlay blur (defaults to true) */
  blurBackdrop?: boolean;
}

/**
 * Drawer — Reusable slide-over detail panel organism
 *
 * A highly configurable drawer that slides in from the right.
 * Satisfies DESIGN_GUIDELINES.md §4.3 and §7.1.
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  width = "w-[480px]",
  blurBackdrop = false,
}: DrawerProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={[
              "fixed inset-0 z-40 bg-black/40",
              blurBackdrop ? "backdrop-blur-[2px]" : "",
            ].join(" ")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            className={[
              "fixed right-0 top-0 z-50 h-full max-w-full bg-(--color-bg-drawer) border-l border-(--color-border-default) flex flex-col overflow-hidden",
              width,
            ].join(" ")}
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-(--color-border-default) bg-(--color-bg-surface)/10">
              <div className="flex flex-col gap-1 min-w-0">
                {badge && <div className="self-start">{badge}</div>}
                {title && (
                  <Text
                    as="h2"
                    variant="title"
                    color="primary"
                    className="truncate text-xl lg:text-2xl font-bold uppercase tracking-tight mt-1"
                  >
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text variant="label" color="secondary">
                    {subtitle}
                  </Text>
                )}
              </div>
              <motion.button
                onClick={onClose}
                className="flex items-center justify-center size-8 rounded-lg text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-surface) transition-colors cursor-pointer shrink-0 ml-4"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} weight="regular" />
              </motion.button>
            </div>

            {/* Scrollable Content wrapper */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
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

/**
 * ArtistDrawer — Specialized detail drawer for artists (backward compatible)
 */
export function ArtistDrawer({ artist, onClose }: ArtistDrawerProps) {
  return (
    <Drawer
      isOpen={!!artist}
      onClose={onClose}
      width="w-[480px]"
      title={artist?.name}
      subtitle={artist && `${artist.originCity}, ${artist.province}`}
    >
      {artist && (
        <div className="flex flex-col gap-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Text variant="caption" color="secondary">
                Popularity
              </Text>
              <AnimatedCounter
                value={artist.popularity}
                className="text-title text-(--color-accent-500) font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Text variant="caption" color="secondary">
                Followers
              </Text>
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
            <Text variant="caption" color="secondary">
              Genres
            </Text>
            <div className="flex flex-wrap gap-1.5">
              {artist.genres.map((genre) => (
                <Badge key={genre} color="accent">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <Divider spacing="sm" />

          {/* Province context */}
          <div className="flex flex-col gap-2">
            <Text variant="caption" color="secondary">
              Province Rank (by Artist Count)
            </Text>
            <ProvinceRankChart activeProvince={artist.province} />
          </div>
        </div>
      )}
    </Drawer>
  );
}
