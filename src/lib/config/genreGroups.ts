export interface GenreGroup {
  name: string;
  color: string;
  subgenres: string[];
}

export const GENRE_GROUPS: GenreGroup[] = [
  {
    name: "Mainstream Pop & Ballad",
    color: "#3b82f6",
    subgenres: ["indonesian pop", "jazz pop", "children's music", "pop"]
  },
  {
    name: "Sophisticated Pop & Jazz Fusion",
    color: "#06b6d4",
    subgenres: ["pop kreatif", "city pop", "jazz", "indonesian jazz", "jazz fusion", "indie jazz", "bossa nova", "christian jazz", "experimental jazz"]
  },
  {
    name: "R&B, Soul & Urban Grooves",
    color: "#f43f5e",
    subgenres: ["indonesian r&b", "electro r&b", "r&b", "soul"]
  },
  {
    name: "Hip-Hop, Rap & Electronic Beats",
    color: "#f97316",
    subgenres: ["indonesian hip hop", "malay rap", "j-rap", "melodic house", "moombahton", "jazz house", "hip hop", "rap", "house", "electronic"]
  },
  {
    name: "J-Pop & ACG Subculture",
    color: "#84cc16",
    subgenres: ["j-pop", "anime", "vocaloid"]
  },
  {
    name: "Classic & Heritage Rock",
    color: "#eab308",
    subgenres: ["indonesian rock", "indorock", "progressive rock", "rock"]
  },
  {
    name: "Indie & Alternative",
    color: "#10b981",
    subgenres: ["indonesian indie", "indie", "indonesian indie rock", "post-rock", "grunge", "math rock", "psychedelic rock", "surf rock", "experimental", "ambient", "electroacoustic", "avant-garde", "alternative"]
  },
  {
    name: "Heavy & Underground",
    color: "#dc2626",
    subgenres: ["death metal", "black metal", "grindcore", "metalcore", "melodic death metal", "progressive metal", "drone metal", "mathcore", "punk", "skate punk", "pop punk", "ska", "metal"]
  },
  {
    name: "Dangdut & Koplo",
    color: "#8b5cf6",
    subgenres: ["dangdut", "koplo", "hipdut", "funkot", "breakbeat"]
  },
  {
    name: "Regional Roots & Folk",
    color: "#b45309",
    subgenres: ["lagu jawa", "lagu timur", "maluku", "batak", "sunda", "minang", "fújì", "folk"]
  },
  {
    name: "Spiritual & Devotional",
    color: "#94a3b8",
    subgenres: ["sholawat", "worship"]
  }
];

export function getGenreGroupInfo(genreName: string): { name: string; color: string } {
  const norm = genreName.toLowerCase().trim();
  
  // 1. Try exact or subgenre-list match first
  for (const group of GENRE_GROUPS) {
    if (group.subgenres.some(sub => sub.toLowerCase().trim() === norm)) {
      return { name: group.name, color: group.color };
    }
  }
  
  // 2. Try partial match (word substring)
  for (const group of GENRE_GROUPS) {
    if (group.subgenres.some(sub => norm.includes(sub.toLowerCase().trim()) || sub.toLowerCase().trim().includes(norm))) {
      return { name: group.name, color: group.color };
    }
  }

  // 3. Fallback
  return { name: "Other Genres", color: "#94a3b8" };
}
