"use client";

import { motion } from "motion/react";
import { MiniProgressBar } from "@/components/shared/mini-progress-bar";
import { StatusPill, statusBarColor } from "@/components/shared/status-pill";
import { fadeInUp } from "@/lib/motion/variants";
import type { Phase } from "@/lib/types/domain";

export function PhaseRow({ phase, numLabel }: { phase: Phase; numLabel: string }) {
  const total = phase.topics.length;
  const done = phase.topics.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <motion.div
      layout
      variants={fadeInUp}
      className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-[9px] last:border-b-0"
    >
      <div className="w-4 shrink-0 font-mono text-[10px] text-wp-ink-tertiary">{numLabel}</div>
      <div className="min-w-0 flex-1 truncate text-[12px] font-medium">{phase.name}</div>
      <MiniProgressBar
        pct={pct}
        color={statusBarColor(phase.status)}
        className="w-[50px] shrink-0 h-[5px]"
      />
      <div className="w-7 shrink-0 text-right font-mono text-[10px] text-wp-ink-secondary">
        {done}/{total}
      </div>
      <StatusPill status={phase.status} className="min-w-[64px] px-[6px] py-[2px] text-[9px]" />
    </motion.div>
  );
}
