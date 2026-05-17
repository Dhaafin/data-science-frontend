"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import {
  GlobeHemisphereWest,
  GithubLogo,
  SpotifyLogo,
  Database,
  Heart,
} from "@phosphor-icons/react";
import { Text, Badge, Divider } from "@/components/atoms";

/**
 * Footer — Premium glassmorphic bottom navigation & brand lockup
 *
 * DESIGN_GUIDELINES.md §2.2 — glass-card bottom border composition.
 */
export function Footer() {
  return (
    <motion.footer
      className="w-full mt-16 border-t border-(--color-border-default) bg-(--color-bg-sidebar)/60 backdrop-blur-md"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-(--color-accent-500)/15">
                <GlobeHemisphereWest
                  size={20}
                  weight="bold"
                  className="text-(--color-accent-500) animate-pulse"
                />
              </div>
              <div className="flex flex-col leading-none">
                <Text
                  as="span"
                  variant="label"
                  color="primary"
                  className="font-semibold tracking-tight"
                >
                  Selasar Suara
                </Text>
                <Text as="span" variant="caption" color="muted">
                  Analisis Spasial Musik
                </Text>
              </div>
            </div>
            <Text
              variant="caption"
              color="secondary"
              className="leading-relaxed"
            >
              Platform analisis spasial interaktif untuk memetakan konsentrasi
              talenta, popularitas, dan persebaran genre musisi di seluruh
              Indonesia.
            </Text>
          </div>

          {/* Tech Stack Column */}
          <div className="flex flex-col gap-3">
            <Text variant="label" className="font-semibold text-white/95">
              Teknologi
            </Text>
            <div className="flex flex-wrap gap-1.5">
              <Badge color="accent">Next.js 16</Badge>
              <Badge color="accent">Tailwind v4</Badge>
              <Badge color="info">Supabase</Badge>
              <Badge color="info">PostgreSQL</Badge>
              <Badge color="warning">Leaflet</Badge>
              <Badge color="success">Framer Motion</Badge>
            </div>
          </div>

          {/* Links Column */}
          <div className="flex flex-col gap-3">
            <Text variant="label" className="font-semibold text-white/95">
              Tautan Data
            </Text>
            <div className="flex flex-col gap-2">
              <a
                href="https://spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-(--color-text-secondary) hover:text-(--color-accent-400) transition-colors cursor-pointer group"
              >
                <SpotifyLogo size={16} className="text-emerald-500 shrink-0" />
                <span>Spotify API (Spotipy)</span>
              </a>
              <a
                href="https://musicbrainz.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-(--color-text-secondary) hover:text-(--color-accent-400) transition-colors cursor-pointer group"
              >
                <Database size={16} className="text-sky-500 shrink-0" />
                <span>MusicBrainz Database</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-(--color-text-secondary) hover:text-(--color-accent-400) transition-colors cursor-pointer group"
              >
                <GithubLogo size={16} className="text-white shrink-0" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>

        <Divider spacing="sm" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Text variant="caption" color="muted">
            &copy; {new Date().getFullYear()} Selasar Suara. Hak Cipta
            Dilindungi.
          </Text>
          <div className="flex items-center gap-1.5">
            <Text variant="caption" color="muted">
              Maju terus musik Indonesia
            </Text>
            <Heart
              size={12}
              weight="fill"
              className="text-red-500 animate-pulse"
            />
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
