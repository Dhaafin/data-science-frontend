"use client";

import { motion } from "framer-motion";
import { slideInLeft, staggerContainer, fadeUp } from "@/lib/motion";
import {
  MapPin,
  ChartBar,
  MusicNotes,
  GlobeHemisphereWest,
  Info,
} from "@phosphor-icons/react";
import { Text, Divider } from "@/components/atoms";
import { NavItem } from "@/components/molecules/NavItem";

/**
 * Sidebar — Fixed left navigation organism
 *
 * Contains: logo area, navigation links, and a compact info section.
 * DESIGN_GUIDELINES.md §4.1 — 240px fixed width, dark sidebar background.
 */

type ActiveView = "map" | "genres" | "comparative" | "about";

interface SidebarProps {
  /** Current active view */
  activeView: ActiveView;
  /** View change handler */
  onViewChange: (view: ActiveView) => void;
}

const navItems: { id: ActiveView; icon: typeof MapPin; label: string }[] = [
  { id: "map", icon: MapPin, label: "Talent Map" },
  { id: "genres", icon: MusicNotes, label: "Genre Deep-Dive" },
  { id: "comparative", icon: ChartBar, label: "Comparative" },
  { id: "about", icon: Info, label: "About" },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <motion.aside
      className="fixed left-0 top-0 z-30 h-full w-[240px] bg-(--color-bg-sidebar) border-r border-(--color-border-default) flex flex-col"
      variants={slideInLeft}
      initial="hidden"
      animate="visible"
    >
      {/* Logo area */}
      <motion.div
        className="flex items-center gap-3 px-5 py-6"
        variants={fadeUp}
      >
        <div className="flex items-center justify-center size-9 rounded-lg bg-(--color-accent-500)/15">
          <GlobeHemisphereWest size={22} weight="bold" className="text-(--color-accent-500)" />
        </div>
        <div className="flex flex-col min-w-0">
          <Text as="span" variant="label" color="primary" className="font-semibold truncate">
            Musik Indonesia
          </Text>
          <Text as="span" variant="caption" color="muted">
            Analisis Spasial
          </Text>
        </div>
      </motion.div>

      <Divider spacing="sm" className="mx-4" />

      {/* Navigation */}
      <motion.nav
        className="flex flex-col gap-1 px-3 py-4 flex-1"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {navItems.map((item) => (
          <motion.div key={item.id} variants={fadeUp}>
            <NavItem
              icon={item.icon}
              label={item.label}
              active={activeView === item.id}
              onClick={() => onViewChange(item.id)}
            />
          </motion.div>
        ))}
      </motion.nav>

      {/* Footer info */}
      <div className="px-5 py-4 border-t border-(--color-border-default)">
        <Text variant="caption" color="muted" className="leading-relaxed">
          Analisis ketimpangan digital pada industri musik Indonesia di platform streaming.
        </Text>
      </div>
    </motion.aside>
  );
}
