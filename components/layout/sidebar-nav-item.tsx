"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/motion/variants";

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  active,
  showLabel,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  showLabel: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-[9px] overflow-hidden whitespace-nowrap rounded-[6px] px-[10px] py-[7px] text-[14px] font-medium",
        active ? "text-[#F4F4F5]" : "text-[#A1A1AA] hover:bg-[#232326] hover:text-[#F4F4F5]"
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-pill"
          transition={{ duration: 0.22, ease: easeOut }}
          className="absolute inset-0 rounded-[6px] bg-[#232326]"
        />
      )}
      <Icon className="relative z-10 h-[14px] w-[14px] shrink-0" strokeWidth={2} />
      {showLabel && <span className="relative z-10">{label}</span>}
    </Link>
  );
}
