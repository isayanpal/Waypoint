// Pure mirror of the recompute rules in supabase/migrations/0007_functions_toggle_topic.sql.
// Kept in sync by hand — used for optimistic UI updates only, never as the source of truth.

export type PhaseStatus = "not_started" | "current" | "complete";

export function computePhaseStatus(params: {
  orderIndex: number;
  totalTopics: number;
  doneTopics: number;
  previousPhaseStatus: PhaseStatus | null;
}): PhaseStatus {
  const { orderIndex, totalTopics, doneTopics, previousPhaseStatus } = params;

  if (totalTopics > 0 && doneTopics === totalTopics) {
    return "complete";
  }

  if (orderIndex === 0) {
    return "current";
  }

  return previousPhaseStatus === "complete" ? "current" : "not_started";
}
