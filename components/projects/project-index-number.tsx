export function ProjectIndexNumber({ index }: { index: number }) {
  return (
    <div className="w-[26px] shrink-0 font-mono text-[22px] font-bold text-wp-accent opacity-45">
      {String(index + 1).padStart(2, "0")}
    </div>
  );
}
