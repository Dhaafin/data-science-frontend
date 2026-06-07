"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  Crown,
  Flame,
  Heart,
  Sparkles,
  MagnifyingGlass,
  Funnel,
  TrendingUp,
  User,
  Users,
  Info,
  Warning,
  MusicNote,
  MapPin,
  Check,
} from "@phosphor-icons/react";
import { Text, GlassCard, Badge, Divider, Skeleton, Button } from "@/components/atoms";
import { Dropdown } from "@/components/molecules";
import { musicService, StickinessArtistEntry } from "@/lib/api/musicService";
import type { ArtistData } from "@/components/organisms/Drawer";

interface PopularityFollowerShowcaseProps {
  onArtistSelect?: (artist: ArtistData) => void;
}

export function PopularityFollowerShowcase({ onArtistSelect }: PopularityFollowerShowcaseProps) {
  const [artistData, setArtistData] = useState<StickinessArtistEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedGenre, setSelectedGenre] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hoveredArtist, setHoveredArtist] = useState<StickinessArtistEntry | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Dynamic highlighting of quadrants
  const [highlightedQuadrant, setHighlightedQuadrant] = useState<string | null>(null);

  // Load stickiness data from music service
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await musicService.getStickinessData();
        setArtistData(data);
      } catch (err) {
        console.error("Failed to load stickiness data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute dynamic stats and boundaries
  const stats = useMemo(() => {
    if (artistData.length === 0) return {
      medianPop: 50,
      medianFollowers: 10000,
      minFollowers: 100,
      maxFollowers: 10000000,
      minLog: 2,
      maxLog: 7,
      uniqueGenres: ["Semua"],
    };

    // Calculate median popularity
    const sortedPops = [...artistData].map(d => d.popularity).sort((a, b) => a - b);
    const medianPop = sortedPops.length > 0 
      ? sortedPops[Math.floor(sortedPops.length / 2)] 
      : 50;

    // Calculate median followers
    const sortedFollowers = [...artistData].map(d => d.followers).sort((a, b) => a - b);
    const medianFollowers = sortedFollowers.length > 0 
      ? sortedFollowers[Math.floor(sortedFollowers.length / 2)] 
      : 10000;

    // Boundaries
    const followersList = artistData.map(d => d.followers);
    const minFollowers = Math.max(1, Math.min(...followersList, 100));
    const maxFollowers = Math.max(minFollowers + 10, ...followersList, 5000000);

    const minLog = Math.log10(minFollowers);
    const maxLog = Math.log10(maxFollowers);

    // Get unique primary genres
    const genresSet = new Set<string>();
    artistData.forEach(d => {
      if (d.primaryGenre) {
        genresSet.add(
          d.primaryGenre
            .split(" ")
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")
        );
      }
    });

    const uniqueGenres = ["Semua", ...Array.from(genresSet).sort()];

    return {
      medianPop,
      medianFollowers,
      minFollowers,
      maxFollowers,
      minLog,
      maxLog,
      uniqueGenres,
    };
  }, [artistData]);

  // Standard logarithmic ticks for X-axis
  const axisTicks = useMemo(() => {
    const standardTicks = [
      { label: "100", value: 100, logVal: 2 },
      { label: "1K", value: 1000, logVal: 3 },
      { label: "10K", value: 10000, logVal: 4 },
      { label: "100K", value: 100000, logVal: 5 },
      { label: "1M", value: 1000000, logVal: 6 },
      { label: "10M", value: 10000000, logVal: 7 },
    ];
    
    // Return ticks that are reasonably within the minLog and maxLog limits
    return standardTicks.filter(
      t => t.logVal >= Math.floor(stats.minLog) - 1 && t.logVal <= Math.ceil(stats.maxLog) + 1
    );
  }, [stats]);

  // Dimensions of SVG Plot
  const viewBoxWidth = 600;
  const viewBoxHeight = 420;
  const padding = { top: 35, bottom: 45, left: 55, right: 25 };

  // Mapping coordinate helper functions
  const getX = (followers: number) => {
    const logVal = Math.log10(Math.max(1, followers));
    const pct = (logVal - stats.minLog) / (stats.maxLog - stats.minLog);
    return padding.left + pct * (viewBoxWidth - padding.left - padding.right);
  };

  const getY = (popularity: number) => {
    const pct = popularity / 100;
    return viewBoxHeight - padding.bottom - pct * (viewBoxHeight - padding.top - padding.bottom);
  };

  // Classify artist into quadrants
  const getQuadrant = (popularity: number, followers: number) => {
    const isHighPop = popularity >= stats.medianPop;
    const isHighFollowers = followers >= stats.medianFollowers;

    if (isHighPop && isHighFollowers) return "Legends";
    if (isHighPop && !isHighFollowers) return "Viral Hits";
    if (!isHighPop && isHighFollowers) return "Cult Classics";
    return "Emerging Talents";
  };

  // Formatting helpers
  const formatNumber = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  };

  // Filter and process lists
  const filteredArtists = useMemo(() => {
    return artistData.map(artist => {
      // Evaluate matching status
      const matchesGenre =
        selectedGenre === "Semua" ||
        artist.primaryGenre.toLowerCase() === selectedGenre.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === "" ||
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.primaryGenre.toLowerCase().includes(searchQuery.toLowerCase());

      const isActive = matchesGenre && matchesSearch;
      
      const quadrant = getQuadrant(artist.popularity, artist.followers);
      const isHighlightedQuadrant = !highlightedQuadrant || quadrant === highlightedQuadrant;

      return {
        ...artist,
        quadrant,
        isActive: isActive && isHighlightedQuadrant,
        isFaded: !isActive || !isHighlightedQuadrant,
      };
    });
  }, [artistData, selectedGenre, searchQuery, stats, highlightedQuadrant]);

  // Quadrant distribution statistics
  const quadrantStats = useMemo(() => {
    const result = {
      Legends: { count: 0, color: "var(--color-data-1)", icon: Crown },
      "Viral Hits": { count: 0, color: "var(--color-data-4)", icon: Flame },
      "Cult Classics": { count: 0, color: "var(--color-data-3)", icon: Heart },
      "Emerging Talents": { count: 0, color: "var(--color-text-muted)", icon: Sparkles },
    };

    filteredArtists.forEach(art => {
      if (art.isActive) {
        result[art.quadrant as keyof typeof result].count += 1;
      }
    });

    return result;
  }, [filteredArtists]);

  // Leaders lists
  const leaderboards = useMemo(() => {
    // 1. Cult Classics Leaderboard (Highest SC = Followers / Popularity)
    // Filter to only active and sorted by stickiness Coefficient descending
    const cultClassics = [...filteredArtists]
      .filter(art => art.isActive && art.quadrant === "Cult Classics")
      .sort((a, b) => b.stickinessCoefficient - a.stickinessCoefficient)
      .slice(0, 5);

    // 2. Viral Hits Leaderboard (Lowest SC among high popularity)
    const viralHits = [...filteredArtists]
      .filter(art => art.isActive && art.quadrant === "Viral Hits")
      .sort((a, b) => a.stickinessCoefficient - b.stickinessCoefficient)
      .slice(0, 5);

    // 3. Legends Leaderboard (Highest followers)
    const legends = [...filteredArtists]
      .filter(art => art.isActive && art.quadrant === "Legends")
      .sort((a, b) => b.followers - a.followers)
      .slice(0, 5);

    return { cultClassics, viralHits, legends };
  }, [filteredArtists]);

  // Dynamic colors for each quadrant
  const getQuadrantColor = (quad: string) => {
    switch (quad) {
      case "Legends":
        return "var(--color-data-1)"; // Teal
      case "Viral Hits":
        return "var(--color-data-4)"; // Amber
      case "Cult Classics":
        return "var(--color-data-3)"; // Indigo
      default:
        return "var(--color-text-secondary)"; // Subdued gray
    }
  };

  const handleArtistClick = (artist: StickinessArtistEntry) => {
    if (onArtistSelect) {
      // Map to full ArtistData interface expected by ArtistDrawer
      onArtistSelect({
        name: artist.name,
        profilePicture: artist.profilePicture,
        originCity: artist.originCity,
        province: artist.originProvince,
        popularity: artist.popularity,
        followers: artist.followers,
        genres: [artist.primaryGenre], // wrap primary genre as fallback
        primaryGenre: artist.primaryGenre,
        artistType: artist.artistType,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-6 h-auto w-full">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md mt-1" />
        </div>
        <Divider spacing="sm" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="col-span-2 h-[450px]">
            <Skeleton className="w-full h-full rounded-md" />
          </GlassCard>
          <GlassCard className="col-span-1 h-[450px]">
            <Skeleton className="w-full h-full rounded-md" />
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 h-auto w-full"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ── Section Header ── */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} weight="bold" className="text-(--color-accent-500)" />
          <Text as="h1" variant="title" color="primary">
            Fans Loyalty &amp; Stickiness Index
          </Text>
        </div>
        <Text variant="body" color="secondary">
          Analisis perbandingan antara pendengar viral sesaat (Popularity) dengan loyalitas fanatik jangka panjang (Followers).
        </Text>
      </motion.div>

      <Divider spacing="sm" />

      {/* ── Filters & Search Controls ── */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col md:flex-row gap-4 justify-between items-center w-full bg-(--color-bg-card)/30 border border-(--color-border-default) rounded-xl p-4 glass-card"
      >
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center justify-center size-9 rounded-lg bg-(--color-accent-500)/10 border border-(--color-accent-500)/20 text-(--color-accent-400)">
            <Funnel size={16} weight="fill" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-(--color-text-secondary) font-bold uppercase tracking-wider">Filter Genre</span>
            <Dropdown
              options={stats.uniqueGenres.map(g => ({ label: g, value: g }))}
              value={selectedGenre}
              onChange={setSelectedGenre}
              className="w-44 mt-0.5"
            />
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-(--color-text-muted)">
            <MagnifyingGlass size={16} />
          </div>
          <input
            type="text"
            placeholder="Cari nama musisi, genre, kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-(--color-bg-canvas) border border-(--color-border-default) focus:border-(--color-border-accent) text-white focus:outline-none placeholder-(--color-text-muted) transition-all"
          />
        </div>
      </motion.div>

      {/* ── Main Canvas Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2D Scatterplot Card */}
        <motion.div variants={fadeUp} className="col-span-1 lg:col-span-2">
          <GlassCard className="p-5 flex flex-col gap-4 relative select-none">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Text variant="heading" color="primary" className="font-bold">
                  2D Interactive Scatterplot
                </Text>
                <Text variant="caption" color="secondary">
                  Klik titik musisi untuk detail. Garis putus-putus menunjukkan median regional.
                </Text>
              </div>
              
              {highlightedQuadrant && (
                <Button
                  variant="ghost"
                  onClick={() => setHighlightedQuadrant(null)}
                  className="py-1 px-2.5 text-[10px] rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  Reset Filter Kuadran
                </Button>
              )}
            </div>

            {/* SVG Plot Wrapper */}
            <div className="w-full relative bg-(--color-bg-canvas)/50 border border-(--color-border-default) rounded-lg overflow-hidden py-2">
              <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-auto overflow-visible">
                
                {/* ── 1. Quadrant Background Shading / Glow ── */}
                {/* Top Right: Legends */}
                <rect
                  x={getX(stats.medianFollowers)}
                  y={padding.top}
                  width={viewBoxWidth - padding.right - getX(stats.medianFollowers)}
                  height={getY(0) - getY(stats.medianPop)}
                  className={`fill-(--color-data-1)/5 transition-opacity duration-300 ${
                    highlightedQuadrant === "Legends" ? "opacity-100" : highlightedQuadrant ? "opacity-0" : "opacity-40"
                  }`}
                />
                {/* Top Left: Viral Hits */}
                <rect
                  x={padding.left}
                  y={padding.top}
                  width={getX(stats.medianFollowers) - padding.left}
                  height={getY(0) - getY(stats.medianPop)}
                  className={`fill-(--color-data-4)/5 transition-opacity duration-300 ${
                    highlightedQuadrant === "Viral Hits" ? "opacity-100" : highlightedQuadrant ? "opacity-0" : "opacity-40"
                  }`}
                />
                {/* Bottom Right: Cult Classics */}
                <rect
                  x={getX(stats.medianFollowers)}
                  y={getY(stats.medianPop)}
                  width={viewBoxWidth - padding.right - getX(stats.medianFollowers)}
                  height={getY(0) - getY(stats.medianPop)}
                  className={`fill-(--color-data-3)/5 transition-opacity duration-300 ${
                    highlightedQuadrant === "Cult Classics" ? "opacity-100" : highlightedQuadrant ? "opacity-0" : "opacity-40"
                  }`}
                />

                {/* ── 2. Grid lines ── */}
                {/* Y-axis grids (Popularity) */}
                {[20, 40, 60, 80, 100].map(pop => (
                  <line
                    key={pop}
                    x1={padding.left}
                    y1={getY(pop)}
                    x2={viewBoxWidth - padding.right}
                    y2={getY(pop)}
                    className="stroke-(--color-border-default) stroke-1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* X-axis grids (Log-Followers) */}
                {axisTicks.map(tick => (
                  <line
                    key={tick.value}
                    x1={getX(tick.value)}
                    y1={padding.top}
                    x2={getX(tick.value)}
                    y2={viewBoxHeight - padding.bottom}
                    className="stroke-(--color-border-default) stroke-1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* ── 3. Quadrant Axes (dashed medians) ── */}
                {/* Median Followers vertical axis */}
                <line
                  x1={getX(stats.medianFollowers)}
                  y1={padding.top}
                  x2={getX(stats.medianFollowers)}
                  y2={viewBoxHeight - padding.bottom}
                  className="stroke-(--color-accent-400)/40 stroke-2"
                  strokeDasharray="5 5"
                />
                
                {/* Median Popularity horizontal axis */}
                <line
                  x1={padding.left}
                  y1={getY(stats.medianPop)}
                  x2={viewBoxWidth - padding.right}
                  y2={getY(stats.medianPop)}
                  className="stroke-(--color-accent-400)/40 stroke-2"
                  strokeDasharray="5 5"
                />

                {/* ── 4. Axes Labels ── */}
                {/* Y-axis ticks */}
                {[0, 20, 40, 60, 80, 100].map(pop => (
                  <text
                    key={pop}
                    x={padding.left - 10}
                    y={getY(pop) + 4}
                    className="fill-(--color-text-secondary) font-mono text-[9px] text-right"
                    textAnchor="end"
                  >
                    {pop}
                  </text>
                ))}
                
                {/* X-axis ticks */}
                {axisTicks.map(tick => (
                  <text
                    key={tick.value}
                    x={getX(tick.value)}
                    y={viewBoxHeight - padding.bottom + 15}
                    className="fill-(--color-text-secondary) font-mono text-[9px] text-center"
                    textAnchor="middle"
                  >
                    {tick.label}
                  </text>
                ))}

                {/* Axis Titles */}
                <text
                  x={padding.left - 42}
                  y={(viewBoxHeight - padding.top - padding.bottom) / 2 + padding.top}
                  className="fill-(--color-text-secondary) font-bold text-[10px] tracking-wider text-center"
                  textAnchor="middle"
                  transform={`rotate(-90, ${padding.left - 42}, ${(viewBoxHeight - padding.top - padding.bottom) / 2 + padding.top})`}
                >
                  SPOTIFY POPULARITY (0-100)
                </text>

                <text
                  x={(viewBoxWidth - padding.left - padding.right) / 2 + padding.left}
                  y={viewBoxHeight - 12}
                  className="fill-(--color-text-secondary) font-bold text-[10px] tracking-wider text-center"
                  textAnchor="middle"
                >
                  SPOTIFY FOLLOWERS (LOG SCALE)
                </text>

                {/* ── 5. Corner Quadrant Metadata Labels ── */}
                {/* Legends */}
                <g transform={`translate(${viewBoxWidth - padding.right - 80}, ${padding.top + 15})`} className="opacity-50">
                  <text className="fill-(--color-data-1) font-bold text-[9px] uppercase tracking-wider" textAnchor="end">Legends</text>
                  <text className="fill-(--color-text-muted) text-[8px] mt-1" textAnchor="end" y="10">High SC / Fans</text>
                </g>
                {/* Viral Hits */}
                <g transform={`translate(${padding.left + 15}, ${padding.top + 15})`} className="opacity-50">
                  <text className="fill-(--color-data-4) font-bold text-[9px] uppercase tracking-wider" textAnchor="start">Viral Hits</text>
                  <text className="fill-(--color-text-muted) text-[8px]" textAnchor="start" y="10">High Pop, Low Fans</text>
                </g>
                {/* Cult Classics */}
                <g transform={`translate(${viewBoxWidth - padding.right - 80}, ${viewBoxHeight - padding.bottom - 25})`} className="opacity-50">
                  <text className="fill-(--color-data-3) font-bold text-[9px] uppercase tracking-wider" textAnchor="end">Cult Classics</text>
                  <text className="fill-(--color-text-muted) text-[8px]" textAnchor="end" y="10">Militant Cult Fans</text>
                </g>
                {/* Emerging Talents */}
                <g transform={`translate(${padding.left + 15}, ${viewBoxHeight - padding.bottom - 25})`} className="opacity-50">
                  <text className="fill-(--color-text-secondary) font-bold text-[9px] uppercase tracking-wider" textAnchor="start">Emerging</text>
                  <text className="fill-(--color-text-muted) text-[8px]" textAnchor="start" y="10">Low Pop, Low Fans</text>
                </g>

                {/* ── 6. Artists Plot Points ── */}
                {filteredArtists.map((artist) => {
                  const cx = getX(artist.followers);
                  const cy = getY(artist.popularity);
                  const dotColor = getQuadrantColor(artist.quadrant);
                  
                  const isHovered = hoveredArtist && hoveredArtist.name === artist.name;
                  const isSearchMatch = searchQuery.trim() !== "" && artist.isActive;

                  return (
                    <motion.g
                      key={artist.name}
                      onClick={() => handleArtistClick(artist)}
                      onMouseEnter={(e) => {
                        setHoveredArtist(artist);
                        
                        // Capture SVG bounding container coordinates to calculate tooltip anchor coordinates
                        const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                        if (rect) {
                          const svgEl = e.currentTarget.parentElement;
                          const pt = (svgEl as any).createSVGPoint();
                          pt.x = e.clientX;
                          pt.y = e.clientY;
                          const loc = pt.matrixTransform((svgEl as any).getScreenCTM().inverse());
                          setHoveredPosition({ x: loc.x, y: loc.y });
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredArtist(null);
                        setHoveredPosition(null);
                      }}
                      className="cursor-pointer"
                      style={{ originX: `${cx}px`, originY: `${cy}px` }}
                      animate={{
                        opacity: artist.isFaded ? 0.12 : 1,
                        scale: isHovered ? 1.5 : isSearchMatch ? 1.3 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    >
                      {/* Glow filter backdrop when hovered or matched */}
                      {(isHovered || isSearchMatch) && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 10 : 8}
                          fill={dotColor}
                          opacity={0.3}
                          className="animate-ping"
                        />
                      )}
                      
                      {/* Main dot circle */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 6 : 4}
                        fill={dotColor}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={isHovered ? 1.5 : 0.75}
                      />
                    </motion.g>
                  );
                })}
              </svg>

              {/* ── 7. Glassmorphic Tooltip (anchored inside container coordinates) ── */}
              <AnimatePresence>
                {hoveredArtist && hoveredPosition && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      left: `${(hoveredPosition.x / viewBoxWidth) * 100}%`,
                      top: `${(hoveredPosition.y / viewBoxHeight) * 100}%`,
                      transform: `translate(${
                        hoveredPosition.x > viewBoxWidth / 2 ? "-105%" : "5%"
                      }, ${
                        hoveredPosition.y > viewBoxHeight / 2 ? "-105%" : "5%"
                      })`,
                      pointerEvents: "none",
                      zIndex: 30,
                    }}
                    className="w-[250px] p-3 rounded-lg border border-(--color-border-accent) bg-(--color-bg-drawer)/90 shadow-xl backdrop-blur-md flex flex-col gap-2.5"
                  >
                    {/* Header profile row */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={hoveredArtist.profilePicture || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&q=80"}
                        alt={hoveredArtist.name}
                        className="size-8 rounded-full object-cover border border-white/20 shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate leading-tight">
                          {hoveredArtist.name}
                        </span>
                        <div className="flex items-center gap-1.5 truncate mt-0.5">
                          <Badge color="accent" className="text-[8px] px-1 py-0 px-1.5 font-bold uppercase tracking-wider scale-95 origin-left">
                            {hoveredArtist.primaryGenre}
                          </Badge>
                          <span className="text-[9px] text-(--color-text-secondary) truncate">
                            {hoveredArtist.originCity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Divider spacing="none" />

                    {/* Analytics stats */}
                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-(--color-text-secondary) font-bold uppercase">Popularity</span>
                        <span className="text-sm font-bold text-white mt-0.5">{hoveredArtist.popularity}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-(--color-text-secondary) font-bold uppercase">Followers</span>
                        <span className="text-sm font-bold text-white mt-0.5">{formatNumber(hoveredArtist.followers)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[9px] text-(--color-text-secondary) font-medium">
                        <span className="uppercase font-bold text-[8px]">Loyalty (SC)</span>
                        <Info size={10} />
                      </div>
                      <Badge color="accent" className="text-xs font-extrabold px-1.5 py-0.5">
                        {hoveredArtist.stickinessCoefficient.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="text-[8px] text-(--color-text-muted) italic leading-tight">
                      Kuadran: <span className="font-semibold" style={{ color: getQuadrantColor(hoveredArtist.quadrant) }}>{hoveredArtist.quadrant}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Insights & Quadrant Stats Column */}
        <motion.div variants={fadeUp} className="col-span-1 flex flex-col gap-6">
          
          {/* Quadrant filter breakdown cards */}
          <GlassCard className="p-4 flex flex-col gap-3">
            <Text variant="heading" color="primary" className="font-bold text-sm">
              Distribusi Kuadran
            </Text>
            
            <div className="flex flex-col gap-2">
              {Object.entries(quadrantStats).map(([name, stat]) => {
                const Icon = stat.icon;
                const isSelected = highlightedQuadrant === name;
                
                return (
                  <button
                    key={name}
                    onClick={() => setHighlightedQuadrant(isSelected ? null : name)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all text-left cursor-pointer group ${
                      isSelected
                        ? "border-(--color-border-accent) bg-(--color-accent-500)/10 shadow-md"
                        : "border-(--color-border-default) bg-(--color-bg-surface)/20 hover:bg-(--color-bg-surface)/40 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="p-1.5 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                      >
                        <Icon size={14} weight={isSelected ? "fill" : "bold"} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-(--color-accent-400) transition-colors">
                          {name}
                        </span>
                        <span className="text-[9px] text-(--color-text-secondary) mt-0.5">
                          {name === "Legends" && "Populer & Pengikut Besar"}
                          {name === "Viral Hits" && "Populer Tapi Pengikut Minim"}
                          {name === "Cult Classics" && "Militan, Pengikut Relatif Tinggi"}
                          {name === "Emerging Talents" && "Musisi Berkembang / Baru"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold font-mono text-white">
                        {stat.count}
                      </span>
                      {isSelected && (
                        <Check size={12} weight="bold" className="text-(--color-accent-400)" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Cult Classics Leaderboard Card */}
          <GlassCard className="p-4 flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-1.5">
              <Heart size={16} weight="fill" className="text-(--color-data-3)" />
              <Text variant="heading" color="primary" className="font-bold text-sm">
                Top Cult Classics (Loyalitas Tinggi)
              </Text>
            </div>
            
            <Text variant="caption" color="secondary" className="leading-normal">
              Musisi dengan rasio pengikut (Followers) jauh melampaui sirkulasi playlist harian (Popularity).
            </Text>

            <div className="flex flex-col gap-2 mt-2">
              {leaderboards.cultClassics.length > 0 ? (
                leaderboards.cultClassics.map((artist, idx) => (
                  <button
                    key={artist.name}
                    onClick={() => handleArtistClick(artist)}
                    className="flex items-center justify-between p-2 rounded-lg bg-(--color-bg-surface)/20 border border-(--color-border-default) hover:border-(--color-data-3)/40 hover:bg-(--color-data-3)/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono font-bold text-(--color-text-muted) w-4 text-center shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={artist.profilePicture || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&q=80"}
                        alt={artist.name}
                        className="size-7 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white group-hover:text-(--color-data-3) transition-colors truncate">
                          {artist.name}
                        </span>
                        <span className="text-[9px] text-(--color-text-secondary) truncate">
                          Followers: {formatNumber(artist.followers)} | Pop: {artist.popularity}
                        </span>
                      </div>
                    </div>
                    
                    <Badge color="info" className="text-[9px] font-mono shrink-0">
                      SC: {artist.stickinessCoefficient.toFixed(1)}
                    </Badge>
                  </button>
                ))
              ) : (
                <div className="py-4 text-center">
                  <Text variant="caption" color="muted">Tidak ada musisi dalam kuadran ini.</Text>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Viral Hits Leaderboard Card */}
          <GlassCard className="p-4 flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-1.5">
              <Flame size={16} weight="fill" className="text-(--color-data-4)" />
              <Text variant="heading" color="primary" className="font-bold text-sm">
                Top Viral Hits (Hype Playlist)
              </Text>
            </div>
            
            <Text variant="caption" color="secondary" className="leading-normal">
              Sirkulasi playlist tinggi tapi jarang diklik tombol follow (rasio loyalitas fans rendah).
            </Text>

            <div className="flex flex-col gap-2 mt-2">
              {leaderboards.viralHits.length > 0 ? (
                leaderboards.viralHits.map((artist, idx) => (
                  <button
                    key={artist.name}
                    onClick={() => handleArtistClick(artist)}
                    className="flex items-center justify-between p-2 rounded-lg bg-(--color-bg-surface)/20 border border-(--color-border-default) hover:border-(--color-data-4)/40 hover:bg-(--color-data-4)/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono font-bold text-(--color-text-muted) w-4 text-center shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={artist.profilePicture || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&q=80"}
                        alt={artist.name}
                        className="size-7 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white group-hover:text-(--color-data-4) transition-colors truncate">
                          {artist.name}
                        </span>
                        <span className="text-[9px] text-(--color-text-secondary) truncate">
                          Pop: {artist.popularity} | Followers: {formatNumber(artist.followers)}
                        </span>
                      </div>
                    </div>
                    
                    <Badge color="warning" className="text-[9px] font-mono shrink-0">
                      SC: {artist.stickinessCoefficient.toFixed(2)}
                    </Badge>
                  </button>
                ))
              ) : (
                <div className="py-4 text-center">
                  <Text variant="caption" color="muted">Tidak ada musisi dalam kuadran ini.</Text>
                </div>
              )}
            </div>
          </GlassCard>

        </motion.div>
      </div>
    </motion.div>
  );
}
