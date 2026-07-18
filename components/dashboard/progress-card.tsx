"use client";

import { motion } from "motion/react";
import { CircularProgress } from "@/components/shared/circular-progress";
import { fadeInUp, hoverLift } from "@/lib/motion/variants";
import type { Phase } from "@/lib/types/domain";

export function ProgressCard({ currentPhase }: { currentPhase: Phase }) {
  const total = currentPhase.topics.length;
  const done = currentPhase.topics.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={hoverLift}
      className="mb-[18px] flex w-full items-center gap-[18px] rounded-[11px] border border-wp-card-border bg-white px-[18px] py-[14px]"
    >
      <CircularProgress pct={pct} size={64} strokeWidth={6} color="#8A6A2F">
        <span className="font-heading text-[15px] font-bold text-wp-ink-primary">{pct}%</span>
      </CircularProgress>
      <div className="min-w-0">
        <div className="text-[12px] font-bold uppercase tracking-[0.05em] text-wp-ink-secondary">
          Current phase progress
        </div>
        <div className="truncate text-[15px] font-semibold text-wp-ink-primary">
          {currentPhase.name}
        </div>
        <div className="text-[12.5px] text-wp-ink-tertiary">
          {done}/{total} topics complete
        </div>
      </div>
    </motion.div>
  );
}
