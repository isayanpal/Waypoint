"use client";

import { motion } from "motion/react";
import { fadeInUp, hoverLift } from "@/lib/motion/variants";
import { AnimatedNumber } from "@/lib/motion/animated-number";

export function StatTile({
  label,
  value,
  color = "var(--wp-ink-primary)",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={hoverLift}
      className="min-w-0 rounded-[9px] border border-wp-card-border bg-white px-[12px] py-[11px]"
    >
      <div className="truncate text-[11px] font-semibold uppercase tracking-[0.03em] text-wp-ink-secondary">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-[20.5px] font-bold" style={{ color }}>
        <AnimatedNumber value={value} />
      </div>
    </motion.div>
  );
}
