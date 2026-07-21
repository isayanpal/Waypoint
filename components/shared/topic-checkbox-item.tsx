"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ConfettiBurst } from "@/lib/motion/confetti-burst";

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
  const [burst, setBurst] = useState(0);

  const handleClick = () => {
    if (!done) setBurst((b) => b + 1);
    onToggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn("flex min-w-0 items-start gap-2 py-[1px] text-left", className)}
    >
      <motion.span
        animate={{ borderColor: done ? "var(--wp-accent)" : "rgba(255,255,255,0.22)" }}
        transition={{ duration: 0.15 }}
        className={cn(
          "relative mt-[3px] flex shrink-0 items-center justify-center overflow-visible rounded-[4px] border-[1.5px]",
          boxSize,
          done ? "border-wp-accent bg-wp-accent" : "border-white/[0.22] bg-transparent"
        )}
      >
        <ConfettiBurst triggerKey={burst} count={7} />
        <AnimatePresence>
          {done && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.35, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.32, times: [0, 0.6, 1], ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <Check className="h-2 w-2 text-white" strokeWidth={4} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
      <span
        className={cn(
          "min-w-0 flex-1 leading-[1.35] transition-colors duration-150",
          size === "sm" ? "text-[11.5px]" : "text-[12px]",
          done ? "text-wp-ink-tertiary line-through" : "text-wp-ink-primary"
        )}
      >
        {label}
      </span>
    </button>
  );
}
