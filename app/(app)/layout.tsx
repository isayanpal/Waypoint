import { redirect } from "next/navigation";
import { ViewTransition } from "react";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-wp-main text-[15px]">
      <div className="hidden shrink-0 mobile:block">
        <AppSidebar variant="desktop" />
      </div>
      <MobileDrawer />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <MobileTopBar />
        <ViewTransition name="app-content" enter="auto" exit="auto" default="none">
          {children}
        </ViewTransition>
      </div>
    </div>
  );
}
