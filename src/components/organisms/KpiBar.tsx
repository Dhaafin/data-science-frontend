"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  UsersThree,
  ChartLineUp,
  MapPin,
  Buildings,
  Fire,
  Globe,
  Warning,
} from "@phosphor-icons/react";
import { KpiCard } from "@/components/molecules/KpiCard";
import { GENRE_GROUPS } from "@/lib/config/genreGroups";

export type ResearchPerspective = "sebaran" | "genre" | "aksesibilitas";

interface KpiBarProps {
  activePerspective: ResearchPerspective;
  onPerspectiveChange: (perspective: ResearchPerspective) => void;
  
  // Perspective 1 (Sebaran) Metrics
  sebaranGranularity: 'pulau' | 'provinsi' | 'kota';
  sebaranKpis: {
    mostDenseName: string;
    mostDenseVal: number;
    mostPopularName: string;
    mostPopularVal: number;
    leastDenseName: string;
    leastDenseVal: number;
    leastPopularName: string;
    leastPopularVal: number;
  };

  // Perspective 2 (Genre) — only mode needed for legend display
  genreMode?: 'primary' | 'tags';
  
  // Perspective 3 (Aksesibilitas) Metrics
  avgPopJakarta: number;
  avgPopJava: number;
  avgPopOutside: number;
  gapPop: number;
}

