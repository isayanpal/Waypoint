import { cn } from "@/lib/utils";
import type { PhaseStatus } from "@/lib/domain/phase-status";
import type { PortfolioProjectStatus } from "@/lib/types/domain";

const STATUS_STYLES: Record<
  PhaseStatus | PortfolioProjectStatus,
  { bg: string; text: string; label: string }
> = {
  complete: { bg: "var(--wp-status-complete-bg)", text: "var(--wp-status-complete-text)", label: "Complete" },
  current: { bg: "var(--wp-status-progress-bg)", text: "var(--wp-status-progress-text)", label: "In progress" },
  in_progress: { bg: "var(--wp-status-progress-bg)", text: "var(--wp-status-progress-text)", label: "In progress" },
  not_started: { bg: "var(--wp-status-notstarted-bg)", text: "var(--wp-status-notstarted-text)", label: "Not started" },
};

export function StatusPill({
  status,
  onClick,
  className,
}: {
  status: PhaseStatus | PortfolioProjectStatus;
  onClick?: () => void;
  className?: string;
}) {
  const style = STATUS_STYLES[status];
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-[10px] py-[3px] text-[10px] font-bold",
        onClick && "cursor-pointer",
        className
      )}
      style={{ background: style.bg, color: style.text }}
    >
      {style.label}
    </Comp>
  );
}

/** Bar color for progress bars, matching a phase/project's status. */
export function statusBarColor(status: PhaseStatus): string {
  if (status === "complete") return "#3D6E58";
  if (status === "current") return "#8A6A2F";
  return "#D4D4D8";
}
