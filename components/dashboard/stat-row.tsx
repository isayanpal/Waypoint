"use client";

import { motion } from "motion/react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { staggerContainer } from "@/lib/motion/variants";
import type { DashboardStats } from "@/lib/domain/dashboard-stats";

export function StatRow({ stats }: { stats: DashboardStats }) {
  const tiles = [
    { label: "Phases done", value: `${stats.phasesComplete}/${stats.phaseCount}` },
    { label: "Overall progress", value: `${stats.progressPct}%`, color: "var(--wp-accent)" },
    { label: "Topics left", value: String(stats.topicsLeft) },
    { label: "Projects built", value: String(stats.projectsBuilt) },
    { label: "Projects active", value: String(stats.projectsActive) },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mb-[18px] grid gap-2"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))" }}
    >
      {tiles.map((tile) => (
        <StatTile key={tile.label} label={tile.label} value={tile.value} color={tile.color} />
      ))}
    </motion.div>
  );
}
