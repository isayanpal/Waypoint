export function ProjectIndexNumber({ index }: { index: number }) {
  return (
    <div className="w-[26px] shrink-0 font-mono text-[19px] font-bold text-wp-accent opacity-[0.55]">
      {String(index + 1).padStart(2, "0")}
    </div>
  );
}
