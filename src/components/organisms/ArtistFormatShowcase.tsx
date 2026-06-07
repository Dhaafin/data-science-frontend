"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  Microphone,
  Guitar,
  ChartPieSlice,
  MapPin,
  Users,
  User,
  TrendUp,
  Info,
  Warning,
  MusicNote,
  Disc,
} from "@phosphor-icons/react";
import { Text, GlassCard, Badge, Divider, AnimatedCounter, Skeleton } from "@/components/atoms";
import { Dropdown } from "@/components/molecules";
import { musicService, CollaborationEntry, GenreFormatEntry, SceneArchetype } from "@/lib/api/musicService";

// Region color mapping
const REGION_COLORS: Record<string, string> = {
  Jawa: "var(--color-data-1)",
  Sumatera: "var(--color-data-2)",
  Sulawesi: "var(--color-data-3)",
  "Nusa Tenggara": "var(--color-data-4)",
  Kalimantan: "var(--color-data-5)",
  Maluku: "var(--color-data-2)",
  Papua: "var(--color-data-4)",
};

const getRegionForProvince = (prov: string): string => {
  const p = prov.toLowerCase();
  if (
    p.includes("jakarta") ||
    p.includes("banten") ||
    p.includes("jawa") ||
    p.includes("yogyakarta")
  )
    return "Jawa";
  if (
    p.includes("sumatera") ||
    p.includes("aceh") ||
    p.includes("riau") ||
    p.includes("jambi") ||
    p.includes("bengkulu") ||
    p.includes("lampung") ||
    p.includes("bangka")
  )
    return "Sumatera";
  if (p.includes("sulawesi") || p.includes("gorontalo")) return "Sulawesi";
  if (
    p.includes("bali") ||
    p.includes("nusa tenggara") ||
    p.includes("ntt") ||
    p.includes("ntb")
  )
    return "Nusa Tenggara";
  if (p.includes("kalimantan")) return "Kalimantan";
  if (p.includes("maluku")) return "Maluku";
  if (p.includes("papua")) return "Papua";
  return "Lainnya";
};

