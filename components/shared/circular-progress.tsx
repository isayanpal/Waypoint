"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { easeOut } from "@/lib/motion/variants";
import { ConfettiBurst } from "@/lib/motion/confetti-burst";

export function CircularProgress({
  pct,
  size = 72,
  strokeWidth = 7,
  color = "var(--wp-accent)",
  trackColor = "rgba(255,255,255,0.1)",
  children,
}: {
  pct: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  const [prevPct, setPrevPct] = useState(clamped);
  const [burst, setBurst] = useState(0);
  const justCompleted = clamped === 100 && prevPct < 100;

  if (clamped !== prevPct) {
    if (justCompleted) setBurst((b) => b + 1);
    setPrevPct(clamped);
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <ConfettiBurst triggerKey={burst} count={16} />
      <motion.svg
        width={size}
        height={size}
        className="-rotate-90"
        animate={
          justCompleted
            ? {
                filter: [
                  "drop-shadow(0 0 0px #F5C451)",
                  "drop-shadow(0 0 8px #F5C451)",
                  "drop-shadow(0 0 0px #F5C451)",
                ],
              }
            : {}
        }
        transition={{ duration: 0.7, repeat: justCompleted ? 1 : 0 }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: easeOut }}
        />
      </motion.svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
