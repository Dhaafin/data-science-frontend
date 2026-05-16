"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { MapPin } from "@phosphor-icons/react";
import { Text } from "@/components/atoms";
import type { ArtistData } from "@/components/organisms/ArtistDrawer";

/**
 * MapPlaceholder — Temporary map canvas
 *
 * Renders a styled placeholder with mock bubble dots representing
 * artist locations across Indonesia. Will be replaced with
 * Mapbox GL JS / React Map GL in the next milestone.
 */

const mockBubbles: { x: number; y: number; size: number; artist: ArtistData }[] = [
  { x: 28, y: 55, size: 28, artist: { name: "Tulus", originCity: "Bandung", province: "Jawa Barat", popularity: 78, followers: 4200000, genres: ["indonesian pop", "indo pop"] } },
  { x: 32, y: 48, size: 36, artist: { name: "Raisa", originCity: "Jakarta", province: "DKI Jakarta", popularity: 72, followers: 3800000, genres: ["indonesian pop", "indo pop"] } },
  { x: 35, y: 52, size: 20, artist: { name: "Hindia", originCity: "Jakarta", province: "DKI Jakarta", popularity: 58, followers: 1200000, genres: ["indie pop", "indonesian indie"] } },
  { x: 25, y: 50, size: 22, artist: { name: "Fourtwnty", originCity: "Bandung", province: "Jawa Barat", popularity: 62, followers: 2100000, genres: ["reggae", "indonesian indie"] } },
  { x: 55, y: 45, size: 18, artist: { name: "Weird Genius", originCity: "Surabaya", province: "Jawa Timur", popularity: 55, followers: 900000, genres: ["edm", "electronic"] } },
  { x: 18, y: 42, size: 16, artist: { name: "Vidi Aldiano", originCity: "Medan", province: "Sumatera Utara", popularity: 48, followers: 600000, genres: ["indonesian pop", "r&b"] } },
  { x: 65, y: 55, size: 24, artist: { name: "Nadin Amizah", originCity: "Makassar", province: "Sulawesi Selatan", popularity: 65, followers: 2500000, genres: ["indie pop", "folk"] } },
  { x: 75, y: 50, size: 14, artist: { name: "Glenn Fredly", originCity: "Ambon", province: "Maluku", popularity: 52, followers: 800000, genres: ["r&b", "soul", "jazz"] } },
  { x: 42, y: 60, size: 20, artist: { name: "Denny Caknan", originCity: "Nganjuk", province: "Jawa Timur", popularity: 68, followers: 3200000, genres: ["dangdut", "koplo"] } },
  { x: 10, y: 35, size: 15, artist: { name: "Kelvin Fordatkossu", originCity: "Padang", province: "Sumatera Barat", popularity: 42, followers: 350000, genres: ["pop", "acoustic"] } },
];

interface MapPlaceholderProps {
  onArtistClick: (artist: ArtistData) => void;
}

export function MapPlaceholder({ onArtistClick }: MapPlaceholderProps) {
  return (
    <motion.div
      className="relative flex-1 overflow-hidden rounded-lg"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Indonesia text label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <Text as="span" variant="hero" color="muted" className="opacity-20 text-[5rem] tracking-widest">
          INDONESIA
        </Text>
      </div>

      {/* Artist bubbles */}
      <motion.div
        className="absolute inset-0"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {mockBubbles.map((bubble, i) => (
          <motion.button
            key={i}
            className="absolute group cursor-pointer"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            variants={{
              hidden: { opacity: 0, scale: 0 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: i * 0.06,
                },
              },
            }}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onArtistClick(bubble.artist)}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-(--color-accent-500)/15"
              style={{
                width: bubble.size + 12,
                height: bubble.size + 12,
                left: -(12 / 2),
                top: -(12 / 2),
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
            {/* Bubble dot */}
            <div
              className="rounded-full bg-(--color-accent-500) shadow-[0_0_12px_var(--color-accent-glow)] group-hover:shadow-[0_0_24px_var(--color-accent-glow)]"
              style={{ width: bubble.size, height: bubble.size }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass-card px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap">
              <Text as="span" variant="caption" color="primary" className="font-medium">
                {bubble.artist.name}
              </Text>
              <Text as="span" variant="caption" color="accent" className="ml-1.5">
                {bubble.artist.popularity}
              </Text>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Bottom-right attribution */}
      <div className="absolute bottom-3 right-3">
        <div className="glass-card flex items-center gap-1.5 px-2.5 py-1.5">
          <MapPin size={12} weight="fill" className="text-(--color-accent-500)" />
          <Text as="span" variant="caption" color="muted">
            {mockBubbles.length} artists mapped
          </Text>
        </div>
      </div>
    </motion.div>
  );
}
