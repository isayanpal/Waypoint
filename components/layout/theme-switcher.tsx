"use client";

import { useUiStore, type Theme } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";

const THEMES: { value: Theme; label: string; accent: string }[] = [
  { value: "indigo_ink", label: "Indigo Ink", accent: "#5457D6" },
  { value: "graphite_gold", label: "Graphite & Gold", accent: "#A8813F" },
  { value: "emerald_slate", label: "Emerald Slate", accent: "#2F7A63" },
];

export function ThemeSwitcher({ showLabel }: { showLabel: boolean }) {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  return (
    <div className="flex items-center justify-center gap-[7px] px-[4px] py-[6px]">
      {THEMES.map((t) => (
        <button
          key={t.value}
          type="button"
          title={t.label}
          onClick={() => setTheme(t.value)}
          className={cn(
            "h-[14px] w-[14px] shrink-0 rounded-full ring-offset-2 ring-offset-[#17171B] transition-shadow",
            theme === t.value ? "ring-2 ring-white/70" : "opacity-70 hover:opacity-100"
          )}
          style={{ background: t.accent }}
        />
      ))}
      {showLabel && <span className="sr-only">Theme</span>}
    </div>
  );
}
