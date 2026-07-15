import { withComputedPhaseStatus } from "@/lib/queries/skill-projects";
import type { Phase, SkillProjectDetail } from "@/lib/types/domain";

export type DashboardStats = {
  phaseCount: number;
  phasesComplete: number;
  progressPct: number;
  topicsLeft: number;
  projectsBuilt: number;
  projectsActive: number;
  phases: Phase[];
  currentPhase: Phase;
};

export function computeDashboardStats(project: SkillProjectDetail): DashboardStats {
  const phases = withComputedPhaseStatus(project.phases);
  const phaseCount = phases.length;
  const phasesComplete = phases.filter((p) => p.status === "complete").length;

  const totalTopics = phases.reduce((sum, p) => sum + p.topics.length, 0);
  const doneTopics = phases.reduce(
    (sum, p) => sum + p.topics.filter((t) => t.done).length,
    0
  );
  const progressPct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  const projectsBuilt = project.portfolioProjects.filter((p) => p.status === "complete").length;
  const projectsActive = project.portfolioProjects.filter(
    (p) => p.status === "in_progress"
  ).length;

  const currentIdx = phases.findIndex((p) => p.status === "current");
  const currentPhase = currentIdx >= 0 ? phases[currentIdx] : phases[phases.length - 1];

  return {
    phaseCount,
    phasesComplete,
    progressPct,
    topicsLeft: totalTopics - doneTopics,
    projectsBuilt,
    projectsActive,
    phases,
    currentPhase,
  };
}
