"use client";

import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { PhaseStatus } from "@/lib/domain/phase-status";
import type { PortfolioProjectStatus } from "@/lib/types/domain";

const STATUS_STYLES: Record<
  PhaseStatus | PortfolioProjectStatus,
  { bg: string; text: string; label: string }
> = {
  complete: { bg: "var(--wp-status-complete-bg)", text: "var(--wp-status-complete-text)", label: "Complete" },
  current: { bg: "var(--wp-status-progress-bg)", text: "var(--wp-status-progress-text)", label: "In progress" },
  in_progress: { bg: "var(--wp-status-progress-bg)", text: "var(--wp-status-progress-text)", label: "In progress" },
  not_started: { bg: "var(--wp-status-notstarted-bg)", text: "var(--wp-status-notstarted-text)", label: "Not started" },
};

export function StatusPill({
  status,
  onClick,
  className,
}: {
  status: PhaseStatus | PortfolioProjectStatus;
  onClick?: () => void;
  className?: string;
}) {
  const style = STATUS_STYLES[status];
  const pillClassName = cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-[10px] py-[3px] text-[10px] font-bold",
    onClick && "cursor-pointer",
    className
  );
  const label = (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={style.label}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.15 }}
        className="inline-block"
      >
        {style.label}
      </motion.span>
    </AnimatePresence>
  );

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        animate={{ background: style.bg, color: style.text }}
        transition={{ duration: 0.18 }}
        className={pillClassName}
      >
        {label}
      </motion.button>
    );
  }

  return (
    <motion.div
      animate={{ background: style.bg, color: style.text }}
      transition={{ duration: 0.18 }}
      className={pillClassName}
    >
      {label}
    </motion.div>
  );
}

/** Bar color for progress bars, matching a phase/project's status. */
export function statusBarColor(status: PhaseStatus): string {
  if (status === "complete") return "#5FCB9E";
  if (status === "current") return "#E0AE5A";
  return "rgba(255,255,255,0.2)";
}
