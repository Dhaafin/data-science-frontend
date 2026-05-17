"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { MagnifyingGlass, Funnel, UserCircle } from "@phosphor-icons/react";
import { Text, GlassCard, Badge } from "@/components/atoms";
import type { ArtistData } from "./ArtistDrawer";

/**
 * DatabaseExplorer — Interactive lookup engine organism
 *
 * Provides a text search and quick-filter interface for the artist database.
 * Connected to the global ArtistDrawer.
 * Mock data used until Supabase integration (M2).
 */

const MOCK_ARTISTS: ArtistData[] = [
  { name: "Hindia", originCity: "Jakarta Selatan", province: "DKI Jakarta", popularity: 82, followers: 1200000, genres: ["Indie Pop", "Indonesian Indie"] },
  { name: "Pamungkas", originCity: "Jakarta Timur", province: "DKI Jakarta", popularity: 78, followers: 2100000, genres: ["Indie Pop", "Singer-Songwriter"] },
  { name: "Yura Yunita", originCity: "Bandung", province: "Jawa Barat", popularity: 85, followers: 1800000, genres: ["Indo Pop", "Jazz"] },
  { name: "Tulus", originCity: "Bukittinggi", province: "Sumatera Barat", popularity: 88, followers: 3500000, genres: ["Indo Pop", "Pop"] },
  { name: "Denny Caknan", originCity: "Ngawi", province: "Jawa Timur", popularity: 80, followers: 4200000, genres: ["Dangdut Koplo", "Javanese Pop"] },
  { name: "Nadin Amizah", originCity: "Bandung", province: "Jawa Barat", popularity: 75, followers: 950000, genres: ["Indie Folk", "Pop"] },
  { name: "Sal Priadi", originCity: "Malang", province: "Jawa Timur", popularity: 70, followers: 500000, genres: ["Indie Pop", "Indonesian Indie"] },
  { name: "Kunto Aji", originCity: "Yogyakarta", province: "DI Yogyakarta", popularity: 72, followers: 800000, genres: ["Indo Pop", "Indie Pop"] },
];

const QUICK_FILTERS = ["Semua", "DKI Jakarta", "Jawa Barat", "Jawa Timur", "Pop", "Indie", "Dangdut"];

interface DatabaseExplorerProps {
  onArtistSelect: (artist: ArtistData) => void;
}

export function DatabaseExplorer({ onArtistSelect }: DatabaseExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");

  const filteredArtists = useMemo(() => {
    return MOCK_ARTISTS.filter((artist) => {
      // 1. Text Search (case-insensitive substring)
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        artist.name.toLowerCase().includes(q) ||
        artist.originCity.toLowerCase().includes(q) ||
        artist.province.toLowerCase().includes(q) ||
        artist.genres.some((g) => g.toLowerCase().includes(q));

      // 2. Quick Filter
      let matchesFilter = true;
      if (activeFilter !== "Semua") {
        matchesFilter =
          artist.province.includes(activeFilter) ||
          artist.genres.some((g) => g.includes(activeFilter));
      }

      return matchesSearch && matchesFilter;
    }).sort((a, b) => b.popularity - a.popularity); // Sort by popularity desc
  }, [searchQuery, activeFilter]);

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
      <motion.div variants={fadeUp}>
        <Text variant="caption" color="muted">
          Showing {filteredArtists.length} of {MOCK_ARTISTS.length} artis
        </Text>
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
          <div className="flex flex-col max-h-[400px] overflow-y-auto">
            {filteredArtists.length > 0 ? (
              filteredArtists.map((artist, i) => (
                <button
                  key={artist.name}
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
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <MagnifyingGlass size={32} className="text-(--color-text-muted)" />
                <Text variant="label" color="secondary">Tidak ada hasil ditemukan untuk "{searchQuery}"</Text>
                <Text variant="caption" color="muted">Coba gunakan kata kunci lain atau hapus filter aktif.</Text>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
