"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  UsersThree,
  ChartLineUp,
  MapPin,
  MusicNotes,
  Buildings,
  Fire,
  Globe,
  TrendUp,
  Warning,
} from "@phosphor-icons/react";
import { KpiCard } from "@/components/molecules/KpiCard";

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
  
  // Perspective 2 (Genre) Metrics
  topGenre: string;
  genreDiversity: number;
  indieEpicenter: string;
  koploEpicenter: string;
  
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
  topGenre,
  genreDiversity,
  indieEpicenter,
  koploEpicenter,
  
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

      {/* Dynamic KPI Cards with smooth cross-fade */}
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
              key="genre-kpis"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-1 gap-4 w-full"
            >
              <KpiCard icon={MusicNotes} label="Genre Utama Teratas" value={0} formatter={() => topGenre} />
              <KpiCard icon={Buildings} label="Episentrum Indie" value={0} formatter={() => indieEpicenter} />
              <KpiCard icon={Fire} label="Episentrum Koplo" value={0} formatter={() => koploEpicenter} />
              <KpiCard icon={UsersThree} label="Diversitas Genre" value={genreDiversity} />
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

