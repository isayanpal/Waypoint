"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/motion/variants";

export function MiniProgressBar({
  pct,
  color = "var(--wp-accent)",
  trackClassName,
  className,
}: {
  pct: number;
  color?: string;
  trackClassName?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <div
      className={cn("h-[3px] overflow-hidden rounded-full bg-white/10", trackClassName, className)}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.5, ease: easeOut }}
      />
    </div>
  );
}
