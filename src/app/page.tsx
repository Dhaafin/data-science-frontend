"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fade } from "@/lib/motion";
import {
  Sidebar,
  KpiBar,
  ArtistDrawer,
  MapPlaceholder,
  GenreDeepDive,
  ComparativeView,
  AboutView,
} from "@/components/organisms";
import type { ArtistData } from "@/components/organisms";

/**
 * Home — Map-First App Shell
 *
 * Routes between four views via the sidebar navigation.
 * DESIGN_GUIDELINES.md §4.1 — fixed 240px sidebar, map-canvas flex-1.
 */

type ActiveView = "map" | "genres" | "comparative" | "about";

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>("map");
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-(--color-bg-canvas)">
      {/* Fixed sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main content — offset by sidebar width */}
      <main className="ml-[240px] flex flex-col flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === "map" && (
            <motion.div
              key="map"
              className="flex flex-col flex-1 h-full"
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* KPI overlay bar */}
              <KpiBar
                totalArtists={312}
                avgPopularity={64.8}
                provincesCovered={28}
                topGenre="Indo Pop"
              />

              {/* Map canvas area */}
              <div className="flex-1 px-4 pb-4 min-h-0">
                <MapPlaceholder onArtistClick={setSelectedArtist} />
              </div>
            </motion.div>
          )}

          {activeView === "genres" && (
            <motion.div
              key="genres"
              className="flex-1 h-full overflow-hidden"
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <GenreDeepDive />
            </motion.div>
          )}

          {activeView === "comparative" && (
            <motion.div
              key="comparative"
              className="flex-1 h-full overflow-hidden"
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ComparativeView />
            </motion.div>
          )}

          {activeView === "about" && (
            <motion.div
              key="about"
              className="flex-1 h-full overflow-hidden"
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <AboutView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Slide-over drawer — available on all views */}
      <ArtistDrawer
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />
    </div>
  );
}
