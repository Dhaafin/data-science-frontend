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
 * Helper to map a parent filter genre to a list of common sub-genres
 * found in Spotify/indonesian music datasets to allow broad overlap matching.
 */
function getGenreOverlapList(parentGenre: string): string[] {
  const g = parentGenre.toLowerCase();
  switch (g) {
    case "pop":
      return [
        "pop",
        "indonesian pop",
        "indie pop",
        "pop rock",
        "pop melayu",
        "sunda pop",
        "javanese pop",
        "pop sunda",
        "pop jawa",
        "folk pop",
        "acoustic pop",
        "alternative pop",
      ];
    case "indie":
      return [
        "indie",
        "indie pop",
        "indonesian indie",
        "indie rock",
        "indie folk",
        "indonesian indie pop",
        "indie soul",
      ];
    case "rock":
      return [
        "rock",
        "indonesian rock",
        "alternative rock",
        "pop rock",
        "indie rock",
        "hard rock",
        "metal",
        "punk",
        "grunge",
        "indonesian punk",
        "indonesian rockabilly",
      ];
    case "dangdut":
      return ["dangdut", "dangdut koplo", "koplo", "dangdut campursari"];
    case "jazz":
      return ["jazz", "indonesian jazz", "fusion jazz", "indonesian jazz pop"];
    case "folk":
      return ["folk", "indie folk", "indonesian folk", "folk pop", "acoustic folk"];
    case "metal":
      return ["metal", "metalcore", "deathcore", "thrash metal", "indonesian metal", "heavy metal"];
    case "hip hop":
      return ["hip hop", "indonesian hip hop", "rap", "indonesian rap"];
    case "r&b":
      return ["r&b", "indonesian r&b", "soul", "neo-soul"];
    case "electronic":
      return ["electronic", "electronica", "house", "techno", "edm", "indonesian electronic"];
    case "acoustic":
      return ["acoustic", "acoustic pop", "acoustic folk"];
    case "alternative":
      return ["alternative", "alternative rock", "alternative pop", "indonesian alternative", "alternative metal"];
    case "reggae":
      return ["reggae", "indonesian reggae", "ska", "indonesian ska"];
    default:
      return [g];
  }
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
    if (filter !== "Semua") {
      const isRegion = [
        "dki jakarta", "jawa barat", "jawa tengah", "jawa timur", "di yogyakarta",
        "banten", "sumatera utara", "sumatera barat", "bali", "sulawesi selatan"
      ].includes(filter.toLowerCase());

      if (isRegion) {
        const f = encodeURIComponent(`*${filter}*`);
        filters.push(`origin_province=ilike.${f}`);
      } else {
        const subGenres = getGenreOverlapList(filter);
        const listStr = subGenres.map(sg => encodeURIComponent(sg)).join(",");
        filters.push(`genre=ov.{${listStr}}`);
      }
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
