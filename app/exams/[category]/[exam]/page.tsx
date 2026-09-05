"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  FileText,
  GraduationCap,
  Loader2,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import {
  getPublishedExam,
  getPublishedMockTests,
  getPublishedTestSeries,
  type Exam,
  type MockTest,
  type TestSeries,
} from "@/lib/api";

type PageProps = {
  params: Promise<{
    category: string;
    exam: string;
  }>;
};

export default function ExamDetailsPage({ params }: PageProps) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [mockTests, setMockTests] = useState<Record<string, MockTest[]>>(
    {},
  );

  const [loading, setLoading] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadExam = async () => {
      try {
        setLoading(true);
        setError("");

        const resolvedParams = await params;

        const examResponse = await getPublishedExam(
          resolvedParams.exam,
        );

        if (!active) return;

        if (!examResponse.success || !examResponse.exam) {
          setError("This examination could not be found.");
          return;
        }

        const currentExam = examResponse.exam;

        setExam(currentExam);

        const seriesResponse = await getPublishedTestSeries(
          currentExam.id,
        );

        if (!active) return;

        if (seriesResponse.success) {
          setTestSeries(seriesResponse.testSeries || []);
        }
      } catch (err) {
        console.error("Load exam details error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this examination.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadExam();

    return () => {
      active = false;
    };
  }, [params]);

  useEffect(() => {
    if (testSeries.length === 0) {
      return;
    }

    let active = true;

    const loadMockTests = async () => {
      try {
        setLoadingTests(true);

        const responses = await Promise.all(
          testSeries.map(async (series) => {
            try {
              const response = await getPublishedMockTests(
                series.id,
              );

              return {
                seriesId: series.id,
                mockTests: response.success
                  ? response.mockTests || []
                  : [],
              };
            } catch (error) {
              console.error(
                `Load mock tests error for ${series.title}:`,
                error,
              );

              return {
                seriesId: series.id,
                mockTests: [],
              };
            }
          }),
        );

        if (!active) return;

        const mapped: Record<string, MockTest[]> = {};

        responses.forEach((item) => {
          mapped[item.seriesId] = item.mockTests;
        });

        setMockTests(mapped);
      } finally {
        if (active) {
          setLoadingTests(false);
        }
      }
    };

    loadMockTests();

    return () => {
      active = false;
    };
  }, [testSeries]);

  const totalMockTests = useMemo(() => {
    return Object.values(mockTests).reduce(
      (total, tests) => total + tests.length,
      0,
    );
  }, [mockTests]);

  const totalQuestions = useMemo(() => {
    return Object.values(mockTests).reduce(
      (total, tests) =>
        total +
        tests.reduce(
          (questionTotal, test) =>
            questionTotal + (test.totalQuestions || 0),
          0,
        ),
      0,
    );
  }, [mockTests]);

  const freeSeriesCount = useMemo(() => {
    return testSeries.filter(
      (series) => series.accessType === "FREE",
    ).length;
  }, [testSeries]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>

              <h1 className="mt-5 text-2xl font-black text-slate-950">
                Loading examination
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Preparing your examination dashboard...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !exam) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[32px] border border-rose-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <GraduationCap className="h-7 w-7" />
            </div>

            <h1 className="mt-6 text-2xl font-black text-slate-950">
              Examination not available
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              {error ||
                "The requested examination could not be loaded."}
            </p>

            <Link
              href="/exams"
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Exams
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* BREADCRUMB */}
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
          <Link
            href="/exams"
            className="transition hover:text-violet-600"
          >
            Exams
          </Link>

          <span>/</span>

          <span>{exam.category}</span>

          <span>/</span>

          <span className="text-slate-900">
            {exam.name}
          </span>
        </div>

        {/* HERO */}
        <section className="relative mt-6 overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-10 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <div className="absolute right-16 top-16 hidden h-24 w-24 rounded-full border border-white/10 lg:block" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/80 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                {exam.category}
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                {exam.name}
              </h1>

              {exam.shortName ? (
                <p className="mt-3 text-base font-bold text-violet-200 sm:text-lg">
                  {exam.shortName}
                </p>
              ) : null}

              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
                {exam.description ||
                  `Prepare for ${exam.name} with structured learning, test series, mock tests and focused practice on JobWay.`}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#test-series"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Start Preparation
                  <ArrowRight className="h-4 w-4" />
                </a>

                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
                >
                  Explore Courses
                </Link>
              </div>
            </div>

            {/* HERO STATS */}
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                Your preparation hub
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <BookOpen className="h-5 w-5 text-violet-200" />

                  <p className="mt-4 text-2xl font-black">
                    {testSeries.length}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-white/50">
                    Test Series
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <FileQuestion className="h-5 w-5 text-cyan-200" />

                  <p className="mt-4 text-2xl font-black">
                    {loadingTests ? "—" : totalMockTests}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-white/50">
                    Mock Tests
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <Target className="h-5 w-5 text-emerald-200" />

                  <p className="mt-4 text-2xl font-black">
                    {loadingTests ? "—" : totalQuestions}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-white/50">
                    Questions
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <Trophy className="h-5 w-5 text-amber-200" />

                  <p className="mt-4 text-2xl font-black">
                    {freeSeriesCount}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-white/50">
                    Free Series
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK BENEFITS */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BookOpen className="h-5 w-5" />
            </div>

            <h2 className="mt-4 font-black text-slate-950">
              Structured Learning
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Follow a focused preparation path.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>

            <h2 className="mt-4 font-black text-slate-950">
              Practice Questions
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Practice questions through mock tests.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Clock3 className="h-5 w-5" />
            </div>

            <h2 className="mt-4 font-black text-slate-950">
              Real Test Practice
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Practice under exam-style time limits.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BarChart3 className="h-5 w-5" />
            </div>

            <h2 className="mt-4 font-black text-slate-950">
              Performance
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Measure your preparation through tests.
            </p>
          </div>
        </section>

        {/* TEST SERIES */}
        <section
          id="test-series"
          className="mt-10 scroll-mt-24"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                <BookOpen className="h-3.5 w-3.5" />
                Practice Library
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Test Series
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Choose a test series and start practicing for{" "}
                {exam.name}.
              </p>
            </div>

            <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
              {testSeries.length}{" "}
              {testSeries.length === 1
                ? "series"
                : "series"}{" "}
              available
            </div>
          </div>

          {testSeries.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <BookOpen className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-950">
                Test series coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Test series published by the JobWay admin will
                automatically appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {testSeries.map((series) => {
                const seriesMocks = mockTests[series.id] || [];

                const seriesQuestionCount = seriesMocks.reduce(
                  (sum, test) =>
                    sum + (test.totalQuestions || 0),
                  0,
                );

                return (
                  <article
                    key={series.id}
                    className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
                  >
                    <div className="p-6 sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                          <BookOpen className="h-6 w-6" />
                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] ${
                            series.accessType === "FREE"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {series.accessType === "FREE"
                            ? "Free"
                            : "Premium"}
                        </span>
                      </div>

                      <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
                        {series.title}
                      </h3>

                      <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500">
                        {series.description ||
                          `Practice ${exam.name} with this structured test series.`}
                      </p>

                      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <FileQuestion className="h-4 w-4 text-violet-600" />

                          <p className="mt-3 text-lg font-black text-slate-950">
                            {loadingTests
                              ? "—"
                              : seriesMocks.length}
                          </p>

                          <p className="text-[11px] font-bold text-slate-400">
                            Mock Tests
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <Target className="h-4 w-4 text-indigo-600" />

                          <p className="mt-3 text-lg font-black text-slate-950">
                            {loadingTests
                              ? "—"
                              : seriesQuestionCount}
                          </p>

                          <p className="text-[11px] font-bold text-slate-400">
                            Questions
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <Clock3 className="h-4 w-4 text-cyan-600" />

                          <p className="mt-3 text-lg font-black text-slate-950">
                            {seriesMocks[0]
                              ?.durationMinutes || "—"}
                          </p>

                          <p className="text-[11px] font-bold text-slate-400">
                            Minutes
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                        {series.accessType === "PREMIUM" &&
                        series.discountPrice > 0 ? (
                          <div>
                            <span className="text-lg font-black text-slate-950">
                              ₹{series.discountPrice}
                            </span>

                            {series.price >
                            series.discountPrice ? (
                              <span className="ml-2 text-xs font-bold text-slate-400 line-through">
                                ₹{series.price}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-sm font-black text-emerald-600">
                            Free Practice
                          </span>
                        )}

                        <Link
                          href={`/test-series/${encodeURIComponent(
                            series.slug,
                          )}`}
                          className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-700"
                        >
                          View Series
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* PREPARATION CTA */}
        <section className="mt-10 overflow-hidden rounded-[30px] border border-violet-100 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                    JobWay Preparation
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                    Prepare smarter. Practice better.
                  </h2>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                Combine your courses, study resources and mock tests
                to build a complete preparation journey for{" "}
                {exam.name}.
              </p>

              <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Structured preparation
                </span>

                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Practice focused
                </span>

                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Performance driven
                </span>
              </div>
            </div>

            <div className="p-7 pt-0 sm:p-9 sm:pt-0 lg:pt-9">
              <Link
                href="/courses"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-violet-700 sm:w-auto"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* BACK */}
        <div className="mt-8 pb-8">
          <Link
            href="/exams"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </Link>
        </div>
      </div>
    </main>
  );
}