export function ArtistFormatShowcase() {
  const [collaborationData, setCollaborationData] = useState<CollaborationEntry[]>([]);
  const [genreFormatMatrix, setGenreFormatMatrix] = useState<GenreFormatEntry[]>([]);
  const [streamingComparison, setStreamingComparison] = useState<{
    solo: { avgPopularity: number; avgFollowers: number; count: number };
    band: { avgPopularity: number; avgFollowers: number; count: number };
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState("Nasional");
  const [hoveredProvince, setHoveredProvince] = useState<{
    province: string;
    collaborationIndex: number;
    soloCount: number;
    bandCount: number;
  } | null>(null);

  // Load stats from musicService
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [collab, matrix, streaming] = await Promise.all([
          musicService.getCollaborationStats(),
          musicService.getGenreFormatMatrix(),
          musicService.getFormatStreamingComparison(),
        ]);
        if (mounted) {
          setCollaborationData(collab);
          setGenreFormatMatrix(matrix);
          setStreamingComparison(streaming);
        }
      } catch (err) {
        console.error("Failed to load format showcase data:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute province-level collaboration index aggregates
  const provinceMap = new Map<
    string,
    { province: string; region: string; soloCount: number; bandCount: number }
  >();

  collaborationData.forEach((c) => {
    const prov = c.province || "Unknown";
    if (prov === "Unknown") return;
    const current = provinceMap.get(prov) || {
      province: prov,
      region: getRegionForProvince(prov),
      soloCount: 0,
      bandCount: 0,
    };
    current.soloCount += c.soloCount;
    current.bandCount += c.bandCount;
    provinceMap.set(prov, current);
  });

  const provinceList = Array.from(provinceMap.values())
    .map((p) => {
      const total = p.soloCount + p.bandCount;
      const ci = total > 0 ? Math.round((p.bandCount / total) * 100) : 0;
      return {
        province: p.province,
        region: p.region,
        soloCount: p.soloCount,
        bandCount: p.bandCount,
        total,
        collaborationIndex: ci,
      };
    })
    .sort((a, b) => b.collaborationIndex - a.collaborationIndex);

  // Generate options for dropdown
  const provinceOptions = [
    { label: "Nasional", value: "Nasional" },
    ...provinceList.map((p) => ({ label: p.province, value: p.province })),
  ];

  // Helper to format large numbers
  const formatFollowers = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  // Compute KPI values
  const totalSoloists = streamingComparison?.solo.count || 0;
  const totalBands = streamingComparison?.band.count || 0;
  const nationalTotal = totalSoloists + totalBands;
  const nationalCI = nationalTotal > 0 ? Math.round((totalBands / nationalTotal) * 100) : 0;

  // Filter out cities with very low total count for statistical relevance
  const significantCollabCities = collaborationData.filter((c) => c.totalCount >= 3);
  const mostCollaborativeCity = significantCollabCities.length > 0
    ? significantCollabCities.reduce((max, city) =>
        city.collaborationIndex > max.collaborationIndex ? city : max,
        significantCollabCities[0]
      )
    : null;

  // Determine CI color based on value
  const getCiColorClass = (ci: number) => {
    if (ci < 30) return "text-(--color-data-3)"; // Indigo - Soloist dominant
    if (ci > 55) return "text-(--color-accent-400)"; // Teal - Band dominant
    return "text-(--color-warning)"; // Amber - Balanced
  };

  // Determine current Dial CI based on state (selected or hovered)
  let activeCI = nationalCI;
  let activeLabel = "Nasional";
  let activeSolo = totalSoloists;
  let activeBand = totalBands;

  if (hoveredProvince) {
    activeCI = hoveredProvince.collaborationIndex;
    activeLabel = hoveredProvince.province;
    activeSolo = hoveredProvince.soloCount;
    activeBand = hoveredProvince.bandCount;
  } else if (selectedProvince !== "Nasional") {
    const current = provinceList.find((p) => p.province === selectedProvince);
    if (current) {
      activeCI = current.collaborationIndex;
      activeLabel = current.province;
      activeSolo = current.soloCount;
      activeBand = current.bandCount;
    }
  }

  // Radial Dial Math
  const radius = 55;
  const circumference = 2 * Math.PI * radius; // ~345.57
  const strokeOffset = circumference - (activeCI / 100) * circumference;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-6 h-auto w-full">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md mt-1" />
        </div>
        <Divider spacing="sm" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} className="h-28">
              <Skeleton className="w-full h-full rounded-md" />
            </GlassCard>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="col-span-1 h-[340px]">
            <Skeleton className="w-full h-full rounded-md" />
          </GlassCard>
          <GlassCard className="col-span-2 h-[340px]">
            <Skeleton className="w-full h-full rounded-md" />
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id="artist-format"
      className="flex flex-col gap-6 py-6 h-auto w-full"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ── Section Header ── */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Guitar size={20} weight="bold" className="text-(--color-accent-500)" />
          <Text as="h1" variant="title" color="primary">
            Artist Format &amp; Collaboration Analysis
          </Text>
        </div>
        <Text variant="body" color="secondary">
          Eksplorasi spasial pembentukan musisi Soloist (Individu) vs Band/Group (Kolektif) di Indonesia.
        </Text>
      </motion.div>

      <Divider spacing="sm" />

      {/* ── SEGMENT 1: Hero KPI Strip ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Soloists Count */}
        <GlassCard className="p-4 flex flex-col gap-1.5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <Text variant="caption" color="secondary">
              Total Soloist
            </Text>
            <Microphone size={18} className="text-(--color-data-3) group-hover:scale-110 transition-transform" />
          </div>
          <AnimatedCounter
            value={totalSoloists}
            className="text-hero text-(--color-data-3) font-extrabold leading-none my-1"
          />
          <Text variant="caption" color="muted">
            Format Individu (Person)
          </Text>
        </GlassCard>

        {/* Bands Count */}
        <GlassCard className="p-4 flex flex-col gap-1.5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <Text variant="caption" color="secondary">
              Total Band/Group
            </Text>
            <Guitar size={18} className="text-(--color-accent-500) group-hover:scale-110 transition-transform" />
          </div>
          <AnimatedCounter
            value={totalBands}
            className="text-hero text-(--color-accent-400) font-extrabold leading-none my-1"
          />
          <Text variant="caption" color="muted">
            Format Kolektif (Group)
          </Text>
        </GlassCard>

        {/* National Collaboration Index */}
        <GlassCard className="p-4 flex flex-col gap-1.5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <Text variant="caption" color="secondary">
              Nasional Collab Index (CI)
            </Text>
            <ChartPieSlice size={18} className="text-(--color-warning) group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatedCounter
              value={nationalCI}
              formatter={(val) => `${val}%`}
              className="text-hero text-(--color-text-primary) font-extrabold leading-none my-1"
            />
          </div>
          <Text variant="caption" color="muted">
            Persentase pembentukan format Band
          </Text>
        </GlassCard>

        {/* Most Collaborative City */}
        <GlassCard className="p-4 flex flex-col gap-1.5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <Text variant="caption" color="secondary">
              Kota Paling Kolektif
            </Text>
            <MapPin size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          {mostCollaborativeCity ? (
            <>
              <Text variant="heading" color="primary" className="truncate text-xl lg:text-2xl font-bold my-1">
                {mostCollaborativeCity.city}
              </Text>
              <Text variant="caption" color="muted">
                Collaboration Index: {mostCollaborativeCity.collaborationIndex}%
              </Text>
            </>
          ) : (
            <>
              <Text variant="heading" color="primary" className="text-xl lg:text-2xl font-bold my-1">
                N/A
              </Text>
              <Text variant="caption" color="muted">
                Jumlah data kota minim
              </Text>
            </>
          )}
        </GlassCard>
      </motion.div>

      {/* ── SEGMENT 2: Duo-Metric Scene Dial & Province Ranking ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2A. Scene Dial */}
        <motion.div variants={fadeUp} className="col-span-1">
          <GlassCard className="p-5 flex flex-col gap-5 h-full items-center justify-between min-h-[380px]">
            <div className="w-full flex items-center justify-between">
              <div className="flex flex-col">
                <Text variant="label" color="primary" className="font-semibold">
                  Scene Dial
                </Text>
                <Text variant="caption" color="muted">
                  Dominasi Kolektif vs. Solo
                </Text>
              </div>
              <Dropdown
                options={provinceOptions}
                value={selectedProvince}
                onChange={setSelectedProvince}
                className="w-32"
              />
            </div>

            {/* SVG circular dial */}
            <div className="relative size-44 flex items-center justify-center">
              <svg className="size-full transform -rotate-90">
                {/* Background Track (Indigo - Soloist segment) */}
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="stroke-(--color-data-3)/20 fill-none"
                  strokeWidth="12"
                />
                
                {/* Indigo arc (Solo portion) */}
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="stroke-(--color-data-3) fill-none transition-all duration-300"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={0}
                />

                {/* Overlapping Teal arc (Band portion) */}
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="stroke-(--color-accent-400) fill-none transition-all duration-300"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Text inside the ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <Text variant="hero" color="primary" className="text-3xl font-extrabold leading-none">
                  {activeCI}%
                </Text>
                <Text variant="caption" color="muted" className="uppercase tracking-wider font-semibold text-[9px]">
                  Bands (CI)
                </Text>
              </div>
            </div>

            {/* Dial Labels / Legend */}
            <div className="flex flex-col gap-2 w-full text-center">
              <Text variant="label" color="primary" className="font-bold uppercase tracking-tight text-sm">
                {activeLabel}
              </Text>
              <div className="flex justify-around items-center pt-2 border-t border-(--color-border-default)/50">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-(--color-data-3)" />
                    <Text variant="caption" color="secondary" className="font-semibold">
                      {activeSolo}
                    </Text>
                  </div>
                  <Text variant="caption" color="muted" className="text-[10px]">Soloist</Text>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-(--color-accent-400)" />
                    <Text variant="caption" color="secondary" className="font-semibold">
                      {activeBand}
                    </Text>
                  </div>
                  <Text variant="caption" color="muted" className="text-[10px]">Bands</Text>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* 2B. Province CI Ranking */}
        <motion.div variants={fadeUp} className="col-span-1 lg:col-span-2">
          <GlassCard className="p-5 flex flex-col gap-4 h-full min-h-[380px]">
            <div className="flex flex-col">
              <Text variant="label" color="primary" className="font-semibold">
                Province CI Ranking
              </Text>
              <Text variant="caption" color="muted">
                Peringkat provinsi berdasarkan keterikatan kolaboratif kolektif.
              </Text>
            </div>

            <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[300px] pr-2">
              {provinceList.map((item, i) => {
                const total = item.soloCount + item.bandCount;
                const bandPct = total > 0 ? (item.bandCount / total) * 100 : 0;
                
                // Get archetype label locally
                let label = "Evolving Music Scene";
                if (item.collaborationIndex >= 65) label = "Indie Rehearsal Capital";
                else if (item.collaborationIndex >= 50) label = "Emerging Band Scene";
                else if (item.collaborationIndex >= 35) label = "Evolving Music Scene";
                else if (item.collaborationIndex >= 20) label = "Commercial Artist Hub";
                else label = "Vocalist & Studio Epicenter";

                return (
                  <div
                    key={item.province}
                    onMouseEnter={() => setHoveredProvince(item)}
                    onMouseLeave={() => setHoveredProvince(null)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-(--color-bg-surface)/10 hover:bg-(--color-bg-surface)/30 transition-all border border-transparent hover:border-(--color-border-default)/30"
                  >
                    <div className="flex flex-col gap-0.5 min-w-[140px]">
                      <Text variant="label" color="primary" className="font-semibold truncate">
                        {item.province}
                      </Text>
                      <Text variant="caption" color="muted" className="text-[10px]">
                        Region: {item.region}
                      </Text>
                    </div>

                    {/* Proportional Stacked Bar representing Solo vs Band proportion */}
                    <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
                      <div className="h-2.5 rounded-full bg-(--color-bg-surface) flex overflow-hidden">
                        <div
                          className="h-full bg-(--color-accent-400)"
                          style={{ width: `${bandPct}%` }}
                        />
                        <div
                          className="h-full bg-(--color-data-3)"
                          style={{ width: `${100 - bandPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <Text variant="caption" color="secondary" className="font-semibold">
                          CI: {item.collaborationIndex}%
                        </Text>
                        <Text variant="caption" color="muted">
                          {item.bandCount} Band / {item.soloCount} Solo
                        </Text>
                      </div>
                    </div>

                    {/* Archetype Label Badge */}
                    <div className="flex items-center shrink-0">
                      <Badge color={item.collaborationIndex >= 50 ? "accent" : "info"} className="text-[9px] uppercase tracking-wider font-bold">
                        {label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── SEGMENT 3: Genre-Format Cross-Matrix ── */}
      <motion.div variants={fadeUp}>
        <GlassCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-(--color-border-default)/50 flex flex-col">
            <Text variant="label" color="primary" className="font-semibold">
              Genre-Format Cross-Matrix
            </Text>
            <Text variant="caption" color="muted">
              Apakah genre musik mendikte susunan formasi artis? Temuan anomali ditandai di bawah.
            </Text>
          </div>

          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-(--color-bg-surface)/30 border-b border-(--color-border-default)/40 text-left font-bold text-xs tracking-wider text-(--color-text-secondary) uppercase">
            <div className="col-span-3">Genre</div>
            <div className="col-span-5 text-center">Format Distribution (Solo / Band)</div>
            <div className="col-span-2 text-right">Artis</div>
            <div className="col-span-2 text-right">Keterangan</div>
          </div>

          <div className="flex flex-col">
            {genreFormatMatrix.map((item, i) => (
              <div
                key={item.genre}
                className={`grid grid-cols-12 gap-4 px-5 py-3 border-b border-(--color-border-default)/30 last:border-b-0 items-center text-sm ${
                  i % 2 === 0 ? "bg-transparent" : "bg-(--color-bg-surface)/10"
                }`}
              >
                <div className="col-span-3 font-semibold text-(--color-text-primary)">
                  {item.genre}
                </div>

                <div className="col-span-5 flex flex-col gap-1">
                  <div className="h-2 rounded-full bg-(--color-bg-surface) flex overflow-hidden">
                    <div
                      className="h-full bg-(--color-data-3)"
                      style={{ width: `${item.soloPct}%` }}
                    />
                    <div
                      className="h-full bg-(--color-accent-400)"
                      style={{ width: `${item.bandPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-(--color-text-muted) font-semibold">
                    <span>{item.soloPct}% Solo</span>
                    <span>{item.bandPct}% Band</span>
                  </div>
                </div>

                <div className="col-span-2 text-right font-medium text-(--color-text-secondary)">
                  {item.total}
                </div>

                <div className="col-span-2 flex justify-end">
                  {item.isAnomaly ? (
                    <Badge color="warning" className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold">
                      <Warning size={10} weight="bold" />
                      <span>Anomali</span>
                    </Badge>
                  ) : (
                    <span className="text-xs text-(--color-text-muted)">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* ── SEGMENT 4: Streaming Economics Comparison ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popularity Comparison */}
        <motion.div variants={fadeUp}>
          <GlassCard className="p-5 flex flex-col gap-4 justify-between h-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <TrendUp size={16} className="text-(--color-accent-400)" />
                <Text variant="label" color="primary" className="font-semibold">
                  Avg. Spotify Popularity
                </Text>
              </div>
              <Text variant="caption" color="muted">
                Perbandingan popularitas streaming instan bulanan.
              </Text>
            </div>

            <div className="flex flex-col gap-4 my-2">
              {streamingComparison && (
                <>
                  {/* Soloist */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline">
                      <Text variant="caption" color="secondary" className="font-medium">Soloist</Text>
                      <Text variant="label" color="primary" className="font-extrabold text-lg">
                        {streamingComparison.solo.avgPopularity}
                      </Text>
                    </div>
                    <div className="h-3 rounded-full bg-(--color-bg-surface) overflow-hidden">
                      <div
                        className="h-full bg-(--color-data-3)"
                        style={{ width: `${streamingComparison.solo.avgPopularity}%` }}
                      />
                    </div>
                  </div>

                  {/* Band */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline">
                      <Text variant="caption" color="secondary" className="font-medium">Band/Group</Text>
                      <Text variant="label" color="primary" className="font-extrabold text-lg">
                        {streamingComparison.band.avgPopularity}
                      </Text>
                    </div>
                    <div className="h-3 rounded-full bg-(--color-bg-surface) overflow-hidden">
                      <div
                        className="h-full bg-(--color-accent-400)"
                        style={{ width: `${streamingComparison.band.avgPopularity}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <Text variant="caption" color="muted" className="text-[11px] leading-relaxed pt-2 border-t border-(--color-border-default)/30">
              * Delta +{streamingComparison ? Math.abs(streamingComparison.solo.avgPopularity - streamingComparison.band.avgPopularity) : 0} poin menunjukkan bahwa penyanyi solo secara umum lebih mudah menjangkau playlist kurasi viral bulanan.
            </Text>
          </GlassCard>
        </motion.div>

        {/* Followers Comparison */}
        <motion.div variants={fadeUp}>
          <GlassCard className="p-5 flex flex-col gap-4 justify-between h-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-(--color-accent-400)" />
                <Text variant="label" color="primary" className="font-semibold">
                  Avg. Spotify Followers (Fans Loyalty)
                </Text>
              </div>
              <Text variant="caption" color="muted">
                Perbandingan loyalitas struktural jangka panjang pendengar.
              </Text>
            </div>

            <div className="flex flex-col gap-4 my-2">
              {streamingComparison && (
                <>
                  {/* Soloist */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline">
                      <Text variant="caption" color="secondary" className="font-medium">Soloist</Text>
                      <Text variant="label" color="primary" className="font-extrabold text-lg">
                        {formatFollowers(streamingComparison.solo.avgFollowers)}
                      </Text>
                    </div>
                    <div className="h-3 rounded-full bg-(--color-bg-surface) overflow-hidden">
                      <div
                        className="h-full bg-(--color-data-3)"
                        style={{ width: `${(streamingComparison.solo.avgFollowers / Math.max(streamingComparison.solo.avgFollowers, streamingComparison.band.avgFollowers)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Band */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline">
                      <Text variant="caption" color="secondary" className="font-medium">Band/Group</Text>
                      <Text variant="label" color="primary" className="font-extrabold text-lg">
                        {formatFollowers(streamingComparison.band.avgFollowers)}
                      </Text>
                    </div>
                    <div className="h-3 rounded-full bg-(--color-bg-surface) overflow-hidden">
                      <div
                        className="h-full bg-(--color-accent-400)"
                        style={{ width: `${(streamingComparison.band.avgFollowers / Math.max(streamingComparison.solo.avgFollowers, streamingComparison.band.avgFollowers)) * 100}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <Text variant="caption" color="muted" className="text-[11px] leading-relaxed pt-2 border-t border-(--color-border-default)/30">
              * Rerata followers grup musik secara nasional jauh melampaui soloist. Band cenderung berperan sebagai &quot;Subculture Brand&quot; dengan basis loyalitas fans struktural yang sangat erat.
            </Text>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── SEGMENT 5: Scene Archetype Cards ── */}
      <motion.div variants={fadeUp} className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <Text variant="label" color="primary" className="font-semibold">
            Regional Scene Archetypes
          </Text>
          <Text variant="caption" color="muted">
            Karakteristik ekosistem seni dari kota-kota utama Indonesia berdasarkan struktur CI.
          </Text>
        </div>

        {/* Scrollable Container */}
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory">
          {significantCollabCities.slice(0, 5).map((city) => {
            // Archetype styling helper
            let colorTheme = "text-(--color-accent-400) border-(--color-accent-500)/30";
            let Icon = Guitar;
            
            if (city.archetype === "Indie Rehearsal Capital") {
              Icon = Guitar;
              colorTheme = "text-(--color-accent-400) border-(--color-accent-500)/30";
            } else if (city.archetype === "Emerging Band Scene") {
              Icon = MusicNote;
              colorTheme = "text-emerald-400 border-emerald-500/30";
            } else if (city.archetype === "Evolving Music Scene") {
              Icon = Disc;
              colorTheme = "text-amber-400 border-amber-500/30";
            } else {
              Icon = Microphone;
              colorTheme = "text-(--color-data-3) border-(--color-data-3)/30";
            }

            return (
              <GlassCard
                key={city.city}
                className={`p-4 flex flex-col justify-between gap-4 min-w-[260px] max-w-[260px] snap-start border ${colorTheme}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col min-w-0">
                    <Text variant="heading" color="primary" className="font-bold truncate text-base">
                      {city.city}
                    </Text>
                    <Text variant="caption" color="muted" className="text-[10px] truncate">
                      {city.province}
                    </Text>
                  </div>
                  <div className="size-8 rounded-lg bg-(--color-bg-surface)/20 flex items-center justify-center shrink-0">
                    <Icon size={16} weight="fill" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <Text variant="caption" color="secondary" className="font-semibold">
                      CI: {city.collaborationIndex}%
                    </Text>
                    <Text variant="caption" color="muted" className="text-[10px]">
                      {city.totalCount} Artis
                    </Text>
                  </div>
                  <div className="h-1.5 rounded-full bg-(--color-bg-surface) flex overflow-hidden">
                    <div
                      className="h-full bg-current"
                      style={{ width: `${city.collaborationIndex}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-(--color-border-default)/30">
                  <Text variant="caption" color="secondary" className="font-bold block tracking-tight text-[11px] leading-tight mb-1 uppercase">
                    &ldquo;{city.archetype}&rdquo;
                  </Text>
                  <Text variant="caption" color="muted" className="text-[10px] leading-snug">
                    Mayoritas genre: <span className="font-semibold text-(--color-text-secondary)">{city.topGenre}</span>
                  </Text>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
