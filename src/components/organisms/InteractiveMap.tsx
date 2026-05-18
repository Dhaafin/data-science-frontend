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
}

// Diverging Color Ramp (Blue -> Teal -> Red) based on divergence from a global average
function getDivergingColor(value: number, avg: number, maxDiv: number) {
  const divergence = value - avg; 
  let t = divergence / maxDiv;
  t = Math.max(-1, Math.min(1, t)); // clamp to [-1, 1]
  
  // Define our 3 color stops: Blue, Teal, Red
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
  onArtistClick?: (artist: ArtistData) => void;
  onCityClick?: (city: CityAggregate) => void;
  onDataLoaded?: (data: CityAggregate[]) => void;
}

export default function InteractiveMap({ mapMode, onArtistClick, onCityClick, onDataLoaded }: MapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
  const [cityData, setCityData] = useState<CityAggregate[]>([]);
  const [hoveredCity, setHoveredCity] = useState<CityAggregate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch GeoJSON and Database map data
  useEffect(() => {
    let mounted = true;

    async function loadMapData() {
      try {
        // 1. Fetch lightweight GeoJSON
        const geoResponse = await fetch("/indonesiaProvinces.json");
        const geoJson = (await geoResponse.json()) as GeoJsonObject;

        // 2. Fetch all required map data from Supabase via our Axios client
        // Selecting full columns to support the ArtistDrawer drilldown payload (~25KB)
        const { supabaseApi } = await import("@/lib/api/client");
        const { mapDbToArtistData } = await import("@/lib/api/musicService");
        const dbResponse = await supabaseApi.get(
          "/music_data?select=id,profile_picture,artist_name,origin_city,origin_province,popularity,followers,genre,artist_type&is_indonesian=eq.true"
        );

        // 3. Aggregate data by City
        const cityMap = new Map<string, CityAggregate>();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbResponse.data.forEach((row: any) => {
          const city = row.origin_city;
          // Skip if city is null or we don't have its centroid configured
          if (!city || !cityCentroids[city]) return;

          const existing = cityMap.get(city) || {
            city,
            count: 0,
            totalPopularity: 0,
            avgPopularity: 0,
            totalFollowers: 0,
            topArtists: [] as ArtistData[],
            coordinates: cityCentroids[city],
          };

          existing.count += 1;
          existing.totalPopularity += row.popularity || 0;
          existing.totalFollowers += row.followers || 0;
          
          // Map to ArtistData and keep a small list of top artists for the popup
          const artistData = mapDbToArtistData(row);
          existing.topArtists.push(artistData);
          existing.topArtists.sort((a, b) => b.popularity - a.popularity);

          cityMap.set(city, existing);
        });

        // Calculate averages
        const finalCityData = Array.from(cityMap.values()).map(c => ({
          ...c,
          avgPopularity: Math.round(c.totalPopularity / c.count)
        }));

        if (mounted) {
          setGeoJsonData(geoJson);
          setCityData(finalCityData);
          setIsLoading(false);
          if (onDataLoaded) onDataLoaded(finalCityData);
        }
      } catch (err) {
        console.error("Map Data Fetch Error:", err);
        if (mounted) setIsLoading(false);
      }
    }

    loadMapData();
    return () => { mounted = false; };
  }, []);

  if (isLoading || !geoJsonData) {
    return null; // The MapPlaceholder wrapper handles the skeleton
  }

  // Calculate max values for proportional scaling and diverging colors
  const maxFollowers = Math.max(...cityData.map(c => c.totalFollowers), 1);
  
  // Calculate global average popularity and max divergence
  const totalPop = cityData.reduce((acc, c) => acc + c.avgPopularity, 0);
  const globalAvgPopularity = cityData.length > 0 ? totalPop / cityData.length : 50;
  
  let maxPopDivergence = 15; 
  cityData.forEach(c => {
    const div = Math.abs(c.avgPopularity - globalAvgPopularity);
    if (div > maxPopDivergence) maxPopDivergence = div;
  });

  // Calculate global average density (count) and max divergence
  const totalCount = cityData.reduce((acc, c) => acc + c.count, 0);
  const globalAvgCount = cityData.length > 0 ? totalCount / cityData.length : 5;
  
  let maxCountDivergence = 5;
  cityData.forEach(c => {
    const div = Math.abs(c.count - globalAvgCount);
    if (div > maxCountDivergence) maxCountDivergence = div;
  });

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[-2.5489, 118.0149]}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full bg-transparent"
        zoomControl={false}
      >
        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Provincial Choropleth Outlines */}
        <GeoJSON 
          data={geoJsonData}
          style={() => ({
            color: "var(--color-accent-600)",
            weight: 1,
            fillColor: "var(--color-bg-surface)",
            fillOpacity: 0.1,
            dashArray: "3",
          })}
          onEachFeature={(feature, layer) => {
            layer.on({
              mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                  weight: 2,
                  fillOpacity: 0.3,
                  color: "var(--color-accent-400)"
                });
                target.bringToFront();
              },
              mouseout: (e) => {
                const target = e.target;
                target.setStyle({
                  color: "var(--color-accent-600)",
                  weight: 1,
                  fillColor: "var(--color-bg-surface)",
                  fillOpacity: 0.1,
                  dashArray: "3",
                });
              }
            });
          }}
        />

        {/* Proportional City Centroid Bubbles on a Custom High Z-Index Pane */}
        <Pane name="cities-pane" style={{ zIndex: 500 }}>
          {cityData.map((city) => {
            // Scale radius logarithmically or proportionally. Min 6px, Max 30px.
            const baseRadius = 6;
            const ratio = city.totalFollowers / maxFollowers;
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

      {/* Top Center HUD for Hovered City */}
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
                <span className="text-white/60 text-xs uppercase tracking-wider font-medium">Artists Recorded</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global override for Leaflet popup styles to match glassmorphism */}
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
        .leaflet-popup-close-button {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
