"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { PhaseWatermarkNumber } from "@/components/shared/phase-watermark-number";
import { FractionBadge } from "@/components/shared/fraction-badge";
import { MiniProgressBar } from "@/components/shared/mini-progress-bar";
import { TopicChecklist } from "@/components/shared/topic-checklist";
import { fadeInUp, hoverLift } from "@/lib/motion/variants";
import type { Phase } from "@/lib/types/domain";

export function CurrentPhaseCard({
  phase,
  numLabel,
  projectId,
  onToggleTopic,
}: {
  phase: Phase;
  numLabel: string;
  projectId: string;
  onToggleTopic: (phaseId: string, topicId: string) => void;
}) {
  const total = phase.topics.length;
  const done = phase.topics.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={hoverLift}
      className="relative mb-5 overflow-hidden rounded-[11px] border border-wp-card-border bg-wp-card px-[18px] py-4"
    >
      <PhaseWatermarkNumber numLabel={numLabel} size={112} />
      <div className="relative z-10">
        <div className="mb-[2px] flex items-center justify-between gap-[10px]">
          <div className="min-w-0 truncate font-heading text-[14px] font-bold">{phase.name}</div>
          <div className="flex shrink-0 items-center gap-[6px]">
            <FractionBadge done={done} total={total} />
            <Link
              href={`/roadmap/${projectId}`}
              title="View full roadmap"
              className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-wp-ink-secondary hover:bg-wp-well hover:text-wp-ink-primary"
            >
              <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
            </Link>
          </div>
        </div>
        <MiniProgressBar pct={pct} color="#E0AE5A" className="mt-[8px] mb-[14px] h-[5px]" />
        <TopicChecklist
          topics={phase.topics}
          layout="list"
          onToggle={(topicId) => onToggleTopic(phase.id, topicId)}
        />
      </div>
    </motion.div>
  );
}
