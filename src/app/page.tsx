"use client";

import { useState } from "react";
import {
  Sidebar,
  KpiBar,
  ArtistDrawer,
  MapPlaceholder,
} from "@/components/organisms";
import type { ArtistData } from "@/components/organisms";

/**
 * Home — Map-First App Shell
 *
 * The primary dashboard view per DESIGN_GUIDELINES.md §4.1:
 * Fixed sidebar (240px) | Map canvas (flex-1) with KPI overlay + drawer.
 */

export default function Home() {
  const [activeView, setActiveView] = useState<"map" | "genres" | "comparative" | "about">("map");
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-(--color-bg-canvas)">
      {/* Fixed sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main content — offset by sidebar width */}
      <main className="ml-[240px] flex flex-col flex-1 relative">
        {/* KPI overlay bar */}
        <KpiBar
          totalArtists={312}
          avgPopularity={64.8}
          provincesCovered={28}
          topGenre="Indo Pop"
        />

        {/* Map canvas area */}
        <div className="flex-1 px-4 pb-4">
          <MapPlaceholder onArtistClick={setSelectedArtist} />
        </div>
      </main>

      {/* Slide-over drawer */}
      <ArtistDrawer
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />
    </div>
  );
}
