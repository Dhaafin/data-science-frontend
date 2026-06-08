"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, MusicNote, ChartBar, Warning, CircleNotch, Globe } from "@phosphor-icons/react";
import { Text, GlassCard, Badge, Divider, Skeleton } from "@/components/atoms";
import { musicService, StickinessArtistEntry } from "@/lib/api/musicService";
import { fadeUp, staggerContainer } from "@/lib/motion";

const JAVA_PROVINCES = [
  "dki jakarta",
  "jawa barat",
  "jawa tengah",
  "jawa timur",
  "di yogyakarta",
  "banten",
];

const normalizeCity = (city: string): string => {
  const c = city.toLowerCase().trim();
  if (c.includes("jakarta")) return "Jakarta";
  if (c.includes("yogyakarta") || c.includes("sleman") || c.includes("bantul")) return "Yogyakarta";
  return city.charAt(0).toUpperCase() + city.slice(1);
};

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("id-ID");
};

export function ResearchQuestionsShowcase() {
  const [artists, setArtists] = useState<StickinessArtistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rq1" | "rq2" | "rq3">("rq1");
  const [genreMode, setGenreMode] = useState<"primary" | "tags">("primary");

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await musicService.getStickinessData();
        if (mounted) {
          setArtists(data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load research data:", err);
        if (mounted) setError("Gagal memuat data analisis penelitian.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // ═══════════════════════════════════════════════════════
  // RQ 1: Profil Sebaran Geografis Calculations
  // ═══════════════════════════════════════════════════════
  const rq1Stats = useMemo(() => {
    if (artists.length === 0) return null;

    let javaCount = 0;
    let javaFollowers = 0;
    let totalFollowers = 0;

    const cityMap = new Map<string, { name: string; count: number; followers: number; totalPop: number }>();

    artists.forEach((art) => {
      const isJava = JAVA_PROVINCES.includes(art.originProvince.toLowerCase().trim());
      const followers = art.followers || 0;
      totalFollowers += followers;

      if (isJava) {
        javaCount += 1;
        javaFollowers += followers;
      }

      const normCity = normalizeCity(art.originCity);
      const current = cityMap.get(normCity) || { name: normCity, count: 0, followers: 0, totalPop: 0 };
      current.count += 1;
      current.followers += followers;
      current.totalPop += art.popularity || 0;
      cityMap.set(normCity, current);
    });

    const totalArtists = artists.length;
    const javaArtistPct = Math.round((javaCount / totalArtists) * 100);
    const outsideArtistPct = 100 - javaArtistPct;
    const javaFollowersPct = totalFollowers > 0 ? Math.round((javaFollowers / totalFollowers) * 100) : 0;
    const outsideFollowersPct = 100 - javaFollowersPct;

    const topCities = Array.from(cityMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((c) => ({
        ...c,
        avgPopularity: Math.round(c.totalPop / c.count),
      }));

    return {
      javaArtistPct,
      outsideArtistPct,
      javaFollowersPct,
      outsideFollowersPct,
      topCities,
      totalArtists,
      totalFollowers,
    };
  }, [artists]);

  // ═══════════════════════════════════════════════════════
  // RQ 2: Konsentrasi Genre Calculations
  // ═══════════════════════════════════════════════════════
  const rq2Stats = useMemo(() => {
    if (artists.length === 0 || !rq1Stats) return null;

    // We calculate for the top 5 cities from RQ1
    const topCityNames = rq1Stats.topCities.map((c) => c.name);

    return topCityNames.map((cityName) => {
      const cityArtists = artists.filter((art) => normalizeCity(art.originCity) === cityName);
      const totalInCity = cityArtists.length;

      const freqMap = new Map<string, number>();

      if (genreMode === "primary") {
        cityArtists.forEach((art) => {
          const pg = art.primaryGenre ? art.primaryGenre.trim() : "Lainnya";
          const formattedGenre = pg
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          freqMap.set(formattedGenre, (freqMap.get(formattedGenre) || 0) + 1);
        });
      } else {
        cityArtists.forEach((art) => {
          const tags = art.primaryGenre ? [art.primaryGenre, ...(art.genres || [])] : art.genres || [];
          const uniqueTags = Array.from(new Set(tags.map((t) => t.toLowerCase().trim())));
          uniqueTags.forEach((tag) => {
            const formattedTag = tag
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");
            freqMap.set(formattedTag, (freqMap.get(formattedTag) || 0) + 1);
          });
        });
      }

      const sortedGenres = Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1]);
      const [topGenreName, topGenreCount] = sortedGenres[0] || ["N/A", 0];
      const dominancePct = totalInCity > 0 ? Math.round((topGenreCount / totalInCity) * 100) : 0;

      return {
        cityName,
        topGenreName,
        dominancePct,
        totalInCity,
        allGenres: sortedGenres.slice(0, 3).map(([name, count]) => ({
          name,
          pct: totalInCity > 0 ? Math.round((count / totalInCity) * 100) : 0,
        })),
      };
    });
  }, [artists, rq1Stats, genreMode]);

  // ═══════════════════════════════════════════════════════
  // RQ 3: Aksesibilitas Spasial Calculations
  // ═══════════════════════════════════════════════════════
  const rq3Stats = useMemo(() => {
    if (artists.length === 0) return null;

    const groups = {
      jakarta: { totalPop: 0, totalFollowers: 0, count: 0 },
      javaRest: { totalPop: 0, totalFollowers: 0, count: 0 },
      outsideJava: { totalPop: 0, totalFollowers: 0, count: 0 },
    };

    artists.forEach((art) => {
      const normCity = normalizeCity(art.originCity);
      const isJava = JAVA_PROVINCES.includes(art.originProvince.toLowerCase().trim());
      const popularity = art.popularity || 0;
      const followers = art.followers || 0;

      if (normCity === "Jakarta") {
        groups.jakarta.count += 1;
        groups.jakarta.totalPop += popularity;
        groups.jakarta.totalFollowers += followers;
      } else if (isJava) {
        groups.javaRest.count += 1;
        groups.javaRest.totalPop += popularity;
        groups.javaRest.totalFollowers += followers;
      } else {
        groups.outsideJava.count += 1;
        groups.outsideJava.totalPop += popularity;
        groups.outsideJava.totalFollowers += followers;
      }
    });

    const calcGroup = (g: typeof groups.jakarta) => ({
      count: g.count,
      avgPopularity: g.count > 0 ? Math.round(g.totalPop / g.count) : 0,
      avgFollowers: g.count > 0 ? Math.round(g.totalFollowers / g.count) : 0,
    });

    return {
      jakarta: calcGroup(groups.jakarta),
      javaRest: calcGroup(groups.javaRest),
      outsideJava: calcGroup(groups.outsideJava),
    };
  }, [artists]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-6 w-full">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-8 w-64 rounded-md animate-pulse" />
          <Skeleton className="h-4 w-96 rounded-md animate-pulse" />
        </div>
        <Divider spacing="sm" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <GlassCard className="p-6 h-96 flex flex-col gap-6 justify-center">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-12 text-center border-(--color-error)/30">
        <Warning size={48} className="text-(--color-error) mb-4" />
        <Text as="h2" variant="title" color="primary">Error</Text>
        <Text variant="body" color="secondary">{error}</Text>
      </GlassCard>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-6 w-full scroll-mt-20"
      id="research"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Section Header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Globe size={22} weight="bold" className="text-(--color-accent-500)" />
          <Text as="h1" variant="title" className="font-bold text-white tracking-tight">
            Dasbor Analisis Rumusan Masalah
          </Text>
        </div>
        <Text variant="body" color="secondary">
          Pembuktian empiris untuk 3 pertanyaan riset mengenai hegemoni industri musik secara spasial.
        </Text>
      </motion.div>

      <Divider spacing="sm" />

      {/* Tabs Control */}
      <motion.div variants={fadeUp} className="flex p-1 bg-black/40 rounded-xl border border-white/5 self-start">
        {[
          { id: "rq1", label: "Q1: Profil Distribusi", icon: MapPin },
          { id: "rq2", label: "Q2: Regional Hubs", icon: MusicNote },
          { id: "rq3", label: "Q3: Aksesibilitas Spasial", icon: ChartBar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all relative cursor-pointer ${
                isActive
                  ? "text-teal-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} weight={isActive ? "bold" : "regular"} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-research-tab"
                  className="absolute inset-0 bg-teal-500/10 border border-teal-500/20 rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "rq1" && rq1Stats && (
            <GlassCard className="p-6 flex flex-col gap-8">
              <div>
                <Text variant="heading" className="font-bold text-white">
                  RQ1: Bagaimana sebaran geografis musisi populer Indonesia di platform digital?
                </Text>
                <Text variant="caption" color="secondary" className="mt-1">
                  Menganalisis tingkat konsentrasi musisi papan atas secara spasial di Pulau Jawa vs Luar Jawa.
                </Text>
              </div>

              {/* Java vs Outside Java Progress Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/2 p-5 rounded-xl border border-white/5">
                {/* Artist Count Disparity */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white/90">Persentase Musisi Terdaftar</span>
                    <span className="text-(--color-accent-400) font-bold">{rq1Stats.javaArtistPct}% Jawa</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                    <motion.div
                      className="bg-(--color-accent-500) h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${rq1Stats.javaArtistPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <div className="flex-1 bg-white/10 h-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-(--color-text-secondary)">
                    <span>Pulau Jawa ({rq1Stats.javaArtistPct}%)</span>
                    <span>Luar Jawa ({rq1Stats.outsideArtistPct}%)</span>
                  </div>
                </div>

                {/* Followers Disparity */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white/90">Persentase Pangsa Pengikut (Reach)</span>
                    <span className="text-sky-400 font-bold">{rq1Stats.javaFollowersPct}% Jawa</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                    <motion.div
                      className="bg-sky-500 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${rq1Stats.javaFollowersPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <div className="flex-1 bg-white/10 h-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-(--color-text-secondary)">
                    <span>Pulau Jawa ({rq1Stats.javaFollowersPct}%)</span>
                    <span>Luar Jawa ({rq1Stats.outsideFollowersPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Top Cities Table */}
              <div className="flex flex-col gap-3">
                <Text variant="label" className="font-bold text-white/90">
                  Konsentrasi Kota Asal Terbanyak (Top 5 Kota)
                </Text>
                <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
                  <div className="grid grid-cols-4 p-3 bg-white/5 border-b border-white/5 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                    <span>Nama Kota</span>
                    <span className="text-center">Jumlah Musisi</span>
                    <span className="text-right">Total Followers</span>
                    <span className="text-right font-medium">Avg Popularity</span>
                  </div>
                  {rq1Stats.topCities.map((city, idx) => (
                    <div
                      key={city.name}
                      className="grid grid-cols-4 p-3 border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors text-xs items-center"
                    >
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <span className="text-white/40 font-mono w-4">{idx + 1}.</span>
                        <span>{city.name}</span>
                      </div>
                      <span className="text-center font-bold text-white">{city.count}</span>
                      <span className="text-right text-(--color-text-secondary)">{formatNumber(city.followers)}</span>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-bold text-(--color-accent-400)">{city.avgPopularity}</span>
                        <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="bg-(--color-accent-500) h-full"
                            style={{ width: `${city.avgPopularity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Text variant="caption" color="secondary" className="leading-relaxed bg-teal-500/5 border border-teal-500/10 p-3 rounded-lg mt-1">
                  💡 <strong>Analisis RQ1</strong>: Terjadi dominasi spasial yang timpang di mana Pulau Jawa menguasai lebih dari <strong>{rq1Stats.javaArtistPct}%</strong> musisi populer nasional dan menarik <strong>{rq1Stats.javaFollowersPct}%</strong> total pangsa pengikut, memvalidasi hegemoni spasial di era digital.
                </Text>
              </div>
            </GlassCard>
          )}

          {activeTab === "rq2" && rq2Stats && (
            <GlassCard className="p-6 flex flex-col gap-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <Text variant="heading" className="font-bold text-white">
                    RQ2: Di mana di Indonesia terdapat konsentrasi genre spesifik?
                  </Text>
                  <Text variant="caption" color="secondary" className="mt-1">
                    Mendeteksi spesialisasi genre regional (*Regional Genre Hubs*) dan tag subgenre yang paling mendominasi.
                  </Text>
                </div>

                {/* Sub-tabs Mode Selector */}
                <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/5">
                  {[
                    { label: "Genre Utama", id: "primary" },
                    { label: "Tag Genre (Tags)", id: "tags" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setGenreMode(mode.id as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        genreMode === mode.id
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/25"
                          : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grids showing Top Cities & their genre profiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {rq2Stats.map((city) => (
                  <GlassCard
                    key={city.cityName}
                    variant="default"
                    className="p-4 border-white/5 hover:border-teal-500/20 transition-all flex flex-col gap-4 relative overflow-hidden group"
                  >
                    {/* Background Glow Ring */}
                    <div className="absolute -right-6 -top-6 size-16 rounded-full bg-teal-500/5 group-hover:scale-150 transition-transform duration-500" />

                    <div>
                      <Text variant="heading" className="font-bold text-white">
                        {city.cityName}
                      </Text>
                      <Text variant="caption" color="secondary">
                        {city.totalInCity} musisi terdaftar
                      </Text>
                    </div>

                    <Divider className="my-0 opacity-50" />

                    {/* Dominant Genre Badge block */}
                    <div className="flex flex-col gap-1.5 bg-white/2 p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Top Genre</span>
                      <div className="flex items-center justify-between">
                        <Badge color="accent" className="font-semibold px-2">
                          {city.topGenreName}
                        </Badge>
                        <span className="text-xs font-bold text-teal-400">{city.dominancePct}%</span>
                      </div>
                    </div>

                    {/* All Genres list in city */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] text-white/40 uppercase tracking-wider font-bold">Keterwakilan Genre</span>
                      <div className="flex flex-col gap-1.5">
                        {city.allGenres.map((genre) => (
                          <div key={genre.name} className="flex justify-between items-center text-xs">
                            <span className="text-(--color-text-secondary) truncate max-w-[120px]">{genre.name}</span>
                            <span className="font-semibold text-white/80">{genre.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>

              <Text variant="caption" color="secondary" className="leading-relaxed bg-teal-500/5 border border-teal-500/10 p-3 rounded-lg mt-2">
                💡 <strong>Analisis RQ2</strong>: Terbukti terbentuknya spesialisasi genre spasial (*Regional Hubs*). 
                {genreMode === "primary" ? (
                  <span> Bandung dan Yogyakarta bertindak sebagai inkubator genre <strong>Indie/Folk</strong> dengan persentase dominasi yang kuat, sedangkan Jakarta bertindak sebagai pusat musik <strong>Pop</strong> komersial nasional.</span>
                ) : (
                  <span> Tag genre lokal seperti Koplo mendominasi wilayah Jawa Tengah & Timur, sedangkan tag pop/R&B urban terkonsentrasi kuat di wilayah metropolitan Jakarta.</span>
                )}
              </Text>
            </GlassCard>
          )}

          {activeTab === "rq3" && rq3Stats && (
            <GlassCard className="p-6 flex flex-col gap-8">
              <div>
                <Text variant="heading" className="font-bold text-white">
                  RQ3: Bagaimana korelasi antara lokasi asal musisi dengan jangkauan popularitas nasional mereka?
                </Text>
                <Text variant="caption" color="secondary" className="mt-1">
                  Menganalisis korelasi aksesibilitas industri geografis terhadap rata-rata popularitas digital musisi.
                </Text>
              </div>

              {/* Comparison Bars */}
              <div className="flex flex-col gap-6">
                {[
                  {
                    name: "Ibu Kota (Jakarta)",
                    description: "Pusat industri kreatif, agensi, media nasional, & label besar.",
                    avgPop: rq3Stats.jakarta.avgPopularity,
                    avgFollowers: rq3Stats.jakarta.avgFollowers,
                    color: "bg-(--color-data-1)",
                    border: "border-teal-500/30",
                    glow: "shadow-teal-500/10",
                  },
                  {
                    name: "Penyangga Jawa (Bandung, Yogya, Surabaya, dsb.)",
                    description: "Episentrum kreatif regional dengan akses industri menengah.",
                    avgPop: rq3Stats.javaRest.avgPopularity,
                    avgFollowers: rq3Stats.javaRest.avgFollowers,
                    color: "bg-sky-500",
                    border: "border-sky-500/30",
                    glow: "shadow-sky-500/10",
                  },
                  {
                    name: "Luar Jawa (Sumatera, Bali, Sulawesi, Maluku, dsb.)",
                    description: "Jarak spasial terjauh dari pusat infrastruktur industri musik nasional.",
                    avgPop: rq3Stats.outsideJava.avgPopularity,
                    avgFollowers: rq3Stats.outsideJava.avgFollowers,
                    color: "bg-amber-500",
                    border: "border-amber-500/30",
                    glow: "shadow-amber-500/10",
                  },
                ].map((zone, idx) => (
                  <div
                    key={zone.name}
                    className={`flex flex-col gap-3 p-4 rounded-xl bg-white/2 border ${zone.border} shadow-lg ${zone.glow} relative overflow-hidden`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <Text variant="heading" className="font-bold text-white">
                          {zone.name}
                        </Text>
                        <Text variant="caption" color="secondary" className="mt-0.5">
                          {zone.description}
                        </Text>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[10px] text-white/50 block font-bold uppercase tracking-wider">Rata-Rata Pengikut</span>
                          <span className="text-sm font-bold text-white">{formatNumber(zone.avgFollowers)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-white/50 block font-bold uppercase tracking-wider">Rata-Rata Popularitas</span>
                          <span className="text-lg font-bold text-teal-400">{zone.avgPop} <span className="text-xs text-white/50">/100</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Popularity Visual Bar */}
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 mt-1">
                      <motion.div
                        className={`h-full ${zone.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${zone.avgPop}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Text variant="caption" color="secondary" className="leading-relaxed bg-teal-500/5 border border-teal-500/10 p-3 rounded-lg">
                💡 <strong>Analisis RQ3</strong>: Data membuktikan adanya korelasi positif antara kedekatan geografis pusat industri (Jakarta) terhadap performa streaming. Rata-rata popularitas musisi Jakarta mencapai <strong>{rq3Stats.jakarta.avgPopularity}</strong> dengan jangkauan pengikut tertinggi, meluncur turun pada wilayah penyangga Jawa (<strong>{rq3Stats.javaRest.avgPopularity}</strong>) dan berada di tingkat terendah untuk musisi Luar Jawa (<strong>{rq3Stats.outsideJava.avgPopularity}</strong>). Hal ini memperkuat teori hambatan aksesibilitas spasial.
              </Text>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
