import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { withComputedPhaseStatus } from "@/lib/queries/skill-projects";
import type { NewSkillInput } from "@/lib/validations/new-skill";
import type { PortfolioProjectStatus, SkillProjectDetail } from "@/lib/types/domain";

export function useToggleTopic(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const detailKey = queryKeys.skillProjects.detail(projectId);

  return useMutation({
    mutationFn: async ({ topicId }: { phaseId: string; topicId: string }) => {
      const { error } = await supabase.rpc("toggle_topic_done", { p_topic_id: topicId });
      if (error) throw error;
    },
    onMutate: async ({ phaseId, topicId }) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<SkillProjectDetail>(detailKey);

      if (previous) {
        const nextPhases = previous.phases.map((phase) =>
          phase.id === phaseId
            ? {
                ...phase,
                topics: phase.topics.map((topic) =>
                  topic.id === topicId ? { ...topic, done: !topic.done } : topic
                ),
              }
            : phase
        );

        queryClient.setQueryData<SkillProjectDetail>(detailKey, {
          ...previous,
          phases: withComputedPhaseStatus(nextPhases),
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.skillProjects.all() });
    },
  });
}

const PORTFOLIO_STATUS_CYCLE: PortfolioProjectStatus[] = [
  "not_started",
  "in_progress",
  "complete",
];

export function useCycleProjectStatus(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const detailKey = queryKeys.skillProjects.detail(projectId);

  return useMutation({
    mutationFn: async ({ portfolioProjectId }: { portfolioProjectId: string }) => {
      const { error } = await supabase.rpc("cycle_portfolio_project_status", {
        p_project_id: portfolioProjectId,
      });
      if (error) throw error;
    },
    onMutate: async ({ portfolioProjectId }) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<SkillProjectDetail>(detailKey);

      if (previous) {
        queryClient.setQueryData<SkillProjectDetail>(detailKey, {
          ...previous,
          portfolioProjects: previous.portfolioProjects.map((pp) =>
            pp.id === portfolioProjectId
              ? {
                  ...pp,
                  status:
                    PORTFOLIO_STATUS_CYCLE[
                      (PORTFOLIO_STATUS_CYCLE.indexOf(pp.status) + 1) %
                        PORTFOLIO_STATUS_CYCLE.length
                    ],
                }
              : pp
          ),
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailKey });
    },
  });
}

export function useDeleteSkillProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skillProjectId: string) => {
      const { error } = await supabase.rpc("delete_skill_project", {
        p_skill_project_id: skillProjectId,
      });
      if (error) throw error;
      return skillProjectId;
    },
    onSuccess: (skillProjectId) => {
      queryClient.removeQueries({ queryKey: queryKeys.skillProjects.detail(skillProjectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.skillProjects.all() });
    },
  });
}

export class RoadmapGenerationError extends Error {
  retryAt: string | null;

  constructor(code: string, retryAt: string | null = null) {
    super(code);
    this.name = "RoadmapGenerationError";
    this.retryAt = retryAt;
  }
}

export function useCreateSkillProjectFromAI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NewSkillInput) => {
      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new RoadmapGenerationError(body.error ?? "generation_failed", body.retryAt ?? null);
      }

      return (await response.json()) as { skillProjectId: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillProjects.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.aiGenerations.usage() });
    },
    onError: (error) => {
      if (error instanceof RoadmapGenerationError && error.message === "rate_limited") {
        queryClient.invalidateQueries({ queryKey: queryKeys.aiGenerations.usage() });
      }
    },
  });
}
