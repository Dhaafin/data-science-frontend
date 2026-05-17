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
} from "@/components/organisms";
import type { ArtistData } from "@/components/organisms";

/**
 * Home — Selasar Suara unified vertical-scroll page
 *
 * Layout: Sticky Header → Immersive Map (80vh) → Analytical sections.
 * Replaces the old sidebar-driven conditional view architecture.
 * All navigation is handled via smooth-scroll anchors in Header.tsx.
 */

export default function HomeOrganism() {
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);

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
          <MapPlaceholder onArtistClick={setSelectedArtist} />
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
    </div>
  );
}
