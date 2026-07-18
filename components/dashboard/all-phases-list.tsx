"use client";

import { motion } from "motion/react";
import { PhaseRow } from "@/components/dashboard/phase-row";
import { staggerContainer } from "@/lib/motion/variants";
import type { Phase } from "@/lib/types/domain";

export function AllPhasesList({ phases }: { phases: Phase[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="overflow-hidden rounded-[11px] border border-wp-card-border bg-white"
    >
      {phases.map((phase, i) => (
        <PhaseRow key={phase.id} phase={phase} numLabel={String(i + 1).padStart(2, "0")} />
      ))}
    </motion.div>
  );
}
