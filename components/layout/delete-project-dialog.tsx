"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteSkillProject } from "@/lib/queries/mutations";
import { useSkillProjects } from "@/lib/queries/skill-projects";

export function DeleteProjectDialog({
  projectId,
  projectName,
  isActiveProject,
  open,
  onOpenChange,
}: {
  projectId: string;
  projectName: string;
  isActiveProject: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data: projects } = useSkillProjects();
  const deleteProject = useDeleteSkillProject();

  const handleDelete = async () => {
    await deleteProject.mutateAsync(projectId);
    onOpenChange(false);

    if (isActiveProject) {
      const fallback = (projects ?? []).find((p) => p.id !== projectId);
      router.push(fallback ? `/dashboard/${fallback.id}` : "/new-skill");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[12px] shadow-[var(--wp-shadow-modal)] sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-[16.5px] font-bold">
            Delete &ldquo;{projectName}&rdquo;?
          </DialogTitle>
          <DialogDescription className="text-[14px] leading-[1.5] text-wp-ink-secondary">
            This removes the roadmap, checklist progress, and portfolio project tracker for this
            skill. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteProject.isPending}>
            {deleteProject.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
