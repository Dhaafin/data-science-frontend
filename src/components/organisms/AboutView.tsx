"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  Info,
  Database,
  GlobeHemisphereWest,
  Broadcast,
  Code,
} from "@phosphor-icons/react";
import { Text, GlassCard, Badge, Divider } from "@/components/atoms";

/**
 * AboutView — Project context and methodology organism
 *
 * Explains the research context, data sources, stack, and limitations.
 * Serves the "About" nav item.
 */

interface StackItem {
  label: string;
  value: string;
  color: "accent" | "success" | "warning" | "error" | "info";
}

const STACK: StackItem[] = [
  { label: "Frontend", value: "Next.js 16 + TypeScript", color: "accent" },
  { label: "Styling", value: "Tailwind CSS v4", color: "accent" },
  { label: "Animation", value: "Framer Motion", color: "accent" },
  { label: "Database", value: "Supabase (PostgreSQL)", color: "info" },
  { label: "Data Source", value: "Spotify API via Spotipy", color: "info" },
  { label: "Geocoding", value: "MusicBrainz + OSM Nominatim", color: "info" },
];

interface StatItem {
  label: string;
  value: string;
}

const PROJECT_STATS: StatItem[] = [
  { label: "Artists scraped", value: "312+" },
  { label: "Provinces covered", value: "28 / 38" },
  { label: "Genres identified", value: "40+" },
  { label: "Data vintage", value: "2024–2025" },
];

export function AboutView() {
  return (
    <motion.div
      className="flex flex-col gap-6 p-6 h-full overflow-y-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Page header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Info size={20} weight="bold" className="text-(--color-accent-500)" />
          <Text as="h1" variant="title" color="primary">
            About this Platform
          </Text>
        </div>
        <Text variant="body" color="secondary">
          Konteks penelitian, metodologi, dan stack teknologi.
        </Text>
      </motion.div>

      <Divider spacing="sm" />

      {/* Research context */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="accent" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <GlobeHemisphereWest
              size={18}
              weight="bold"
              className="text-(--color-accent-500)"
            />
            <Text variant="heading" color="primary">
              Konteks Penelitian
            </Text>
          </div>
          <Text variant="body" color="secondary" className="leading-relaxed">
            Platform ini menganalisis ketimpangan digital pada industri musik
            Indonesia di era streaming. Data dikumpulkan dari Spotify melalui
            API scraping, diperkaya dengan informasi asal daerah dari
            MusicBrainz, dan divisualisasikan secara spasial untuk mengungkap
            pola konsentrasi artis berbasis provinsi.
          </Text>
          <Text variant="body" color="secondary" className="leading-relaxed">
            Hipotesis utama: apakah Jakarta mendominasi secara tidak
            proporsional dalam ekosistem musik digital Indonesia, dan apa
            implikasinya bagi kebijakan pengembangan industri kreatif daerah?
          </Text>
        </GlassCard>
      </motion.div>

      {/* Project stats */}
      <motion.div
        className="grid grid-cols-2 xl:grid-cols-4 gap-4"
        variants={staggerContainer}
      >
        {PROJECT_STATS.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <GlassCard className="flex flex-col gap-1.5 p-4 text-center">
              <Text as="span" variant="hero" color="accent">
                {stat.value}
              </Text>
              <Text variant="caption" color="secondary">
                {stat.label}
              </Text>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Data pipeline */}
      <motion.div variants={fadeUp}>
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Database
              size={18}
              weight="bold"
              className="text-(--color-accent-500)"
            />
            <Text variant="heading" color="primary">
              Pipeline Data
            </Text>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                step: "01",
                title: "Scraping",
                desc: "Spotify API (Spotipy) → artist metadata, popularity, followers, genres",
              },
              {
                step: "02",
                title: "Geo-Enrichment",
                desc: "MusicBrainz lookup → hometown strings → province classification",
              },
              {
                step: "03",
                title: "Geocoding",
                desc: "OSM Nominatim → lat/lng coordinates per city of origin",
              },
              {
                step: "04",
                title: "Storage",
                desc: "Supabase PostgreSQL → master artists table with spatial columns",
              },
              {
                step: "05",
                title: "Visualization",
                desc: "Next.js frontend → spatial map, charts, KPI dashboard",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="flex items-start gap-3 group"
              >
                {/* Step number */}
                <div className="flex items-center justify-center size-7 rounded-full bg-(--color-accent-500)/10 border border-(--color-border-accent) shrink-0 mt-0.5">
                  <Text as="span" variant="caption" color="accent" className="font-bold">
                    {item.step}
                  </Text>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-0.5 flex-1">
                  <Text variant="label" color="primary">
                    {item.title}
                  </Text>
                  <Text variant="caption" color="muted">
                    {item.desc}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Tech stack */}
      <motion.div variants={fadeUp}>
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Code
              size={18}
              weight="bold"
              className="text-(--color-accent-500)"
            />
            <Text variant="heading" color="primary">
              Tech Stack
            </Text>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            {STACK.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-(--color-bg-surface)/40 hover:bg-(--color-bg-surface)/70 transition-colors"
              >
                <Text variant="label" color="secondary">
                  {item.label}
                </Text>
                <Badge color={item.color}>{item.value}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Caveats */}
      <motion.div variants={fadeUp}>
        <GlassCard className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Broadcast
              size={18}
              weight="bold"
              className="text-(--color-warning)"
            />
            <Text variant="heading" color="primary">
              Keterbatasan Data
            </Text>
          </div>
          <ul className="flex flex-col gap-2">
            {[
              "Dataset mencakup artis yang aktif di Spotify — artis lokal tanpa kehadiran digital tidak terwakili.",
              "Asal daerah diambil dari MusicBrainz dan bisa tidak akurat untuk artis yang kurang terkenal.",
              "Popularitas Spotify bersifat relatif dan dapat berubah sewaktu-waktu.",
              "Data mencerminkan snapshot 2024–2025, bukan kondisi real-time.",
            ].map((caveat, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="size-1.5 rounded-full bg-(--color-warning)/60 mt-1.5 shrink-0" />
                <Text variant="caption" color="secondary" className="leading-relaxed">
                  {caveat}
                </Text>
              </li>
            ))}
          </ul>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
