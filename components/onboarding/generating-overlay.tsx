export function GeneratingOverlay() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div
        className="h-7 w-7 animate-spin rounded-full border-[3px] border-wp-card-border"
        style={{ borderTopColor: "var(--wp-accent)" }}
      />
      <div className="text-[12px] text-wp-ink-secondary">Generating your roadmap&hellip;</div>
    </div>
  );
}
