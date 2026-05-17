import { supabaseApi } from "./client";
import type { ArtistData } from "@/components/organisms/ArtistDrawer";

/**
 * DatabaseArtist reflects the raw Postgres schema for the public.music_data table.
 */
export interface DatabaseArtist {
  id: string;
  name: string;
  origin_city: string;
  province: string;
  popularity: number;
  followers: number;
  genres: string[];
}

/**
 * Maps the raw database record to the frontend component expected schema.
 */
export function mapDbToArtistData(dbArtist: DatabaseArtist): ArtistData {
  return {
    name: dbArtist.name,
    originCity: dbArtist.origin_city,
    province: dbArtist.province,
    popularity: dbArtist.popularity,
    followers: dbArtist.followers,
    genres: dbArtist.genres || [],
  };
}

/**
 * Data Service for querying Indonesian musicians.
 * Leverages PostgREST syntax directly via Axios.
 */
export const musicService = {
  /**
   * Fetch all artists sorted by popularity descending
   * @param limit - Max number of records to return (defaults to 100)
   */
  async getAllArtists(limit: number = 100): Promise<ArtistData[]> {
    const data = await supabaseApi.get<never, DatabaseArtist[]>(
      `/music_data?order=popularity.desc`,
      {
        headers: {
          Range: `0-${limit - 1}`,
          "Range-Unit": "items",
        },
      }
    );
    return data.map(mapDbToArtistData);
  },

  /**
   * Search artists across multiple fields using PostgREST OR operations
   * @param query - The string to search for (case-insensitive)
   */
  async searchArtists(query: string): Promise<ArtistData[]> {
    if (!query.trim()) return this.getAllArtists();
    
    // Format query for PostgREST ILIKE (* acts as wildcard %)
    const formattedQuery = encodeURIComponent(`*${query}*`);
    const orFilter = `or=(name.ilike.${formattedQuery},origin_city.ilike.${formattedQuery},province.ilike.${formattedQuery})`;
    
    const data = await supabaseApi.get<never, DatabaseArtist[]>(
      `/music_data?${orFilter}&order=popularity.desc`
    );
    return data.map(mapDbToArtistData);
  },
};
