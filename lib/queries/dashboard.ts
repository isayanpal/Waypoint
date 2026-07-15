import { useSkillProject } from "@/lib/queries/skill-projects";
import { computeDashboardStats } from "@/lib/domain/dashboard-stats";

export function useDashboardStats(projectId: string | null) {
  const query = useSkillProject(projectId);
  return {
    ...query,
    data: query.data ? computeDashboardStats(query.data) : undefined,
  };
}
