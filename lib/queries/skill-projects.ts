import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { computePhaseStatus, type PhaseStatus } from "@/lib/domain/phase-status";
import type {
  Phase,
  PortfolioProject,
  SkillProjectDetail,
  SkillProjectSummary,
} from "@/lib/types/domain";

export function useSkillProjects() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.skillProjects.all(),
    queryFn: async (): Promise<SkillProjectSummary[]> => {
      const { data, error } = await supabase
        .from("skill_projects")
        .select("id,name,created_at,phases(topics(done))")
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((row) => {
        const topics = row.phases.flatMap((p) => p.topics);
        const totalTopics = topics.length;
        const doneTopics = topics.filter((t) => t.done).length;
        return {
          id: row.id,
          name: row.name,
          totalTopics,
          doneTopics,
          progressPct: totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0,
        };
      });
    },
  });
}

export function useSkillProject(projectId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.skillProjects.detail(projectId ?? ""),
    enabled: Boolean(projectId),
    queryFn: async (): Promise<SkillProjectDetail> => {
      const { data, error } = await supabase
        .from("skill_projects")
        .select(
          `id,name,goal,level,timeline_months,
           phases(id,order_index,name,status,topics(id,order_index,label,done)),
           portfolio_projects(id,order_index,name,timeline,difficulty,status,description,hook,proves,stack,portfolio_project_phases(phase_id))`
        )
        .eq("id", projectId as string)
        .order("order_index", { referencedTable: "phases" })
        .order("order_index", { referencedTable: "phases.topics" })
        .order("order_index", { referencedTable: "portfolio_projects" })
        .single();

      if (error) throw error;

      const phases: Phase[] = data.phases.map((ph) => ({
        id: ph.id,
        orderIndex: ph.order_index,
        name: ph.name,
        status: ph.status as PhaseStatus,
        topics: ph.topics.map((t) => ({
          id: t.id,
          orderIndex: t.order_index,
          label: t.label,
          done: t.done,
        })),
      }));

      const portfolioProjects: PortfolioProject[] = data.portfolio_projects.map((pp) => ({
        id: pp.id,
        orderIndex: pp.order_index,
        name: pp.name,
        timeline: pp.timeline,
        difficulty: pp.difficulty,
        status: pp.status,
        description: pp.description,
        hook: pp.hook,
        proves: pp.proves,
        stack: pp.stack ?? [],
        phaseIds: pp.portfolio_project_phases.map((ppp) => ppp.phase_id),
      }));

      return {
        id: data.id,
        name: data.name,
        goal: data.goal,
        level: data.level,
        timelineMonths: data.timeline_months,
        phases,
        portfolioProjects,
      };
    },
  });
}

/** Recomputes each phase's status client-side from the same rules the DB function uses. */
export function withComputedPhaseStatus(phases: Phase[]): Phase[] {
  let previousStatus: PhaseStatus | null = null;
  return phases.map((phase, orderIndex) => {
    const totalTopics = phase.topics.length;
    const doneTopics = phase.topics.filter((t) => t.done).length;
    const status = computePhaseStatus({
      orderIndex,
      totalTopics,
      doneTopics,
      previousPhaseStatus: previousStatus,
    });
    previousStatus = status;
    return { ...phase, status };
  });
}
