"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const STEPS = [
  "Reading your goal and current level…",
  "Mapping out phases…",
  "Drafting portfolio projects…",
  "Building your topic checklist…",
];

export function GeneratingOverlay() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-14">
      <div className="relative flex size-14 items-center justify-center">
        <div
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-wp-card-border"
          style={{ borderTopColor: "var(--wp-accent)", animationDuration: "0.9s" }}
        />
        <div
          className="absolute inset-2 animate-spin rounded-full border-[3px] border-transparent opacity-60"
          style={{
            borderTopColor: "var(--wp-accent)",
            animationDuration: "1.4s",
            animationDirection: "reverse",
          }}
        />
        <Sparkles className="size-5 text-wp-accent" strokeWidth={2} />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="text-[13px] font-semibold">Generating your roadmap…</div>
        <div className="text-[11.5px] text-wp-ink-secondary transition-opacity duration-300">
          {STEPS[stepIndex]}
        </div>
      </div>
    </div>
  );
}
