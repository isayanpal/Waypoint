import { redirect } from "next/navigation";
import { getActiveProjectId } from "@/lib/server/active-project";

export default async function RoadmapRedirectPage() {
  const projectId = await getActiveProjectId();
  redirect(projectId ? `/roadmap/${projectId}` : "/new-skill");
}
