import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-wp-main text-wp-ink-primary">
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-wp-card-border bg-wp-card/90 px-3 py-2 text-[12.5px] font-semibold text-wp-ink-secondary backdrop-blur hover:text-wp-ink-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Waypoint
      </Link>

      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#102019] px-10 py-16 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(95,191,157,0.22),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(47,122,99,0.25),transparent_34%)]" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-wp-accent">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="15" width="4" height="7" rx="1" fill="white" fillOpacity="0.55" />
                  <rect x="10" y="9" width="4" height="13" rx="1" fill="white" fillOpacity="0.8" />
                  <rect x="18" y="2" width="4" height="20" rx="1" fill="white" />
                </svg>
              </div>
              <span className="font-heading text-[19px] font-extrabold tracking-tight">
                Waypoint
              </span>
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-[460px]">
            <div className="relative h-[220px]">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 460 220" fill="none">
                <path
                  id="auth-constellation-path"
                  d="M56 154 C122 42 190 42 230 110 C272 184 342 182 404 58"
                  stroke="rgba(143,167,158,0.42)"
                  strokeWidth="2"
                  strokeDasharray="7 9"
                  strokeLinecap="round"
                />
                {[
                  [56, 154],
                  [168, 64],
                  [290, 160],
                  [404, 58],
                ].map(([cx, cy], i) => (
                  <g key={`${cx}-${cy}`}>
                    <circle cx={cx} cy={cy} r="18" fill="rgba(95,203,158,0.10)" />
                    <circle cx={cx} cy={cy} r="7" fill={i < 2 ? "#5FCB9E" : "#1B2320"} stroke="#5FCB9E" strokeWidth="2" />
                  </g>
                ))}
              </svg>
              <div
                className="absolute h-3 w-3 rounded-full bg-[#5FCB9E] shadow-[0_0_18px_rgba(95,203,158,0.9)]"
                style={{
                  offsetPath:
                    "path('M56 154 C122 42 190 42 230 110 C272 184 342 182 404 58')",
                  animation: "waypoint-travel 4.8s linear infinite",
                }}
              />
            </div>

            <div className="rounded-[14px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
              <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-wp-ink-secondary">
                Any skill, one roadmap
              </div>
              <div className="mt-1 font-heading text-[24px] font-extrabold tracking-tight">
                Pick a goal. Get a plan.
              </div>
              <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-4">
                <div className="font-mono text-[32px] font-bold text-[#5FCB9E]">11</div>
                <div>
                  <div className="text-[13px] font-semibold">phases generated automatically</div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[62%] rounded-full bg-[#5FCB9E]" />
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[13px] text-wp-ink-secondary">
                Plus real projects &amp; a checklist
                <span className="ml-1 inline-block h-[1em] w-[6px] translate-y-[2px] bg-[#5FCB9E]" style={{ animation: "waypoint-cursor 1s step-end infinite" }} />
              </div>
            </div>
          </div>

          <div className="relative max-w-[460px] text-[15px] leading-7 text-wp-ink-secondary">
            Stop rebuilding learning plans from scratch. Keep phases, projects, and progress in one focused place.
          </div>
        </section>

        <main className="flex min-h-screen items-center justify-center px-4 py-20 lg:px-10">
          <div className="w-full max-w-[390px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
