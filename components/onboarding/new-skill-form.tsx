"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { newSkillSchema, type NewSkillInput } from "@/lib/validations/new-skill";
import { RoadmapGenerationError, useCreateSkillProjectFromAI } from "@/lib/queries/mutations";
import { formatResetTime, useAiGenerationUsage } from "@/lib/queries/ai-generations";
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

export function NewSkillForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const createSkillProject = useCreateSkillProjectFromAI();
  const { data: usage } = useAiGenerationUsage();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<NewSkillInput>({
    resolver: zodResolver(newSkillSchema),
    defaultValues: { name: "", goal: "", level: "Beginner", timelineMonths: 6 },
  });

  const nameValue = watch("name");
  const limitReached = !!usage && usage.used >= usage.limit;
  const canSubmit = nameValue.trim().length > 0 && !limitReached;

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
      setServerError("Couldn't generate a roadmap right now. Try again in a moment.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      {usage && (
        <div
          className={cn(
            "rounded-[7px] border px-3 py-2 text-[11px]",
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
        <Label htmlFor="name" className="mb-[5px] block text-[11px] font-semibold text-[#3F3F46]">
          Skill name
        </Label>
        <Input
          id="name"
          placeholder="e.g. Frontend performance engineering"
          {...register("name")}
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="goal" className="mb-[5px] block text-[11px] font-semibold text-[#3F3F46]">
          Goal &amp; context
        </Label>
        <Textarea
          id="goal"
          rows={3}
          placeholder="What do you want to be able to do, and why?"
          {...register("goal")}
        />
        {errors.goal && <p className="mt-1 text-xs text-destructive">{errors.goal.message}</p>}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Label className="mb-[5px] block text-[11px] font-semibold text-[#3F3F46]">
            Current level
          </Label>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
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
          <Label className="mb-[5px] block text-[11px] font-semibold text-[#3F3F46]">
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
                <SelectTrigger className="w-full">
                  <SelectValue />
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
