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
  Users,
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
  { id: "home", path: "/", icon: MapPin, label: "Home" },
  { id: "insights", path: "/insights", icon: ChartBar, label: "Insights" },
  { id: "about", path: "/about", icon: Info, label: "About" },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]["id"];

export function Header() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<SectionId | string>("map");
  const [scrolled, setScrolled] = useState(false);

  /* ── Track active route ── */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    if (pathname === "/") {
      setActiveSection("home");
    } else if (pathname.startsWith("/insights")) {
      setActiveSection("insights");
    } else if (pathname.startsWith("/about")) {
      setActiveSection("about");
    } else {
      setActiveSection("");
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

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
        href="/"
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
        {NAV_ITEMS.map(({ id, path, icon: IconComponent, label }) => {
          const isActive = activeSection === id;
          return (
            <Link
              key={id}
              href={path}
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
