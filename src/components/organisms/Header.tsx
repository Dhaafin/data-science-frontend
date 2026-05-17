"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import {
  GlobeHemisphereWest,
  MapPin,
  MusicNotes,
  ChartBar,
  Info,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { Text } from "@/components/atoms";

/**
 * Header — Sticky glassmorphic top navigation organism
 *
 * Replaces the old fixed Sidebar. Floats at the top of the viewport
 * with scroll-spy highlighting for the active section.
 * DESIGN_GUIDELINES.md §2.2 — glass-card composition applied.
 */

const NAV_ITEMS = [
  { id: "map", icon: MapPin, label: "Talent Map" },
  { id: "explore", icon: MagnifyingGlass, label: "Explore Database" },
  { id: "genres", icon: MusicNotes, label: "Genre Deep-Dive" },
  { id: "comparative", icon: ChartBar, label: "Comparative" },
  { id: "about", icon: Info, label: "About" },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]["id"];

export function Header() {
  const [activeSection, setActiveSection] = useState<SectionId>("map");
  const [scrolled, setScrolled] = useState(false);

  /* ── scroll-spy: track which section is in view ── */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const offsets = NAV_ITEMS.map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return { id, top: Infinity };
        return { id, top: el.getBoundingClientRect().top };
      });

      /* Pick the section whose top edge is closest to (but above) the
         viewport top, accounting for header height + some padding. */
      const threshold = 120;
      let current: SectionId = "map";
      for (const { id, top } of offsets) {
        if (top <= threshold) current = id as SectionId;
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── smooth-scroll to anchor ── */
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <motion.header
      className={[
        "fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-16",
        "transition-all duration-300",
        scrolled
          ? "glass-card !rounded-none !border-x-0 !border-t-0 shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
      {/* ── Brand area (left) ── */}
      <button
        onClick={() => scrollTo("map")}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="flex items-center justify-center size-8 rounded-lg bg-(--color-accent-500)/15 group-hover:bg-(--color-accent-500)/25 transition-colors">
          <GlobeHemisphereWest
            size={20}
            weight="bold"
            className="text-(--color-accent-500)"
          />
        </div>
        <div className="flex flex-col leading-none">
          <Text
            as="span"
            variant="label"
            color="primary"
            className="font-semibold tracking-tight"
          >
            Selasar Suara
          </Text>
          <Text as="span" variant="caption" color="muted">
            Analisis Spasial
          </Text>
        </div>
      </button>

      {/* ── Navigation links (center) ── */}
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ id, icon: IconComponent, label }) => {
          const isActive = activeSection === id;
          return (
            <motion.button
              key={id}
              onClick={() => scrollTo(id)}
              className={[
                "flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer",
                "transition-colors duration-150",
                isActive
                  ? "bg-(--color-bg-surface) text-(--color-accent-500)"
                  : "text-(--color-text-secondary) hover:bg-(--color-bg-surface)/50 hover:text-(--color-text-primary)",
              ].join(" ")}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
            >
              <IconComponent
                size={16}
                weight={isActive ? "bold" : "regular"}
              />
              <Text
                as="span"
                variant="caption"
                color={isActive ? "accent" : "secondary"}
                className="font-medium hidden lg:inline"
              >
                {label}
              </Text>
            </motion.button>
          );
        })}
      </nav>
      </div>
    </motion.header>
  );
}
