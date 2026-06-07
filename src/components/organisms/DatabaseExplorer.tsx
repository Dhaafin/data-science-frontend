/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  MagnifyingGlass,
  Funnel,
  UserCircle,
  CircleNotch,
  X,
  User,
  Users,
} from "@phosphor-icons/react";
import { Text, GlassCard, Badge } from "@/components/atoms";
import { Pagination, Dropdown } from "@/components/molecules";
import { musicService } from "@/lib/api/musicService";
import type { ArtistData } from "./ArtistDrawer";

/**
 * DatabaseExplorer — Interactive lookup engine organism
 *
 * Provides a text search and quick-filter interface for the artist database.
 * Connected to the global ArtistDrawer.
 * Fetches live data via Supabase PostgREST API with pagination.
 */

const TOP_FILTERS = ["Semua", "Pop", "Indie", "DKI Jakarta"];

const ALL_GENRES = [
  "Pop",
  "Indie",
  "Dangdut",
  "Rock",
  "Jazz",
  "R&B",
  "Hip Hop",
  "Folk",
  "Electronic",
  "Acoustic",
  "Alternative",
  "Metal",
  "Reggae",
];

const ALL_REGIONS = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "DI Yogyakarta",
  "Banten",
  "Sumatera Utara",
  "Sumatera Barat",
  "Bali",
  "Sulawesi Selatan",
];

const FORMAT_OPTIONS = [
  { label: "Semua Format", value: "Semua" },
  {
    label: "Soloist (Lahir)",
    value: "Soloist",
    icon: <User size={14} weight="bold" className="text-indigo-400" />,
  },
  {
    label: "Band (Dibentuk)",
    value: "Band",
    icon: <Users size={14} weight="bold" className="text-teal-400" />,
  },
];

interface DatabaseExplorerProps {
  onArtistSelect: (artist: ArtistData) => void;
}

