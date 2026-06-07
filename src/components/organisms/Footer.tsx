"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Text } from "@/components/atoms";

/**
 * Footer — Premium glassmorphic bottom navigation & brand lockup
 *
 * DESIGN_GUIDELINES.md §2.2 — glass-card bottom border composition.
 */
export function Footer() {
  return (
    <motion.footer
      className="w-full mt-16 border-t border-(--color-border-default) bg-(--color-bg-sidebar)/40 backdrop-blur-md"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="max-w-5xl mx-auto w-full px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <Text
            as="span"
            variant="label"
            color="primary"
            className="font-semibold tracking-tight"
          >
            Selasar Suara
          </Text>
          <span className="hidden sm:inline text-(--color-text-muted) text-xs">•</span>
          <Text variant="caption" color="secondary">
            &copy; {new Date().getFullYear()} Hak Cipta Dilindungi.
          </Text>
        </div>

        {/* Minimal Navigation & Status */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link
            href="/"
            className="text-xs text-(--color-text-secondary) hover:text-(--color-accent-400) transition-colors cursor-pointer"
          >
            Home
          </Link>
          <Link
            href="/insights"
            className="text-xs text-(--color-text-secondary) hover:text-(--color-accent-400) transition-colors cursor-pointer"
          >
            Insights
          </Link>
          <Link
            href="/about"
            className="text-xs text-(--color-text-secondary) hover:text-(--color-accent-400) transition-colors cursor-pointer"
          >
            About
          </Link>
          <span className="text-(--color-text-muted) text-xs hidden sm:inline">•</span>
          <span className="text-[10px] font-medium text-(--color-text-accent) bg-(--color-accent-500)/10 px-2 py-0.5 rounded border border-(--color-accent-500)/20">
            v1.0.0
          </span>
        </div>
      </div>
    </motion.footer>
  );
}
