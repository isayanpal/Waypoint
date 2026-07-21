import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-wp-main text-wp-ink-primary">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#102019] px-10 py-10 lg:flex lg:flex-col lg:justify-between">
          <div
            className="pointer-events-none absolute -left-[120px] -top-[160px] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(47,122,99,0.35)_0%,transparent_70%)]"
            style={{ animation: "waypoint-orb-drift 16s ease-in-out infinite" }}
          />
          <div
            className="pointer-events-none absolute -bottom-[180px] -right-[140px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(47,122,99,0.22)_0%,transparent_70%)]"
            style={{
              animation: "waypoint-orb-drift 20s ease-in-out infinite reverse",
            }}
          />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-wp-accent">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="15"
                    width="4"
                    height="7"
                    rx="1"
                    fill="white"
                    fillOpacity="0.55"
                  />
                  <rect
                    x="10"
                    y="9"
                    width="4"
                    height="13"
                    rx="1"
                    fill="white"
                    fillOpacity="0.8"
                  />
                  <rect
                    x="18"
                    y="2"
                    width="4"
                    height="20"
                    rx="1"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="font-heading text-[19px] font-extrabold tracking-tight">
                Waypoint
              </span>
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-[460px]">
            <div className="relative h-[220px]">
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 460 220"
                fill="none"
              >
                <path
                  id="auth-constellation-path"
                  d="M56 154 C122 42 190 42 230 110 C272 184 342 182 404 58"
                  stroke="rgba(143,167,158,0.42)"
                  strokeWidth="2"
                  strokeDasharray="7 9"
                  strokeLinecap="round"
                  style={{ animation: "waypoint-dash-move 3s linear infinite" }}
                />
                {[
                  { cx: 56, cy: 154, pulse: true, delay: "0s" },
                  { cx: 168, cy: 64, pulse: true, delay: "0.5s" },
                  { cx: 290, cy: 160, pulse: true, delay: "1s" },
                  { cx: 404, cy: 58, pulse: false, delay: "0s" },
                ].map((n, i) => (
                  <g key={`${n.cx}-${n.cy}`}>
                    <circle
                      cx={n.cx}
                      cy={n.cy}
                      r="18"
                      fill="rgba(95,203,158,0.10)"
                    />
                    {n.pulse && (
                      <circle
                        cx={n.cx}
                        cy={n.cy}
                        r="7"
                        fill="none"
                        stroke="#5FCB9E"
                        strokeWidth="2"
                        style={{
                          transformOrigin: `${n.cx}px ${n.cy}px`,
                          animation: `waypoint-node-ring-pulse 2.4s ease-out infinite ${n.delay}`,
                        }}
                      />
                    )}
                    <circle
                      cx={n.cx}
                      cy={n.cy}
                      r="7"
                      fill={i < 2 ? "#5FCB9E" : "#1B2320"}
                      stroke="#5FCB9E"
                      strokeWidth="2"
                    />
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
              {[
                {
                  x: 56,
                  y: 154,
                  label: "Fundamentals",
                  tone: "text-wp-ink-secondary font-semibold",
                },
                {
                  x: 168,
                  y: 64,
                  label: "HTTP & APIs",
                  tone: "text-wp-ink-secondary font-semibold",
                },
                {
                  x: 290,
                  y: 160,
                  label: "Databases",
                  tone: "text-wp-ink-primary font-bold",
                },
                {
                  x: 404,
                  y: 58,
                  label: "Auth & security",
                  tone: "text-wp-ink-tertiary font-semibold",
                },
              ].map((n) => (
                <div
                  key={n.label}
                  className={`absolute whitespace-nowrap text-[9.5px] ${n.tone}`}
                  style={{ left: n.x + 14, top: n.y - 6 }}
                >
                  {n.label}
                </div>
              ))}
            </div>

            <div className="rounded-[14px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
              <div
                className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-wp-ink-secondary opacity-0"
                style={{ animation: "waypoint-count-up 0.6s ease both" }}
              >
                Any skill, one roadmap
              </div>
              <div
                className="mt-1 font-heading text-[18px] font-extrabold tracking-tight text-white opacity-0"
                style={{ animation: "waypoint-count-up 0.6s ease both 0.1s" }}
              >
                Pick a goal. Get a plan.
              </div>
              <div
                className="mt-3 flex items-baseline gap-[6px] opacity-0"
                style={{ animation: "waypoint-count-up 0.6s ease both 0.2s" }}
              >
                <div className="font-mono text-[22px] font-bold text-[#5FBF9D]">
                  11
                </div>
                <div className="font-mono text-[12px] font-bold text-[#5FBF9D]">
                  phases
                </div>
              </div>
              <div
                className="mt-[2px] text-[10.5px] text-wp-ink-secondary opacity-0"
                style={{ animation: "waypoint-count-up 0.6s ease both 0.2s" }}
              >
                generated automatically
              </div>
              <div
                className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/10 opacity-0"
                style={{ animation: "waypoint-count-up 0.6s ease both 0.3s" }}
              >
                <div
                  className="h-full rounded-full bg-[#5FBF9D]"
                  style={{
                    animation:
                      "waypoint-bar-fill 1.8s cubic-bezier(0.16,1,0.3,1) forwards 0.4s",
                  }}
                />
              </div>
              <div
                className="mt-2 flex items-center gap-[6px] font-mono text-[10px] text-wp-ink-secondary opacity-0"
                style={{ animation: "waypoint-count-up 0.6s ease both 0.4s" }}
              >
                <span>Plus real projects &amp; a checklist</span>
                <span
                  className="inline-block h-[11px] w-[6px] bg-[#5FBF9D]"
                  style={{ animation: "waypoint-cursor 1s step-end infinite" }}
                />
              </div>
            </div>
          </div>

          <div className="relative max-w-[460px] text-[19px] font-heading font-extrabold leading-[1.25] tracking-tight text-white">
            Every skill, one roadmap away.
            <p className="mt-[6px] text-[12px] font-sans font-normal leading-[1.5] text-wp-ink-secondary">
              Describe what you want to learn — Waypoint turns it into phases,
              checklists, and real projects to build.
            </p>
          </div>
        </section>

        <main className="relative flex min-h-screen items-center justify-center px-4 py-20 lg:px-10">
          <Link
            href="/"
            className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-wp-card-border bg-wp-card/90 px-3 py-2 text-[13px] font-semibold text-wp-ink-secondary backdrop-blur hover:text-wp-ink-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Waypoint
          </Link>
          <div
            className="w-full max-w-[390px] opacity-0"
            style={{ animation: "waypoint-fade-up 0.4s ease forwards" }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
