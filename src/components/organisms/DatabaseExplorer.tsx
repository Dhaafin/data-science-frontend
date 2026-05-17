"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { MagnifyingGlass, Funnel, UserCircle, CircleNotch } from "@phosphor-icons/react";
import { Text, GlassCard, Badge } from "@/components/atoms";
import { Pagination } from "@/components/molecules";
import { musicService } from "@/lib/api/musicService";
import type { ArtistData } from "./ArtistDrawer";

/**
 * DatabaseExplorer — Interactive lookup engine organism
 *
 * Provides a text search and quick-filter interface for the artist database.
 * Connected to the global ArtistDrawer.
 * Fetches live data via Supabase PostgREST API with pagination.
 */

const QUICK_FILTERS = ["Semua", "DKI Jakarta", "Jawa Barat", "Jawa Timur", "Pop", "Indie", "Dangdut"];

interface DatabaseExplorerProps {
  onArtistSelect: (artist: ArtistData) => void;
}

export function DatabaseExplorer({ onArtistSelect }: DatabaseExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [artists, setArtists] = useState<ArtistData[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await musicService.getArtists(searchQuery, activeFilter, currentPage, PAGE_SIZE);
      setArtists(res.data);
      setTotalCount(res.count);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeFilter, currentPage]);

  useEffect(() => {
    // 300ms debounce
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  return (
    <motion.div
      className="flex flex-col gap-6 w-full"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ── Section Header ── */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MagnifyingGlass size={20} weight="bold" className="text-(--color-accent-500)" />
          <Text as="h2" variant="title" color="primary">
            Database Explorer
          </Text>
        </div>
        <Text variant="body" color="secondary">
          Cari dan eksplorasi data musisi berdasarkan nama, daerah asal, atau genre.
        </Text>
      </motion.div>

      {/* ── Search & Filter Controls ── */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlass size={18} className="text-(--color-text-secondary)" />
          </div>
          <input
            type="text"
            className="w-full bg-(--color-bg-surface)/50 border border-(--color-border-default) rounded-lg pl-10 pr-4 py-3 text-(--color-text-primary) placeholder-(--color-text-muted) focus:outline-none focus:border-(--color-accent-500) transition-colors"
            placeholder="Cari artis, kota asal (daerah), atau provinsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Funnel size={16} className="text-(--color-text-secondary) mr-1" />
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={[
                "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border",
                activeFilter === filter
                  ? "bg-(--color-accent-500)/20 text-(--color-accent-400) border-(--color-accent-500)/50"
                  : "bg-(--color-bg-surface)/50 text-(--color-text-secondary) border-transparent hover:bg-(--color-bg-surface) hover:text-(--color-text-primary)",
              ].join(" ")}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Results Summary ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <Text variant="caption" color="muted">
          Showing {artists.length} of {totalCount} artis
        </Text>
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <CircleNotch size={14} className="animate-spin text-(--color-accent-500)" />
              <Text variant="caption" color="secondary">Loading data...</Text>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Results Table ── */}
      <motion.div variants={fadeUp}>
        <GlassCard className="overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-(--color-border-default) bg-(--color-bg-surface)/30">
            <div className="col-span-4 lg:col-span-3">
              <Text variant="caption" color="secondary" className="uppercase tracking-wider">Artist Name</Text>
            </div>
            <div className="col-span-4 lg:col-span-3 hidden sm:block">
              <Text variant="caption" color="secondary" className="uppercase tracking-wider">Daerah (Origin)</Text>
            </div>
            <div className="col-span-3 lg:col-span-4 hidden md:block">
              <Text variant="caption" color="secondary" className="uppercase tracking-wider">Top Genre</Text>
            </div>
            <div className="col-span-4 sm:col-span-4 md:col-span-2 lg:col-span-2 text-right">
              <Text variant="caption" color="secondary" className="uppercase tracking-wider">Popularity</Text>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col min-h-[300px]">
            {isLoading && artists.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-12 gap-3 opacity-50">
                <CircleNotch size={32} className="animate-spin text-(--color-text-muted)" />
              </div>
            ) : artists.length > 0 ? (
              artists.map((artist, i) => (
                <button
                  key={artist.name + i}
                  onClick={() => onArtistSelect(artist)}
                  className={[
                    "grid grid-cols-12 gap-4 px-4 py-3 border-b border-(--color-border-default) last:border-b-0 cursor-pointer text-left items-center",
                    i % 2 === 0 ? "bg-transparent" : "bg-(--color-bg-surface)/20",
                    "hover:bg-(--color-bg-surface)/60 transition-colors group",
                  ].join(" ")}
                >
                  {/* Name Column */}
                  <div className="col-span-8 sm:col-span-4 lg:col-span-3 flex items-center gap-3">
                    <div className="size-8 rounded-full bg-(--color-bg-surface) border border-(--color-border-default) flex items-center justify-center shrink-0 group-hover:border-(--color-accent-500)/50 transition-colors">
                      <UserCircle size={20} className="text-(--color-text-secondary)" />
                    </div>
                    <Text variant="label" color="primary" className="truncate font-semibold group-hover:text-(--color-accent-400) transition-colors">
                      {artist.name}
                    </Text>
                  </div>

                  {/* Origin Column */}
                  <div className="col-span-4 lg:col-span-3 hidden sm:flex flex-col min-w-0">
                    <Text variant="label" color="secondary" className="truncate">
                      {artist.originCity}
                    </Text>
                    <Text variant="caption" color="muted" className="truncate">
                      {artist.province}
                    </Text>
                  </div>

                  {/* Genre Column */}
                  <div className="col-span-3 lg:col-span-4 hidden md:flex items-center gap-1.5 flex-wrap">
                    {artist.genres.slice(0, 2).map((genre) => (
                      <Badge key={genre} color="info">{genre}</Badge>
                    ))}
                    {artist.genres.length > 2 && (
                      <Text variant="caption" color="muted">+{artist.genres.length - 2}</Text>
                    )}
                  </div>

                  {/* Popularity Column */}
                  <div className="col-span-4 sm:col-span-4 md:col-span-2 lg:col-span-2 flex flex-col items-end gap-1">
                    <Text variant="label" color="accent">
                      {artist.popularity}
                    </Text>
                    {/* Visual bar representation of popularity */}
                    <div className="w-full h-1 bg-(--color-bg-surface) rounded-full overflow-hidden max-w-[60px]">
                      <div
                        className="h-full bg-(--color-accent-500)"
                        style={{ width: `${artist.popularity}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 py-16">
                <MagnifyingGlass size={32} className="text-(--color-text-muted)" />
                <Text variant="label" color="secondary">Tidak ada hasil ditemukan untuk "{searchQuery}"</Text>
                <Text variant="caption" color="muted">Coba gunakan kata kunci lain atau hapus filter aktif.</Text>
              </div>
            )}
          </div>

          <div className="px-4 pb-4">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
