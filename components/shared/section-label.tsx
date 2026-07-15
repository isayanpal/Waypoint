import { cn } from "@/lib/utils";

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mb-2 text-[10.5px] font-bold uppercase tracking-[0.05em] text-wp-ink-secondary",
        className
      )}
    >
      {children}
    </div>
  );
}