export function DatabaseExplorer({ onArtistSelect }: DatabaseExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [formatFilter, setFormatFilter] = useState("Semua");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [artists, setArtists] = useState<ArtistData[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // If the active filter is not in TOP_FILTERS, we append it to the visible pills
  const visibleFilters = TOP_FILTERS.includes(activeFilter)
    ? TOP_FILTERS
    : [...TOP_FILTERS, activeFilter];

  // 1. Debounce the text search query (delays network request by 300ms while typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Reset to page 1 on active filter, text query, or format filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, activeFilter, formatFilter]);

  // 3. Data fetching callback targeting the debounced value
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await musicService.getArtists(
        debouncedSearchQuery,
        activeFilter,
        currentPage,
        PAGE_SIZE,
        formatFilter,
      );
      setArtists(res.data);
      setTotalCount(res.count);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, activeFilter, currentPage, formatFilter]);

  // 4. Instantly trigger fetch on parameter updates
  useEffect(() => {
    fetchData();
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
          <MagnifyingGlass
            size={20}
            weight="bold"
            className="text-(--color-accent-500)"
          />
          <Text as="h2" variant="title" color="primary">
            Database Explorer
          </Text>
        </div>
        <Text variant="body" color="secondary">
          Cari dan eksplorasi data musisi berdasarkan nama, daerah asal, atau
          genre.
        </Text>
      </motion.div>

      {/* ── Search & Filter Controls ── */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4">
        {/* Search Bar & Format Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-3xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass
                size={18}
                className="text-(--color-text-secondary)"
              />
            </div>
            <input
              type="text"
              className="w-full bg-(--color-bg-surface)/50 border border-(--color-border-default) rounded-lg pl-10 pr-4 py-3 text-(--color-text-primary) placeholder-(--color-text-muted) focus:outline-none focus:border-(--color-accent-500) transition-colors"
              placeholder="Cari artis, kota asal (daerah), atau provinsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dropdown
            options={FORMAT_OPTIONS}
            value={formatFilter}
            onChange={setFormatFilter}
            className="w-full sm:w-48 shrink-0"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Funnel size={16} className="text-(--color-text-secondary) mr-1" />
          {visibleFilters.map((filter) => (
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
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border border-dashed border-(--color-border-default) text-(--color-text-secondary) hover:text-(--color-text-primary) hover:border-(--color-text-secondary)"
          >
            + More
          </button>
        </div>
      </motion.div>

      {/* ── Results Summary ── */}
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
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
              <CircleNotch
                size={14}
                className="animate-spin text-(--color-accent-500)"
              />
              <Text variant="caption" color="secondary">
                Loading data...
              </Text>
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
              <Text
                variant="caption"
                color="secondary"
                className="uppercase tracking-wider"
              >
                Artist Name
              </Text>
            </div>
            <div className="col-span-4 lg:col-span-3 hidden sm:block">
              <Text
                variant="caption"
                color="secondary"
                className="uppercase tracking-wider"
              >
                Daerah (Origin)
              </Text>
            </div>
            <div className="col-span-3 lg:col-span-4 hidden md:block">
              <Text
                variant="caption"
                color="secondary"
                className="uppercase tracking-wider"
              >
                Genre
              </Text>
            </div>
            <div className="col-span-4 sm:col-span-4 md:col-span-2 lg:col-span-2 text-right">
              <Text
                variant="caption"
                color="secondary"
                className="uppercase tracking-wider"
              >
                Popularity
              </Text>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col min-h-[300px]">
            {isLoading && artists.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-12 gap-3 opacity-50">
                <CircleNotch
                  size={32}
                  className="animate-spin text-(--color-text-muted)"
                />
              </div>
            ) : artists.length > 0 ? (
              artists.map((artist, i) => (
                <button
                  key={artist.name + i}
                  onClick={() => onArtistSelect(artist)}
                  className={[
                    "grid grid-cols-12 gap-4 px-4 py-3 border-b border-(--color-border-default) last:border-b-0 cursor-pointer text-left items-center",
                    i % 2 === 0
                      ? "bg-transparent"
                      : "bg-(--color-bg-surface)/20",
                    "hover:bg-(--color-bg-surface)/60 transition-colors group",
                  ].join(" ")}
                >
                  {/* Name Column */}
                  <div className="col-span-8 sm:col-span-4 lg:col-span-3 flex items-center gap-3">
                    <div className="size-8 rounded-full bg-(--color-bg-surface) border border-(--color-border-default) flex items-center justify-center shrink-0 overflow-hidden group-hover:border-(--color-accent-500)/50 transition-colors">
                      {artist.profilePicture ? (
                        <img
                          src={artist.profilePicture}
                          alt={artist.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <UserCircle
                          size={20}
                          className="text-(--color-text-secondary)"
                        />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Text
                          variant="label"
                          color="primary"
                          className="truncate font-semibold group-hover:text-(--color-accent-400) transition-colors"
                        >
                          {artist.name}
                        </Text>
                        {artist.artistType === "Group" ? (
                          <Users
                            size={12}
                            weight="fill"
                            className="text-teal-400 shrink-0 opacity-80"
                          />
                        ) : (
                          <User
                            size={12}
                            weight="fill"
                            className="text-indigo-400 shrink-0 opacity-80"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Origin Column */}
                  <div className="col-span-4 lg:col-span-3 hidden sm:flex flex-col min-w-0">
                    <Text
                      variant="label"
                      color="secondary"
                      className="truncate"
                    >
                      {artist.originCity}
                    </Text>
                    <Text variant="caption" color="muted" className="truncate">
                      {artist.province}
                    </Text>
                  </div>

                  {/* Genre Column */}
                  <div className="col-span-3 lg:col-span-4 hidden md:flex items-center gap-1.5 flex-wrap">
                    {artist.primaryGenre ? (
                      <Badge color="info">
                        {artist.primaryGenre}
                      </Badge>
                    ) : (
                      <Text variant="caption" color="muted">
                        —
                      </Text>
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
                <MagnifyingGlass
                  size={32}
                  className="text-(--color-text-muted)"
                />
                <Text variant="label" color="secondary">
                  Tidak ada hasil ditemukan untuk &quot;{searchQuery}&ldquo;
                </Text>
                <Text variant="caption" color="muted">
                  Coba gunakan kata kunci lain atau hapus filter aktif.
                </Text>
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

      {/* ── Filter Modal ── */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-(--color-bg-default) border border-(--color-border-default) rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-border-default) bg-(--color-bg-surface)/50">
                <Text
                  as="h3"
                  variant="label"
                  color="primary"
                  className="font-semibold text-lg"
                >
                  Explore Filters
                </Text>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-1 rounded-md text-(--color-text-secondary) hover:bg-(--color-bg-surface) hover:text-(--color-text-primary) transition-colors cursor-pointer"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex flex-col gap-8">
                {/* Genres Section */}
                <div className="flex flex-col gap-3">
                  <Text
                    variant="label"
                    color="secondary"
                    className="font-medium tracking-wide uppercase text-xs"
                  >
                    Explore Genres
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {ALL_GENRES.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => {
                          setActiveFilter(genre);
                          setIsFilterModalOpen(false);
                        }}
                        className={[
                          "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border",
                          activeFilter === genre
                            ? "bg-(--color-accent-500)/20 text-(--color-accent-400) border-(--color-accent-500)/50"
                            : "bg-(--color-bg-surface)/50 text-(--color-text-secondary) border-(--color-border-default) hover:bg-(--color-bg-surface) hover:text-(--color-text-primary)",
                        ].join(" ")}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Regions Section */}
                <div className="flex flex-col gap-3">
                  <Text
                    variant="label"
                    color="secondary"
                    className="font-medium tracking-wide uppercase text-xs"
                  >
                    Explore Regions
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {ALL_REGIONS.map((region) => (
                      <button
                        key={region}
                        onClick={() => {
                          setActiveFilter(region);
                          setIsFilterModalOpen(false);
                        }}
                        className={[
                          "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border",
                          activeFilter === region
                            ? "bg-(--color-accent-500)/20 text-(--color-accent-400) border-(--color-accent-500)/50"
                            : "bg-(--color-bg-surface)/50 text-(--color-text-secondary) border-(--color-border-default) hover:bg-(--color-bg-surface) hover:text-(--color-text-primary)",
                        ].join(" ")}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
