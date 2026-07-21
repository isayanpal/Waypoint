"use client";

import { useParams } from "next/navigation";
import { useSkillProject, withComputedPhaseStatus } from "@/lib/queries/skill-projects";
import { useToggleTopic } from "@/lib/queries/mutations";
import { PhaseCard } from "@/components/roadmap/phase-card";
import { Spinner } from "@/components/ui/spinner";

export default function RoadmapPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useSkillProject(projectId);
  const toggleTopic = useToggleTopic(projectId);

  if (!project) {
    return (
      <div className="flex w-full max-w-[1180px] items-center justify-center px-[30px] py-[22px]">
        <Spinner className="size-6 text-wp-ink-secondary" />
      </div>
    );
  }

  const phases = withComputedPhaseStatus(project.phases);
  const totalTopics = phases.reduce((sum, p) => sum + p.topics.length, 0);
  const doneTopics = phases.reduce((sum, p) => sum + p.topics.filter((t) => t.done).length, 0);
  const progressPct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  return (
    <div className="w-full max-w-[1180px] px-[14px] py-4 pb-8 mobile:px-[30px] mobile:py-[22px] mobile:pb-11">
      <div className="mb-4">
        <div className="font-heading text-[19px] font-extrabold tracking-tight">Roadmap</div>
        <div className="mt-[1px] text-[11px] text-wp-ink-secondary">
          {project.name} &middot; {phases.length} phases &middot; {progressPct}% complete
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        {phases.map((phase, i) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            numLabel={String(i + 1).padStart(2, "0")}
            onToggleTopic={(topicId) => toggleTopic.mutate({ phaseId: phase.id, topicId })}
          />
        ))}
      </div>
    </div>
  );
}
