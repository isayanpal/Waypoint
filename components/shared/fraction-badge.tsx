export function FractionBadge({ done, total }: { done: number; total: number }) {
  return (
    <div className="rounded-[5px] bg-wp-well px-[6px] py-[1px] font-mono text-[12.5px] font-semibold text-[#E0AE5A]">
      {done}/{total}
    </div>
  );
}
