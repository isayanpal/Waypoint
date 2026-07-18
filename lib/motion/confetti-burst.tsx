"use client";

import { motion, AnimatePresence } from "motion/react";

const COLORS = ["#5457D6", "#8A6A2F", "#3D6E58", "#DC8850", "#B7B8EC"];

/** One-shot particle burst. Re-fires whenever `triggerKey` changes (pass an incrementing counter). */
export function ConfettiBurst({ triggerKey, count = 10 }: { triggerKey: number; count?: number }) {
  if (triggerKey === 0) return null;

  const particles = Array.from({ length: count }, (_, i) => {
    const jitter = ((i * 53) % 17) / 17;
    const angle = (i / count) * Math.PI * 2 + jitter * 0.4;
    const distance = 26 + ((i * 31) % 23);
    return {
      i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 6,
      color: COLORS[i % COLORS.length],
    };
  });

  return (
    <AnimatePresence>
      <motion.div
        key={triggerKey}
        className="pointer-events-none absolute inset-0 z-20 overflow-visible"
      >
        {particles.map((p) => (
          <motion.span
            key={p.i}
            className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full"
            style={{ background: p.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
