"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  Headphones,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Video,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";

type ResourceType =
  | "Current Affairs"
  | "Free Classes"
  | "Previous Year Papers"
  | "Free Quizzes";

type Resource = {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  meta: string;
  action: string;
  href: string;
  icon: typeof BookOpen;
  eyebrow: string;
  featured?: boolean;
};

const RESOURCES: Resource[] = [
  {
    id: "daily-current-affairs",
    type: "Current Affairs",
    title: "Daily Current Affairs",
    description:
      "Stay updated with important national, international, business and exam-focused current affairs.",
    meta: "Updated daily",
    action: "Read Now",
    href: "/current-affairs",
    icon: CalendarDays,
    eyebrow: "DAILY UPDATE",
    featured: true,
  },
  {
    id: "free-live-classes",
    type: "Free Classes",
    title: "Free Live Classes",
    description:
      "Join selected live classes and learn from experienced JobWay educators without a paid course.",
    meta: "Live & recorded",
    action: "Join Class",
    href: "/free-classes",
    icon: Video,
    eyebrow: "LEARN FREE",
  },
  {
    id: "previous-year-papers",
    type: "Previous Year Papers",
    title: "Previous Year Papers",
    description:
      "Solve previous examination papers to understand question patterns, difficulty and important topics.",
    meta: "Multiple exams",
    action: "Solve Papers",
    href: "/previous-year-papers",
    icon: FileText,
    eyebrow: "PRACTICE",
  },
  {
    id: "free-quizzes",
    type: "Free Quizzes",
    title: "Daily Free Quizzes",
    description:
      "Test your preparation with short quizzes designed for consistent daily practice.",
    meta: "Quick practice",
    action: "Start Quiz",
    href: "/quizzes",
    icon: Target,
    eyebrow: "TEST YOURSELF",
  },
  {
    id: "audio-learning",
    type: "Current Affairs",
    title: "Current Affairs Audio",
    description:
      "Listen to concise current affairs updates when you are travelling, exercising or taking a break.",
    meta: "Audio learning",
    action: "Listen Now",
    href: "/current-affairs/audio",
    icon: Headphones,
    eyebrow: "LISTEN & LEARN",
  },
  {
    id: "exam-practice",
    type: "Free Quizzes",
    title: "Exam Practice Zone",
    description:
      "Take focused practice sessions covering the most important topics from competitive examinations.",
    meta: "Topic-wise",
    action: "Practice Now",
    href: "/practice",
    icon: Trophy,
    eyebrow: "EXAM PRACTICE",
  },
];

const RESOURCE_TYPES: ResourceType[] = [
  "Current Affairs",
  "Free Classes",
  "Previous Year Papers",
  "Free Quizzes",
];

