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
  origin_province: string;
  popularity: number;
  followers: number;
  genre: string[];
  primary_genre?: string;
  artist_type?: string;
}

/**
 * Maps the raw database record to the frontend component expected schema.
 */
export function mapDbToArtistData(dbArtist: DatabaseArtist): ArtistData {
  return {
    name: dbArtist.artist_name,
    profilePicture: dbArtist.profile_picture,
    originCity: dbArtist.origin_city,
    province: dbArtist.origin_province,
    popularity: dbArtist.popularity || 0,
    followers: dbArtist.followers || 0,
    genres: dbArtist.genre || [],
    primaryGenre: dbArtist.primary_genre || "",
    artistType: dbArtist.artist_type || "Person",
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
    artistType: string = "Semua",
  ): Promise<PaginatedResult<ArtistData>> {
    let url = `/music_data?order=popularity.desc.nullslast`;
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
        const f = encodeURIComponent(filter);
        filters.push(`primary_genre=ilike.${f}`);
      }
    }

    // 3. Format/Artist Type Filter (Soloist vs. Band)
    if (artistType !== "Semua") {
      if (artistType === "Soloist") {
        filters.push("artist_type=eq.Person");
      } else if (artistType === "Band") {
        filters.push("artist_type=eq.Group");
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

  /**
   * Fetches selective data to compute genre statistics on the client.
   * Keeps network payload extremely small (e.g. <5KB for ~300 records).
   */
  async getGenreStats(): Promise<GenreEntry[]> {
    // Only select required columns for aggregation to maximize speed
    const response = await supabaseApi.get<{ primary_genre: string | null; popularity: number }[]>(
      "/music_data?select=primary_genre,popularity",
    );

    const data = response.data;
    const globalTotalPop = data.reduce((sum, item) => sum + (item.popularity || 0), 0);
    const globalAvgPop = data.length > 0 ? globalTotalPop / data.length : 0;

    // Track total popularity and count per genre
    const genreMap = new Map<string, { totalPop: number; count: number }>();

    data.forEach((artist) => {
      const pg = artist.primary_genre ? artist.primary_genre.trim() : "";
      if (!pg) return;

      // Standardize capitalization (e.g. 'indonesian pop' -> 'Indonesian Pop')
      const g = pg
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

      const pop = artist.popularity || 0;
      const current = genreMap.get(g) || { totalPop: 0, count: 0 };
      genreMap.set(g, {
        totalPop: current.totalPop + pop,
        count: current.count + 1,
      });
    });

    // Convert map to array and compute averages
    const stats: GenreEntry[] = Array.from(genreMap.entries()).map(([name, stat]) => {
      const avgPopularity = Math.round(stat.totalPop / stat.count);
      
      // Compute mock trend based on relation to global average
      let trend: "up" | "down" | "stable" = "stable";
      if (avgPopularity > globalAvgPop + 5) trend = "up";
      else if (avgPopularity < globalAvgPop - 5) trend = "down";

      return {
        name,
        count: stat.count,
        avgPopularity,
        trend,
      };
    });

    // Sort by count descending
    return stats.sort((a, b) => b.count - a.count);
  },

  /**
   * Fetches selective data to compute global KPI metrics on the client.
   */
  async getKpiStats(): Promise<{
    totalArtists: number;
    avgPopularity: number;
    provincesCovered: number;
    topGenre: string;
  }> {
    const response = await supabaseApi.get<{ origin_province: string; popularity: number; primary_genre: string | null }[]>(
      "/music_data?select=origin_province,popularity,primary_genre"
    );

    const data = response.data;
    const totalArtists = data.length;
    const avgPopularity = totalArtists > 0 
      ? Math.round(data.reduce((sum, item) => sum + (item.popularity || 0), 0) / totalArtists * 10) / 10
      : 0;

    const provinces = new Set(data.map((item) => item.origin_province).filter(Boolean));
    const provincesCovered = provinces.size;

    // Calculate top genre frequency
    const genreCounts = new Map<string, number>();
    data.forEach((item) => {
      const pg = item.primary_genre ? item.primary_genre.toLowerCase().trim() : "";
      if (pg) {
        genreCounts.set(pg, (genreCounts.get(pg) || 0) + 1);
      }
    });

    let topGenre = "N/A";
    let maxCount = 0;
    genreCounts.forEach((count, genre) => {
      if (count > maxCount) {
        maxCount = count;
        topGenre = genre;
      }
    });

    // Capitalize top genre nicely
    topGenre = topGenre
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      totalArtists,
      avgPopularity,
      provincesCovered,
      topGenre: topGenre || "Pop",
    };
  },

  /**
   * Fetches and aggregates live province-level comparative metrics.
   */
  async getProvinceComparisonStats(): Promise<ProvinceEntry[]> {
    const response = await supabaseApi.get<{ origin_province: string; popularity: number; primary_genre: string | null }[]>(
      "/music_data?select=origin_province,popularity,primary_genre"
    );

    const data = response.data;

    // Group by province
    const provinceMap = new Map<
      string,
      {
        totalPopularity: number;
        artistCount: number;
        genres: Map<string, number>;
      }
    >();

    data.forEach((item) => {
      const province = item.origin_province || "Unknown";
      const popularity = item.popularity || 0;

      const current = provinceMap.get(province) || {
        totalPopularity: 0,
        artistCount: 0,
        genres: new Map<string, number>(),
      };

      current.artistCount += 1;
      current.totalPopularity += popularity;

      const pg = item.primary_genre ? item.primary_genre.trim() : "";
      if (pg) {
        current.genres.set(pg, (current.genres.get(pg) || 0) + 1);
      }

      provinceMap.set(province, current);
    });

    // Helper to map province to region
    const getRegionForProvince = (prov: string): string => {
      const p = prov.toLowerCase();
      if (
        p.includes("jakarta") ||
        p.includes("banten") ||
        p.includes("jawa") ||
        p.includes("yogyakarta")
      )
        return "Jawa";
      if (
        p.includes("sumatera") ||
        p.includes("aceh") ||
        p.includes("riau") ||
        p.includes("jambi") ||
        p.includes("bengkulu") ||
        p.includes("lampung") ||
        p.includes("bangka")
      )
        return "Sumatera";
      if (p.includes("sulawesi") || p.includes("gorontalo")) return "Sulawesi";
      if (
        p.includes("bali") ||
        p.includes("nusa tenggara") ||
        p.includes("ntt") ||
        p.includes("ntb")
      )
        return "Nusa Tenggara";
      if (p.includes("kalimantan")) return "Kalimantan";
      if (p.includes("maluku")) return "Maluku";
      if (p.includes("papua")) return "Papua";
      return "Lainnya";
    };

    // Map to ProvinceEntry and compute details
    const comparisonData: ProvinceEntry[] = Array.from(provinceMap.entries())
      .filter(([prov]) => prov !== "Unknown")
      .map(([province, stats]) => {
        // Find top genre
        let topGenre = "Unknown";
        let maxCount = 0;
        stats.genres.forEach((count, gen) => {
          if (count > maxCount) {
            maxCount = count;
            topGenre = gen;
          }
        });

        // Capitalize nicely
        topGenre = topGenre
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        return {
          province,
          region: getRegionForProvince(province),
          artistCount: stats.artistCount,
          avgPopularity: Math.round(stats.totalPopularity / stats.artistCount),
          topGenre: topGenre === "Unknown" ? "Pop" : topGenre,
        };
      });

    // Sort by artist count descending
    // Sort by artist count descending
    return comparisonData.sort((a, b) => b.artistCount - a.artistCount);
  },

  /**
   * Fetches and aggregates local Collaboration Index (CI) and archetype per city.
   */
  async getCollaborationStats(): Promise<CollaborationEntry[]> {
    const response = await supabaseApi.get<{ origin_city: string | null; origin_province: string | null; artist_type: string | null; primary_genre: string | null }[]>(
      "/music_data?select=origin_city,origin_province,artist_type,primary_genre"
    );

    const data = response.data || [];
    const cityMap = new Map<string, {
      city: string;
      province: string;
      soloCount: number;
      bandCount: number;
      genres: Map<string, number>;
    }>();

    data.forEach((item) => {
      const city = item.origin_city || "Unknown";
      const province = item.origin_province || "Unknown";
      if (city === "Unknown") return;

      const current = cityMap.get(city) || {
        city,
        province,
        soloCount: 0,
        bandCount: 0,
        genres: new Map<string, number>(),
      };

      if (item.artist_type === "Group") {
        current.bandCount += 1;
      } else {
        current.soloCount += 1;
      }

      const pg = item.primary_genre ? item.primary_genre.trim() : "";
      if (pg) {
        current.genres.set(pg, (current.genres.get(pg) || 0) + 1);
      }

      cityMap.set(city, current);
    });

    return Array.from(cityMap.values()).map((stats) => {
      const totalCount = stats.soloCount + stats.bandCount;
      const collaborationIndex = totalCount > 0 ? Math.round((stats.bandCount / totalCount) * 100) : 0;
      
      let topGenre = "Pop";
      let maxCount = 0;
      stats.genres.forEach((count, gen) => {
        if (count > maxCount) {
          maxCount = count;
          topGenre = gen;
        }
      });

      let archetype: SceneArchetype = "Evolving Music Scene";
      if (collaborationIndex >= 65) archetype = "Indie Rehearsal Capital";
      else if (collaborationIndex >= 50) archetype = "Emerging Band Scene";
      else if (collaborationIndex >= 35) archetype = "Evolving Music Scene";
      else if (collaborationIndex >= 20) archetype = "Commercial Artist Hub";
      else archetype = "Vocalist & Studio Epicenter";

      return {
        city: stats.city,
        province: stats.province,
        soloCount: stats.soloCount,
        bandCount: stats.bandCount,
        totalCount,
        collaborationIndex,
        archetype,
        topGenre,
      };
    }).sort((a, b) => b.totalCount - a.totalCount);
  },

  /**
   * Fetches and aggregates the cross-tabulation matrix of parent genre vs soloist/band format.
   */
  async getGenreFormatMatrix(): Promise<GenreFormatEntry[]> {
    const response = await supabaseApi.get<{ primary_genre: string | null; artist_type: string | null }[]>(
      "/music_data?select=primary_genre,artist_type"
    );

    const data = response.data || [];
    const genreMap = new Map<string, {
      genre: string;
      soloCount: number;
      bandCount: number;
    }>();

    data.forEach((item) => {
      const pg = item.primary_genre ? item.primary_genre.trim() : "";
      if (!pg) return;

      const g = pg
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

      const current = genreMap.get(g) || {
        genre: g,
        soloCount: 0,
        bandCount: 0,
      };

      if (item.artist_type === "Group") {
        current.bandCount += 1;
      } else {
        current.soloCount += 1;
      }

      genreMap.set(g, current);
    });

    return Array.from(genreMap.values()).map((stats) => {
      const total = stats.soloCount + stats.bandCount;
      const soloPct = total > 0 ? Math.round((stats.soloCount / total) * 100) : 0;
      const bandPct = total > 0 ? Math.round((stats.bandCount / total) * 100) : 0;

      let isAnomaly = false;
      let anomalyReason = "";

      if (stats.genre === "Koplo" && bandPct > 60) {
        isAnomaly = true;
        anomalyReason = "Rasio grup tinggi pada genre dangdut turunan Koplo menunjukkan peralihan budaya kolektif.";
      } else if (stats.genre === "Indie" && Math.abs(soloPct - bandPct) <= 15) {
        isAnomaly = true;
        anomalyReason = "Distribusi Solo/Band yang hampir seimbang menunjukkan fleksibilitas ekosistem indie.";
      }

      return {
        genre: stats.genre,
        soloCount: stats.soloCount,
        bandCount: stats.bandCount,
        total,
        soloPct,
        bandPct,
        isAnomaly,
        anomalyReason,
      };
    }).sort((a, b) => b.total - a.total);
  },

  /**
   * Fetches and compares average popularity and followers for soloists vs groups.
   */
  async getFormatStreamingComparison(): Promise<{
    solo: { avgPopularity: number; avgFollowers: number; count: number };
    band: { avgPopularity: number; avgFollowers: number; count: number };
  }> {
    const response = await supabaseApi.get<{ artist_type: string | null; popularity: number; followers: number }[]>(
      "/music_data?select=artist_type,popularity,followers"
    );

    const data = response.data || [];
    const stats = {
      solo: { totalPop: 0, totalFollowers: 0, count: 0 },
      band: { totalPop: 0, totalFollowers: 0, count: 0 },
    };

    data.forEach((item) => {
      const type = item.artist_type === "Group" ? "band" : "solo";
      stats[type].count += 1;
      stats[type].totalPop += item.popularity || 0;
      stats[type].totalFollowers += item.followers || 0;
    });

    return {
      solo: {
        avgPopularity: stats.solo.count > 0 ? Math.round(stats.solo.totalPop / stats.solo.count) : 0,
        avgFollowers: stats.solo.count > 0 ? Math.round(stats.solo.totalFollowers / stats.solo.count) : 0,
        count: stats.solo.count,
      },
      band: {
        avgPopularity: stats.band.count > 0 ? Math.round(stats.band.totalPop / stats.band.count) : 0,
        avgFollowers: stats.band.count > 0 ? Math.round(stats.band.totalFollowers / stats.band.count) : 0,
        count: stats.band.count,
      },
    };
  },
  
  /**
   * Fetches selective artist metrics (name, popularity, followers, primary_genre, type, location) for all artists to build the Stickiness Index.
   */
  async getStickinessData(): Promise<StickinessArtistEntry[]> {
    const response = await supabaseApi.get<{
      artist_name: string;
      popularity: number | null;
      followers: number | null;
      primary_genre: string | null;
      profile_picture: string | null;
      artist_type: string | null;
      origin_city: string | null;
      origin_province: string | null;
    }[]>(
      "/music_data?select=artist_name,popularity,followers,primary_genre,profile_picture,artist_type,origin_city,origin_province&order=popularity.desc.nullslast"
    );

    return (response.data || []).map((item) => {
      const followers = item.followers || 0;
      const popularity = item.popularity || 0;
      // SC = Followers / (Popularity + 1)
      const sc = followers / (popularity + 1);

      return {
        name: item.artist_name,
        popularity,
        followers,
        stickinessCoefficient: sc,
        primaryGenre: item.primary_genre || "Lainnya",
        profilePicture: item.profile_picture || "",
        artistType: item.artist_type || "Person",
        originCity: item.origin_city || "Unknown",
        originProvince: item.origin_province || "Unknown",
      };
    });
  },
};

export interface GenreEntry {
  name: string;
  count: number;
  avgPopularity: number;
  trend: "up" | "down" | "stable";
}

export interface ProvinceEntry {
  province: string;
  region: string;
  artistCount: number;
  avgPopularity: number;
  topGenre: string;
}

export type SceneArchetype =
  | "Indie Rehearsal Capital"
  | "Emerging Band Scene"
  | "Evolving Music Scene"
  | "Commercial Artist Hub"
  | "Vocalist & Studio Epicenter";

export interface CollaborationEntry {
  city: string;
  province: string;
  soloCount: number;
  bandCount: number;
  totalCount: number;
  collaborationIndex: number;
  archetype: SceneArchetype;
  topGenre: string;
}

export interface GenreFormatEntry {
  genre: string;
  soloCount: number;
  bandCount: number;
  total: number;
  soloPct: number;
  bandPct: number;
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface StickinessArtistEntry {
  name: string;
  popularity: number;
  followers: number;
  stickinessCoefficient: number;
  primaryGenre: string;
  profilePicture: string;
  artistType: string;
  originCity: string;
  originProvince: string;
}
