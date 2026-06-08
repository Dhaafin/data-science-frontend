"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Pane } from "react-leaflet";
import { AnimatePresence, motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { cityCentroids } from "@/lib/config/cityCentroids";
import type { ArtistData } from "@/components/organisms/ArtistDrawer";
import { mapDbToArtistData } from "@/lib/api/musicService";
import type { GeoJsonObject } from "geojson";

// Fix Leaflet marker icons issue in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface CityAggregate {
  city: string;
  count: number;
  totalPopularity: number;
  avgPopularity: number;
  totalFollowers: number;
  topArtists: ArtistData[];
  coordinates: [number, number];
  topGenre: string;
  topArtistName: string;
  topArtistPopularity: number;
  soloCount: number;
  bandCount: number;
}

export interface ProvinceAggregate {
  province: string;
  count: number;
  totalPopularity: number;
  avgPopularity: number;
  totalFollowers: number;
  topArtists: ArtistData[];
  soloCount: number;
  bandCount: number;
}

// Fallback capitals coordinates for cities without pre-configured centroids
const provinceCapitals: Record<string, string> = {
  "DKI Jakarta": "Jakarta",
  "Jakarta": "Jakarta",
  "Jawa Barat": "Bandung",
  "Jawa Tengah": "Semarang",
  "DI Yogyakarta": "Yogyakarta",
  "Jawa Timur": "Surabaya",
  "Banten": "Tangerang",
  "Bali": "Denpasar",
  "Nusa Tenggara Barat": "Mataram",
  "Nusa Tenggara Timur": "Kupang",
  "Sumatera Utara": "Medan",
  "Sumatera Barat": "Padang",
  "Sumatera Selatan": "Palembang",
  "Riau": "Pekanbaru",
  "Kepulauan Riau": "Batam",
  "Aceh": "Banda Aceh",
  "Lampung": "Bandar Lampung",
  "Jambi": "Jambi",
  "Bengkulu": "Bengkulu",
  "Kalimantan Barat": "Pontianak",
  "Kalimantan Timur": "Samarinda",
  "Kalimantan Selatan": "Banjarmasin",
  "Kalimantan Tengah": "Palangkaraya",
  "Sulawesi Selatan": "Makassar",
  "Sulawesi Utara": "Manado",
  "Sulawesi Tengah": "Palu",
  "Sulawesi Tenggara": "Kendari",
  "Gorontalo": "Gorontalo",
  "Maluku": "Ambon",
  "Maluku Utara": "Ternate",
  "Papua": "Jayapura",
  "Papua Barat": "Manokwari"
};

function resolveCityAndCoordinates(city: string, province: string): { targetCity: string; coordinates: [number, number] } | null {
  const normalizedCity = city ? city.trim() : "";
  if (normalizedCity && cityCentroids[normalizedCity]) {
    return { targetCity: normalizedCity, coordinates: cityCentroids[normalizedCity] };
  }
  
  const normalizedProvince = province ? province.trim() : "";
  const capital = provinceCapitals[normalizedProvince];
  if (capital && cityCentroids[capital]) {
    return { targetCity: capital, coordinates: cityCentroids[capital] };
  }
  
  // Last fallback - fuzzy search
  for (const provKey of Object.keys(provinceCapitals)) {
    if (normalizedProvince.toLowerCase().includes(provKey.toLowerCase())) {
      const cap = provinceCapitals[provKey];
      if (cityCentroids[cap]) {
        return { targetCity: cap, coordinates: cityCentroids[cap] };
      }
    }
  }
  
  return null;
}

// Fuzzy matching for province naming standardizations between DB and GeoJSON
function matchProvinceName(dbProv: string, geoProv: string): boolean {
  const db = dbProv.toLowerCase().trim();
  const geo = geoProv.toLowerCase().trim();
  
  if (db === geo) return true;
  if (db.includes(geo) || geo.includes(db)) return true;
  
  if (db === "dki jakarta" && geo.includes("jakarta")) return true;
  if (db === "di yogyakarta" && geo.includes("yogyakarta")) return true;
  if (db === "banten" && geo.includes("banten")) return true;
  if (db === "banten" && geo.includes("probanten")) return true;
  if (db === "papua" && geo.includes("irian jaya")) return true;
  
  return false;
}