function ResourceArtwork({ resource }: { resource: Resource }) {
  const Icon = resource.icon;

  return (
    <div
      className={`relative h-[170px] overflow-hidden sm:h-[180px] ${
        resource.featured ? "bg-[#E13032]" : "bg-[#171717]"
      }`}
    >
      {/* Decorative circles */}
      <div
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[26px] border-white/10"
        aria-hidden="true"
      />

      <div
        className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full border-[28px] border-white/5"
        aria-hidden="true"
      />

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Soft center glow */}
      <div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/15">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      </div>

      {/* Eyebrow */}
      <div className="absolute left-4 top-4">
        <span className="rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          {resource.eyebrow}
        </span>
      </div>

      {/* Bottom meta / play */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        <span className="text-xs font-bold text-white/80">
          {resource.meta}
        </span>

        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#E13032] shadow-md transition-transform duration-300 group-hover:scale-110">
          <PlayCircle className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-[0_16px_38px_rgba(15,23,42,0.10)]">
      <ResourceArtwork resource={resource} />

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#E13032]">
          {resource.type}
        </span>

        <h3 className="mt-2 line-clamp-2 text-base font-black leading-6 tracking-tight text-slate-950 transition-colors duration-200 group-hover:text-[#E13032]">
          {resource.title}
        </h3>

        <p className="mt-2 flex-1 text-xs leading-5 text-slate-500">
          {resource.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {resource.meta}
          </span>

          <Link
            href={resource.href}
            className="inline-flex items-center gap-1 text-xs font-black text-[#E13032] transition-all duration-200 hover:gap-1.5 hover:text-[#B91C1C] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
            aria-label={`${resource.action}: ${resource.title}`}
          >
            {resource.action}

            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeaturedResource({ resource }: { resource: Resource }) {
  const Icon = resource.icon;

  return (
    <article className="relative overflow-hidden rounded-[24px] bg-[#171717] shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
      {/* Background glow */}
      <div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-600/20 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-red-500/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
        aria-hidden="true"
      />

      <div className="relative grid lg:grid-cols-[1.08fr_0.92fr]">
        {/* Left content */}
        <div className="px-6 py-8 sm:px-9 sm:py-10 lg:px-11 lg:py-11">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-red-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Free every day
          </div>

          <h3 className="mt-5 max-w-xl text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-[38px] lg:leading-[1.15]">
            Your daily dose of
            <span className="block text-red-400">
              exam preparation.
            </span>
          </h3>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Read, watch, listen and practice every day with free learning
            resources from JobWay.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/current-affairs"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 text-xs font-black text-white shadow-lg shadow-red-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              Explore free resources

              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href="/quizzes"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-xs font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              Take a free quiz
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              No subscription required
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Updated regularly
            </span>
          </div>
        </div>

        {/* Right visual */}
        <div className="relative min-h-[280px] border-t border-white/10 lg:border-l lg:border-t-0">
          <div className="absolute inset-0 flex items-center justify-center p-7 sm:p-8">
            <div className="relative w-full max-w-[330px]">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-3.5 shadow-2xl backdrop-blur-sm sm:p-4">
                <div className="rounded-[16px] bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#E13032]">
                        JobWay
                      </p>

                      <p className="mt-1 truncate text-base font-black text-slate-950">
                        {resource.title}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      "Important exam updates",
                      "Daily practice questions",
                      "Quick revision resources",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-black text-[#E13032] shadow-sm">
                          {index + 1}
                        </span>

                        <span className="text-xs font-bold text-slate-600">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-xl bg-green-50 px-3 py-2.5">
                    <span className="text-[10px] font-black text-green-700">
                      No payment required
                    </span>

                    <span className="rounded-full bg-green-100 px-2 py-1 text-[9px] font-black text-green-700">
                      FREE
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -right-4 -top-5 hidden rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-xl sm:block">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                    <BookOpen
                      className="h-4 w-4 text-[#E13032]"
                      aria-hidden="true"
                    />
                  </span>

                  <span className="text-[10px] font-black text-slate-700">
                    Learn daily
                  </span>
                </div>
              </div>

              {/* Floating play button */}
              <div className="absolute -bottom-4 -left-4 hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-[#E13032] text-white shadow-xl sm:flex">
                <PlayCircle className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function FreeResources() {
  const [activeType, setActiveType] =
    useState<ResourceType>("Current Affairs");

  const filteredResources = RESOURCES.filter(
    (resource) => resource.type === activeType,
  );

  const featuredResource =
    RESOURCES.find((resource) => resource.featured) ?? RESOURCES[0];

  return (
    <section
      aria-labelledby="free-resources-heading"
      className="relative overflow-hidden bg-[#f8f9fb] py-14 sm:py-16 lg:py-[72px]"
    >
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute -left-40 top-24 h-80 w-80 rounded-full bg-red-50/60 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-orange-50/50 blur-3xl"
        aria-hidden="true"
      />

      <Container size="wide">
        <SectionHeading
          eyebrow="FREE LEARNING"
          title="Learn something useful every day"
          description="Access free current affairs, live classes, previous year papers and practice resources to keep your preparation moving forward."
          action={
            <Link
              href="/free-resources"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#E13032] transition hover:text-[#B91C1C]"
            >
              View all resources
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        {/* Featured resource */}
        <div className="mt-8">
          <FeaturedResource resource={featuredResource} />
        </div>

        {/* Resource categories */}
        <div className="mt-9">
          <div className="mb-6 overflow-x-auto pb-1 scrollbar-none">
            <div
              role="tablist"
              aria-label="Free resource categories"
              className="flex min-w-max gap-2"
            >
              {RESOURCE_TYPES.map((type) => {
                const isActive = type === activeType;

                return (
                  <button
                    key={type}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveType(type)}
                    className={`rounded-full border px-4 py-2.5 text-xs font-extrabold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2 ${
                      isActive
                        ? "border-[#E13032] bg-[#E13032] text-white shadow-[0_7px_18px_rgba(225,48,50,0.18)]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-[#E13032]"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resource cards */}
          <div
            key={activeType}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.04)] sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-900">
                Preparation doesn't stop after class.
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Keep learning and practicing with JobWay's free resources.
              </p>
            </div>
          </div>

          <Link
            href="/free-resources"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 text-xs font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2d2d2d] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
          >
            Explore free resources

            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}