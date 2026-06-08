export interface GenreGroup {
  name: string;
  color: string;
  subgenres: string[];
}

export const GENRE_GROUPS: GenreGroup[] = [
  {
    name: "Reggae, Ska & Island Vibes",
    color: "#15803d",
    subgenres: ["ska", "reggae", "reggae, ska & island vibes"]
  },
  {
    name: "Jazz & Blues Essentials",
    color: "#06b6d4",
    subgenres: ["jazz", "indonesian jazz", "jazz fusion", "indie jazz", "bossa nova", "christian jazz", "experimental jazz", "blues", "jazz & blues essentials"]
  },
  {
    name: "Sophisticated & City Pop",
    color: "#0ea5e9",
    subgenres: ["pop kreatif", "city pop", "sophisticated & city pop"]
  },
  {
    name: "Mainstream Pop & Ballad",
    color: "#3b82f6",
    subgenres: ["indonesian pop", "jazz pop", "children's music", "pop", "mainstream pop & ballad"]
  },
  {
    name: "R&B, Soul & Urban Grooves",
    color: "#f43f5e",
    subgenres: ["indonesian r&b", "electro r&b", "r&b", "soul", "r&b, soul & urban grooves"]
  },
  {
    name: "Hip-Hop, Rap & Electronic Beats",
    color: "#f97316",
    subgenres: ["indonesian hip hop", "malay rap", "j-rap", "melodic house", "moombahton", "jazz house", "hip hop", "rap", "house", "electronic", "hip-hop, rap & electronic beats"]
  },
  {
    name: "J-Pop & ACG Subculture",
    color: "#84cc16",
    subgenres: ["j-pop", "anime", "vocaloid", "j-pop & acg subculture"]
  },
  {
    name: "Classic & Heritage Rock",
    color: "#eab308",
    subgenres: ["indonesian rock", "indorock", "progressive rock", "rock", "classic & heritage rock"]
  },
  {
    name: "Indie & Alternative",
    color: "#10b981",
    subgenres: ["indonesian indie", "indie", "indonesian indie rock", "post-rock", "grunge", "math rock", "psychedelic rock", "surf rock", "experimental", "ambient", "electroacoustic", "avant-garde", "alternative", "indie & alternative"]
  },
  {
    name: "Heavy & Underground",
    color: "#dc2626",
    subgenres: ["death metal", "black metal", "grindcore", "metalcore", "melodic death metal", "progressive metal", "drone metal", "mathcore", "punk", "skate punk", "pop punk", "metal", "hardcore", "heavy metal", "heavy & underground"]
  },
  {
    name: "Dangdut & Koplo",
    color: "#8b5cf6",
    subgenres: ["dangdut", "koplo", "hipdut", "funkot", "breakbeat", "dangdut & koplo"]
  },
  {
    name: "Regional Roots & Folk",
    color: "#b45309",
    subgenres: ["lagu jawa", "lagu timur", "maluku", "batak", "sunda", "minang", "fújì", "folk", "regional roots & folk"]
  },
  {
    name: "Melayu Pop",
    color: "#a21caf",
    subgenres: ["malay", "malay pop", "malaysian pop", "melayu pop", "melayu", "pop melayu"]
  },
  {
    name: "Spiritual & Devotional",
    color: "#94a3b8",
    subgenres: ["sholawat", "worship", "spiritual & devotional", "nasyid", "religi", "gospel"]
  }
];

export function getGenreGroupInfo(genreName: string): { name: string; color: string } {
  const norm = genreName.toLowerCase().trim();
  
  // Direct case-insensitive match on the primary genre name
  for (const group of GENRE_GROUPS) {
    if (group.name.toLowerCase().trim() === norm) {
      return { name: group.name, color: group.color };
    }
  }
  
  // Fallback
  return { name: "Other Genres", color: "#94a3b8" };
}
