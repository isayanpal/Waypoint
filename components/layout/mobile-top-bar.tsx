"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useUiStore } from "@/lib/stores/ui-store";

const PAGE_TITLES: { prefix: string; title: string }[] = [
  { prefix: "/dashboard", title: "Dashboard" },
  { prefix: "/roadmap", title: "Roadmap" },
  { prefix: "/projects", title: "Projects" },
  { prefix: "/new-skill", title: "New skill" },
];

export function MobileTopBar() {
  const pathname = usePathname();
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const title = PAGE_TITLES.find((p) => pathname.startsWith(p.prefix))?.title ?? "Dashboard";

  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-wp-card-border bg-wp-main px-4 py-3 mobile:hidden">
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] border border-wp-card-border bg-wp-card text-wp-ink-primary"
      >
        <Menu className="h-[15px] w-[15px]" />
      </button>
      <div className="font-heading text-[14px] font-bold">{title}</div>
    </div>
  );
}
