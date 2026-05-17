"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { ChartBar, MapPin, TrendUp } from "@phosphor-icons/react";
import { Text, GlassCard, Badge, Divider } from "@/components/atoms";

/**
 * ComparativeView — Province comparison view organism
 *
 * Side-by-side comparison of artist density and average popularity
 * across Indonesian provinces, rendered as animated horizontal bars.
 * DESIGN_GUIDELINES.md §9 — chart color order applied.
 */

interface ProvinceEntry {
  province: string;
  region: string;
  artistCount: number;
  avgPopularity: number;
  topGenre: string;
}

/** Mock data — replace with Supabase query in future milestone */
const PROVINCE_DATA: ProvinceEntry[] = [
  {
    province: "DKI Jakarta",
    region: "Jawa",
    artistCount: 138,
    avgPopularity: 71,
    topGenre: "Indo Pop",
  },
  {
    province: "Jawa Barat",
    region: "Jawa",
    artistCount: 64,
    avgPopularity: 64,
    topGenre: "Indie Pop",
  },
  {
    province: "Jawa Timur",
    region: "Jawa",
    artistCount: 47,
    avgPopularity: 60,
    topGenre: "Dangdut",
  },
  {
    province: "Sumatera Utara",
    region: "Sumatera",
    artistCount: 23,
    avgPopularity: 52,
    topGenre: "R&B",
  },
  {
    province: "Sulawesi Selatan",
    region: "Sulawesi",
    artistCount: 19,
    avgPopularity: 57,
    topGenre: "Indie Pop",
  },
  {
    province: "Bali",
    region: "Nusa Tenggara",
    artistCount: 15,
    avgPopularity: 50,
    topGenre: "Folk",
  },
  {
    province: "Sumatera Selatan",
    region: "Sumatera",
    artistCount: 12,
    avgPopularity: 48,
    topGenre: "Indo Pop",
  },
  {
    province: "Kalimantan Timur",
    region: "Kalimantan",
    artistCount: 9,
    avgPopularity: 45,
    topGenre: "R&B",
  },
  {
    province: "Maluku",
    region: "Maluku",
    artistCount: 7,
    avgPopularity: 44,
    topGenre: "Soul",
  },
  {
    province: "Papua",
    region: "Papua",
    artistCount: 5,
    avgPopularity: 38,
    topGenre: "Folk",
  },
];

const REGION_COLORS: Record<string, string> = {
  Jawa: "var(--color-data-1)",
  Sumatera: "var(--color-data-2)",
  Sulawesi: "var(--color-data-3)",
  "Nusa Tenggara": "var(--color-data-4)",
  Kalimantan: "var(--color-data-5)",
  Maluku: "var(--color-data-2)",
  Papua: "var(--color-data-4)",
};

export function ComparativeView() {
  const maxArtists = Math.max(...PROVINCE_DATA.map((p) => p.artistCount));
  const maxPop = Math.max(...PROVINCE_DATA.map((p) => p.avgPopularity));

  const topProvince = PROVINCE_DATA[0];
  const jakartaShare = Math.round(
    (topProvince.artistCount /
      PROVINCE_DATA.reduce((s, p) => s + p.artistCount, 0)) *
      100,
  );

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 h-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Page header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ChartBar
            size={20}
            weight="bold"
            className="text-(--color-accent-500)"
          />
          <Text as="h1" variant="title" color="primary">
            Comparative Analysis
          </Text>
        </div>
        <Text variant="body" color="secondary">
          Perbandingan distribusi artis dan popularitas antar provinsi.
        </Text>
      </motion.div>

      <Divider spacing="sm" />

      {/* Concentration insight card */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="accent" className="flex items-center gap-4 p-4">
          <div className="flex items-center justify-center size-12 rounded-lg bg-(--color-accent-500)/10 shrink-0">
            <TrendUp
              size={24}
              weight="bold"
              className="text-(--color-accent-500)"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <Text variant="label" color="secondary">
              Konsentrasi Jakarta
            </Text>
            <div className="flex items-baseline gap-2">
              <Text as="span" variant="hero" color="accent">
                {jakartaShare}%
              </Text>
              <Text as="span" variant="body" color="secondary">
                dari total artis berasal dari DKI Jakarta
              </Text>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Artist count chart */}
      <motion.div variants={fadeUp}>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin
              size={16}
              weight="bold"
              className="text-(--color-accent-500)"
            />
            <Text variant="label" color="secondary">
              Jumlah Artis per Provinsi
            </Text>
          </div>

          <div className="flex flex-col gap-3">
            {PROVINCE_DATA.map((item, i) => {
              const widthPct = (item.artistCount / maxArtists) * 100;
              const color = REGION_COLORS[item.region] ?? "var(--color-data-1)";
              return (
                <div key={item.province} className="flex items-center gap-3">
                  {/* Province label */}
                  <Text
                    as="span"
                    variant="caption"
                    color="secondary"
                    className="w-36 shrink-0 truncate"
                  >
                    {item.province}
                  </Text>

                  {/* Bar track */}
                  <div className="flex-1 h-2 rounded-full bg-(--color-bg-surface) overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{
                        duration: 0.7,
                        delay: 0.1 + i * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>

                  {/* Count */}
                  <Text
                    as="span"
                    variant="caption"
                    color="muted"
                    className="w-8 text-right shrink-0"
                  >
                    {item.artistCount}
                  </Text>
                </div>
              );
            })}
          </div>

          {/* Region legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-(--color-border-default)">
            {Object.entries(REGION_COLORS).map(([region, color]) => (
              <div key={region} className="flex items-center gap-1.5">
                <div
                  className="size-2 rounded-full"
                  style={{ background: color }}
                />
                <Text as="span" variant="caption" color="muted">
                  {region}
                </Text>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Popularity comparison table */}
      <motion.div variants={fadeUp}>
        <GlassCard className="overflow-hidden">
          <div className="px-4 py-3 border-b border-(--color-border-default)">
            <Text variant="label" color="secondary">
              Avg. Popularity &amp; Top Genre
            </Text>
          </div>
          {PROVINCE_DATA.map((item, i) => {
            const popPct = (item.avgPopularity / maxPop) * 100;
            const color = REGION_COLORS[item.region] ?? "var(--color-data-1)";
            return (
              <div
                key={item.province}
                className={`flex items-center gap-4 px-4 py-3 border-b border-(--color-border-default) last:border-b-0 ${
                  i % 2 === 0
                    ? "bg-(--color-bg-card)/60"
                    : "bg-(--color-bg-surface)/30"
                } hover:bg-(--color-bg-surface)/60 transition-colors`}
              >
                <Text
                  variant="label"
                  color="primary"
                  className="w-36 shrink-0 truncate"
                >
                  {item.province}
                </Text>

                {/* Popularity mini-bar */}
                <div className="flex-1 h-1.5 rounded-full bg-(--color-bg-surface) overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${popPct}%` }}
                    transition={{
                      duration: 0.7,
                      delay: 0.2 + i * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>

                <Text
                  as="span"
                  variant="label"
                  color="accent"
                  className="w-6 text-right shrink-0"
                >
                  {item.avgPopularity}
                </Text>

                <Badge color="accent" className="shrink-0">
                  {item.topGenre}
                </Badge>
              </div>
            );
          })}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
