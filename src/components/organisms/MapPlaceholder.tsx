"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Spinner } from "@phosphor-icons/react";
import type { ArtistData } from "@/components/organisms/ArtistDrawer";
import type { CityAggregate } from "./InteractiveMap";

/**
 * MapPlaceholder (Now Interactive Map Wrapper)
 *
 * Dynamically imports the React-Leaflet InteractiveMap with SSR disabled.
 * Renders a glassmorphic skeleton loader while the heavy map payload hydrates.
 */

// Dynamically import InteractiveMap without SSR to prevent 'window is not defined'
const InteractiveMap = dynamic(
  () => import("@/components/organisms/InteractiveMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <Spinner size={32} className="animate-spin text-(--color-accent-500)" />
        <span className="text-sm font-medium text-(--color-text-muted) tracking-widest uppercase">
          Initializing Mapping Engine...
        </span>
      </div>
    )
  }
);

interface MapWrapperProps {
  onArtistClick: (artist: ArtistData) => void;
  onCityClick?: (city: CityAggregate) => void;
}

export function MapPlaceholder({ onArtistClick, onCityClick }: MapWrapperProps) {
  return (
    <motion.div
      className="relative w-full h-full overflow-hidden rounded-lg bg-(--color-bg-surface)/20 border border-(--color-border-default)"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      {/* Grid background base */}
      <div
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      
      {/* Live React Leaflet Map */}
      <InteractiveMap onArtistClick={onArtistClick} onCityClick={onCityClick} />
    </motion.div>
  );
}
