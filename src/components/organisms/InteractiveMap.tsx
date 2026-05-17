"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Text, Badge } from "@/components/atoms";
import { cityCentroids } from "@/lib/config/cityCentroids";
import { musicService, GenreEntry } from "@/lib/api/musicService";
import type { ArtistData } from "@/components/organisms/ArtistDrawer";

// Fix Leaflet marker icons issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface CityAggregate {
  city: string;
  count: number;
  totalPopularity: number;
  avgPopularity: number;
  totalFollowers: number;
  topArtists: { name: string; popularity: number }[];
  coordinates: [number, number];
}

interface MapProps {
  onArtistClick?: (artist: ArtistData) => void;
}

export default function InteractiveMap({ onArtistClick }: MapProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [cityData, setCityData] = useState<CityAggregate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch GeoJSON and Database map data
  useEffect(() => {
    let mounted = true;

    async function loadMapData() {
      try {
        // 1. Fetch lightweight GeoJSON
        const geoResponse = await fetch("/indonesiaProvinces.json");
        const geoJson = await geoResponse.json();

        // 2. Fetch all required map data from Supabase via our Axios client
        // Selecting only required columns to keep payload minimal (~15KB)
        const { default: supabaseApi } = await import("@/lib/api/client");
        const dbResponse = await supabaseApi.get(
          "/music_data?select=artist_name,origin_city,popularity,followers,genre&is_indonesian=eq.true"
        );

        // 3. Aggregate data by City
        const cityMap = new Map<string, CityAggregate>();
        
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
            topArtists: [],
            coordinates: cityCentroids[city],
          };

          existing.count += 1;
          existing.totalPopularity += row.popularity || 0;
          existing.totalFollowers += row.followers || 0;
          
          // Keep a small list of top artists for the popup
          existing.topArtists.push({ name: row.artist_name, popularity: row.popularity || 0 });
          existing.topArtists.sort((a, b) => b.popularity - a.popularity);
          existing.topArtists = existing.topArtists.slice(0, 3); // top 3

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

  // Calculate max values for proportional scaling
  const maxFollowers = Math.max(...cityData.map(c => c.totalFollowers), 1);

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

        {/* Proportional City Centroid Bubbles */}
        {cityData.map((city) => {
          // Scale radius logarithmically or proportionally. Min 6px, Max 30px.
          const baseRadius = 6;
          const ratio = city.totalFollowers / maxFollowers;
          const calculatedRadius = baseRadius + (ratio * 24);

          return (
            <CircleMarker
              key={city.city}
              center={city.coordinates}
              radius={calculatedRadius}
              pathOptions={{
                color: "var(--color-accent-400)",
                fillColor: "var(--color-accent-500)",
                fillOpacity: 0.6,
                weight: 2,
              }}
            >
              <Popup className="custom-popup">
                <div className="flex flex-col gap-2 p-1 min-w-[180px]">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <Text variant="label" color="primary">{city.city}</Text>
                    <Badge color="accent">{city.count} Artists</Badge>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <Text variant="caption" color="secondary">Avg Pop:</Text>
                    <Text as="span" variant="label" color="primary">{city.avgPopularity}</Text>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <Text variant="caption" color="muted">Top Artists:</Text>
                    {city.topArtists.map(a => (
                      <div key={a.name} className="flex justify-between text-xs">
                        <span className="text-white/80 truncate max-w-[120px]">{a.name}</span>
                        <span className="text-[var(--color-accent-500)]">{a.popularity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Global override for Leaflet popup styles to match glassmorphism */}
      <style jsx global>{`
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
