export function PhaseWatermarkNumber({
  numLabel,
  size = 112,
}: {
  numLabel: string;
  size?: number;
}) {
  return (
    <div
      className="pointer-events-none absolute right-2 select-none font-heading font-extrabold leading-none text-wp-ink-primary opacity-[0.04]"
      style={{ top: -size * 0.16, fontSize: size }}
      aria-hidden
    >
      {numLabel}
    </div>
  );
}
