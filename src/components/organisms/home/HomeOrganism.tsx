"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, CircleNotch } from "@phosphor-icons/react";
import { musicService } from "@/lib/api/musicService";
import {
  Header,
  KpiBar,
  ArtistDrawer,
  MapPlaceholder,
  DatabaseExplorer,
  Drawer,
  Footer,
} from "@/components/organisms";
import type { ArtistData } from "@/components/organisms";
import type { CityAggregate } from "@/components/organisms/InteractiveMap";
import { Text, Badge, Divider, AnimatedCounter } from "@/components/atoms";

/**
 * Home — Selasar Suara unified vertical-scroll page
 *
 * Layout: Sticky Header → Immersive Map (80vh) → Analytical sections.
 * Replaces the old sidebar-driven conditional view architecture.
 * All navigation is handled via smooth-scroll anchors in Header.tsx.
 */

export default function HomeOrganism() {
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityAggregate | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mapMode, setMapMode] = useState<'density' | 'popularity'>('density');
  const [cityData, setCityData] = useState<CityAggregate[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleCitySelect = (city: CityAggregate | null) => {
    setSelectedCity(city);
    setVisibleCount(10);
    setShowBackToTop(false);
  };

  // Bind scroll handler to show/hide "Back to Top" button
  useEffect(() => {
    if (!selectedCity) return;

    let handleScroll: () => void;
    
    const timer = setTimeout(() => {
      const container = document.getElementById("drawer-scroll-container");
      if (!container) return;

      handleScroll = () => {
        setShowBackToTop(container.scrollTop > 200);
      };

      container.addEventListener("scroll", handleScroll);
      handleScroll();
    }, 100);

    return () => {
      clearTimeout(timer);
      const container = document.getElementById("drawer-scroll-container");
      if (container && handleScroll) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [selectedCity]);

  // IntersectionObserver to auto-trigger loading more artists as scroll approaches sentinel
  useEffect(() => {
    if (!selectedCity) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 10, selectedCity.topArtists.length));
        }
      },
      {
        root: document.getElementById("drawer-scroll-container"),
        threshold: 0.1,
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [selectedCity, visibleCount]);

  const [kpiStats, setKpiStats] = useState<{
    totalArtists: number;
    avgPopularity: number;
    provincesCovered: number;
    topGenre: string;
  } | null>(null);

  useEffect(() => {
    async function loadKpis() {
      try {
        const stats = await musicService.getKpiStats();
        setKpiStats(stats);
      } catch (err) {
        console.error("Error loading KPIs:", err);
      }
    }
    loadKpis();
  }, []);

  const formatFollowers = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toFixed(0);
  };

  // Dynamic KPI Calculations based on `cityData`
  const avgArtistsPerCity = cityData.length > 0 ? (kpiStats?.totalArtists || 0) / cityData.length : 0;
  
  let mostDenseCity = "N/A";
  let maxCount = 0;
  let mostPopularCity = "N/A";
  let maxPop = 0;
  let rawTotalFollowers = 0;

  cityData.forEach(c => {
    if (c.count > maxCount) { maxCount = c.count; mostDenseCity = c.city; }
    if (c.avgPopularity > maxPop) { maxPop = c.avgPopularity; mostPopularCity = c.city; }
    rawTotalFollowers += c.totalFollowers;
  });

  const totalFollowersStr = formatFollowers(rawTotalFollowers);

  // Genre distribution inside the active city drawer
  const cityGenreDistribution = useMemo(() => {
    if (!selectedCity) return [];
    const counts: Record<string, number> = {};
    selectedCity.topArtists.forEach((art) => {
      const g = art.primaryGenre || "Lainnya";
      counts[g] = (counts[g] || 0) + 1;
    });

    const total = selectedCity.topArtists.length;
    return Object.entries(counts)
      .map(([name, count]) => {
        const percentage = Math.round((count / total) * 100);
        return { name, count, percentage };
      })
      .sort((a, b) => b.count - a.count);
  }, [selectedCity]);

  const cityCollaborationIndex = selectedCity?.count ? Math.round((selectedCity.bandCount / selectedCity.count) * 100) : 0;
  
  let cityArchetype = "Evolving Music Scene";
  if (cityCollaborationIndex >= 65) cityArchetype = "Indie Rehearsal Capital";
  else if (cityCollaborationIndex >= 50) cityArchetype = "Emerging Band Scene";
  else if (cityCollaborationIndex >= 35) cityArchetype = "Evolving Music Scene";
  else if (cityCollaborationIndex >= 20) cityArchetype = "Commercial Artist Hub";
  else cityArchetype = "Vocalist & Studio Epicenter";

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
          mapMode={mapMode}
          onModeChange={setMapMode}
          totalArtists={kpiStats?.totalArtists ?? 0}
          avgArtistsPerCity={avgArtistsPerCity}
          mostDenseCity={mostDenseCity}
          provincesCovered={kpiStats?.provincesCovered ?? 0}
          avgPopularity={kpiStats?.avgPopularity ?? 0}
          mostPopularCity={mostPopularCity}
          totalFollowers={totalFollowersStr}
          topGenre={kpiStats?.topGenre ?? "Loading..."}
        />

        {/* Map canvas — fills remaining height */}
        <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden border border-(--color-border-default)">
          <MapPlaceholder 
            mapMode={mapMode}
            onArtistClick={setSelectedArtist} 
            onCityClick={handleCitySelect} 
            onDataLoaded={setCityData}
          />
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
      </main>

      {/* Slide-over Drawer — globally available for artist details */}
      <ArtistDrawer
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />

      {/* Slide-over Drawer — globally available for city detail analysis */}
      <Drawer
        isOpen={!!selectedCity}
        onClose={() => handleCitySelect(null)}
        width="w-[480px]"
        blurBackdrop={true}
        badge={
          <Badge
            color="accent"
            className="uppercase tracking-wider text-[10px] font-bold"
          >
            Kota Analisis
          </Badge>
        }
        title={selectedCity?.city}
        subtitle="Rangkuman data spasial musisi di wilayah perkotaan"
      >
        {selectedCity && (
          <div className="flex flex-col gap-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 bg-(--color-bg-surface)/20 border border-(--color-border-default) rounded-xl p-4">
              <div className="flex flex-col gap-1">
                <Text variant="caption" color="secondary">Artis</Text>
                <AnimatedCounter
                  value={selectedCity.count}
                  className="text-lg font-bold text-white tracking-tight"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Text variant="caption" color="secondary">Avg Pop</Text>
                <AnimatedCounter
                  value={selectedCity.avgPopularity}
                  className="text-lg font-bold text-(--color-accent-500) tracking-tight"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Text variant="caption" color="secondary">Followers</Text>
                <AnimatedCounter
                  value={selectedCity.totalFollowers}
                  formatter={formatFollowers}
                  className="text-lg font-bold text-white tracking-tight"
                />
              </div>
            </div>

            {/* Archetype Badge block */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-(--color-border-default) bg-(--color-bg-surface)/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-(--color-text-secondary) uppercase tracking-wider font-semibold">Scene Archetype</span>
                <span className="text-sm font-bold text-white mt-0.5">{cityArchetype}</span>
              </div>
              <Badge color="accent" className="font-semibold text-xs py-1">
                {cityCollaborationIndex}% Band Format
              </Badge>
            </div>

            {/* Genre Distribution */}
            <div className="flex flex-col gap-3">
              <Text variant="label" className="font-semibold text-white/95">
                Distribusi Genre Utama
              </Text>
              
              <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-white/5 border border-white/5">
                {cityGenreDistribution.map((genre, idx) => {
                  const colors = [
                    "bg-(--color-accent-500)",
                    "bg-sky-500",
                    "bg-indigo-500",
                    "bg-amber-500",
                    "bg-emerald-500",
                  ];
                  const colorClass = colors[idx % colors.length];
                  return (
                    <div
                      key={genre.name}
                      style={{ width: `${genre.percentage}%` }}
                      className={`${colorClass} h-full transition-all`}
                      title={`${genre.name}: ${genre.percentage}%`}
                    />
                  );
                })}
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
                {cityGenreDistribution.slice(0, 4).map((genre, idx) => {
                  const dotColors = [
                    "bg-(--color-accent-500)",
                    "bg-sky-500",
                    "bg-indigo-500",
                    "bg-amber-500",
                    "bg-emerald-500",
                  ];
                  const dotColor = dotColors[idx % dotColors.length];
                  return (
                    <div key={genre.name} className="flex items-center gap-1.5 text-xs text-(--color-text-secondary)">
                      <span className={`size-2 rounded-full ${dotColor}`} />
                      <span className="font-medium text-white/80">{genre.name}</span>
                      <span>({genre.percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Divider spacing="sm" />

            {/* Roster list */}
            <div className="flex flex-col gap-3 relative pb-10">
              <Text variant="label" className="font-semibold text-white/95">
                Musisi Terpopuler ({selectedCity.topArtists.length})
              </Text>
              
              <div className="flex flex-col gap-2">
                {selectedCity.topArtists.slice(0, visibleCount).map((art) => (
                  <button
                    key={art.name}
                    onClick={() => {
                      setSelectedArtist(art);
                      handleCitySelect(null); 
                    }}
                    className="flex items-center justify-between p-3 rounded-lg bg-(--color-bg-surface)/20 border border-(--color-border-default) hover:border-(--color-accent-500)/30 hover:bg-(--color-accent-500)/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={art.profilePicture || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&q=80"}
                        alt={art.name}
                        className="size-10 rounded-full border border-white/10 object-cover group-hover:border-(--color-accent-500)/40 transition-colors"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white group-hover:text-(--color-accent-400) transition-colors truncate">
                          {art.name}
                        </span>
                        <span className="text-xs text-(--color-text-secondary) truncate">
                          {art.genres.slice(0, 2).join(", ")}
                        </span>
                      </div>
                    </div>
                    <Badge color="accent" className="font-medium text-[10px]">
                      Pop {art.popularity}
                    </Badge>
                  </button>
                ))}
              </div>

              {/* Show More & Infinite Scroll triggers */}
              {visibleCount < selectedCity.topArtists.length && (
                <div className="mt-2 flex flex-col items-center gap-3 w-full">
                  <button
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 10, selectedCity.topArtists.length))}
                    className="w-full py-2.5 rounded-lg border border-(--color-border-default) bg-(--color-bg-surface)/30 text-xs font-semibold text-(--color-text-secondary) hover:text-(--color-text-primary) hover:border-(--color-accent-500)/50 hover:bg-(--color-bg-surface)/50 transition-all cursor-pointer text-center shadow-sm"
                  >
                    Tampilkan Lebih Banyak ({selectedCity.topArtists.length - visibleCount} Musisi Lainnya)
                  </button>
                  
                  {/* Invisible scroll sentinel */}
                  <div ref={sentinelRef} className="h-2 w-full flex items-center justify-center opacity-60">
                    <CircleNotch size={14} className="animate-spin text-(--color-accent-500)" />
                    <span className="ml-1.5 text-[10px] text-(--color-text-muted)">Menggulir untuk memuat lebih banyak...</span>
                  </div>
                </div>
              )}

              {/* Back to top fixed button inside viewport */}
              <AnimatePresence>
                {showBackToTop && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    onClick={() => {
                      const container = document.getElementById("drawer-scroll-container");
                      if (container) {
                        container.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-(--color-accent-500) text-black shadow-lg shadow-(--color-accent-glow) hover:bg-(--color-accent-400) hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                    title="Kembali ke Atas"
                  >
                    <ArrowUp size={16} weight="bold" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </Drawer>

      <Footer />
    </div>
  );
}
