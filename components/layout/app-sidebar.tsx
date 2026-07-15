"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutGrid, Waypoints, FolderClosed, ChevronLeft, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/stores/ui-store";
import { useSkillProjects } from "@/lib/queries/skill-projects";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";
import { SidebarSkillProjectItem } from "@/components/layout/sidebar-skill-project-item";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { LogoutButton } from "@/components/layout/logout-button";

export function AppSidebar({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const activeProjectId = params?.projectId;

  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  const { data: projects } = useSkillProjects();

  const isMobile = variant === "mobile";
  const showLabels = isMobile || !sidebarCollapsed;
  const closeMobileNav = () => setMobileNavOpen(false);

  const navHref = (page: string) => (activeProjectId ? `/${page}/${activeProjectId}` : `/${page}`);

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden bg-wp-sidebar p-3 transition-[width] duration-150",
        !isMobile && (sidebarCollapsed ? "w-[68px]" : "w-[232px]")
      )}
    >
      <div className="flex items-center gap-2 px-1 pb-4 pt-1">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-wp-accent">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="15" width="4" height="7" rx="1" fill="white" fillOpacity="0.55" />
            <rect x="10" y="9" width="4" height="13" rx="1" fill="white" fillOpacity="0.8" />
            <rect x="18" y="2" width="4" height="20" rx="1" fill="white" />
          </svg>
        </div>
        {showLabels && (
          <div className="flex-1 truncate font-heading text-[14px] font-extrabold tracking-tight text-[#FAFAFA]">
            Waypoint
          </div>
        )}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] text-[#71717A] hover:bg-[#232326] hover:text-[#E4E4E7]"
          >
            <ChevronLeft
              className="h-3 w-3 transition-transform duration-150"
              style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        )}
        {isMobile && (
          <button
            type="button"
            onClick={closeMobileNav}
            className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] text-[#71717A] hover:bg-[#232326] hover:text-[#E4E4E7]"
          >
            <X className="h-[13px] w-[13px]" />
          </button>
        )}
      </div>

      <nav className="mb-4 flex flex-col gap-[1px]">
        <SidebarNavItem
          href={navHref("dashboard")}
          label="Dashboard"
          icon={LayoutGrid}
          active={pathname.startsWith("/dashboard")}
          showLabel={showLabels}
        />
        <SidebarNavItem
          href={navHref("roadmap")}
          label="Roadmap"
          icon={Waypoints}
          active={pathname.startsWith("/roadmap")}
          showLabel={showLabels}
        />
        <SidebarNavItem
          href={navHref("projects")}
          label="Projects"
          icon={FolderClosed}
          active={pathname.startsWith("/projects")}
          showLabel={showLabels}
        />
      </nav>

      <div className="mx-2 mb-3 h-px bg-[#27272A]" />

      {showLabels && (
        <div className="px-[10px] pb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#71717A]">
          Skill Projects
        </div>
      )}

      <div className="flex flex-1 flex-col gap-[2px] overflow-y-auto overflow-x-hidden">
        {(projects ?? []).map((project) => (
          <SidebarSkillProjectItem
            key={project.id}
            project={project}
            isActive={project.id === activeProjectId}
            showLabel={showLabels}
            onNavigate={closeMobileNav}
          />
        ))}
      </div>

      <ThemeSwitcher showLabel={showLabels} />

      <LogoutButton showLabel={showLabels} />

      <Link
        href="/new-skill"
        onClick={closeMobileNav}
        className={cn(
          "mt-2 flex items-center justify-center gap-[6px] overflow-hidden whitespace-nowrap rounded-[7px] border border-[#3F3F46] bg-[#232326] px-[9px] py-[9px] text-[11.5px] font-semibold text-[#E4E4E7] hover:bg-[#2A2A2E]"
        )}
      >
        <Plus className="h-3 w-3 shrink-0" strokeWidth={2.5} />
        {showLabels && "New skill"}
      </Link>
    </div>
  );
}
