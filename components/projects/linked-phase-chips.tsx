import Link from "next/link";
import type { Phase } from "@/lib/types/domain";

export function LinkedPhaseChips({
  phaseIds,
  phases,
  projectId,
}: {
  phaseIds: string[];
  phases: Phase[];
  projectId: string;
}) {
  const phaseNumberById = new Map(phases.map((p, i) => [p.id, i + 1]));

  return (
    <div className="mb-[14px] flex flex-wrap gap-[5px]">
      {phaseIds.map((phaseId) => {
        const phase = phases.find((p) => p.id === phaseId);
        if (!phase) return null;
        return (
          <Link
            key={phaseId}
            href={`/roadmap/${projectId}`}
            className="whitespace-nowrap rounded-[5px] border border-wp-card-border bg-white px-[8px] py-[2px] text-[9.5px] font-semibold text-wp-ink-secondary hover:text-wp-ink-primary"
          >
            Phase {phaseNumberById.get(phaseId)} &mdash; {phase.name}
          </Link>
        );
      })}
    </div>
  );
}
