import { supabaseApi } from "./client";
import type { ArtistData } from "@/components/organisms/ArtistDrawer";

/**
 * DatabaseArtist reflects the raw Postgres schema for the public.music_data table.
 */
export interface DatabaseArtist {
  id: string;
  profile_picture: string;
  artist_name: string;
  origin_city: string;
  province: string;
  popularity: number;
  followers: number;
  genre: string[];
}

/**
 * Maps the raw database record to the frontend component expected schema.
 */
export function mapDbToArtistData(dbArtist: DatabaseArtist): ArtistData {
  return {
    name: dbArtist.artist_name,
    profilePicture: dbArtist.profile_picture,
    originCity: dbArtist.origin_city,
    province: dbArtist.province,
    popularity: dbArtist.popularity,
    followers: dbArtist.followers,
    genres: dbArtist.genre || [],
  };
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
}

/**
 * Parses the Content-Range header from PostgREST to extract the total count.
 * Expected format: "0-9/312" -> returns 312
 */
function extractCount(header?: string): number {
  if (!header) return 0;
  const parts = header.split("/");
  if (parts.length === 2) {
    return parseInt(parts[1], 10) || 0;
  }
  return 0;
}

/**
 * Data Service for querying Indonesian musicians.
 * Leverages PostgREST syntax directly via Axios.
 */
export const musicService = {
  /**
   * Fetch artists with pagination and optional text search / category filtering.
   * @param query - The string to search for (name, city, province)
   * @param filter - A quick filter (e.g., "Jawa Barat", "Pop") or "Semua"
   * @param page - Current page (1-indexed)
   * @param pageSize - Items per page
   */
  async getArtists(
    query: string = "",
    filter: string = "Semua",
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResult<ArtistData>> {
    let url = `/music_data?order=popularity.desc`;
    const filters: string[] = [];

    // 1. Text Search (ILIKE across multiple fields matching exact database column names)
    if (query.trim()) {
      const q = encodeURIComponent(`*${query.trim()}*`);
      filters.push(
        `or=(artist_name.ilike.${q},origin_city.ilike.${q},origin_province.ilike.${q})`,
      );
    }

    // 2. Quick Category Filter (Handles regions & genres matching robustly)
    // For the text[] genre array, we cast it to text (genre::text) to perform case-insensitive substring matching.
    if (filter !== "Semua") {
      const f = encodeURIComponent(`*${filter}*`);
      filters.push(
        `or=(origin_province.ilike.${f},genre::text.ilike.${f})`,
      );
    }

    if (filters.length > 0) {
      // Join all filters with '&'
      url += `&${filters.join("&")}`;
    }

    // Pagination headers
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const response = await supabaseApi.get<DatabaseArtist[]>(url, {
      headers: {
        Prefer: "count=exact",
        Range: `${start}-${end}`,
        "Range-Unit": "items",
      },
    });

    const count = extractCount(response.headers["content-range"]);
    return {
      data: response.data.map(mapDbToArtistData),
      count,
    };
  },
};
