import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

export const DAILY_GENERATION_LIMIT = 2;

export type AiGenerationUsage = {
  used: number;
  limit: number;
  /** ISO timestamp of when the oldest generation in the current window falls off, if the limit is hit. */
  resetAt: string | null;
};

export function useAiGenerationUsage() {
  const supabase = createClient();

  return useQuery<AiGenerationUsage>({
    queryKey: queryKeys.aiGenerations.usage(),
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { used: 0, limit: DAILY_GENERATION_LIMIT, resetAt: null };
      }

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("ai_generations")
        .select("created_at")
        .eq("user_id", user.id)
        .gt("created_at", since)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const used = data?.length ?? 0;
      const oldest = data?.[0]?.created_at;
      const resetAt =
        used >= DAILY_GENERATION_LIMIT && oldest
          ? new Date(new Date(oldest).getTime() + 24 * 60 * 60 * 1000).toISOString()
          : null;

      return { used, limit: DAILY_GENERATION_LIMIT, resetAt };
    },
    staleTime: 30_000,
  });
}

export function formatResetTime(resetAt: string): string {
  const diffMs = new Date(resetAt).getTime() - Date.now();
  if (diffMs <= 0) return "shortly";

  const totalMinutes = Math.ceil(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `in ${minutes}m`;
  if (minutes === 0) return `in ${hours}h`;
  return `in ${hours}h ${minutes}m`;
}
