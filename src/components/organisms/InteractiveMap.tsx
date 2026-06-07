"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Pane } from "react-leaflet";
import { AnimatePresence, motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { cityCentroids } from "@/lib/config/cityCentroids";
import type { ArtistData } from "@/components/organisms/ArtistDrawer";
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
    r = Math.round(c1[0] + (c2[0] - c1[0]) * mappedT);
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
  onArtistClick?: (artist: ArtistData) => void;
  onCityClick?: (city: CityAggregate) => void;
  onDataLoaded?: (data: CityAggregate[]) => void;
}

export default function InteractiveMap({ mapMode, onArtistClick, onCityClick, onDataLoaded }: MapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
  const [rawArtists, setRawArtists] = useState<any[]>([]);
  const [hoveredCity, setHoveredCity] = useState<CityAggregate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // local filter states
  const [selectedGenre, setSelectedGenre] = useState<string>("Semua");
  const [selectedFormat, setSelectedFormat] = useState<string>("Semua");
  const [radiusMetric, setRadiusMetric] = useState<'followers' | 'count'>('followers');

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
  const cityData = useMemo(() => {
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
    });
  }, [rawArtists, selectedGenre, selectedFormat]);

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
    const values = Object.values(provinceCounts);
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
  const maxMetricValue = Math.max(...cityData.map((c) => radiusMetric === 'followers' ? c.totalFollowers : c.count), 1);
  const totalPop = cityData.reduce((acc, c) => acc + c.avgPopularity, 0);
  const globalAvgPopularity = cityData.length > 0 ? totalPop / cityData.length : 50;
  
  let maxPopDivergence = 15; 
  cityData.forEach((c) => {
    const div = Math.abs(c.avgPopularity - globalAvgPopularity);
    if (div > maxPopDivergence) maxPopDivergence = div;
  });

  const totalCount = cityData.reduce((acc, c) => acc + c.count, 0);
  const globalAvgCount = cityData.length > 0 ? totalCount / cityData.length : 5;
  
  let maxCountDivergence = 5;
  cityData.forEach((c) => {
    const div = Math.abs(c.count - globalAvgCount);
    if (div > maxCountDivergence) maxCountDivergence = div;
  });

  const getProvinceStyle = (feature: any) => {
    const propName = feature.properties?.Propinsi || "";
    let count = 0;
    for (const [dbProv, c] of Object.entries(provinceCounts)) {
      if (matchProvinceName(dbProv, propName)) {
        count = c;
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
                target.bringToFront();
              },
              mouseout: (e) => {
                const target = e.target;
                target.setStyle(getProvinceStyle(feature));
              }
            });
          }}
        />

        <Pane name="cities-pane" style={{ zIndex: 500 }}>
          {cityData.map((city) => {
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

      {/* Floating Control Panel */}
      <div className="absolute bottom-6 left-6 z-[1000] w-64 p-4 rounded-xl border border-(--color-border-default) bg-(--color-bg-sidebar)/90 backdrop-blur-md shadow-2xl flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-white/90">Filter Genre</span>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full text-xs bg-(--color-bg-surface)/40 border border-(--color-border-default) rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-(--color-accent-500) transition-colors cursor-pointer"
          >
            <option value="Semua">Semua Genre</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Indie">Indie</option>
            <option value="Dangdut">Dangdut</option>
            <option value="Jazz">Jazz</option>
            <option value="Folk">Folk</option>
            <option value="Metal">Metal</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-white/90">Format Musisi</span>
          <div className="grid grid-cols-3 gap-1 bg-(--color-bg-surface)/30 p-0.5 rounded-lg border border-(--color-border-default)">
            {["Semua", "Soloist", "Band"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFormat(type === "Band" ? "Band" : type === "Soloist" ? "Soloist" : "Semua")}
                className={`py-1 text-[10px] font-medium rounded transition-colors cursor-pointer text-center ${
                  (type === "Semua" && selectedFormat === "Semua") ||
                  (type === "Soloist" && selectedFormat === "Soloist") ||
                  (type === "Band" && selectedFormat === "Band")
                    ? "bg-(--color-accent-500) text-black font-semibold"
                    : "text-(--color-text-secondary) hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-white/90">Ukuran Gelembung</span>
          <div className="grid grid-cols-2 gap-1 bg-(--color-bg-surface)/30 p-0.5 rounded-lg border border-(--color-border-default)">
            {[
              { id: "followers", label: "Followers" },
              { id: "count", label: "Artis" }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRadiusMetric(opt.id as 'followers' | 'count')}
                className={`py-1 text-[10px] font-medium rounded transition-colors cursor-pointer text-center ${
                  radiusMetric === opt.id
                    ? "bg-(--color-accent-500) text-black font-semibold"
                    : "text-(--color-text-secondary) hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Hover HUD */}
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
              className="px-6 py-4 flex flex-col rounded-xl shadow-2xl w-80 text-left border border-white/10 bg-[#0c1015]/90 backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                <span className="font-bold text-white text-lg tracking-wide">{hoveredCity.city}</span>
                <span className="text-[10px] uppercase font-semibold text-(--color-text-secondary) tracking-wider">
                  Episentrum Kota
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-(--color-text-secondary) uppercase tracking-wider font-medium">Kepadatan Artis</span>
                  <span className="text-white text-sm font-semibold mt-0.5">
                    {hoveredCity.count} Musisi
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-(--color-text-secondary) uppercase tracking-wider font-medium">Genre Utama</span>
                  <span className="text-(--color-accent-400) text-sm font-semibold mt-0.5">
                    {hoveredCity.topGenre}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-(--color-text-secondary) uppercase tracking-wider font-medium">Pembagian Solo/Band</span>
                  <span className="text-white text-xs font-semibold mt-1">
                    {hoveredCity.soloCount} S / {hoveredCity.bandCount} B
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-(--color-text-secondary) uppercase tracking-wider font-medium">Musisi Teratas</span>
                  <span className="text-white text-xs font-semibold truncate mt-1" title={hoveredCity.topArtistName}>
                    {hoveredCity.topArtistName} ({hoveredCity.topArtistPopularity} Pop)
                  </span>
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
