export function StatTile({
  label,
  value,
  color = "var(--wp-ink-primary)",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="min-w-0 rounded-[9px] border border-wp-card-border bg-white px-[12px] py-[11px]">
      <div className="truncate text-[9.5px] font-semibold uppercase tracking-[0.03em] text-wp-ink-secondary">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-[18px] font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
