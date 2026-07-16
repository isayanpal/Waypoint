"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopicCheckboxItem({
  label,
  done,
  onToggle,
  size = "md",
  className,
}: {
  label: string;
  done: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const boxSize = size === "sm" ? "h-[13px] w-[13px]" : "h-[14px] w-[14px]";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn("flex min-w-0 items-center gap-2 py-[1px] text-left", className)}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[4px] border-[1.5px]",
          boxSize,
          done ? "border-wp-accent bg-wp-accent" : "border-[#D4D4D8] bg-transparent"
        )}
      >
        {done && <Check className="h-2 w-2 text-white" strokeWidth={4} />}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[14px]",
          done ? "text-wp-ink-tertiary line-through" : "text-[#27272A]"
        )}
      >
        {label}
      </span>
    </button>
  );
}
