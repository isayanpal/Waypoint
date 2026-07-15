import type { PhaseStatus } from "@/lib/domain/phase-status";

export type PortfolioProjectStatus = "not_started" | "in_progress" | "complete";

export type Topic = {
  id: string;
  orderIndex: number;
  label: string;
  done: boolean;
};

export type Phase = {
  id: string;
  orderIndex: number;
  name: string;
  status: PhaseStatus;
  topics: Topic[];
};

export type PortfolioProject = {
  id: string;
  orderIndex: number;
  name: string;
  timeline: string | null;
  difficulty: string | null;
  status: PortfolioProjectStatus;
  description: string | null;
  hook: string | null;
  proves: string | null;
  stack: string[];
  phaseIds: string[];
};

export type SkillProjectSummary = {
  id: string;
  name: string;
  totalTopics: number;
  doneTopics: number;
  progressPct: number;
};

export type SkillProjectDetail = {
  id: string;
  name: string;
  goal: string | null;
  level: string | null;
  timelineMonths: number | null;
  phases: Phase[];
  portfolioProjects: PortfolioProject[];
};
