import { PhaseRow } from "@/components/dashboard/phase-row";
import type { Phase } from "@/lib/types/domain";

export function AllPhasesList({ phases }: { phases: Phase[] }) {
  return (
    <div className="overflow-hidden rounded-[11px] border border-wp-card-border bg-white">
      {phases.map((phase, i) => (
        <PhaseRow key={phase.id} phase={phase} numLabel={String(i + 1).padStart(2, "0")} />
      ))}
    </div>
  );
}
