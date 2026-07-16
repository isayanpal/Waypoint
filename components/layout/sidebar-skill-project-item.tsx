"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniProgressBar } from "@/components/shared/mini-progress-bar";
import { DeleteProjectDialog } from "@/components/layout/delete-project-dialog";
import type { SkillProjectSummary } from "@/lib/types/domain";

export function SidebarSkillProjectItem({
  project,
  isActive,
  showLabel,
  onNavigate,
}: {
  project: SkillProjectSummary;
  isActive: boolean;
  showLabel: boolean;
  onNavigate: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded-[7px] px-[9px] py-[7px] hover:bg-[#232326]">
      <Link
        href={`/dashboard/${project.id}`}
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <div
          className={cn(
            "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px]",
            isActive ? "bg-wp-accent text-white" : "bg-[#232326] text-[#A1A1AA]"
          )}
        >
          <Folder className="h-[14px] w-[14px]" strokeWidth={2} />
        </div>
        {showLabel && (
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "truncate text-[13px] font-semibold",
                isActive ? "text-[#F4F4F5]" : "text-[#A1A1AA]"
              )}
            >
              {project.name}
            </div>
            <div className="mt-[3px] flex items-center gap-[5px]">
              <MiniProgressBar
                pct={project.progressPct}
                className="flex-1 bg-[#3F3F46]"
              />
              <div className="shrink-0 font-mono text-[11px] text-[#71717A]">
                {project.progressPct}%
              </div>
            </div>
          </div>
        )}
      </Link>
      {showLabel && (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[5px] text-[#52525B] hover:bg-[#3F3F46] hover:text-[#F87171]"
        >
          <Trash2 className="h-[11px] w-[11px]" strokeWidth={2} />
        </button>
      )}
      <DeleteProjectDialog
        projectId={project.id}
        projectName={project.name}
        isActiveProject={isActive}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
