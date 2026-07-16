"use client";

import { useParams } from "next/navigation";
import { useSkillProject } from "@/lib/queries/skill-projects";
import { useCycleProjectStatus } from "@/lib/queries/mutations";
import { ProjectCard } from "@/components/projects/project-card";
import { Spinner } from "@/components/ui/spinner";

export default function ProjectsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useSkillProject(projectId);
  const cycleStatus = useCycleProjectStatus(projectId);

  if (!project) {
    return (
      <div className="flex w-full max-w-[1180px] items-center justify-center px-[30px] py-[22px]">
        <Spinner className="size-6 text-wp-ink-secondary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1180px] px-[14px] py-4 pb-8 mobile:px-[30px] mobile:py-[22px] mobile:pb-11">
      <div className="mb-4">
        <div className="font-heading text-[22px] font-extrabold tracking-tight">
          Portfolio projects
        </div>
        <div className="mt-[1px] text-[12.5px] text-wp-ink-secondary">
          {project.name} &middot; click status to update
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {project.portfolioProjects.map((pp, i) => (
          <ProjectCard
            key={pp.id}
            project={pp}
            index={i}
            phases={project.phases}
            projectId={projectId}
            onCycleStatus={() => cycleStatus.mutate({ portfolioProjectId: pp.id })}
          />
        ))}
      </div>
    </div>
  );
}
