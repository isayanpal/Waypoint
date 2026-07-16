"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "flex items-center gap-[9px] overflow-hidden whitespace-nowrap rounded-[6px] px-[10px] py-[7px] text-[14px] font-medium transition-colors",
        active ? "bg-[#232326] text-[#F4F4F5]" : "text-[#A1A1AA] hover:bg-[#232326] hover:text-[#F4F4F5]"
      )}
    >
      <Icon className="h-[14px] w-[14px] shrink-0" strokeWidth={2} />
      {showLabel && <span>{label}</span>}
    </Link>
  );
}
