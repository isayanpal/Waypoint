"use client";

import { motion } from "motion/react";
import { StatusPill } from "@/components/shared/status-pill";
import { fadeInUp, staggerContainer } from "@/lib/motion/variants";
import type { PortfolioProject } from "@/lib/types/domain";

export function PortfolioSummaryList({ projects }: { projects: PortfolioProject[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mb-5 overflow-hidden rounded-[11px] border border-wp-card-border bg-wp-card"
    >
      {projects.map((project) => (
        <motion.div
          key={project.id}
          layout
          variants={fadeInUp}
          className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-[9px] last:border-b-0"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold">{project.name}</div>
            <div className="truncate text-[11.5px] text-wp-ink-tertiary">{project.timeline}</div>
          </div>
          <StatusPill status={project.status} />
        </motion.div>
      ))}
    </motion.div>
  );
}
