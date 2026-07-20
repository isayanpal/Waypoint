"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export function LogoutButton({ showLabel }: { showLabel: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "flex items-center gap-[9px] overflow-hidden whitespace-nowrap rounded-[6px] px-[10px] py-[7px] text-[14px] font-medium text-wp-ink-secondary transition-colors hover:bg-[#1C2420] hover:text-wp-ink-primary disabled:opacity-60",
        !showLabel && "justify-center"
      )}
    >
      {loading ? (
        <Spinner className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <LogOut className="h-3.5 w-3.5 shrink-0" />
      )}
      {showLabel && (loading ? "Logging out..." : "Log out")}
    </button>
  );
}
