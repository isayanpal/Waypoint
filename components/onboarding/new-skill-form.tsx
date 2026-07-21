"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { newSkillSchema, type NewSkillInput } from "@/lib/validations/new-skill";
import { RoadmapGenerationError, useCreateSkillProjectFromAI } from "@/lib/queries/mutations";
import { formatResetTime, useAiGenerationUsage } from "@/lib/queries/ai-generations";
import { useSkillProjects } from "@/lib/queries/skill-projects";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GeneratingOverlay } from "@/components/onboarding/generating-overlay";
import { cn } from "@/lib/utils";

const MAX_SKILL_PROJECTS = 4;

export function NewSkillForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const createSkillProject = useCreateSkillProjectFromAI();
  const { data: usage } = useAiGenerationUsage();
  const { data: projects } = useSkillProjects();
  const projectLimitReached = (projects?.length ?? 0) >= MAX_SKILL_PROJECTS;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewSkillInput>({
    resolver: zodResolver(newSkillSchema),
    defaultValues: { name: "", goal: "", level: "Beginner", timelineMonths: 6 },
  });

  const nameValue = useWatch({ control, name: "name" });
  const limitReached = !!usage && usage.used >= usage.limit;
  const canSubmit = nameValue.trim().length > 0 && !limitReached && !projectLimitReached;

  if (createSkillProject.isPending) {
    return <GeneratingOverlay />;
  }

  const onSubmit = async (values: NewSkillInput) => {
    setServerError(null);
    try {
      const { skillProjectId } = await createSkillProject.mutateAsync(values);
      router.push(`/dashboard/${skillProjectId}`);
    } catch (error) {
      if (error instanceof RoadmapGenerationError && error.message === "rate_limited") {
        setServerError(
          error.retryAt
            ? `You've used both roadmap generations for today. Next one available ${formatResetTime(error.retryAt)}.`
            : "You've used both roadmap generations for today. Try again tomorrow."
        );
        return;
      }
      if (error instanceof RoadmapGenerationError && error.message === "project_limit_reached") {
        setServerError(
          `You can only have ${MAX_SKILL_PROJECTS} skill projects at a time. Delete one to add another.`
        );
        return;
      }
      setServerError("Couldn't generate a roadmap right now. Try again in a moment.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      {projectLimitReached && (
        <div className="rounded-[7px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12.5px] text-destructive">
          {`You can only have ${MAX_SKILL_PROJECTS} skill projects at a time. Delete one to add another.`}
        </div>
      )}
      {usage && (
        <div
          className={cn(
            "rounded-[7px] border px-3 py-2 text-[12.5px]",
            limitReached
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-wp-card-border bg-wp-card text-wp-ink-secondary"
          )}
        >
          {limitReached
            ? `Daily limit reached (${usage.used}/${usage.limit}). ${
                usage.resetAt ? `Next one available ${formatResetTime(usage.resetAt)}.` : ""
              }`
            : `${usage.used}/${usage.limit} AI roadmaps generated today`}
        </div>
      )}
      <div>
        <Label htmlFor="name" className="mb-[5px] block text-[11px] font-semibold text-wp-ink-secondary">
          Skill name
        </Label>
        <Input
          id="name"
          placeholder="e.g. Frontend performance engineering"
          className="h-auto rounded-[7px] px-[11px] py-[9px] text-[12px]"
          {...register("name")}
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="goal" className="mb-[5px] block text-[11px] font-semibold text-wp-ink-secondary">
          Goal &amp; context
        </Label>
        <Textarea
          id="goal"
          rows={3}
          placeholder="What do you want to be able to do, and why?"
          className="rounded-[7px] px-[11px] py-[9px] text-[12px]"
          {...register("goal")}
        />
        {errors.goal && <p className="mt-1 text-xs text-destructive">{errors.goal.message}</p>}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Label className="mb-[5px] block text-[11px] font-semibold text-wp-ink-secondary">
            Current level
          </Label>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-auto w-full rounded-[7px] px-[11px] py-[9px] text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex-1">
          <Label className="mb-[5px] block text-[11px] font-semibold text-wp-ink-secondary">
            Timeline
          </Label>
          <Controller
            name="timelineMonths"
            control={control}
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <SelectTrigger className="h-auto w-full rounded-[7px] px-[11px] py-[9px] text-[12px]">
                  <SelectValue>{(value: string) => `${value} months`}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {serverError && <p className="text-xs text-destructive">{serverError}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          "mt-1 inline-flex w-fit items-center gap-[7px] rounded-[7px] px-[18px] py-[10px] text-[12px] font-semibold text-white",
          canSubmit ? "bg-wp-accent" : "bg-wp-accent-soft"
        )}
      >
        <Sparkles className="h-[13px] w-[13px]" strokeWidth={2} />
        Generate roadmap with AI
      </button>
    </form>
  );
}
