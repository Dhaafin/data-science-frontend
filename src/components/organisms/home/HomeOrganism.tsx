"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, CircleNotch, MapPin, MusicNote, ChartBar, Globe, Warning, Info, MagnifyingGlass, ArrowsDownUp, Question } from "@phosphor-icons/react";
import { musicService, StickinessArtistEntry } from "@/lib/api/musicService";
import {
  Header,
  KpiBar,
  ArtistDrawer,
  MapPlaceholder,
  DatabaseExplorer,
  Drawer,
  Footer,
} from "@/components/organisms";
import { ResearchPerspective } from "@/components/organisms/KpiBar";
import type { ArtistData } from "@/components/organisms";
import type { CityAggregate, ProvinceAggregate } from "@/components/organisms/InteractiveMap";

import { Text, Badge, Divider, AnimatedCounter, GlassCard, Skeleton } from "@/components/atoms";
import { Dropdown } from "@/components/molecules";
import { getGenreGroupInfo } from "@/lib/config/genreGroups";

const JAVA_PROVINCES = [
  "dki jakarta",
  "jawa barat",
  "jawa tengah",
  "jawa timur",
  "di yogyakarta",
  "banten",
];

const SPOTLIGHT_GENRES = [
  {
    name: "Mainstream Pop & Ballad",
    displayName: "Mainstream Pop & Ballad",
    description: "Pop dengan melodi manis, ballad romantis, dan aransemen vokal yang mendominasi chart musik arus utama.",
    color: "#3b82f6",
    colorClass: "from-blue-500/20 to-blue-600/5 hover:border-blue-500/30",
    glowClass: "shadow-blue-500/10 hover:shadow-blue-500/20",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    name: "Sophisticated Pop & Jazz Fusion",
    displayName: "Sophisticated Pop & Jazz",
    description: "Eksplorasi harmoni jazz, perkusi bossa nova, perkawinan vokal pop kreatif, dan progresi akord kompleks.",
    color: "#06b6d4",
    colorClass: "from-cyan-500/20 to-cyan-600/5 hover:border-cyan-500/30",
    glowClass: "shadow-cyan-500/10 hover:shadow-cyan-500/20",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    name: "R&B, Soul & Urban Grooves",
    displayName: "R&B, Soul & Urban",
    description: "Lantunan vokal melismatik, ketukan R&B lambat, groove bass urban yang tebal, dan ekspresi emosi soul mendalam.",
    color: "#f43f5e",
    colorClass: "from-rose-500/20 to-rose-600/5 hover:border-rose-500/30",
    glowClass: "shadow-rose-500/10 hover:shadow-rose-500/20",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  {
    name: "Hip-Hop, Rap & Electronic Beats",
    displayName: "Hip-Hop & Electronic",
    description: "Ketukan beat digital, rima rap cepat, musik dansa elektronik, dan aransemen synthesizer urban modern.",
    color: "#f97316",
    colorClass: "from-orange-500/20 to-orange-600/5 hover:border-orange-500/30",
    glowClass: "shadow-orange-500/10 hover:shadow-orange-500/20",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  {
    name: "J-Pop & ACG Subculture",
    displayName: "J-Pop & ACG",
    description: "Musik kultur pop Jepang, lagu anime bertempo cepat, vokal bernada tinggi, dan pengaruh subkultur ACG.",
    color: "#84cc16",
    colorClass: "from-lime-500/20 to-lime-600/5 hover:border-lime-500/30",
    glowClass: "shadow-lime-500/10 hover:shadow-lime-500/20",
    badgeColor: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  },
  {
    name: "Classic & Heritage Rock",
    displayName: "Classic & Heritage Rock",
    description: "Distorsi gitar elektrik, riff perkasa, dan ketukan drum bertenaga tinggi yang diwarisi dari era keemasan rock.",
    color: "#eab308",
    colorClass: "from-yellow-500/20 to-yellow-600/5 hover:border-yellow-500/30",
    glowClass: "shadow-yellow-500/10 hover:shadow-yellow-500/20",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  {
    name: "Indie & Alternative",
    displayName: "Indie & Alternative",
    description: "Musik independen dengan eksplorasi genre lo-fi, shoegaze, alternative rock, hingga folk kontemplatif.",
    color: "#10b981",
    colorClass: "from-emerald-500/20 to-emerald-600/5 hover:border-emerald-500/30",
    glowClass: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    name: "Heavy & Underground",
    displayName: "Heavy & Underground",
    description: "Musik metal ekstrim, hardcore punk, distorsi penuh amarah, tempo agresif, dan vokal harsh/growl.",
    color: "#dc2626",
    colorClass: "from-red-500/20 to-red-600/5 hover:border-red-500/30",
    glowClass: "shadow-red-500/10 hover:shadow-red-500/20",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  {
    name: "Dangdut & Koplo",
    displayName: "Dangdut & Koplo",
    description: "Revolusi ketukan kendang tradisional Indonesia yang berpadu dengan unsur disko modern, ska, dan funk.",
    color: "#8b5cf6",
    colorClass: "from-violet-500/20 to-violet-600/5 hover:border-violet-500/30",
    glowClass: "shadow-violet-500/10 hover:shadow-violet-500/20",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  {
    name: "Regional Roots & Folk",
    displayName: "Regional Roots & Folk",
    description: "Lagu daerah berbahasa lokal (Jawa, Sunda, Batak, Minang, dsb.) dikombinasikan dengan musik akustik folk.",
    color: "#b45309",
    colorClass: "from-amber-500/20 to-amber-600/5 hover:border-amber-500/30",
    glowClass: "shadow-amber-500/10 hover:shadow-amber-500/20",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    name: "Spiritual & Devotional",
    displayName: "Spiritual & Devotional",
    description: "Musik religi, selawat spiritual, dan kidung pemujaan yang didedikasikan untuk kontemplasi spiritual.",
    color: "#94a3b8",
    colorClass: "from-slate-500/20 to-slate-600/5 hover:border-slate-500/30",
    glowClass: "shadow-slate-500/10 hover:shadow-slate-500/20",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }
];

/**
 * Home — Selasar Suara unified vertical-scroll page
 *
 * Layout: Sticky Header → Immersive Map (80vh) → Analytical sections.
 * Replaces the old sidebar-driven conditional view architecture.
 * All navigation is handled via smooth-scroll anchors in Header.tsx.
 */

export default function HomeOrganism() {
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [portalTooltip, setPortalTooltip] = useState<{
    title: string;
    description: string;
    formula?: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseEnterTooltip = (e: React.MouseEvent<HTMLElement>, title: string, description: string, formula?: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPortalTooltip({
      title,
      description,
      formula,
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY,
    });
  };

  const handleMouseLeaveTooltip = () => {
    setPortalTooltip(null);
  };
  const [selectedCity, setSelectedCity] = useState<CityAggregate | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceAggregate | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activePerspective, setActivePerspective] = useState<ResearchPerspective>("sebaran");
  const [cityData, setCityData] = useState<CityAggregate[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("Semua");
  const [selectedFormat, setSelectedFormat] = useState<string>("Semua");
  const [radiusMetric, setRadiusMetric] = useState<'followers' | 'count'>("count");
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<StickinessArtistEntry[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [genreMode, setGenreMode] = useState<"primary" | "tags">("primary");
  const [sebaranGranularity, setSebaranGranularity] = useState<'pulau' | 'provinsi' | 'kota'>('kota');
  const [selectedKpiGenreCity, setSelectedKpiGenreCity] = useState<string>("Jakarta");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"count" | "followers" | "popularity" | "name">("count");

  const mapMode = activePerspective === "aksesibilitas" ? "popularity" : "density";

  // Load all artists for dynamic client-side research statistics
  useEffect(() => {
    async function loadData() {
      try {
        setIsDataLoading(true);
        const data = await musicService.getStickinessData();
        setArtists(data);
      } catch (err) {
        console.error("Failed to load raw artist dataset:", err);
      } finally {
        setIsDataLoading(false);
      }
    }
    loadData();
  }, []);

  const genreOptions = useMemo(() => {
    const options = [{ label: "Semua Genre", value: "Semua" }];
    availableGenres.forEach((g) => {
      const label = g
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      options.push({ label, value: g });
    });
    return options;
  }, [availableGenres]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleCitySelect = (city: CityAggregate | null) => {
    setSelectedCity(city);
    setSelectedProvince(null); // Clear province drawer if open
    setVisibleCount(10);
    setShowBackToTop(false);
  };

  const handleProvinceSelect = (prov: ProvinceAggregate | null) => {
    setSelectedProvince(prov);
    setSelectedCity(null); // Clear city drawer if open
    setVisibleCount(10);
    setShowBackToTop(false);
  };

  // Bind scroll handler to show/hide "Back to Top" button
  useEffect(() => {
    if (!selectedCity && !selectedProvince) return;

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
  }, [selectedCity, selectedProvince]);

  // IntersectionObserver to auto-trigger loading more artists as scroll approaches sentinel
  useEffect(() => {
    if (!selectedCity && !selectedProvince) return;
    const totalLength = selectedCity ? selectedCity.topArtists.length : selectedProvince?.topArtists.length || 0;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 10, totalLength));
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
  }, [selectedCity, selectedProvince, visibleCount]);

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

  // ═══════════════════════════════════════════════════════
  // Dynamic Calculations for the 3 Research Perspectives
  // ═══════════════════════════════════════════════════════
  const normalizeCity = (city: string): string => {
    const c = city.toLowerCase().trim();
    if (c.includes("jakarta")) return "Jakarta";
    if (c.includes("yogyakarta") || c.includes("sleman") || c.includes("bantul")) return "Yogyakarta";
    return city.charAt(0).toUpperCase() + city.slice(1);
  };

  // RQ1: Sebaran
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
    const javaFollowersPct = totalFollowers > 0 ? Math.round((javaFollowers / totalFollowers) * 100) : 0;
    const outsideArtistPct = 100 - javaArtistPct;
    const outsideFollowersPct = 100 - javaFollowersPct;

    const topCities = Array.from(cityMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((c) => ({
        ...c,
        avgPopularity: Math.round(c.totalPop / c.count),
      }));

    const jakartaArtistsCount = artists.filter(a => normalizeCity(a.originCity).toLowerCase() === "jakarta").length;
    const jci = totalArtists > 0 ? Math.round((jakartaArtistsCount / totalArtists) * 100) : 0;

    const javaArtists = artists.filter(a => {
      const p = a.originProvince.toLowerCase().trim();
      return p && p !== "unknown" && p !== "null" && JAVA_PROVINCES.includes(p);
    });
    const outsideJavaArtists = artists.filter(a => {
      const p = a.originProvince.toLowerCase().trim();
      return p && p !== "unknown" && p !== "null" && !JAVA_PROVINCES.includes(p);
    });
    const javaAvgPop = javaArtists.length > 0 ? javaArtists.reduce((acc, a) => acc + (a.popularity || 0), 0) / javaArtists.length : 0;
    const outsideJavaAvgPop = outsideJavaArtists.length > 0 ? outsideJavaArtists.reduce((acc, a) => acc + (a.popularity || 0), 0) / outsideJavaArtists.length : 0;
    const popGap = Math.round(Math.abs(javaAvgPop - outsideJavaAvgPop) * 10) / 10;

    return {
      javaArtistPct,
      javaFollowersPct,
      outsideArtistPct,
      outsideFollowersPct,
      topCities,
      totalArtists,
      totalFollowers,
      jci,
      popGap,
    };
  }, [artists]);

  useEffect(() => {
    if (rq1Stats && rq1Stats.topCities.length > 0) {
      setSelectedKpiGenreCity(rq1Stats.topCities[0].name);
    }
  }, [rq1Stats]);

  const genreCityOptions = useMemo(() => {
    if (artists.length === 0) return [];
    const citiesSet = new Set(artists.map((a) => normalizeCity(a.originCity)).filter(Boolean));
    return Array.from(citiesSet)
      .sort()
      .map((c) => ({ label: c, value: c }));
  }, [artists]);

  const genreKpisForCity = useMemo(() => {
    if (artists.length === 0 || !selectedKpiGenreCity) {
      return {
        topGenreInCity: "N/A",
        topGenreInCityVal: 0,
        leastGenreInCity: "N/A",
        leastGenreInCityVal: 0,
      };
    }

    const cityArtists = artists.filter(
      (a) => normalizeCity(a.originCity).toLowerCase() === selectedKpiGenreCity.toLowerCase()
    );

    const freqMap = new Map<string, number>();
    
    if (genreMode === "primary") {
      cityArtists.forEach((art) => {
        const pg = art.primaryGenre ? art.primaryGenre.trim() : "Lainnya";
        const formattedGenre = pg
          .split(" ")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
        freqMap.set(formattedGenre, (freqMap.get(formattedGenre) || 0) + 1);
      });
    } else {
      cityArtists.forEach((art) => {
        const tags: string[] = art.primaryGenre ? [art.primaryGenre, ...(art.genres || [])] : art.genres || [];
        const uniqueTags = Array.from(new Set(tags.map((t: string) => t.toLowerCase().trim())));
        uniqueTags.forEach((tag: string) => {
          const formattedTag = tag
            .split(" ")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          freqMap.set(formattedTag, (freqMap.get(formattedTag) || 0) + 1);
        });
      });
    }

    if (freqMap.size === 0) {
      return {
        topGenreInCity: "N/A",
        topGenreInCityVal: 0,
        leastGenreInCity: "N/A",
        leastGenreInCityVal: 0,
      };
    }

    const sortedGenres = Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1]);
    const [topGenreInCity, topGenreInCityVal] = sortedGenres[0] || ["N/A", 0];
    const [leastGenreInCity, leastGenreInCityVal] = sortedGenres[sortedGenres.length - 1] || ["N/A", 0];

    return {
      topGenreInCity,
      topGenreInCityVal,
      leastGenreInCity,
      leastGenreInCityVal,
    };
  }, [artists, selectedKpiGenreCity, genreMode]);

  // Compute dynamic Sebaran KPIs based on selected scale granularity and filters
  const sebaranKpis = useMemo(() => {
    const filtered = artists.filter((art) => {
      if (selectedGenre !== "Semua") {
        if (art.primaryGenre?.toLowerCase() !== selectedGenre.toLowerCase()) {
          return false;
        }
      }
      if (selectedFormat !== "Semua") {
        const type = art.artistType === "Group" ? "Band" : "Soloist";
        if (type !== selectedFormat) {
          return false;
        }
      }
      return true;
    });

    const getIslandForProvince = (province: string): string => {
      const p = province.toLowerCase().trim();
      if (p.includes("jakarta") || p.includes("banten") || p.includes("jawa") || p.includes("yogyakarta")) return "Jawa";
      if (p.includes("sumatera") || p.includes("aceh") || p.includes("riau") || p.includes("jambi") || p.includes("bengkulu") || p.includes("lampung") || p.includes("bangka")) return "Sumatera";
      if (p.includes("sulawesi") || p.includes("gorontalo")) return "Sulawesi";
      if (p.includes("bali") || p.includes("nusa tenggara") || p.includes("ntb") || p.includes("ntt")) return "Nusa Tenggara";
      if (p.includes("kalimantan")) return "Kalimantan";
      if (p.includes("maluku")) return "Maluku";
      if (p.includes("papua")) return "Papua";
      return "Lainnya";
    };

    if (sebaranGranularity === "pulau") {
      const islandMap = new Map<string, { count: number; totalPop: number }>();
      filtered.forEach((art) => {
        const island = getIslandForProvince(art.originProvince);
        if (island === "Lainnya") return;
        const current = islandMap.get(island) || { count: 0, totalPop: 0 };
        current.count += 1;
        current.totalPop += art.popularity || 0;
        islandMap.set(island, current);
      });

      const list = Array.from(islandMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        totalPop: data.totalPop,
      }));

      if (list.length === 0) {
        return {
          mostDenseName: "N/A", mostDenseVal: 0,
          mostPopularName: "N/A", mostPopularVal: 0,
          leastDenseName: "N/A", leastDenseVal: 0,
          leastPopularName: "N/A", leastPopularVal: 0,
        };
      }
      const sortedByCount = [...list].sort((a, b) => b.count - a.count);
      const sortedByPop = [...list].sort((a, b) => b.totalPop - a.totalPop);

      return {
        mostDenseName: sortedByCount[0].name,
        mostDenseVal: sortedByCount[0].count,
        mostPopularName: sortedByPop[0].name,
        mostPopularVal: sortedByPop[0].totalPop,
        leastDenseName: sortedByCount[sortedByCount.length - 1].name,
        leastDenseVal: sortedByCount[sortedByCount.length - 1].count,
        leastPopularName: sortedByPop[sortedByPop.length - 1].name,
        leastPopularVal: sortedByPop[sortedByPop.length - 1].totalPop,
      };
    }

    if (sebaranGranularity === "provinsi") {
      const provinceMap = new Map<string, { count: number; totalPop: number }>();
      filtered.forEach((art) => {
        const prov = art.originProvince?.trim() || "";
        if (!prov || prov.toLowerCase() === "unknown") return;
        const current = provinceMap.get(prov) || { count: 0, totalPop: 0 };
        current.count += 1;
        current.totalPop += art.popularity || 0;
        provinceMap.set(prov, current);
      });

      const list = Array.from(provinceMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        totalPop: data.totalPop,
      }));

      if (list.length === 0) {
        return {
          mostDenseName: "N/A", mostDenseVal: 0,
          mostPopularName: "N/A", mostPopularVal: 0,
          leastDenseName: "N/A", leastDenseVal: 0,
          leastPopularName: "N/A", leastPopularVal: 0,
        };
      }
      const sortedByCount = [...list].sort((a, b) => b.count - a.count);
      const sortedByPop = [...list].sort((a, b) => b.totalPop - a.totalPop);

      return {
        mostDenseName: sortedByCount[0].name,
        mostDenseVal: sortedByCount[0].count,
        mostPopularName: sortedByPop[0].name,
        mostPopularVal: sortedByPop[0].totalPop,
        leastDenseName: sortedByCount[sortedByCount.length - 1].name,
        leastDenseVal: sortedByCount[sortedByCount.length - 1].count,
        leastPopularName: sortedByPop[sortedByPop.length - 1].name,
        leastPopularVal: sortedByPop[sortedByPop.length - 1].totalPop,
      };
    }

    // default: "kota"
    const cityMap = new Map<string, { count: number; totalPop: number }>();
    filtered.forEach((art) => {
      const city = normalizeCity(art.originCity);
      if (!city || city.toLowerCase() === "unknown") return;
      const current = cityMap.get(city) || { count: 0, totalPop: 0 };
      current.count += 1;
      current.totalPop += art.popularity || 0;
      cityMap.set(city, current);
    });

    const list = Array.from(cityMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      totalPop: data.totalPop,
    }));

    if (list.length === 0) {
      return {
        mostDenseName: "N/A", mostDenseVal: 0,
        mostPopularName: "N/A", mostPopularVal: 0,
        leastDenseName: "N/A", leastDenseVal: 0,
        leastPopularName: "N/A", leastPopularVal: 0,
      };
    }
    const sortedByCount = [...list].sort((a, b) => b.count - a.count);
    const sortedByPop = [...list].sort((a, b) => b.totalPop - a.totalPop);

    return {
      mostDenseName: sortedByCount[0].name,
      mostDenseVal: sortedByCount[0].count,
      mostPopularName: sortedByPop[0].name,
      mostPopularVal: sortedByPop[0].totalPop,
      leastDenseName: sortedByCount[sortedByCount.length - 1].name,
      leastDenseVal: sortedByCount[sortedByCount.length - 1].count,
      leastPopularName: sortedByPop[sortedByPop.length - 1].name,
      leastPopularVal: sortedByPop[sortedByPop.length - 1].totalPop,
    };
  }, [artists, selectedGenre, selectedFormat, sebaranGranularity]);

  // Island Stats calculation for below-the-fold display
  const islandStats = useMemo(() => {
    if (artists.length === 0) return [];
    
    const getIslandForProvince = (province: string): string => {
      const p = province.toLowerCase().trim();
      if (
        p.includes("jakarta") ||
        p.includes("banten") ||
        p.includes("jawa") ||
        p.includes("yogyakarta")
      ) {
        return "Jawa";
      }
      if (
        p.includes("sumatera") ||
        p.includes("aceh") ||
        p.includes("riau") ||
        p.includes("jambi") ||
        p.includes("bengkulu") ||
        p.includes("lampung") ||
        p.includes("bangka")
      ) {
        return "Sumatera";
      }
      if (p.includes("sulawesi") || p.includes("gorontalo")) {
        return "Sulawesi";
      }
      if (
        p.includes("bali") ||
        p.includes("nusa tenggara") ||
        p.includes("ntb") ||
        p.includes("ntt")
      ) {
        return "Nusa Tenggara";
      }
      if (p.includes("kalimantan")) {
        return "Kalimantan";
      }
      if (p.includes("maluku")) {
        return "Maluku";
      }
      if (p.includes("papua")) {
        return "Papua";
      }
      return "Lainnya";
    };

    const islandMap = new Map<string, { name: string; count: number; followers: number; totalPop: number }>();
    let grandTotalFollowers = 0;

    artists.forEach((art) => {
      const island = getIslandForProvince(art.originProvince);
      if (island === "Lainnya") return;
      const followers = art.followers || 0;
      grandTotalFollowers += followers;

      const current = islandMap.get(island) || { name: island, count: 0, followers: 0, totalPop: 0 };
      current.count += 1;
      current.followers += followers;
      current.totalPop += art.popularity || 0;
      islandMap.set(island, current);
    });

    return Array.from(islandMap.values())
      .map((i) => ({
        ...i,
        avgPopularity: i.count > 0 ? Math.round(i.totalPop / i.count) : 0,
        pctShare: Math.round((i.count / artists.length) * 100),
        followersPctShare: grandTotalFollowers > 0 ? Math.round((i.followers / grandTotalFollowers) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [artists]);

  // Province Stats calculation for below-the-fold display
  const provinceStats = useMemo(() => {
    if (artists.length === 0) return [];
    
    const provinceMap = new Map<string, { name: string; count: number; followers: number; totalPop: number }>();

    artists.forEach((art) => {
      const prov = art.originProvince.trim();
      if (!prov || prov.toLowerCase() === "unknown") return;

      const followers = art.followers || 0;
      const current = provinceMap.get(prov) || { name: prov, count: 0, followers: 0, totalPop: 0 };
      current.count += 1;
      current.followers += followers;
      current.totalPop += art.popularity || 0;
      provinceMap.set(prov, current);
    });

    return Array.from(provinceMap.values())
      .map((p) => ({
        ...p,
        avgPopularity: p.count > 0 ? Math.round(p.totalPop / p.count) : 0,
        pctShare: Math.round((p.count / artists.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 provinces
  }, [artists]);

  // RQ2: Standalone Genre Spotlights (Independent of map filters)
  const genreSpotlights = useMemo(() => {
    if (artists.length === 0) return [];

    // Precalculate total artists per normalized city to calculate dominance percentage
    const totalArtistsPerCity = new Map<string, number>();
    artists.forEach((art) => {
      const city = normalizeCity(art.originCity);
      if (!city || city.toLowerCase() === "unknown") return;
      totalArtistsPerCity.set(city, (totalArtistsPerCity.get(city) || 0) + 1);
    });

    return SPOTLIGHT_GENRES.map((genreDef) => {
      // Filter artists matching this specific genre group
      const genreArtists = artists.filter(
        (art) => getGenreGroupInfo(art.primaryGenre || "").name === genreDef.name
      );

      // Group these genre artists by city
      const cityCounts = new Map<string, { count: number; artists: StickinessArtistEntry[] }>();
      genreArtists.forEach((art) => {
        const city = normalizeCity(art.originCity);
        if (!city || city.toLowerCase() === "unknown") return;
        
        const current = cityCounts.get(city) || { count: 0, artists: [] };
        current.count += 1;
        current.artists.push(art);
        cityCounts.set(city, current);
      });

      // Find the city with the maximum count
      const sortedCities = Array.from(cityCounts.entries()).sort(
        (a, b) => b[1].count - a[1].count
      );

      const topCityName = sortedCities[0] ? sortedCities[0][0] : "N/A";
      const topCityData = sortedCities[0] ? sortedCities[0][1] : null;

      const totalCityArtists = totalArtistsPerCity.get(topCityName) || 1;
      const dominancePct = topCityData ? Math.round((topCityData.count / totalCityArtists) * 100) : 0;
      const genreCount = topCityData ? topCityData.count : 0;

      // Select top 3 representative artists by popularity (descending)
      const repArtists = topCityData
        ? [...topCityData.artists]
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 3)
            .map((art) => ({
              name: art.name,
              profilePicture: art.profilePicture,
              popularity: art.popularity || 0,
              genres: art.genres || [],
              primaryGenre: art.primaryGenre,
              artistType: art.artistType,
              originCity: art.originCity,
              originProvince: art.originProvince
            }))
        : [];

      return {
        ...genreDef,
        epicenter: topCityName,
        genreCount,
        dominancePct,
        repArtists,
      };
    });
  }, [artists]);

  // RQ2: Genre Hubs
  const rq2Stats = useMemo(() => {
    if (artists.length === 0 || !rq1Stats) return null;

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
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          freqMap.set(formattedGenre, (freqMap.get(formattedGenre) || 0) + 1);
        });
      } else {
        cityArtists.forEach((art) => {
          const tags: string[] = art.primaryGenre ? [art.primaryGenre, ...(art.genres || [])] : art.genres || [];
          const uniqueTags = Array.from(new Set(tags.map((t: string) => t.toLowerCase().trim())));
          uniqueTags.forEach((tag: string) => {
            const formattedTag = tag
              .split(" ")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
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

  // RQ3: Aksesibilitas
  const rq3Stats = useMemo(() => {
    if (artists.length === 0) return null;

    const groups = {
      jakarta: { totalPop: 0, totalFollowers: 0, count: 0 },
      javaRest: { totalPop: 0, totalFollowers: 0, count: 0 },
      outsideJava: { totalPop: 0, totalFollowers: 0, count: 0 },
    };

    artists.forEach((art) => {
      const normCity = normalizeCity(art.originCity);
      const prov = art.originProvince.toLowerCase().trim();
      if (!prov || prov === "unknown" || prov === "null") return;

      const isJava = JAVA_PROVINCES.includes(prov);
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

  // Filter and sort cityData for All-Cities Spatial Explorer
  const filteredAndSortedCities = useMemo(() => {
    return cityData
      .filter((c) => c.city.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "count") {
          return b.count - a.count;
        }
        if (sortBy === "followers") {
          return b.totalFollowers - a.totalFollowers;
        }
        if (sortBy === "popularity") {
          return b.avgPopularity - a.avgPopularity;
        }
        if (sortBy === "name") {
          return a.city.localeCompare(b.city);
        }
        return 0;
      });
  }, [cityData, searchQuery, sortBy]);

  const genreDiversity = useMemo(() => {
    const genresSet = new Set(artists.map((a) => a.primaryGenre).filter(Boolean));
    return genresSet.size;
  }, [artists]);

  const indieEpicenter = useMemo(() => {
    const indieArtists = artists.filter((a) => (a.primaryGenre || "").toLowerCase() === "indie");
    const counts = new Map<string, number>();
    indieArtists.forEach((a) => {
      const c = normalizeCity(a.originCity);
      counts.set(c, (counts.get(c) || 0) + 1);
    });
    let epicenter = "Bandung";
    let max = 0;
    counts.forEach((count, city) => {
      if (count > max) {
        max = count;
        epicenter = city;
      }
    });
    return epicenter;
  }, [artists]);

  const koploEpicenter = useMemo(() => {
    const koploArtists = artists.filter((a) => {
      const pg = (a.primaryGenre || "").toLowerCase();
      return pg === "dangdut" || pg === "koplo";
    });
    const counts = new Map<string, number>();
    koploArtists.forEach((a) => {
      const c = normalizeCity(a.originCity);
      counts.set(c, (counts.get(c) || 0) + 1);
    });
    let epicenter = "Yogyakarta";
    let max = 0;
    counts.forEach((count, city) => {
      if (count > max) {
        max = count;
        epicenter = city;
      }
    });
    return epicenter;
  }, [artists]);

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
        className="max-w-5xl mx-auto w-full px-6 pt-20 pb-4 flex flex-col h-[90vh]"
      >
        {/* Unified Map Control Center & KPI Station */}
        <div className="bg-[#121212]/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex flex-col mb-4 overflow-hidden">
          {/* Top Panel: KPIs & Mode selector */}
          <KpiBar
            activePerspective={activePerspective}
            onPerspectiveChange={setActivePerspective}
            
            // Perspective 1 (Sebaran)
            sebaranGranularity={sebaranGranularity}
            sebaranKpis={sebaranKpis}

            // Perspective 2 (Genre)
            genreMode={genreMode}
            
            // Perspective 3 (Aksesibilitas)
            avgPopJakarta={rq3Stats?.jakarta.avgPopularity ?? 0}
            avgPopJava={rq3Stats?.javaRest.avgPopularity ?? 0}
            avgPopOutside={rq3Stats?.outsideJava.avgPopularity ?? 0}
            gapPop={rq3Stats ? Math.abs(rq3Stats.jakarta.avgPopularity - rq3Stats.outsideJava.avgPopularity) : 0}
          />

          {/* Separator line */}
          <div className="h-[1px] bg-white/10 mx-4" />

          {/* Bottom Panel: Filter Controls (Nested seamlessly based on perspective) */}
          <div className="flex flex-wrap items-center justify-between gap-6 p-4 pt-2 min-h-[58px]">
            {activePerspective === "sebaran" && (
              <>
                {/* Left: Granularity Selector */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-teal-400 tracking-wider uppercase">Skala Wilayah</span>
                  <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/5">
                    {[
                      { label: "Pulau", value: "pulau" },
                      { label: "Provinsi", value: "provinsi" },
                      { label: "Kota", value: "kota" }
                    ].map((gran) => (
                      <button
                        key={gran.value}
                        onClick={() => setSebaranGranularity(gran.value as any)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                          sebaranGranularity === gran.value
                            ? "bg-teal-500/10 text-teal-400 border border-teal-500/25"
                            : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        {gran.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Center & Right: Format selector */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* Format Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase">Format</span>
                    <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/5">
                      {[
                        { label: "Semua", value: "Semua" },
                        { label: "Soloist", value: "Soloist" },
                        { label: "Band", value: "Band" }
                      ].map((fmt) => (
                        <button
                          key={fmt.value}
                          onClick={() => setSelectedFormat(fmt.value)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                            selectedFormat === fmt.value
                              ? "bg-teal-500/10 text-teal-400 border border-teal-500/25"
                              : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePerspective === "genre" && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase">Metode Analisis</span>
                <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/5">
                  {[
                    { label: "Genre Utama", id: "primary" },
                    { label: "Tag Genre (Tags)", id: "tags" }
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
            )}

            {activePerspective === "aksesibilitas" && (
              <>
                <div className="flex items-center gap-2">
                  <ChartBar size={16} className="text-rose-400" />
                  <span className="text-xs text-white/70 font-medium">Analisis Korelasi Aksesibilitas Geografis & Popularitas</span>
                </div>
                <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Skala Warna Peta: Biru (Rendah) ➔ Hijau (Rata-Rata) ➔ Merah (Tinggi)
                </div>
              </>
            )}
          </div>
        </div>

        {/* Map canvas — fills remaining height */}
        <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden border border-(--color-border-default)">
          <MapPlaceholder 
            mapMode={mapMode}
            selectedGenre={selectedGenre}
            selectedFormat={selectedFormat}
            radiusMetric={radiusMetric}
            sebaranGranularity={sebaranGranularity}
            activePerspective={activePerspective}
            genreMode={genreMode}
            onArtistClick={setSelectedArtist} 
            onCityClick={handleCitySelect} 
            onProvinceClick={handleProvinceSelect}
            onDataLoaded={setCityData}
            onGenresLoaded={setAvailableGenres}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Below-the-fold analytical sections
          Constrained to max-w-5xl for readability on wide screens
          ═══════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col gap-16 py-12">
        {/* Dynamic Showcase based on Active Research Perspective */}
        <section id="research-analysis" className="scroll-mt-20">
          {isDataLoading ? (
            <GlassCard className="p-6 flex flex-col gap-6" key="skeleton-loading">
              <Skeleton className="h-6 w-1/3 rounded" />
              <Skeleton className="h-24 w-full rounded" />
              <Skeleton className="h-16 w-full rounded" />
            </GlassCard>
          ) : (
            <div className="flex flex-col gap-8">
              {rq1Stats && (
                <GlassCard className="p-6 flex flex-col gap-6">
                  <div>
                    <Text variant="heading" className="font-bold text-white flex items-center gap-2">
                      <MapPin size={20} className="text-teal-400" />
                      Analisis Geografis: Sebaran & Kepadatan Musisi Populer
                    </Text>
                    <Text variant="caption" color="secondary" className="mt-1">
                      Memvisualisasikan hegemoni spasial industri musik Indonesia berdasarkan tingkat kedalaman wilayah (Fokus: {sebaranGranularity === "pulau" ? "Skala Pulau" : sebaranGranularity === "provinsi" ? "Skala Provinsi" : "Skala Perkotaan"}).
                    </Text>
                  </div>

                  {/* 1. PULAU GRANULARITY DISPLAY */}
                  {sebaranGranularity === "pulau" && (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/2 p-5 rounded-xl border border-white/5">
                        {/* Java vs Outside Java representation */}
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white/90">Kepadatan Musisi Jawa vs Luar Jawa</span>
                            <span className="text-teal-400 font-bold">{rq1Stats.javaArtistPct}% Jawa</span>
                          </div>
                          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                            <motion.div
                              className="bg-teal-500 h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${rq1Stats.javaArtistPct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-white/50">
                            <span>Pulau Jawa ({rq1Stats.javaArtistPct}%)</span>
                            <span>Luar Jawa ({rq1Stats.outsideArtistPct}%)</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white/90">Pangsa Pengikut Jawa vs Luar Jawa</span>
                            <span className="text-sky-400 font-bold">{rq1Stats.javaFollowersPct}% Jawa</span>
                          </div>
                          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                            <motion.div
                              className="bg-sky-500 h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${rq1Stats.javaFollowersPct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-white/50">
                            <span>Pulau Jawa ({rq1Stats.javaFollowersPct}%)</span>
                            <span>Luar Jawa ({rq1Stats.outsideFollowersPct}%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Island Comparison Table */}
                      <div className="flex flex-col gap-3">
                        <Text variant="label" className="font-bold text-white/90">
                          Distribusi Lengkap Berdasarkan Pulau
                        </Text>
                        <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
                          <div className="grid grid-cols-4 p-3 bg-white/5 border-b border-white/5 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                            <span>Nama Pulau</span>
                            <span className="text-center">Jumlah Musisi</span>
                            <span className="text-right">Total Followers</span>
                            <span className="text-right">Kontribusi Pangsa</span>
                          </div>
                          {islandStats.map((island) => (
                            <div
                              key={island.name}
                              className="grid grid-cols-4 p-3 border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors text-xs items-center"
                            >
                              <span className="font-bold text-white">{island.name}</span>
                              <span className="text-center text-white">{island.count}</span>
                              <span className="text-right text-(--color-text-secondary)">{formatFollowers(island.followers)}</span>
                              <span className="text-right text-teal-400 font-bold">{island.pctShare}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. PROVINSI GRANULARITY DISPLAY */}
                  {sebaranGranularity === "provinsi" && (
                    <div className="flex flex-col gap-3">
                      <Text variant="label" className="font-bold text-white/90">
                        Peringkat 10 Provinsi Teratas Asal Musisi
                      </Text>
                      <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
                        <div className="grid grid-cols-4 p-3 bg-white/5 border-b border-white/5 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                          <span>Nama Provinsi</span>
                          <span className="text-center">Jumlah Musisi</span>
                          <span className="text-right">Pangsa (%)</span>
                          <span className="text-right font-medium">Avg Popularity</span>
                        </div>
                        {provinceStats.map((prov, idx) => (
                          <div
                            key={prov.name}
                            className="grid grid-cols-4 p-3 border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors text-xs items-center"
                          >
                            <div className="flex items-center gap-2 font-semibold text-white">
                              <span className="text-white/40 font-mono w-4">{idx + 1}.</span>
                              <span>{prov.name}</span>
                            </div>
                            <span className="text-center text-white font-bold">{prov.count}</span>
                            <span className="text-right text-(--color-text-secondary)">{prov.pctShare}%</span>
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="font-bold text-teal-400">{prov.avgPopularity}</span>
                              <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div
                                  className="bg-teal-500 h-full"
                                  style={{ width: `${prov.avgPopularity}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. KOTA GRANULARITY DISPLAY */}
                  {sebaranGranularity === "kota" && (
                    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                      {/* Left Column: Spatial Inequality Metrics */}
                      <div className="flex flex-col gap-4 lg:w-1/3">
                        <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                          <Text variant="label" className="font-bold text-white/95 text-xs tracking-wider uppercase">
                            Indikator Sentralisasi & Ketimpangan
                          </Text>
                          
                          {/* Jakarta Centralization Index */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <div className="relative flex items-center gap-1 group/tooltip">
                                <span className="text-white/70 text-[11px] cursor-help">Jakarta Centralization (JCI)</span>
                                <Question size={14} className="text-white/40 hover:text-white cursor-help transition-colors" />
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 p-4 bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none text-left">
                                  <div className="text-xs font-bold text-teal-400 mb-1">Jakarta Centralization Index (JCI)</div>
                                  <div className="text-[10px] text-teal-400/90 font-mono mb-2">Formula: (Musisi Jkt / Total Musisi) × 100%</div>
                                  <div className="text-[11px] text-white/80 leading-relaxed font-normal">
                                    Mengukur konsentrasi talenta di ibu kota. Indeks tinggi menunjukkan struktur pasar yang Jakarta-sentris, mencerminkan ketimpangan akses infrastruktur industri musik di daerah lain.
                                  </div>
                                </div>
                              </div>
                              <span className="font-bold text-teal-400">{rq1Stats.jci}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div
                                className="bg-teal-500 h-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${rq1Stats.jci}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                            <span className="text-[9px] text-white/40">
                              Proporsi musisi populer nasional yang terpusat di wilayah DKI Jakarta.
                            </span>
                          </div>

                          {/* Java Dominance Ratio (Followers) */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <div className="relative flex items-center gap-1 group/tooltip">
                                <span className="text-white/70 text-[11px] cursor-help">Java Dominance Ratio (JDR)</span>
                                <Question size={14} className="text-white/40 hover:text-white cursor-help transition-colors" />
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 p-4 bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none text-left">
                                  <div className="text-xs font-bold text-sky-400 mb-1">Java Dominance Ratio (JDR)</div>
                                  <div className="text-[10px] text-sky-400/90 font-mono mb-2">Formula: (Followers Jawa / Total Followers) × 100%</div>
                                  <div className="text-[11px] text-white/80 leading-relaxed font-normal">
                                    Mengukur dominasi komersial musisi asal Jawa dalam menggaet pangsa pengikut digital nasional. Rasio tinggi menyoroti hegemoni pasar pendengar yang timpang di luar Jawa.
                                  </div>
                                </div>
                              </div>
                              <span className="font-bold text-sky-400">{rq1Stats.javaFollowersPct}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div
                                className="bg-sky-500 h-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${rq1Stats.javaFollowersPct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                            <span className="text-[9px] text-white/40">
                              Penguasaan pangsa pasar pengikut (followers) digital oleh musisi asal Jawa.
                            </span>
                          </div>

                          {/* Outer-Java Popularity Gap */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <div className="relative flex items-center gap-1 group/tooltip">
                                <span className="text-white/70 text-[11px] cursor-help">Outer-Java Popularity Gap</span>
                                <Question size={14} className="text-white/40 hover:text-white cursor-help transition-colors" />
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 p-4 bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none text-left">
                                  <div className="text-xs font-bold text-rose-400 mb-1">Outer-Java Popularity Gap</div>
                                  <div className="text-[10px] text-rose-400/90 font-mono mb-2">Formula: |Rerata Pop Jawa - Rerata Pop Luar Jawa|</div>
                                  <div className="text-[11px] text-white/80 leading-relaxed font-normal">
                                    Selisih rata-rata skor popularitas musisi di Pulau Jawa vs Luar Jawa. Kesenjangan tinggi menunjukkan musisi luar Jawa menghadapi hambatan eksposur yang signifikan.
                                  </div>
                                </div>
                              </div>
                              <span className="font-bold text-rose-400">{rq1Stats.popGap} Poin</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div
                                className="bg-rose-500 h-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(rq1Stats.popGap / 100) * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                            <span className="text-[9px] text-white/40">
                              Selisih rata-rata skor popularitas musisi di Pulau Jawa vs Luar Jawa.
                            </span>
                          </div>
                        </div>

                        <div className="bg-teal-500/5 border border-teal-500/10 rounded-xl p-4 flex gap-3 items-start">
                          <Info size={16} className="text-teal-400 shrink-0" />
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-white">Sinkronisasi Peta</span>
                            <span className="text-[10px] text-white/60 leading-relaxed">
                              Klik nama kota pada tabel di samping untuk membuka laci profil kota, sama seperti mengeklik marker di peta interaktif.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Interactive Searchable Table */}
                      <div className="flex-1 flex flex-col gap-4">
                        {/* Search & Sort Panel */}
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                          {/* Search */}
                          <div className="relative flex-1">
                            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                              type="text"
                              placeholder="Cari nama kota..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50 transition-colors"
                            />
                          </div>

                          {/* Sort Controls */}
                          <div className="flex items-center gap-2 shrink-0">
                            <ArrowsDownUp size={14} className="text-white/40" />
                            <span className="text-[10px] font-bold text-white/50 uppercase">Urutkan:</span>
                            <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/5">
                              {[
                                { label: "Musisi", id: "count" },
                                { label: "Followers", id: "followers" },
                                { label: "Populer", id: "popularity" },
                                { label: "Nama", id: "name" },
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => setSortBy(opt.id as any)}
                                  className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                                    sortBy === opt.id
                                      ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                                      : "text-white/60 hover:text-white border border-transparent"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Scrollable Table Area */}
                        <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20 flex flex-col max-h-[380px]">
                          {/* Header */}
                          <div className="grid grid-cols-12 p-3 bg-white/5 border-b border-white/5 text-[10px] font-bold text-white/60 uppercase tracking-wider shrink-0">
                            <span className="col-span-1 text-center">No</span>
                            <span className="col-span-3">Nama Kota</span>
                            <span className="col-span-2 text-center">Musisi</span>
                            <span className="col-span-3 text-right">Total Followers</span>
                            <span className="col-span-3 text-right">Rerata Popularitas</span>
                          </div>

                          {/* Body */}
                          <div className="overflow-y-auto divide-y divide-white/5 custom-scrollbar flex-1">
                            {filteredAndSortedCities.length === 0 ? (
                              <div className="p-8 text-center text-xs text-white/40">
                                Tidak ada kota yang cocok dengan kata kunci pencarian.
                              </div>
                            ) : (
                              filteredAndSortedCities.map((city, idx) => {
                                const getIslandForProvinceName = (prov: string): string => {
                                  const p = prov.toLowerCase();
                                  if (p.includes("jakarta") || p.includes("banten") || p.includes("jawa") || p.includes("yogyakarta")) return "Jawa";
                                  if (p.includes("sumatera") || p.includes("aceh") || p.includes("riau") || p.includes("jambi") || p.includes("bengkulu") || p.includes("lampung") || p.includes("bangka")) return "Sumatera";
                                  if (p.includes("sulawesi") || p.includes("gorontalo")) return "Sulawesi";
                                  if (p.includes("bali") || p.includes("nusa tenggara") || p.includes("ntb") || p.includes("ntt")) return "Nusa Tenggara";
                                  if (p.includes("kalimantan")) return "Kalimantan";
                                  if (p.includes("maluku")) return "Maluku";
                                  if (p.includes("papua")) return "Papua";
                                  return "Lainnya";
                                };

                                const topArt = city.topArtists[0];
                                const island = topArt ? getIslandForProvinceName(topArt.province) : "Lainnya";
                                const islandBadgeColor = 
                                  island === "Jawa" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                                  island === "Sumatera" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                                  island === "Sulawesi" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                  island === "Kalimantan" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                  "bg-rose-500/10 text-rose-400 border-rose-500/20";

                                return (
                                  <div
                                    key={city.city}
                                    onClick={() => handleCitySelect(city)}
                                    className="grid grid-cols-12 p-3 hover:bg-white/5 transition-all text-xs items-center cursor-pointer group/row border-l-2 border-transparent hover:border-teal-500"
                                  >
                                    <span className="col-span-1 text-center text-white/40 font-mono">{idx + 1}</span>
                                    <div className="col-span-3 flex flex-col min-w-0 pr-2">
                                      <span className="font-bold text-white group-hover/row:text-teal-400 transition-colors truncate">{city.city}</span>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase shrink-0 ${islandBadgeColor}`}>
                                          {island}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="col-span-2 text-center text-white font-medium">{city.count}</span>
                                    <span className="col-span-3 text-right text-(--color-text-secondary) font-mono">{formatFollowers(city.totalFollowers)}</span>
                                    <div className="col-span-3 flex items-center justify-end gap-2 pr-1">
                                      <span className="font-bold text-teal-400 font-mono">{city.avgPopularity}</span>
                                      <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 shrink-0 hidden sm:block">
                                        <div
                                          className="bg-teal-500 h-full"
                                          style={{ width: `${city.avgPopularity}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* RQ2: Konsentrasi Genre (Spotlight Cards) */}
              {genreSpotlights.length > 0 && (
                <GlassCard className="p-6 flex flex-col gap-6">
                  <div>
                    <Text variant="heading" className="font-bold text-white flex items-center gap-2">
                      <MusicNote size={20} className="text-sky-400" />
                      Analisis Regional Hubs: Spesialisasi Konsentrasi Genre (RQ2)
                    </Text>
                    <Text variant="caption" color="secondary" className="mt-1">
                      Mencari episentrum geografis (Scene Capitals) dan tingkat dominasi lokal untuk masing-masing genre utama Indonesia (Data Absolut).
                    </Text>
                  </div>

                  <div className="flex flex-col gap-3">
                    {genreSpotlights.map((spotlight) => (
                      <GlassCard
                        key={spotlight.name}
                        className={`p-4 border-white/5 hover:border-teal-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group bg-gradient-to-r ${spotlight.colorClass} ${spotlight.glowClass}`}
                      >
                        {/* 1. Genre Title & Description */}
                        <div className="flex-1 min-w-0 md:pr-4">
                          <div className="flex items-center gap-2 min-w-0 mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/10"
                              style={{ backgroundColor: spotlight.color }}
                            />
                            <Text variant="heading" className="font-bold text-white truncate text-sm">
                              {spotlight.displayName}
                            </Text>
                          </div>
                          <Text variant="caption" color="secondary" className="line-clamp-2 text-[11px] leading-relaxed">
                            {spotlight.description}
                          </Text>
                        </div>

                        {/* 2. Episentrum Spasial (Scene Capital) */}
                        <div className="w-full md:w-48 shrink-0 flex flex-col justify-center gap-0.5">
                          <div className="flex items-center justify-between text-[10px] text-white/50 uppercase tracking-wider font-bold">
                            <div className="flex items-center gap-1">
                              <span>Episentrum Spasial</span>
                              <Question
                                size={12}
                                className="text-white/40 hover:text-white cursor-help transition-colors"
                                onMouseEnter={(e) => handleMouseEnterTooltip(
                                  e,
                                  "Episentrum Spasial (Scene Capital)",
                                  "Kota di Indonesia dengan konsentrasi jumlah musisi genre ini terbanyak secara nasional. Menunjukkan pusat aktivitas komunitas dan industri genre tersebut."
                                )}
                                onMouseLeave={handleMouseLeaveTooltip}
                              />
                            </div>
                            <span className="text-white font-mono font-semibold">{spotlight.genreCount} Musisi</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <MapPin size={14} className="text-teal-400 shrink-0" />
                            <span className="text-sm font-bold text-white truncate">{spotlight.epicenter}</span>
                          </div>
                        </div>

                        {/* 3. Dominansi Lokal */}
                        <div className="w-full md:w-48 shrink-0 flex flex-col justify-center gap-1">
                          <div className="flex items-center justify-between text-[10px] text-white/50 uppercase tracking-wider font-bold">
                            <div className="flex items-center gap-1">
                              <span>Dominansi Lokal</span>
                              <Question
                                size={12}
                                className="text-white/40 hover:text-white cursor-help transition-colors"
                                onMouseEnter={(e) => handleMouseEnterTooltip(
                                  e,
                                  "Dominansi Lokal (%)",
                                  "Persentase musisi genre ini dibanding total musisi yang ada di kota episentrum tersebut. Rasio tinggi menunjukkan spesialisasi genre yang mendalam di ekosistem lokal kota."
                                )}
                                onMouseLeave={handleMouseLeaveTooltip}
                              />
                            </div>
                            <span className="text-teal-400 font-bold font-mono text-xs">{spotlight.dominancePct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${spotlight.dominancePct}%`, backgroundColor: spotlight.color }}
                            />
                          </div>
                        </div>

                        {/* 4. Representative Artists */}
                        <div className="w-full md:w-44 shrink-0 flex flex-col justify-center gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-white/40 uppercase tracking-wider font-bold">Representative Artists</span>
                            <Question
                              size={12}
                              className="text-white/40 hover:text-white cursor-help transition-colors"
                              onMouseEnter={(e) => handleMouseEnterTooltip(
                                e,
                                "Musisi Representatif",
                                "Tiga musisi terpopuler asal kota episentrum tersebut berdasarkan Spotify Popularity. Klik salah satu untuk membuka profil lengkapnya."
                              )}
                              onMouseLeave={handleMouseLeaveTooltip}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            {spotlight.repArtists.map((art) => (
                              <button
                                key={art.name}
                                onClick={() => {
                                  const artistData: ArtistData = {
                                    name: art.name,
                                    profilePicture: art.profilePicture,
                                    originCity: art.originCity,
                                    province: art.originProvince,
                                    popularity: art.popularity,
                                    followers: art.followers,
                                    genres: art.genres,
                                    primaryGenre: art.primaryGenre,
                                    artistType: art.artistType
                                  };
                                  setSelectedArtist(artistData);
                                }}
                                className="group/avatar flex items-center justify-center relative size-8 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-white/40 transition-colors"
                                title={`${art.name} (Popularitas: ${art.popularity})`}
                              >
                                <img
                                  src={art.profilePicture || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&q=80"}
                                  alt={art.name}
                                  className="size-full object-cover group-hover/avatar:scale-110 transition-transform duration-200"
                                />
                              </button>
                            ))}
                            {spotlight.repArtists.length === 0 && (
                              <span className="text-[10px] text-white/30 italic">Tidak ada musisi</span>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* RQ3: Aksesibilitas Spasial */}
              {rq3Stats && (
                <GlassCard className="p-6 flex flex-col gap-6">
                  <div>
                    <Text variant="heading" className="font-bold text-white flex items-center gap-2">
                      <ChartBar size={20} className="text-rose-400" />
                      Analisis Aksesibilitas: Kesenjangan Popularitas Regional
                    </Text>
                    <Text variant="caption" color="secondary" className="mt-1">
                      Membandingkan rata-rata jangkauan popularitas musisi berdasarkan kluster lokasi untuk menguji hambatan industri.
                    </Text>
                  </div>

                  <div className="flex flex-col gap-4">
                    {[
                      {
                        name: "Pusat Industri (DKI Jakarta)",
                        desc: "Akses langsung ke label rekaman utama, media nasional, dan promotor komersial.",
                        avgPop: rq3Stats.jakarta.avgPopularity,
                        avgFollowers: rq3Stats.jakarta.avgFollowers,
                        color: "bg-teal-500",
                        border: "border-teal-500/20",
                      },
                      {
                        name: "Penyangga Jawa (Bandung, Yogyakarta, Surabaya, dsb.)",
                        desc: "Pusat kreativitas regional dengan jaringan komunitas mandiri (indie).",
                        avgPop: rq3Stats.javaRest.avgPopularity,
                        avgFollowers: rq3Stats.javaRest.avgFollowers,
                        color: "bg-sky-500",
                        border: "border-sky-500/20",
                      },
                      {
                        name: "Luar Jawa (Sumatera, Bali, Sulawesi, Maluku, dsb.)",
                        desc: "Hambatan jarak geografis yang signifikan dari pusat ekosistem promosi musik nasional.",
                        avgPop: rq3Stats.outsideJava.avgPopularity,
                        avgFollowers: rq3Stats.outsideJava.avgFollowers,
                        color: "bg-amber-500",
                        border: "border-amber-500/20",
                      },
                    ].map((zone, idx) => (
                      <div
                        key={zone.name}
                        className={`flex flex-col gap-3 p-4 rounded-xl bg-white/2 border ${zone.border} relative overflow-hidden`}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <Text variant="heading" className="font-bold text-white">
                              {zone.name}
                            </Text>
                            <Text variant="caption" color="secondary" className="mt-0.5">
                              {zone.desc}
                            </Text>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="text-[10px] text-white/50 block font-bold uppercase tracking-wider">Avg Followers</span>
                              <span className="text-sm font-bold text-white">{formatFollowers(zone.avgFollowers)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-white/50 block font-bold uppercase tracking-wider">Avg Popularity</span>
                              <span className="text-lg font-bold text-teal-400">{zone.avgPop} <span className="text-xs text-white/50">/100</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
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

                  <div className="flex gap-2 items-center bg-teal-500/5 border border-teal-500/10 p-3.5 rounded-lg text-xs leading-relaxed text-(--color-text-secondary)">
                    <Info size={16} className="text-teal-400 shrink-0" />
                    <span>
                      💡 <strong>Analisis RQ3</strong>: Jarak geografis terbukti berkolerasi dengan popularitas digital. Rata-rata popularitas di Jakarta (<strong>{rq3Stats.jakarta.avgPopularity}</strong>) meluncur turun pada wilayah penyangga Jawa (<strong>{rq3Stats.javaRest.avgPopularity}</strong>) and berada di level terendah pada musisi luar Jawa (<strong>{rq3Stats.outsideJava.avgPopularity}</strong>). Kesenjangan popularitas mencapai <strong>{Math.abs(rq3Stats.jakarta.avgPopularity - rq3Stats.outsideJava.avgPopularity)} poin</strong>.
                    </span>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </section>

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

      {/* Slide-over Drawer — globally available for province detail analysis */}
      <Drawer
        isOpen={!!selectedProvince}
        onClose={() => handleProvinceSelect(null)}
        width="w-[480px]"
        blurBackdrop={true}
        badge={
          <Badge
            color="accent"
            className="uppercase tracking-wider text-[10px] font-bold"
          >
            Provinsi Analisis
          </Badge>
        }
        title={selectedProvince?.province}
        subtitle="Rangkuman data spasial musisi di tingkat provinsi"
      >
        {selectedProvince && (
          <div className="flex flex-col gap-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 bg-(--color-bg-surface)/20 border border-(--color-border-default) rounded-xl p-4">
              <div className="flex flex-col gap-1">
                <Text variant="caption" color="secondary">Artis</Text>
                <AnimatedCounter
                  value={selectedProvince.count}
                  className="text-lg font-bold text-white tracking-tight"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Text variant="caption" color="secondary">Avg Pop</Text>
                <AnimatedCounter
                  value={selectedProvince.avgPopularity}
                  className="text-lg font-bold text-(--color-accent-500) tracking-tight"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Text variant="caption" color="secondary">Followers</Text>
                <AnimatedCounter
                  value={selectedProvince.totalFollowers}
                  formatter={formatFollowers}
                  className="text-lg font-bold text-white tracking-tight"
                />
              </div>
            </div>

            {/* Format / Type Ratio Badge block */}
            {(() => {
              const provCollaborationIndex = selectedProvince.count ? Math.round((selectedProvince.bandCount / selectedProvince.count) * 100) : 0;
              let provArchetype = "Evolving Music Scene";
              if (provCollaborationIndex >= 60) provArchetype = "Band Collective Dominance";
              else if (provCollaborationIndex >= 40) provArchetype = "Balanced Format Mix";
              else provArchetype = "Soloist Heavy Market";

              return (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-(--color-border-default) bg-(--color-bg-surface)/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-(--color-text-secondary) uppercase tracking-wider font-semibold">Format Archetype</span>
                    <span className="text-sm font-bold text-white mt-0.5">{provArchetype}</span>
                  </div>
                  <Badge color="accent" className="font-semibold text-xs py-1">
                    {provCollaborationIndex}% Band Format
                  </Badge>
                </div>
              );
            })()}

            <Divider spacing="sm" />

            {/* Roster list */}
            <div className="flex flex-col gap-3 relative pb-10">
              <Text variant="label" className="font-semibold text-white/95">
                Musisi Terpopuler ({selectedProvince.topArtists.length})
              </Text>
              
              <div className="flex flex-col gap-2">
                {selectedProvince.topArtists.slice(0, visibleCount).map((art) => (
                  <button
                    key={art.name}
                    onClick={() => {
                      setSelectedArtist(art);
                      handleProvinceSelect(null); 
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
              {visibleCount < selectedProvince.topArtists.length && (
                <div className="mt-2 flex flex-col items-center gap-3 w-full">
                  <button
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 10, selectedProvince.topArtists.length))}
                    className="w-full py-2.5 rounded-lg border border-(--color-border-default) bg-(--color-bg-surface)/30 text-xs font-semibold text-(--color-text-secondary) hover:text-(--color-text-primary) hover:border-(--color-accent-500)/50 hover:bg-(--color-bg-surface)/50 transition-all cursor-pointer text-center shadow-sm"
                  >
                    Tampilkan Lebih Banyak ({selectedProvince.topArtists.length - visibleCount} Musisi Lainnya)
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

      {/* Portal Tooltip */}
      {isMounted && portalTooltip && createPortal(
        <div
          style={{
            position: "absolute",
            left: `${portalTooltip.x}px`,
            top: `${portalTooltip.y}px`,
            transform: "translate(-50%, -105%)",
          }}
          className="w-72 p-3.5 bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-[9999] pointer-events-none text-left"
        >
          <div className="text-xs font-bold text-sky-400 mb-1">{portalTooltip.title}</div>
          {portalTooltip.formula && (
            <div className="text-[10px] text-teal-400/90 font-mono mb-2">{portalTooltip.formula}</div>
          )}
          <div className="text-[11px] text-white/80 leading-relaxed font-normal">
            {portalTooltip.description}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
