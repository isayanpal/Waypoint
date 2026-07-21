"use client";

import { useState } from "react";
import { ArrowRight, Layers3, Map, Target } from "lucide-react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Map,
    title: "AI-generated roadmaps",
    body: "Describe any skill and your goal. Get a realistic, phase-by-phase plan instead of a vague list of resources.",
  },
  {
    icon: Target,
    title: "Real portfolio projects",
    body: "Every roadmap comes with concrete projects to build, each mapped to the phases it proves you've learned.",
  },
  {
    icon: Layers3,
    title: "Track every skill, in one place",
    body: "Backend today, frontend next month. Every skill project lives in its own dashboard with its own progress.",
  },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-wp-accent">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
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
          <rect x="18" y="2" width="4" height="20" rx="1" fill="white" />
        </svg>
      </div>
      <span className="font-heading text-[18px] font-extrabold tracking-tight">
        Waypoint
      </span>
    </div>
  );
}

function Orbit({
  size,
  label,
  duration,
  reverse,
}: {
  size: number;
  label: string;
  duration: number;
  reverse?: boolean;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2 rounded-full border border-[#5FCB9E]/25"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-0 w-0"
        style={{
          animation: `${reverse ? "waypoint-orbit-reverse" : "waypoint-orbit"} ${duration}s linear infinite`,
        }}
      >
        <div style={{ transform: `translateX(${size / 2}px)` }}>
          <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-[#5FCB9E] shadow-[0_0_18px_rgba(95,203,158,0.85)]" />
          <div
            className="absolute left-4 top-[-11px] rounded-full bg-wp-main px-2 py-[2px] text-[11px] font-semibold text-wp-ink-secondary"
            style={{
              animation: `${reverse ? "waypoint-counter-reverse" : "waypoint-counter"} ${duration}s linear infinite`,
            }}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function AtomVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[430px]">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(95,203,158,0.14),transparent_60%)]" />
      <Orbit size={160} label="Frontend" duration={7} />
      <Orbit size={270} label="Backend" duration={11} reverse />
      <Orbit size={380} label="Fullstack" duration={16} />
      <div className="absolute left-1/2 top-1/2 flex h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#5FCB9E]/35 bg-wp-card shadow-[0_0_38px_rgba(95,203,158,0.14)]">
        <div className="rounded-full border border-[#5FCB9E]/50 px-4 py-2 font-heading text-[14px] font-extrabold text-[#5FCB9E]">
          Skill
        </div>
      </div>
    </div>
  );
}

function ProductPreview() {
  const topics = [
    "API design",
    "Auth flows",
    "Database modeling",
    "Background jobs",
  ];
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-[1040px] px-4"
    >
      <div className="overflow-hidden rounded-[18px] border border-wp-card-border bg-[#0F1211] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-wp-card-border px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-wp-card-border" />
          <div className="h-2.5 w-2.5 rounded-full bg-wp-card-border" />
          <div className="h-2.5 w-2.5 rounded-full bg-wp-card-border" />
          <div className="ml-3 h-6 flex-1 rounded-full bg-white/[0.04]" />
        </div>
        <div className="grid gap-4 bg-wp-main p-5 md:grid-cols-[1.3fr_1fr]">
          <div className="relative overflow-hidden rounded-[12px] border border-wp-card-border bg-wp-card p-5">
            <div className="absolute right-3 top-[-16px] font-heading text-[104px] font-extrabold leading-none text-white/[0.05]">
              03
            </div>
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate font-heading text-[15px] font-bold">
                  Systems & APIs
                </h3>
                <span className="rounded-full bg-[rgba(224,174,90,0.16)] px-3 py-1 text-[11px] font-bold text-[#E0AE5A]">
                  In progress
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[42%] rounded-full bg-[#E0AE5A]" />
              </div>
              <div className="mt-4 grid gap-2">
                {topics.map((topic, i) => (
                  <div
                    key={topic}
                    className="flex items-center gap-2 text-[13px] text-wp-ink-secondary"
                  >
                    <span
                      className={`h-3.5 w-3.5 rounded-[4px] border ${i === 0 ? "border-wp-accent bg-wp-accent" : "border-white/25"}`}
                    />
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Progress", "42%"],
                ["Topics left", "19"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[12px] border border-wp-card-border bg-wp-card p-4"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-wp-ink-secondary">
                    {label}
                  </div>
                  <div className="mt-1 font-mono text-[24px] font-bold text-wp-ink-primary">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[12px] border border-wp-card-border bg-wp-card p-4">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.05em] text-wp-ink-secondary">
                Portfolio projects
              </div>
              {[
                "API observability dashboard",
                "Auth starter kit",
                "Capstone service",
              ].map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between border-b border-white/[0.06] py-2 last:border-0"
                >
                  <span className="truncate text-[13px] font-semibold">
                    {name}
                  </span>
                  <span className="ml-3 rounded-full bg-white/[0.07] px-2 py-1 text-[10px] font-bold text-wp-ink-secondary">
                    Build
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 12));

  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 40]);
  const orb1Y = useTransform(scrollY, [0, 1000], [0, 80]);
  const orb2Y = useTransform(scrollY, [0, 1000], [0, -50]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-wp-main text-wp-ink-primary">
      <motion.div
        aria-hidden
        style={{ y: orb1Y }}
        className="pointer-events-none absolute -left-[160px] -top-[220px] h-[560px] w-[560px]"
      >
        <div
          className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(63,163,127,0.22)_0%,transparent_70%)]"
          style={{ animation: "waypoint-float-orb 16s ease-in-out infinite" }}
        />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ y: orb2Y }}
        className="pointer-events-none absolute -right-[180px] top-[120px] h-[480px] w-[480px]"
      >
        <div
          className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(63,163,127,0.14)_0%,transparent_70%)]"
          style={{ animation: "waypoint-float-orb 20s ease-in-out infinite reverse" }}
        />
      </motion.div>

      <nav
        className={cn(
          "sticky top-0 z-30 border-b transition-colors duration-300",
          scrolled ? "border-white/[0.06] bg-wp-main/86 backdrop-blur" : "border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-4">
          <Logo />
          <Link
            href="/sign-in"
            className="rounded-[8px] border border-wp-card-border bg-wp-card px-4 py-2 text-[13px] font-semibold text-wp-ink-primary hover:bg-[#202A25]"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <motion.section
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-[1120px] items-center gap-10 px-4 py-14 md:grid-cols-[0.95fr_1.05fr]"
      >
        <AtomVisual />
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-[7px] rounded-full border border-[#5FCB9E]/25 bg-[rgba(95,203,158,0.10)] px-3 py-1 text-[11.5px] font-bold text-[#5FCB9E]">
            <span
              className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#5FCB9E]"
              style={{ animation: "waypoint-soft-pulse 2s ease-in-out infinite" }}
            />
            Personal learning roadmap platform
          </div>
          <h1 className="max-w-[640px] font-heading text-[50px] font-extrabold leading-[1.08] tracking-tight">
            Learn anything. Actually finish it.
          </h1>
          <p className="mt-5 max-w-[540px] text-[15.5px] leading-7 text-wp-ink-secondary">
            Turn a skill goal into a phase-by-phase roadmap, project brief, and
            topic checklist you can keep moving through.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center gap-2 rounded-[11px] bg-wp-accent px-[30px] py-[14px] text-[14.5px] font-bold text-white shadow-[0_0_30px_rgba(63,163,127,0.28)] transition-transform duration-200 hover:-translate-y-[2px] hover:bg-[#4BAF8B]"
          >
            Start your first roadmap
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.section>

      <ProductPreview />

      <section className="mx-auto grid max-w-[1120px] gap-4 px-4 py-20 md:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
            className="rounded-[12px] border border-wp-card-border bg-wp-card p-5"
          >
            <feature.icon className="h-5 w-5 text-[#5FCB9E]" />
            <h2 className="mt-5 font-heading text-[15.5px] font-bold">
              {feature.title}
            </h2>
            <p className="mt-3 text-[13px] leading-6 text-wp-ink-secondary">
              {feature.body}
            </p>
          </motion.div>
        ))}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-[1120px] px-4 pb-16"
      >
        <div className="relative overflow-hidden rounded-[18px] border border-wp-card-border bg-[#102019] px-6 py-10 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(95,203,158,0.25),transparent_45%)]" />
          <div className="relative mx-auto max-w-[620px]">
            <h2 className="font-heading text-[30px] font-extrabold tracking-tight">
              Build proof while you learn.
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-wp-ink-secondary">
              One roadmap per skill. Phases, topics, and portfolio work stay
              connected.
            </p>
            <Link
              href="/sign-up"
              className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-wp-accent px-[28px] py-[13px] text-[14.5px] font-bold text-white transition-transform duration-200 hover:-translate-y-[2px] hover:bg-[#4BAF8B]"
            >
              Start your first roadmap
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      <footer className="border-t border-white/[0.06] px-4 py-8">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 text-[12px] text-wp-ink-tertiary">
          <Logo />
          <span>Personal learning roadmaps.</span>
        </div>
      </footer>
    </main>
  );
}
