"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Crown,
  FileQuestion,
  GraduationCap,
  Layers3,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  Video,
  Zap,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";

import {
  getPublishedExams,
  getPublishedTestSeries,
  type Exam,
  type TestSeries,
} from "@/lib/api";

type SeriesWithExam = {
  series: TestSeries;
  exam: Exam;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default function TestSeriesHubPage() {
  const [items, setItems] = useState<SeriesWithExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let active = true;

    async function loadTestSeries() {
      try {
        setLoading(true);
        setError("");

        const examsResponse = await getPublishedExams();

        if (!active) return;

        if (!examsResponse.success) {
          throw new Error("Unable to load published examinations.");
        }

        const exams = examsResponse.exams || [];

        const results = await Promise.all(
          exams.map(async (exam) => {
            try {
              const response = await getPublishedTestSeries(exam.id);

              if (!response.success) {
                return [];
              }

              return (response.testSeries || []).map((series) => ({
                series,
                exam,
              }));
            } catch (seriesError) {
              console.error(
                `Failed to load test series for ${exam.name}:`,
                seriesError,
              );

              return [];
            }
          }),
        );

        if (!active) return;

        setItems(results.flat());
      } catch (err) {
        console.error("Load test series hub error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load test series.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTestSeries();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const values = items
      .map((item) => item.exam.category)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values))];
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter(({ series, exam }) => {
      const matchesCategory =
        selectedCategory === "All" ||
        exam.category === selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        series.title.toLowerCase().includes(query) ||
        series.description?.toLowerCase().includes(query) ||
        exam.name.toLowerCase().includes(query) ||
        exam.shortName?.toLowerCase().includes(query) ||
        exam.category.toLowerCase().includes(query)
      );
    });
  }, [items, search, selectedCategory]);

  const stats = useMemo(() => {
    const premium = items.filter(
      ({ series }) => series.accessType === "PREMIUM",
    ).length;

    const free = items.length - premium;

    const exams = new Set(items.map(({ exam }) => exam.id)).size;

    return {
      total: items.length,
      premium,
      free,
      exams,
    };
  }, [items]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader variant="test-series" />

      <main>
        {/* =========================================================
            HERO
        ========================================================== */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1fr_390px] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  JobWay Test Series
                </div>

                <h1 className="mt-7 max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl xl:text-7xl">
                  Practice smarter.
                  <span className="block text-white/55">
                    Perform better.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                  Prepare for your target examination with structured test
                  series, realistic mock tests, expert guidance and
                  performance-focused practice.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#series"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
                  >
                    <Target className="h-4 w-4" />
                    Explore Test Series
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <Link
                    href="/exams"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Browse Exams
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/50">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Free practice available
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Expert-led preparation
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Detailed performance analysis
                  </span>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Trophy className="h-5 w-5 text-amber-300" />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                      JobWay Practice Hub
                    </p>

                    <p className="mt-1 text-lg font-black">
                      Choose your target.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-2xl font-black">
                      {loading ? "—" : formatNumber(stats.total)}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      Published Series
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-2xl font-black">
                      {loading ? "—" : formatNumber(stats.exams)}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      Exams
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-2xl font-black text-emerald-300">
                      {loading ? "—" : formatNumber(stats.free)}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      Free Series
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-2xl font-black text-amber-300">
                      {loading ? "—" : formatNumber(stats.premium)}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      Premium Series
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PRE-TEST PREPARATION
        ========================================================== */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">
                More than just a test
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Prepare before you press{" "}
                <span className="text-violet-600">Start Test</span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                A strong attempt starts before the timer begins. Use JobWay
                to revise concepts, understand difficult topics and learn
                exam-solving strategies before testing yourself.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Video,
                  title: "Expert Guidance",
                  text: "Learn concepts and exam strategies from experienced educators.",
                },
                {
                  icon: Users,
                  title: "Live Problem Solving",
                  text: "Get help with difficult questions and understand the right approach.",
                },
                {
                  icon: BookOpen,
                  title: "Concept Revision",
                  text: "Strengthen important topics before attempting a full test.",
                },
                {
                  icon: Target,
                  title: "Exam Strategy",
                  text: "Build better question selection, time management and accuracy.",
                },
              ].map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 font-black text-slate-950">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {feature.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            FREE VS PREMIUM
        ========================================================== */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">
                Choose your preparation level
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Free practice or complete preparation?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Start with FREE tests or unlock the deeper preparation
                experience available through JobWay Premium batches.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                      FREE
                    </p>

                    <h3 className="mt-1 text-2xl font-black text-slate-950">
                      Start practicing
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Great for getting familiar with the exam pattern and
                  building a regular practice habit.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    "Selected free mock tests",
                    "Exam-style practice",
                    "Attempt-based performance data",
                    "Start building your preparation habit",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 text-sm font-semibold text-slate-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-amber-200 bg-slate-950 p-7 text-white shadow-xl">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                        PREMIUM
                      </p>

                      <h3 className="mt-1 text-2xl font-black">
                        Prepare seriously
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
                      <Crown className="h-6 w-6" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-white/55">
                    Designed for focused aspirants who want structured,
                    comprehensive test preparation through their assigned
                    JobWay batch.
                  </p>

                  <div className="mt-6 space-y-3">
                    {[
                      "Premium test series and mock tests",
                      "Structured exam-focused practice",
                      "Detailed explanations and analysis",
                      "Expert and educator-led support",
                      "Batch-based premium access",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 text-sm font-semibold text-white/80"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SEARCH / FILTER
        ========================================================== */}
        <section
          id="series"
          className="scroll-mt-24 bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">
                  Published on JobWay
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Find your test series
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Test series published by the JobWay Admin Panel appear here
                  automatically.
                </p>
              </div>

              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search SSC, Banking, UPSC..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>

            {categories.length > 1 && (
              <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => {
                  const active = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                        active
                          ? "bg-slate-950 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* =======================================================
              SERIES GRID
          ======================================================== */}
          <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
            {loading ? (
              <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Loader2 className="h-7 w-7 animate-spin" />
                </div>

                <h2 className="mt-5 text-xl font-black text-slate-950">
                  Preparing your test series
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Loading the latest published test series from JobWay.
                </p>
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-14 text-center">
                <h2 className="text-xl font-black text-rose-900">
                  Unable to load test series
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-rose-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-6 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                  <BookOpen className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-xl font-black text-slate-950">
                  No test series found
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Try another search or explore the published examinations
                  available on JobWay.
                </p>

                <Link
                  href="/exams"
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Explore Exams
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Available for practice
                    </p>

                    <h3 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                      Choose your preparation
                    </h3>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                    {filteredItems.length}{" "}
                    {filteredItems.length === 1 ? "series" : "series"}
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredItems.map(({ series, exam }) => {
                    const isPremium =
                      series.accessType === "PREMIUM";

                    return (
                      <Link
                        key={series.id}
                        href={`/test-series/${encodeURIComponent(
                          series.slug,
                        )}`}
                        className="group flex min-h-[360px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-2xl"
                      >
                        <div className="relative overflow-hidden bg-slate-950 px-6 pb-7 pt-6 text-white">
                          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl transition group-hover:bg-violet-500/30" />

                          <div className="relative">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                <GraduationCap className="h-6 w-6 text-violet-200" />
                              </div>

                              {isPremium ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-amber-300">
                                  <Crown className="h-3 w-3" />
                                  Premium
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-300">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Free
                                </span>
                              )}
                            </div>

                            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                              {exam.name}
                            </p>

                            <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight">
                              {series.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                            {series.description ||
                              "Practice with structured mock tests designed to improve speed, accuracy and exam confidence."}
                          </p>

                          <div className="mt-6 grid grid-cols-3 gap-2">
                            <div className="rounded-2xl bg-slate-50 p-3">
                              <Layers3 className="h-4 w-4 text-violet-500" />

                              <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                Series
                              </p>

                              <p className="mt-0.5 text-xs font-black text-slate-900">
                                Practice
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-3">
                              <FileQuestion className="h-4 w-4 text-blue-500" />

                              <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                Tests
                              </p>

                              <p className="mt-0.5 text-xs font-black text-slate-900">
                                Mock Tests
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-3">
                              <Clock3 className="h-4 w-4 text-emerald-500" />

                              <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                Mode
                              </p>

                              <p className="mt-0.5 text-xs font-black text-slate-900">
                                Exam Style
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                            <span className="inline-flex items-center gap-2 text-sm font-black text-violet-600">
                              View Test Series
                              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </span>

                            <ShieldCheck className="h-4 w-4 text-slate-300 transition group-hover:text-violet-500" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
            PRACTICE CYCLE
        ========================================================== */}
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-300">
                The JobWay preparation cycle
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Learn → Practice → Test → Analyse → Improve
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/55 sm:text-base">
                Don't treat every mock test as just another score. Use every
                attempt to identify what you know, what you miss and where
                your preparation needs work.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-5">
              {[
                {
                  number: "01",
                  title: "Learn",
                  text: "Build concepts.",
                },
                {
                  number: "02",
                  title: "Practice",
                  text: "Solve questions.",
                },
                {
                  number: "03",
                  title: "Test",
                  text: "Attempt realistically.",
                },
                {
                  number: "04",
                  title: "Analyse",
                  text: "Understand mistakes.",
                },
                {
                  number: "05",
                  title: "Improve",
                  text: "Return stronger.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="rounded-3xl border border-white/10 bg-white/[0.05] p-5"
                >
                  <span className="text-xs font-black text-violet-300">
                    {step.number}
                  </span>

                  <h3 className="mt-5 text-lg font-black">
                    {step.title}
                  </h3>

                  <p className="mt-1 text-sm text-white/45">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            WHY JOBWAY
        ========================================================== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">
                Built for serious preparation
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Turn practice into measurable progress
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: BarChart3,
                  title: "Performance Analytics",
                  text: "Use your attempts to understand performance and identify improvement areas.",
                },
                {
                  icon: Zap,
                  title: "Speed & Accuracy",
                  text: "Practice making better decisions under real exam-style time pressure.",
                },
                {
                  icon: FileQuestion,
                  title: "Detailed Solutions",
                  text: "Review questions and understand the reasoning behind your answers.",
                },
                {
                  icon: ShieldCheck,
                  title: "Structured Access",
                  text: "Premium preparation can be provided through your assigned JobWay batch.",
                },
              ].map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 font-black text-slate-950">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {feature.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================== */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
            <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-6 py-12 text-center text-white shadow-2xl sm:px-10 sm:py-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <GraduationCap className="h-7 w-7 text-violet-200" />
              </div>

              <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                Your next score starts with your next practice session.
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                Choose your examination, explore the available test series
                and start preparing with JobWay.
              </p>

              <a
                href="#series"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Explore Test Series
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}