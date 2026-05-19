"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import {
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
  { id: "map", path: "/", hash: "#map", icon: MapPin, label: "Talent Map" },
  { id: "explore", path: "/", hash: "#explore", icon: MagnifyingGlass, label: "Explore Database" },
  { id: "genres", path: "/", hash: "#genres", icon: MusicNotes, label: "Genre Deep-Dive" },
  { id: "comparative", path: "/", hash: "#comparative", icon: ChartBar, label: "Comparative" },
  { id: "about", path: "/about", hash: "", icon: Info, label: "About" },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]["id"];

export function Header() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<SectionId | string>("map");
  const [scrolled, setScrolled] = useState(false);

  /* ── scroll-spy: track which section is in view ── */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (pathname !== "/") {
        setActiveSection(pathname.includes("about") ? "about" : "");
        return;
      }

      const offsets = NAV_ITEMS.filter(n => n.hash).map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return { id, top: Infinity };
        return { id, top: el.getBoundingClientRect().top };
      });

      const threshold = 120;
      let current = "map";
      for (const { id, top } of offsets) {
        if (top <= threshold) current = id;
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  /* ── smooth-scroll to anchor ── */
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, hash: string) => {
    if (pathname === path && hash) {
      e.preventDefault();
      const el = document.getElementById(hash.replace("#", ""));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState({}, "", hash);
      }
    }
  };

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
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
      {/* ── Brand area (left) ── */}
      <Link
        href="/#map"
        onClick={(e) => handleNavClick(e, "/", "#map")}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <Image
          src="/logo.png"
          alt="Selasar Suara Logo"
          width={32}
          height={32}
          className="object-contain"
        />
        <Text
          as="span"
          variant="label"
          color="primary"
          className="font-semibold tracking-tight"
        >
          Selasar Suara
        </Text>
      </Link>

      {/* ── Navigation links (center) ── */}
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ id, path, hash, icon: IconComponent, label }) => {
          const isActive = activeSection === id;
          return (
            <Link
              key={id}
              href={`${path}${hash}`}
              onClick={(e) => handleNavClick(e, path, hash)}
              className={[
                "flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer",
                "transition-colors duration-150 relative",
                isActive
                  ? "bg-(--color-bg-surface) text-(--color-accent-500)"
                  : "text-(--color-text-secondary) hover:bg-(--color-bg-surface)/50 hover:text-(--color-text-primary)",
              ].join(" ")}
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
            </Link>
          );
        })}
      </nav>
      </div>
    </motion.header>
  );
}
