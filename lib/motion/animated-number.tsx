"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { easeOut } from "@/lib/motion/variants";

/** Tweens the leading integer in `value` (e.g. "3/5", "62%") on change, count-up style. */
export function AnimatedNumber({ value }: { value: string }) {
  const match = value.match(/^-?\d+/);
  const numeric = match ? parseInt(match[0], 10) : null;
  const suffix = match ? value.slice(match[0].length) : value;

  const [display, setDisplay] = useState(numeric ?? 0);
  const prevRef = useRef(numeric ?? 0);

  useEffect(() => {
    if (numeric === null) return;
    const from = prevRef.current;
    prevRef.current = numeric;
    if (from === numeric) return;

    const controls = animate(from, numeric, {
      duration: 0.5,
      ease: easeOut,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [numeric]);

  if (numeric === null) return <>{value}</>;
  return (
    <>
      {display}
      {suffix}
    </>
  );
}
