import { StatusPill } from "@/components/shared/status-pill";
import type { PortfolioProject } from "@/lib/types/domain";

export function PortfolioSummaryList({ projects }: { projects: PortfolioProject[] }) {
  return (
    <div className="mb-5 overflow-hidden rounded-[11px] border border-wp-card-border bg-white">
      {projects.map((project) => (
        <div
          key={project.id}
          className="flex items-center gap-2 border-b border-[#F4F4F5] px-3 py-[9px] last:border-b-0"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-semibold">{project.name}</div>
            <div className="truncate text-[10px] text-wp-ink-tertiary">{project.timeline}</div>
          </div>
          <StatusPill status={project.status} />
        </div>
      ))}
    </div>
  );
}
