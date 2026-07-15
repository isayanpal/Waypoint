export function FractionBadge({ done, total }: { done: number; total: number }) {
  return (
    <div className="rounded-[5px] bg-wp-main px-[6px] py-[1px] font-mono text-[11px] font-semibold text-[#8A6A2F]">
      {done}/{total}
    </div>
  );
}
