"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useUiStore } from "@/lib/stores/ui-store";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function MobileDrawer() {
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[232px] max-w-[82vw] gap-0 border-none bg-wp-sidebar p-0 shadow-[var(--wp-shadow-drawer)] sm:max-w-[232px]"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <AppSidebar variant="mobile" />
      </SheetContent>
    </Sheet>
  );
}
