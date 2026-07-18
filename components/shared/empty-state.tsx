"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { fadeInUp } from "@/lib/motion/variants";

export function EmptyState() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <div className="font-heading text-[22px] font-extrabold">No skill projects yet</div>
      <div className="max-w-[340px] text-[14.5px] text-wp-ink-secondary">
        Describe what you want to learn and get an AI-generated roadmap, portfolio projects, and a
        checklist to track it.
      </div>
      <Link
        href="/new-skill"
        className="mt-1 rounded-[7px] bg-wp-accent px-[18px] py-[9px] text-[14px] font-semibold text-white"
      >
        Add your first skill
      </Link>
    </motion.div>
  );
}
