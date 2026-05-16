"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  Text,
  Button,
  Badge,
  GlassCard,
  AnimatedCounter,
  Divider,
  Skeleton,
} from "@/components/atoms";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-8 bg-(--color-bg-canvas)">
      <motion.div
        className="w-full max-w-3xl flex flex-col gap-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <Text as="h1" variant="title" color="primary" className="mb-2">
            Design System — Component Library
          </Text>
          <Text variant="body" color="secondary">
            Atomic design primitives for Analisis Spasial Musik Indonesia.
          </Text>
        </motion.div>

        <Divider />

        {/* Typography Scale */}
        <motion.section variants={fadeUp} className="flex flex-col gap-3">
          <Text as="h2" variant="heading" color="accent">
            Typography Scale
          </Text>
          <GlassCard>
            <div className="flex flex-col gap-2">
              <Text variant="hero">Hero — 2.5rem</Text>
              <Text variant="title">Title — 1.5rem</Text>
              <Text variant="heading">Heading — 1.125rem</Text>
              <Text variant="body">Body — 0.9375rem</Text>
              <Text variant="label">Label — 0.8125rem</Text>
              <Text variant="caption">Caption — 0.6875rem</Text>
            </div>
          </GlassCard>
        </motion.section>

        {/* Color Tokens */}
        <motion.section variants={fadeUp} className="flex flex-col gap-3">
          <Text as="h2" variant="heading" color="accent">
            Text Colors
          </Text>
          <GlassCard>
            <div className="flex flex-col gap-1">
              <Text variant="body" color="primary">Primary — #F0F6FC</Text>
              <Text variant="body" color="secondary">Secondary — #8B949E</Text>
              <Text variant="body" color="muted">Muted — #3D4F61</Text>
              <Text variant="body" color="accent">Accent — #14B8A6</Text>
            </div>
          </GlassCard>
        </motion.section>

        {/* Buttons */}
        <motion.section variants={fadeUp} className="flex flex-col gap-3">
          <Text as="h2" variant="heading" color="accent">
            Buttons
          </Text>
          <GlassCard>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm">Primary SM</Button>
              <Button variant="primary" size="md">Primary MD</Button>
              <Button variant="primary" size="lg">Primary LG</Button>
              <Button variant="ghost" size="md">Ghost</Button>
              <Button variant="danger" size="md">Danger</Button>
            </div>
          </GlassCard>
        </motion.section>

        {/* Badges */}
        <motion.section variants={fadeUp} className="flex flex-col gap-3">
          <Text as="h2" variant="heading" color="accent">
            Badges
          </Text>
          <GlassCard>
            <div className="flex flex-wrap gap-2">
              <Badge color="accent">indie pop</Badge>
              <Badge color="accent">dangdut</Badge>
              <Badge color="success">active</Badge>
              <Badge color="warning">pending</Badge>
              <Badge color="error">offline</Badge>
              <Badge color="info">new</Badge>
              <Badge variant="outline" color="accent">outline</Badge>
              <Badge variant="solid" color="accent">solid</Badge>
            </div>
          </GlassCard>
        </motion.section>

        {/* Glass Cards */}
        <motion.section variants={fadeUp} className="flex flex-col gap-3">
          <Text as="h2" variant="heading" color="accent">
            Glass Cards
          </Text>
          <div className="grid grid-cols-2 gap-4">
            <GlassCard>
              <Text variant="label" color="secondary">Default Glass</Text>
              <Text variant="heading" className="mt-1">Standard</Text>
            </GlassCard>
            <GlassCard variant="accent">
              <Text variant="label" color="secondary">Accent Glass</Text>
              <Text variant="heading" color="accent" className="mt-1">Highlighted</Text>
            </GlassCard>
          </div>
        </motion.section>

        {/* Animated Counters */}
        <motion.section variants={fadeUp} className="flex flex-col gap-3">
          <Text as="h2" variant="heading" color="accent">
            Animated Counters
          </Text>
          <div className="grid grid-cols-4 gap-4">
            <GlassCard>
              <Text variant="caption" color="secondary">Artists</Text>
              <AnimatedCounter value={312} className="text-hero text-(--color-text-primary)" />
            </GlassCard>
            <GlassCard>
              <Text variant="caption" color="secondary">Avg. Popularity</Text>
              <AnimatedCounter value={64.8} decimals={1} className="text-hero text-(--color-accent-500)" />
            </GlassCard>
            <GlassCard>
              <Text variant="caption" color="secondary">Provinces</Text>
              <AnimatedCounter value={28} className="text-hero text-(--color-text-primary)" />
            </GlassCard>
            <GlassCard>
              <Text variant="caption" color="secondary">Followers</Text>
              <AnimatedCounter
                value={1200000}
                formatter={(n) => {
                  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
                  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
                  return n.toFixed(0);
                }}
                className="text-hero text-(--color-text-primary)"
              />
            </GlassCard>
          </div>
        </motion.section>

        {/* Skeleton Loading */}
        <motion.section variants={fadeUp} className="flex flex-col gap-3">
          <Text as="h2" variant="heading" color="accent">
            Skeleton Loaders
          </Text>
          <GlassCard>
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="size-10" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </GlassCard>
        </motion.section>

        {/* Dividers */}
        <motion.section variants={fadeUp} className="flex flex-col gap-3">
          <Text as="h2" variant="heading" color="accent">
            Dividers
          </Text>
          <GlassCard>
            <Text variant="label">Above (sm)</Text>
            <Divider spacing="sm" />
            <Text variant="label">Middle (md)</Text>
            <Divider spacing="md" />
            <Text variant="label">Below (lg)</Text>
            <Divider spacing="lg" />
            <Text variant="label">End</Text>
          </GlassCard>
        </motion.section>
      </motion.div>
    </div>
  );
}
