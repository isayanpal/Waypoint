import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="font-heading text-[19px] font-extrabold">No skill projects yet</div>
      <div className="max-w-[340px] text-[12.5px] text-wp-ink-secondary">
        Describe what you want to learn and get an AI-generated roadmap, portfolio projects, and a
        checklist to track it.
      </div>
      <Link
        href="/new-skill"
        className="mt-1 rounded-[7px] bg-wp-accent px-[18px] py-[9px] text-[12px] font-semibold text-white"
      >
        Add your first skill
      </Link>
    </div>
  );
}
