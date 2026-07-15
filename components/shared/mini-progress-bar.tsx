import { cn } from "@/lib/utils";

export function MiniProgressBar({
  pct,
  color = "var(--wp-accent)",
  trackClassName,
  className,
}: {
  pct: number;
  color?: string;
  trackClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("h-[3px] overflow-hidden rounded-full bg-[#F4F4F5]", trackClassName, className)}
    >
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
      />
    </div>
  );
}
