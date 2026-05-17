"use client";

import { useState } from "react";
import {
  Header,
  KpiBar,
  ArtistDrawer,
  MapPlaceholder,
  DatabaseExplorer,
  GenreDeepDive,
  ComparativeView,
  AboutView,
  Drawer,
} from "@/components/organisms";
import type { ArtistData } from "@/components/organisms";
import type { CityAggregate } from "@/components/organisms/InteractiveMap";
import { Text, Badge, Divider, AnimatedCounter } from "@/components/atoms";

/**
 * Home — Selasar Suara unified vertical-scroll page
 *
 * Layout: Sticky Header → Immersive Map (80vh) → Analytical sections.
 * Replaces the old sidebar-driven conditional view architecture.
 * All navigation is handled via smooth-scroll anchors in Header.tsx.
 */

export default function Home() {
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityAggregate | null>(null);

  const formatFollowers = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toFixed(0);
  };

  return (
    <div className="min-h-screen bg-(--color-bg-canvas) text-(--color-text-primary) flex flex-col relative">
      {/* Sticky top glassmorphic header */}
      <Header />

      {/* ═══════════════════════════════════════════════════════
          Section 1: Immersive Map Hero Workspace
          ═══════════════════════════════════════════════════════ */}
      <section
        id="map"
        className="max-w-5xl mx-auto w-full px-6 pt-20 pb-4 flex flex-col h-[80vh]"
      >
        {/* KPI overlay bar pinned to top of map area */}
        <KpiBar
          totalArtists={312}
          avgPopularity={64.8}
          provincesCovered={28}
          topGenre="Indo Pop"
        />

        {/* Map canvas — fills remaining height */}
        <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden border border-(--color-border-default)">
          <MapPlaceholder 
            onArtistClick={setSelectedArtist} 
            onCityClick={setSelectedCity} 
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Below-the-fold analytical sections
          Constrained to max-w-5xl for readability on wide screens
          ═══════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col gap-16 py-12">
        {/* Section 1.5: Database Explorer Directory */}
        <section id="explore" className="scroll-mt-20">
          <DatabaseExplorer onArtistSelect={setSelectedArtist} />
        </section>

        {/* Section 2: Genre Deep-Dive Hub */}
        <section id="genres" className="scroll-mt-20">
          <GenreDeepDive />
        </section>

        {/* Section 3: Regional Comparative Analytics */}
        <section id="comparative" className="scroll-mt-20">
          <ComparativeView />
        </section>

        {/* Section 4: Research Methodology & About */}
        <section id="about" className="scroll-mt-20">
          <AboutView />
        </section>
      </main>

      {/* Slide-over Drawer — globally available for artist details */}
      <ArtistDrawer
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />

      {/* Slide-over Drawer — globally available for city detail analysis */}
      <Drawer
        isOpen={!!selectedCity}
        onClose={() => setSelectedCity(null)}
        width="w-[480px]"
        blurBackdrop={true}
        badge={
          <Badge
            color="accent"
            className="uppercase tracking-wider text-[10px] font-bold"
          >
            Kota Analisis
          </Badge>
        }
        title={selectedCity?.city}
        subtitle="Rangkuman data spasial musisi di wilayah perkotaan"
      >
        {selectedCity && (
          <div className="flex flex-col gap-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 bg-(--color-bg-surface)/20 border border-(--color-border-default) rounded-xl p-4">
              <div className="flex flex-col gap-1">
                <Text variant="caption" color="secondary">Artis</Text>
                <AnimatedCounter
                  value={selectedCity.count}
                  className="text-lg font-bold text-white tracking-tight"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Text variant="caption" color="secondary">Avg Pop</Text>
                <AnimatedCounter
                  value={selectedCity.avgPopularity}
                  className="text-lg font-bold text-(--color-accent-500) tracking-tight"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Text variant="caption" color="secondary">Followers</Text>
                <AnimatedCounter
                  value={selectedCity.totalFollowers}
                  formatter={formatFollowers}
                  className="text-lg font-bold text-white tracking-tight"
                />
              </div>
            </div>

            <Divider spacing="sm" />

            {/* Roster list */}
            <div className="flex flex-col gap-3">
              <Text variant="label" className="font-semibold text-white/95">
                Musisi Terpopuler ({selectedCity.topArtists.length})
              </Text>
              
              <div className="flex flex-col gap-2">
                {selectedCity.topArtists.map((art) => (
                  <button
                    key={art.name}
                    onClick={() => {
                      setSelectedArtist(art);
                      setSelectedCity(null); 
                    }}
                    className="flex items-center justify-between p-3 rounded-lg bg-(--color-bg-surface)/20 border border-(--color-border-default) hover:border-(--color-accent-500)/30 hover:bg-(--color-accent-500)/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={art.profilePicture || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&q=80"}
                        alt={art.name}
                        className="size-10 rounded-full border border-white/10 object-cover group-hover:border-(--color-accent-500)/40 transition-colors"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white group-hover:text-(--color-accent-400) transition-colors truncate">
                          {art.name}
                        </span>
                        <span className="text-xs text-(--color-text-secondary) truncate">
                          {art.genres.slice(0, 2).join(", ")}
                        </span>
                      </div>
                    </div>
                    <Badge color="accent" className="font-medium text-[10px]">
                      Pop {art.popularity}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
