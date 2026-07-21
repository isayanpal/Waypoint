"use client";

import { useParams } from "next/navigation";
import { useDashboardStats } from "@/lib/queries/dashboard";
import { useSkillProject } from "@/lib/queries/skill-projects";
import { useToggleTopic } from "@/lib/queries/mutations";
import { Spinner } from "@/components/ui/spinner";
import { StatRow } from "@/components/dashboard/stat-row";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { CurrentPhaseCard } from "@/components/dashboard/current-phase-card";
import { AllPhasesList } from "@/components/dashboard/all-phases-list";
import { PortfolioSummaryList } from "@/components/dashboard/portfolio-summary-list";
import { SectionLabel } from "@/components/shared/section-label";

export default function DashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useSkillProject(projectId);
  const { data: stats } = useDashboardStats(projectId);
  const toggleTopic = useToggleTopic(projectId);

  if (!project || !stats) {
    return (
      <div className="flex w-full max-w-[1180px] items-center justify-center px-[30px] py-[22px] mobile:px-[30px]">
        <Spinner className="size-6 text-wp-ink-secondary" />
      </div>
    );
  }

  const currentIdx = stats.phases.findIndex((p) => p.id === stats.currentPhase.id);

  return (
    <div className="w-full max-w-[1180px] px-[14px] py-4 pb-8 mobile:px-[30px] mobile:py-[22px] mobile:pb-11">
      <div className="mb-4 flex flex-col gap-[2px]">
        <div className="truncate font-heading text-[19px] font-extrabold tracking-tight">
          {project.name}
        </div>
        <div className="text-[11px] text-wp-ink-secondary">Dashboard overview</div>
      </div>

      <StatRow stats={stats} />

      <div className="grid items-start gap-[14px] mobile:grid-cols-[1.35fr_1fr]">
        <div className="min-w-0">
          <SectionLabel>Current phase</SectionLabel>
          <CurrentPhaseCard
            phase={stats.currentPhase}
            numLabel={String(currentIdx + 1).padStart(2, "0")}
            projectId={projectId}
            onToggleTopic={(phaseId, topicId) => toggleTopic.mutate({ phaseId, topicId })}
          />

          <SectionLabel>All phases</SectionLabel>
          <AllPhasesList phases={stats.phases} />
        </div>

        <div className="min-w-0">
          <SectionLabel>Portfolio projects</SectionLabel>
          <PortfolioSummaryList projects={project.portfolioProjects} />

          <ProgressCard currentPhase={stats.currentPhase} />
        </div>
      </div>
    </div>
  );
}
