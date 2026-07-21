import { PhaseWatermarkNumber } from "@/components/shared/phase-watermark-number";
import { MiniProgressBar } from "@/components/shared/mini-progress-bar";
import { StatusPill, statusBarColor } from "@/components/shared/status-pill";
import { TopicChecklist } from "@/components/shared/topic-checklist";
import type { Phase } from "@/lib/types/domain";

export function PhaseCard({
  phase,
  numLabel,
  onToggleTopic,
}: {
  phase: Phase;
  numLabel: string;
  onToggleTopic: (topicId: string) => void;
}) {
  const total = phase.topics.length;
  const done = phase.topics.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-[11px] border border-wp-card-border bg-wp-card px-[18px] py-[14px]">
      <PhaseWatermarkNumber numLabel={numLabel} size={98} />
      <div className="relative z-10">
        <div className="mb-[2px] flex flex-wrap items-center gap-[9px]">
          <div className="min-w-[140px] flex-1 font-heading text-[13.5px] font-bold">
            {phase.name}
          </div>
          <div className="font-mono text-[10.5px] text-wp-ink-secondary">
            {done}/{total}
          </div>
          <StatusPill status={phase.status} className="px-[8px] py-[2px] text-[9.5px]" />
        </div>
        <MiniProgressBar
          pct={pct}
          color={statusBarColor(phase.status)}
          className="mt-[7px] mb-[11px] h-1 max-w-[520px]"
        />
        <TopicChecklist topics={phase.topics} layout="wrap" onToggle={onToggleTopic} />
      </div>
    </div>
  );
}
