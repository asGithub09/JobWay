"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Code2,
  Database,
  Gauge,
  Layers3,
  ListChecks,
  Plus,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

const modules = [
  {
    title: "Skills",
    description:
      "Organize the technology and career skills available inside Skill Arena.",
    href: "/admin/skill-arena/skills",
    icon: Layers3,
    label: "Manage categories",
  },
  {
    title: "Question Bank",
    description:
      "Build and curate MCQ, coding and SQL questions for challenges.",
    href: "/admin/skill-arena/questions",
    icon: ListChecks,
    label: "Manage questions",
  },
  {
    title: "Challenges",
    description:
      "Create challenge experiences, select questions and prepare them for publishing.",
    href: "/admin/skill-arena/challenges",
    icon: Swords,
    label: "Manage challenges",
  },
];

const capabilityItems = [
  {
    icon: Code2,
    title: "Coding",
    text: "Programming challenges with execution-ready architecture.",
  },
  {
    icon: Database,
    title: "SQL",
    text: "Database-focused questions for practical skill assessment.",
  },
  {
    icon: BrainCircuit,
    title: "Intelligent Assessment",
    text: "Designed for future AI-assisted review and personalized feedback.",
  },
];

export default function SkillArenaAdminPage() {
  return (
    <main className="min-h-full bg-slate-50/60">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 -top-32 h-72 w-72 rounded-full bg-violet-200/35 blur-3xl" />
            <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
            <div className="absolute bottom-[-150px] left-[35%] h-72 w-72 rounded-full bg-fuchsia-200/20 blur-3xl" />
          </div>

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Skill Arena
              </div>

              <h1 className="text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
                Turn skills into
                <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
                  measurable ability.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Create structured skill challenges for JobWay learners.
                Manage categories, curate questions and publish polished
                assessment experiences from one focused workspace.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/admin/skill-arena/challenges"
                  className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Open Challenge Studio
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/admin/skill-arena/questions"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                >
                  <ListChecks className="h-4 w-4" />
                  Question Bank
                </Link>
              </div>
            </div>

            {/* HERO ICON */}
            <div className="hidden items-center justify-center lg:flex">
              <div className="relative grid h-44 w-44 place-items-center">
                <div className="absolute inset-4 rounded-[38px] border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-indigo-50 shadow-[0_20px_50px_rgba(99,102,241,0.13)]" />
                <div className="absolute inset-8 rounded-[28px] border border-white bg-white/80 shadow-inner" />
                <Swords className="relative h-16 w-16 text-violet-600" strokeWidth={1.7} />
                <div className="absolute right-2 top-5 rounded-full border border-amber-200 bg-amber-50 p-2 text-amber-600 shadow-sm">
                  <Trophy className="h-4 w-4" />
                </div>
                <div className="absolute bottom-4 left-3 rounded-full border border-sky-200 bg-sky-50 p-2 text-sky-600 shadow-sm">
                  <Gauge className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK MODULES */}
        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Workspace
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                Skill Arena Studio
              </h2>
            </div>

            <span className="hidden text-xs font-medium text-slate-400 sm:block">
              Build → Curate → Publish
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_45px_rgba(99,102,241,0.10)]"
                >
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-violet-100/40 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white shadow-md shadow-slate-200 transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-500" />
                    </div>

                    <h3 className="mt-5 text-base font-black text-slate-900">
                      {module.title}
                    </h3>

                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                      {module.description}
                    </p>

                    <div className="mt-5 text-xs font-black text-violet-600">
                      {module.label}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Built for practical assessment
            </span>
            <h2 className="text-lg font-black tracking-tight text-slate-950">
              One arena. Multiple skill formats.
            </h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {capabilityItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <Icon className="h-5 w-5 text-violet-600" />

                  <h3 className="mt-3 text-sm font-black text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* STATUS STRIP */}
        <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-black text-slate-800">
                Content architecture ready
              </p>
              <p className="text-[11px] text-slate-400">
                Categories, questions and challenges are backed by dedicated
                Skill Arena models.
              </p>
            </div>
          </div>

          <Link
            href="/admin/skill-arena/challenges"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Create challenge
          </Link>
        </section>
      </div>
    </main>
  );
}