export function KpiBar({
  activePerspective,
  onPerspectiveChange,
  
  // Perspective 1
  sebaranGranularity,
  sebaranKpis,

  // Perspective 2
  genreMode = "primary",
  
  // Perspective 3
  avgPopJakarta,
  avgPopJava,
  avgPopOutside,
  gapPop,
}: KpiBarProps) {
  return (
    <div className="flex gap-4 p-4 items-stretch flex-col md:flex-row">
      {/* Mode Selector Pillar */}
      <div className="flex md:flex-col gap-2 p-2 bg-[#121212]/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl min-w-[200px]">
        <button
          onClick={() => onPerspectiveChange("sebaran")}
          className={`relative flex-1 px-4 py-3 text-xs font-bold rounded-xl transition-colors text-left overflow-hidden cursor-pointer ${
            activePerspective === "sebaran" ? "text-teal-400" : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          {activePerspective === "sebaran" && (
            <motion.div layoutId="perspectivePill" className="absolute inset-0 bg-teal-500/10 border border-teal-500/30 rounded-xl" />
          )}
          <span className="relative z-10 block">Sebaran Geografis</span>
          <span className="relative z-10 block text-[9px] font-normal opacity-70">RQ1: Kepadatan Talenta</span>
        </button>
        <button
          onClick={() => onPerspectiveChange("genre")}
          className={`relative flex-1 px-4 py-3 text-xs font-bold rounded-xl transition-colors text-left overflow-hidden cursor-pointer ${
            activePerspective === "genre" ? "text-sky-400" : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          {activePerspective === "genre" && (
            <motion.div layoutId="perspectivePill" className="absolute inset-0 bg-sky-500/10 border border-sky-500/30 rounded-xl" />
          )}
          <span className="relative z-10 block">Konsentrasi Genre</span>
          <span className="relative z-10 block text-[9px] font-normal opacity-70">RQ2: Regional Genre Hubs</span>
        </button>
        <button
          onClick={() => onPerspectiveChange("aksesibilitas")}
          className={`relative flex-1 px-4 py-3 text-xs font-bold rounded-xl transition-colors text-left overflow-hidden cursor-pointer ${
            activePerspective === "aksesibilitas" ? "text-rose-400" : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          {activePerspective === "aksesibilitas" && (
            <motion.div layoutId="perspectivePill" className="absolute inset-0 bg-rose-500/10 border border-rose-500/30 rounded-xl" />
          )}
          <span className="relative z-10 block">Aksesibilitas Spasial</span>
          <span className="relative z-10 block text-[9px] font-normal opacity-70">RQ3: Kesenjangan Popularitas</span>
        </button>
      </div>

      {/* Dynamic KPI / Legend area with smooth cross-fade */}
      <div className="flex flex-1 gap-4 overflow-hidden relative flex-wrap md:flex-nowrap">
        <AnimatePresence mode="wait">
          {activePerspective === "sebaran" && (
            <motion.div
              key="sebaran-kpis"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-1 gap-4 w-full animate-perspective"
            >
              <KpiCard
                icon={UsersThree}
                label={
                  sebaranGranularity === "pulau"
                    ? "Pulau Terpadat"
                    : sebaranGranularity === "provinsi"
                    ? "Provinsi Terbanyak Musisi"
                    : "Kota Terbanyak Musisi"
                }
                value={sebaranKpis.mostDenseVal}
                suffix=" Musisi"
                description={sebaranKpis.mostDenseName}
              />
              <KpiCard
                icon={Fire}
                label={
                  sebaranGranularity === "pulau"
                    ? "Pulau Terpopuler"
                    : sebaranGranularity === "provinsi"
                    ? "Provinsi Terpopuler"
                    : "Kota Terpopuler"
                }
                value={sebaranKpis.mostPopularVal}
                suffix=" Pop"
                description={sebaranKpis.mostPopularName}
              />
              <KpiCard
                icon={MapPin}
                label={
                  sebaranGranularity === "pulau"
                    ? "Pulau Tersepi"
                    : sebaranGranularity === "provinsi"
                    ? "Provinsi Tersedikit Musisi"
                    : "Kota Tersedikit Musisi"
                }
                value={sebaranKpis.leastDenseVal}
                suffix=" Musisi"
                description={sebaranKpis.leastDenseName}
              />
              <KpiCard
                icon={Warning}
                label={
                  sebaranGranularity === "pulau"
                    ? "Pulau Terendah Popularitas"
                    : sebaranGranularity === "provinsi"
                    ? "Provinsi Terendah Popularitas"
                    : "Kota Terendah Popularitas"
                }
                value={sebaranKpis.leastPopularVal}
                suffix=" Pop"
                description={sebaranKpis.leastPopularName}
              />
            </motion.div>
          )}

          {activePerspective === "genre" && (
            <motion.div
              key="genre-legend"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-1 w-full items-center"
            >
              {genreMode === "primary" ? (
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">Legenda Warna Peta — Genre Utama</span>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-1.5">
                    {GENRE_GROUPS.map((group) => (
                      <div key={group.name} className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/10"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="text-[11px] text-white/75 font-medium truncate" title={group.name}>
                          {group.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">Mode: Tag Genre</span>
                  <div
                    className="h-3 w-64 rounded-full overflow-hidden flex"
                    style={{
                      background: "linear-gradient(to right, rgb(59,130,246), rgb(20,184,166), rgb(239,68,68))",
                    }}
                  />
                  <div className="flex justify-between w-64 text-[9px] text-white/50 font-medium">
                    <span>Sedikit Musisi</span>
                    <span>Rata-Rata</span>
                    <span>Banyak Musisi</span>
                  </div>
                  <span className="text-[10px] text-white/40 mt-1">Warna gelembung menunjukkan kepadatan musisi relatif per kota.</span>
                </div>
              )}
            </motion.div>
          )}

          {activePerspective === "aksesibilitas" && (
            <motion.div
              key="aksesibilitas-kpis"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-1 gap-4 w-full"
            >
              <KpiCard icon={ChartLineUp} label="Avg Pop Jakarta" value={avgPopJakarta} />
              <KpiCard icon={Buildings} label="Avg Pop Penyangga" value={avgPopJava} />
              <KpiCard icon={Globe} label="Avg Pop Luar Jawa" value={avgPopOutside} />
              <KpiCard icon={Warning} label="Kesenjangan Akses" value={gapPop} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