// Diverging Color Ramp (Blue -> Teal -> Red) based on divergence from a global average
function getDivergingColor(value: number, avg: number, maxDiv: number) {
  const divergence = value - avg; 
  let t = divergence / maxDiv;
  t = Math.max(-1, Math.min(1, t)); // clamp to [-1, 1]
  
  const c1 = [59, 130, 246];  // Blue (#3b82f6) - Lowest from average
  const c2 = [20, 184, 166];  // Teal (#14b8a6) - Closer to average
  const c3 = [239, 68, 68];   // Red (#ef4444) - Highest from average
  
  let r, g, b;
  if (t < 0) {
    const mappedT = t + 1; // scale -1..0 to 0..1
    r = Math.round(c1[0] + (c2[0] - c1[0]) * mappedT);
    g = Math.round(c1[1] + (c2[1] - c1[1]) * mappedT);
    b = Math.round(c1[2] + (c2[2] - c1[2]) * mappedT);
  } else {
    const mappedT = t; // scale 0..1 to 0..1
    r = Math.round(c2[0] + (c3[0] - c2[0]) * mappedT);
    g = Math.round(c2[1] + (c3[1] - c2[1]) * mappedT);
    b = Math.round(c2[2] + (c3[2] - c2[2]) * mappedT);
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}

export interface MapProps {
  mapMode: 'density' | 'popularity';
  selectedGenre: string;
  selectedFormat: string;
  radiusMetric: 'followers' | 'count';
  sebaranGranularity?: 'pulau' | 'provinsi' | 'kota';
  activePerspective?: string;
  onArtistClick?: (artist: ArtistData) => void;
  onCityClick?: (city: CityAggregate) => void;
  onProvinceClick?: (province: ProvinceAggregate) => void;
  onDataLoaded?: (data: CityAggregate[]) => void;
  onGenresLoaded?: (genres: string[]) => void;
}

export default function InteractiveMap({
  mapMode,
  selectedGenre,
  selectedFormat,
  radiusMetric,
  sebaranGranularity = "kota",
  activePerspective = "sebaran",
  onArtistClick,
  onCityClick,
  onProvinceClick,
  onDataLoaded,
  onGenresLoaded,
}: MapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
  const [rawArtists, setRawArtists] = useState<any[]>([]);
  const [hoveredCity, setHoveredCity] = useState<CityAggregate | null>(null);
  const [hoveredIsland, setHoveredIsland] = useState<{ name: string; count: number; totalFollowers: number } | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceAggregate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch GeoJSON and raw data once on mount
  useEffect(() => {
    let mounted = true;

    async function loadMapData() {
      try {
        const geoResponse = await fetch("/indonesiaProvinces.json");
        const geoJson = (await geoResponse.json()) as GeoJsonObject;

        const { supabaseApi } = await import("@/lib/api/client");
        const dbResponse = await supabaseApi.get(
          "/music_data?select=id,profile_picture,artist_name,origin_city,origin_province,popularity,followers,genre,artist_type,primary_genre&is_indonesian=eq.true"
        );

        if (mounted) {
          setGeoJsonData(geoJson);
          setRawArtists(dbResponse.data || []);
          setIsLoading(false);

          // Extract unique genres
          const genresSet = new Set<string>();
          dbResponse.data.forEach((row: any) => {
            if (row.primary_genre) {
              genresSet.add(row.primary_genre.toLowerCase().trim());
            }
          });
          const sortedGenres = Array.from(genresSet).sort();
          if (onGenresLoaded) onGenresLoaded(sortedGenres);
        }
      } catch (err) {
        console.error("Map Data Fetch Error:", err);
        if (mounted) setIsLoading(false);
      }
    }

    loadMapData();
    return () => { mounted = false; };
  }, []);

  // Compute filtered city aggregates Reactively
  const cityData = useMemo<CityAggregate[]>(() => {
    const filtered = rawArtists.filter((row) => {
      // Genre filter
      if (selectedGenre !== "Semua") {
        if (row.primary_genre?.toLowerCase() !== selectedGenre.toLowerCase()) {
          return false;
        }
      }
      // Format filter
      if (selectedFormat !== "Semua") {
        const type = row.artist_type === "Group" ? "Band" : "Soloist";
        if (type !== selectedFormat) {
          return false;
        }
      }
      return true;
    });

    const cityMap = new Map<string, Omit<CityAggregate, "avgPopularity" | "topGenre" | "topArtistName" | "topArtistPopularity" | "soloCount" | "bandCount"> & {
      genres: Map<string, number>;
      soloCount: number;
      bandCount: number;
    }>();

    filtered.forEach((row) => {
      const resolved = resolveCityAndCoordinates(row.origin_city, row.origin_province);
      if (!resolved) return;
      const { targetCity, coordinates } = resolved;

      const existing = cityMap.get(targetCity) || {
        city: targetCity,
        count: 0,
        totalPopularity: 0,
        totalFollowers: 0,
        topArtists: [] as ArtistData[],
        coordinates,
        genres: new Map<string, number>(),
        soloCount: 0,
        bandCount: 0,
      };

      existing.count += 1;
      existing.totalPopularity += row.popularity || 0;
      existing.totalFollowers += row.followers || 0;
      
      const artistData = mapDbToArtistData(row);
      existing.topArtists.push(artistData);

      const pg = row.primary_genre ? row.primary_genre.trim() : "";
      if (pg) {
        existing.genres.set(pg, (existing.genres.get(pg) || 0) + 1);
      }

      if (row.artist_type === "Group") {
        existing.bandCount += 1;
      } else {
        existing.soloCount += 1;
      }

      cityMap.set(targetCity, existing);
    });

    return Array.from(cityMap.values()).map((c) => {
      c.topArtists.sort((a, b) => b.popularity - a.popularity);
      const topArtist = c.topArtists[0];
      const topArtistName = topArtist ? topArtist.name : "N/A";
      const topArtistPopularity = topArtist ? topArtist.popularity : 0;

      let topGenre = "Pop";
      let maxGenreCount = 0;
      c.genres.forEach((count, gen) => {
        if (count > maxGenreCount) {
          maxGenreCount = count;
          topGenre = gen;
        }
      });
      topGenre = topGenre
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        city: c.city,
        count: c.count,
        totalPopularity: c.totalPopularity,
        avgPopularity: c.count > 0 ? Math.round(c.totalPopularity / c.count) : 0,
        totalFollowers: c.totalFollowers,
        topArtists: c.topArtists,
        coordinates: c.coordinates,
        topGenre,
        topArtistName,
        topArtistPopularity,
        soloCount: c.soloCount,
        bandCount: c.bandCount,
      };
  }, [rawArtists, selectedGenre, selectedFormat]);

  // Compute province aggregates
  const provinceData = useMemo<ProvinceAggregate[]>(() => {
    const filtered = rawArtists.filter((row) => {
      // Genre filter
      if (selectedGenre !== "Semua") {
        if (row.primary_genre?.toLowerCase() !== selectedGenre.toLowerCase()) {
          return false;
        }
      }
      // Format filter
      if (selectedFormat !== "Semua") {
        const type = row.artist_type === "Group" ? "Band" : "Soloist";
        if (type !== selectedFormat) {
          return false;
        }
      }
      return true;
    });

    const provMap = new Map<string, Omit<ProvinceAggregate, "avgPopularity"> & {
      genres: Map<string, number>;
    }>();

    filtered.forEach((row) => {
      const prov = row.origin_province?.trim() || "";
      if (!prov || prov.toLowerCase() === "unknown") return;

      const existing = provMap.get(prov) || {
        province: prov,
        count: 0,
        totalPopularity: 0,
        totalFollowers: 0,
        topArtists: [] as ArtistData[],
        genres: new Map<string, number>(),
        soloCount: 0,
        bandCount: 0,
      };

      existing.count += 1;
      existing.totalPopularity += row.popularity || 0;
      existing.totalFollowers += row.followers || 0;

      const artistData = mapDbToArtistData(row);
      existing.topArtists.push(artistData);

      const pg = row.primary_genre ? row.primary_genre.trim() : "";
      if (pg) {
        existing.genres.set(pg, (existing.genres.get(pg) || 0) + 1);
      }

      if (row.artist_type === "Group") {
        existing.bandCount += 1;
      } else {
        existing.soloCount += 1;
      }

      provMap.set(prov, existing);
    });

    return Array.from(provMap.values()).map((p) => {
      p.topArtists.sort((a, b) => b.popularity - a.popularity);
      return {
        province: p.province,
        count: p.count,
        totalPopularity: p.totalPopularity,
        avgPopularity: p.count > 0 ? Math.round(p.totalPopularity / p.count) : 0,
        totalFollowers: p.totalFollowers,
        topArtists: p.topArtists,
        soloCount: p.soloCount,
        bandCount: p.bandCount,
      };
    });
  }, [rawArtists, selectedGenre, selectedFormat]);

  // Helper to map province to island
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

  // Compute island aggregates reactively
  const islandData = useMemo(() => {
    if (sebaranGranularity !== 'pulau') return [];
    const islandCentroids: Record<string, [number, number]> = {
      "Jawa": [-7.2972, 110.0163],
      "Sumatera": [-0.5897, 102.1725],
      "Kalimantan": [-1.2383, 114.3090],
      "Sulawesi": [-1.6852, 120.6781],
      "Nusa Tenggara": [-8.6500, 117.3600],
      "Maluku": [-3.2384, 130.1452],
      "Papua": [-4.2699, 138.0803]
    };

    const islandMap = new Map<string, { name: string; count: number; totalFollowers: number; coordinates: [number, number] }>();

    Object.keys(islandCentroids).forEach((islandName) => {
      islandMap.set(islandName, {
        name: islandName,
        count: 0,
        totalFollowers: 0,
        coordinates: islandCentroids[islandName],
      });
    });

    rawArtists.forEach((row) => {
      if (selectedGenre !== "Semua" && row.primary_genre?.toLowerCase() !== selectedGenre.toLowerCase()) return;
      if (selectedFormat !== "Semua") {
        const type = row.artist_type === "Group" ? "Band" : "Soloist";
        if (type !== selectedFormat) return;
      }
      const island = getIslandForProvince(row.origin_province || "");
      if (island === "Lainnya") return;
      
      const existing = islandMap.get(island);
      if (existing) {
        existing.count += 1;
        existing.totalFollowers += row.followers || 0;
      }
    });

    return Array.from(islandMap.values());
  }, [rawArtists, sebaranGranularity, selectedGenre, selectedFormat]);

  // Compute province counts for Choropleth styling
  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rawArtists.forEach((row) => {
      if (selectedGenre !== "Semua" && row.primary_genre?.toLowerCase() !== selectedGenre.toLowerCase()) return;
      if (selectedFormat !== "Semua") {
        const type = row.artist_type === "Group" ? "Band" : "Soloist";
        if (type !== selectedFormat) return;
      }
      const prov = row.origin_province;
      if (prov) {
        counts[prov] = (counts[prov] || 0) + 1;
      }
    });
    return counts;
  }, [rawArtists, selectedGenre, selectedFormat]);

  const maxProvinceCount = useMemo(() => {
    const values = Object.values(provinceCounts) as number[];
    return values.length > 0 ? Math.max(...values) : 1;
  }, [provinceCounts]);

  // Trigger callback to parent when aggregated cityData changes (updates KPI values)
  useEffect(() => {
    if (onDataLoaded && !isLoading) {
      onDataLoaded(cityData);
    }
  }, [cityData, onDataLoaded, isLoading]);

  if (isLoading || !geoJsonData) {
    return null; 
  }

  // Calculate max values for proportional scaling and color diverging stop metrics
  const maxMetricValue = Math.max(...cityData.map((c: CityAggregate) => radiusMetric === 'followers' ? c.totalFollowers : c.count), 1);
  const totalPop = cityData.reduce((acc: number, c: CityAggregate) => acc + c.avgPopularity, 0);
  const globalAvgPopularity = cityData.length > 0 ? totalPop / cityData.length : 50;
  
  let maxPopDivergence = 15; 
  cityData.forEach((c: CityAggregate) => {
    const div = Math.abs(c.avgPopularity - globalAvgPopularity);
    if (div > maxPopDivergence) maxPopDivergence = div;
  });

  const totalCount = cityData.reduce((acc: number, c: CityAggregate) => acc + c.count, 0);
  const globalAvgCount = cityData.length > 0 ? totalCount / cityData.length : 5;
  
  let maxCountDivergence = 5;
  cityData.forEach((c: CityAggregate) => {
    const div = Math.abs(c.count - globalAvgCount);
    if (div > maxCountDivergence) maxCountDivergence = div;
  });

  const getProvinceStyle = (feature: any) => {
    const propName = feature.properties?.Propinsi || "";
    let count = 0;
    for (const dbProv of Object.keys(provinceCounts)) {
      if (matchProvinceName(dbProv, propName)) {
        count = provinceCounts[dbProv] || 0;
        break;
      }
    }
    
    const baseOpacity = 0.04;
    const maxOpacity = 0.45;
    const opacity = count > 0 
      ? baseOpacity + (count / maxProvinceCount) * (maxOpacity - baseOpacity)
      : baseOpacity;

    return {
      color: "var(--color-accent-600)",
      weight: 1,
      fillColor: "var(--color-accent-500)",
      fillOpacity: opacity,
      dashArray: "3",
    };
  };

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[-2.5489, 118.0149]}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full bg-transparent"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <GeoJSON 
          key={`${sebaranGranularity}-${selectedGenre}-${selectedFormat}-${activePerspective}`}
          data={geoJsonData}
          style={getProvinceStyle}
          onEachFeature={(feature, layer) => {
            layer.on({
              mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                  weight: 2,
                  fillOpacity: 0.5,
                  color: "var(--color-accent-400)"
                });
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                  target.bringToFront();
                }
                if (activePerspective === "sebaran" && sebaranGranularity === "provinsi") {
                  const propName = feature.properties?.Propinsi || "";
                  const matchedProv = provinceData.find(p => matchProvinceName(p.province, propName)) || {
                    province: propName,
                    count: 0,
                    totalPopularity: 0,
                    avgPopularity: 0,
                    totalFollowers: 0,
                    topArtists: [],
                    soloCount: 0,
                    bandCount: 0,
                  };
                  setHoveredProvince(matchedProv);
                }
              },
              mouseout: (e) => {
                const target = e.target;
                target.setStyle(getProvinceStyle(feature));
                if (activePerspective === "sebaran" && sebaranGranularity === "provinsi") {
                  setHoveredProvince(null);
                }
              },
              click: (e) => {
                if (activePerspective === "sebaran" && sebaranGranularity === "provinsi") {
                  const propName = feature.properties?.Propinsi || "";
                  const matchedProv = provinceData.find(p => matchProvinceName(p.province, propName));
                  if (matchedProv && onProvinceClick) {
                    onProvinceClick(matchedProv);
                  }
                }
              }
            });
          }}
        />

        <Pane name="cities-pane" style={{ zIndex: 500 }}>
          {/* 1. Pulau (Island) Granularity Mode */}
          {activePerspective === "sebaran" && sebaranGranularity === "pulau" && islandData.map((island) => {
            const maxIslandMetricValue = Math.max(...islandData.map((i) => radiusMetric === 'followers' ? i.totalFollowers : i.count), 1);
            const baseRadius = 10;
            const value = radiusMetric === 'followers' ? island.totalFollowers : island.count;
            const ratio = value / maxIslandMetricValue;
            const calculatedRadius = baseRadius + (ratio * 26);
            const heatColor = "var(--color-accent-500)";

            return (
              <CircleMarker
                key={island.name}
                center={island.coordinates}
                radius={calculatedRadius}
                pane="cities-pane"
                pathOptions={{
                  color: heatColor,
                  fillColor: heatColor,
                  fillOpacity: 0.5,
                  weight: 2,
                }}
                eventHandlers={{
                  mouseover: (e) => {
                    const marker = e.target;
                    marker.setStyle({
                      weight: 4,
                      fillOpacity: 0.8,
                      color: "var(--color-accent-400)",
                      fillColor: "var(--color-accent-400)"
                    });
                    setHoveredIsland(island);
                  },
                  mouseout: (e) => {
                    const marker = e.target;
                    marker.setStyle({
                      color: heatColor,
                      fillColor: heatColor,
                      fillOpacity: 0.5,
                      weight: 2,
                    });
                    setHoveredIsland(null);
                  }
                }}
              />
            );
          })}

          {/* 2. Kota (City) Granularity Mode or Other Perspectives */}
          {((activePerspective === "sebaran" && sebaranGranularity === "kota") || activePerspective !== "sebaran") && cityData.map((city: CityAggregate) => {
            const baseRadius = 6;
            const value = radiusMetric === 'followers' ? city.totalFollowers : city.count;
            const ratio = value / maxMetricValue;
            const calculatedRadius = baseRadius + (ratio * 24);
            const heatColor = mapMode === 'popularity' 
              ? getDivergingColor(city.avgPopularity, globalAvgPopularity, maxPopDivergence)
              : getDivergingColor(city.count, globalAvgCount, maxCountDivergence);

            return (
              <CircleMarker
                key={city.city}
                center={city.coordinates}
                radius={calculatedRadius}
                pane="cities-pane"
                pathOptions={{
                  color: heatColor,
                  fillColor: heatColor,
                  fillOpacity: 0.6,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => {
                    if (onCityClick) onCityClick(city);
                  },
                  mouseover: (e) => {
                    const marker = e.target;
                    marker.setStyle({
                      weight: 4,
                      fillOpacity: 1,
                      color: heatColor,
                      fillColor: heatColor
                    });
                    setHoveredCity(city);
                  },
                  mouseout: (e) => {
                    const marker = e.target;
                    marker.setStyle({
                      color: heatColor,
                      fillColor: heatColor,
                      fillOpacity: 0.6,
                      weight: 2,
                    });
                    setHoveredCity(null);
                  }
                }}
              />
            );
          })}
        </Pane>
      </MapContainer>

      {/* Simple Hover HUD */}
      <AnimatePresence>
        {hoveredCity && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none"
          >
            <div 
              className="px-6 py-3 flex flex-col items-center rounded-xl shadow-2xl"
              style={{
                background: "rgba(18, 18, 18, 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            >
              <span className="font-bold text-white text-lg tracking-wide">{hoveredCity.city}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[#34d399] text-sm font-bold">{hoveredCity.count}</span>
                <span className="text-white/60 text-xs uppercase tracking-wider font-medium">Musisi Terdaftar</span>
              </div>
            </div>
          </motion.div>
        )}

        {hoveredIsland && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none"
          >
            <div 
              className="px-6 py-3 flex flex-col items-center rounded-xl shadow-2xl"
              style={{
                background: "rgba(18, 18, 18, 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            >
              <span className="font-bold text-white text-lg tracking-wide">Wilayah: {hoveredIsland.name}</span>
              <div className="flex items-center gap-4 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#34d399] text-sm font-bold">{hoveredIsland.count}</span>
                  <span className="text-white/60 text-xs uppercase tracking-wider font-medium">Musisi</span>
                </div>
                <div className="w-[1px] h-3 bg-white/20" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sky-400 text-sm font-bold">
                    {hoveredIsland.totalFollowers >= 1_000_000 
                      ? `${(hoveredIsland.totalFollowers / 1_000_000).toFixed(1)}M` 
                      : hoveredIsland.totalFollowers >= 1_000 
                        ? `${(hoveredIsland.totalFollowers / 1_000).toFixed(0)}K` 
                        : hoveredIsland.totalFollowers}
                  </span>
                  <span className="text-white/60 text-xs uppercase tracking-wider font-medium">Followers</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {hoveredProvince && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none"
          >
            <div 
              className="px-6 py-3 flex flex-col items-center rounded-xl shadow-2xl"
              style={{
                background: "rgba(18, 18, 18, 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            >
              <span className="font-bold text-white text-lg tracking-wide">{hoveredProvince.province}</span>
              <div className="flex items-center gap-4 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#34d399] text-sm font-bold">{hoveredProvince.count}</span>
                  <span className="text-white/60 text-xs uppercase tracking-wider font-medium">Musisi</span>
                </div>
                <div className="w-[1px] h-3 bg-white/20" />
                <div className="flex items-center gap-1.5">
                  <span className="text-teal-400 text-sm font-bold">{hoveredProvince.avgPopularity}</span>
                  <span className="text-white/60 text-xs uppercase tracking-wider font-medium">Avg Pop</span>
                </div>
                <div className="w-[1px] h-3 bg-white/20" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sky-400 text-sm font-bold">
                    {hoveredProvince.totalFollowers >= 1_000_000 
                      ? `${(hoveredProvince.totalFollowers / 1_000_000).toFixed(1)}M` 
                      : hoveredProvince.totalFollowers >= 1_000 
                        ? `${(hoveredProvince.totalFollowers / 1_000).toFixed(0)}K` 
                        : hoveredProvince.totalFollowers}
                  </span>
                  <span className="text-white/60 text-xs uppercase tracking-wider font-medium">Followers</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .leaflet-interactive {
          transition: stroke 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                      fill 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                      stroke-width 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                      fill-opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                      filter 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.2));
        }
        .leaflet-interactive:hover {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
        }
        .leaflet-container {
          background: transparent !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(18, 18, 18, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .leaflet-popup-tip {
          background: rgba(18, 18, 18, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
    </div>
  );
}
