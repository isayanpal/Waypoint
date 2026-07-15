import { redirect } from "next/navigation";
import { getActiveProjectId } from "@/lib/server/active-project";

export default async function DashboardRedirectPage() {
  const projectId = await getActiveProjectId();
  redirect(projectId ? `/dashboard/${projectId}` : "/new-skill");
}
