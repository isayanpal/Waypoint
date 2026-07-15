import { createClient } from "@/lib/supabase/server";

/** Most-recently-created skill project id for the current user, or null if they have none. */
export async function getActiveProjectId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skill_projects")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}
