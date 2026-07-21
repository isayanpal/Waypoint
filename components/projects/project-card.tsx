"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ProjectIndexNumber } from "@/components/projects/project-index-number";
import { LinkedPhaseChips } from "@/components/projects/linked-phase-chips";
import { StatusPill } from "@/components/shared/status-pill";
import { fadeInUp, hoverLift } from "@/lib/motion/variants";
import type { Phase, PortfolioProject } from "@/lib/types/domain";

export function ProjectCard({
  project,
  index,
  phases,
  projectId,
  onCycleStatus,
}: {
  project: PortfolioProject;
  index: number;
  phases: Phase[];
  projectId: string;
  onCycleStatus: () => void;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={hoverLift}
      className="rounded-[12px] border border-wp-card-border bg-wp-card px-5 py-[18px]"
    >
      <div className="flex gap-[14px]">
        <ProjectIndexNumber index={index} />
        <div className="min-w-0 flex-1">
          <div className="mb-[7px] flex flex-wrap items-center gap-[9px]">
            <div className="font-heading text-[15px] font-bold">{project.name}</div>
            {project.difficulty && (
              <div className="whitespace-nowrap rounded-full bg-wp-well px-[8px] py-[2px] text-[9.5px] font-bold text-wp-ink-secondary">
                {project.difficulty}
              </div>
            )}
            {project.timeline && (
              <div className="whitespace-nowrap text-[10.5px] text-wp-ink-tertiary">
                {project.timeline}
              </div>
            )}
            <StatusPill status={project.status} onClick={onCycleStatus} className="ml-auto" />
          </div>

          <div className="mb-3 max-w-[640px] text-[12.5px] leading-[1.55] text-wp-ink-secondary">
            {project.description} {project.hook}
          </div>

          {project.stack.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-[5px]">
              {project.stack.map((chip) => (
                <div
                  key={chip}
                  className="whitespace-nowrap rounded-[5px] bg-wp-well px-[8px] py-[2px] text-[9.5px] font-semibold text-wp-ink-secondary"
                >
                  {chip}
                </div>
              ))}
            </div>
          )}

          {project.proves && (
            <div className="mb-3 rounded-[8px] bg-[rgba(63,163,127,0.10)] px-3 py-[10px] text-[11.5px] leading-[1.55] text-wp-ink-secondary">
              <span className="font-bold text-wp-ink-primary">What it proves &middot; </span>
              {project.proves}
            </div>
          )}

          <LinkedPhaseChips phaseIds={project.phaseIds} phases={phases} projectId={projectId} />

          <Link
            href={`/roadmap/${projectId}`}
            className="block rounded-[8px] border border-wp-card-border py-[9px] text-center text-[12px] font-semibold hover:bg-wp-well"
          >
            View this project&apos;s roadmap phases &rarr;
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
