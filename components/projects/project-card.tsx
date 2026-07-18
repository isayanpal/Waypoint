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
      className="rounded-[12px] border border-wp-card-border bg-white px-5 py-[18px]"
    >
      <div className="flex gap-[14px]">
        <ProjectIndexNumber index={index} />
        <div className="min-w-0 flex-1">
          <div className="mb-[7px] flex flex-wrap items-center gap-[9px]">
            <div className="font-heading text-[17px] font-bold">{project.name}</div>
            {project.difficulty && (
              <div className="whitespace-nowrap rounded-full bg-[#F1F1F3] px-[8px] py-[2px] text-[11px] font-bold text-[#54545C]">
                {project.difficulty}
              </div>
            )}
            {project.timeline && (
              <div className="whitespace-nowrap text-[12px] text-wp-ink-tertiary">
                {project.timeline}
              </div>
            )}
            <StatusPill status={project.status} onClick={onCycleStatus} className="ml-auto" />
          </div>

          <div className="mb-3 max-w-[640px] text-[14.5px] leading-[1.55] text-[#3F3F46]">
            {project.description} {project.hook}
          </div>

          {project.stack.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-[5px]">
              {project.stack.map((chip) => (
                <div
                  key={chip}
                  className="whitespace-nowrap rounded-[5px] bg-[#F1F1F3] px-[8px] py-[2px] text-[11px] font-semibold text-[#54545C]"
                >
                  {chip}
                </div>
              ))}
            </div>
          )}

          {project.proves && (
            <div className="mb-3 rounded-[8px] bg-wp-main px-3 py-[10px] text-[13px] leading-[1.55] text-[#3F3F46]">
              <span className="font-bold text-[#1C1C21]">What it proves &middot; </span>
              {project.proves}
            </div>
          )}

          <LinkedPhaseChips phaseIds={project.phaseIds} phases={phases} projectId={projectId} />

          <Link
            href={`/roadmap/${projectId}`}
            className="block rounded-[8px] border border-wp-card-border py-[9px] text-center text-[14px] font-semibold hover:bg-wp-main"
          >
            View this project&apos;s roadmap phases &rarr;
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
