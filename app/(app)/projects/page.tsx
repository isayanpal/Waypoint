import { redirect } from "next/navigation";
import { getActiveProjectId } from "@/lib/server/active-project";

export default async function ProjectsRedirectPage() {
  const projectId = await getActiveProjectId();
  redirect(projectId ? `/projects/${projectId}` : "/new-skill");
}
