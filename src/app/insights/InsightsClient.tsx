"use client";

import { useState } from "react";
import {
  Header,
  PopularityFollowerShowcase,
  ArtistFormatShowcase,
  ComparativeView,
  ArtistDrawer,
  Footer,
} from "@/components/organisms";
import type { ArtistData } from "@/components/organisms";

export default function InsightsClient() {
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);

  return (
    <div className="min-h-screen bg-(--color-bg-canvas) text-(--color-text-primary) flex flex-col relative">
      {/* Sticky top glassmorphic header */}
      <Header />

      {/* Main analytical canvas */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col gap-16 pt-24 pb-12">
        {/* Section: Stickiness & Fans Loyalty Index (Placed at top) */}
        <section id="stickiness">
          <PopularityFollowerShowcase onArtistSelect={setSelectedArtist} />
        </section>

        <section id="artist-format">
          <ArtistFormatShowcase />
        </section>

        <section id="comparative">
          <ComparativeView />
        </section>
      </main>

      {/* Global Artist Detail Drawer */}
      <ArtistDrawer
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />

      <Footer />
    </div>
  );
}
