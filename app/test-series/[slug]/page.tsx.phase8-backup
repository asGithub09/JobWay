"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Crown,
  FileQuestion,
  Layers3,
  Loader2,
  Lock,
  Sparkles,
  Trophy,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

import {
  getPublishedExams,
  getPublishedMockTests,
  getPublishedTestSeries,
  type Exam,
  type MockTest,
  type TestSeries,
} from "@/lib/api";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default function TestSeriesDetailsPage({ params }: PageProps) {
  const [series, setSeries] = useState<TestSeries | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError("");

        const resolvedParams = await params;

        if (!active) return;

        const currentSlug = decodeURIComponent(
          resolvedParams.slug || "",
        );

        /*
         * The existing API exposes Test Series by exam ID rather than
         * directly by series slug.
         *
         * Therefore:
         *
         * 1. Load all published exams.
         * 2. Load published test series for each exam.
         * 3. Find the series matching the current URL slug.
         * 4. Load the mock tests belonging to that series.
         */

        const examsResponse = await getPublishedExams();

        if (!active) return;

        const exams = examsResponse.exams || [];

        let foundSeries: TestSeries | null = null;
        let foundExam: Exam | null = null;

        for (const currentExam of exams) {
          const response = await getPublishedTestSeries(
            currentExam.id,
          );

          if (!active) return;

          const matchingSeries = (response.testSeries || []).find(
            (item) =>
              item.slug.toLowerCase() ===
              currentSlug.toLowerCase(),
          );

          if (matchingSeries) {
            foundSeries = matchingSeries;
            foundExam = currentExam;
            break;
          }
        }

        if (!foundSeries || !foundExam) {
          throw new Error("Test series not found.");
        }

        const mockResponse = await getPublishedMockTests(
          foundSeries.id,
        );

        if (!active) return;

        setSeries(foundSeries);
        setExam(foundExam);
        setMockTests(mockResponse.mockTests || []);
      } catch (err) {
        if (!active) return;

        console.error("Failed to load test series:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this test series.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      active = false;
    };
  }, [params]);

  const totalQuestions = useMemo(() => {
    return mockTests.reduce(
      (total, mockTest) =>
        total + (mockTest.totalQuestions || 0),
      0,
    );
  }, [mockTests]);

  const totalDuration = useMemo(() => {
    return mockTests.reduce(
      (total, mockTest) =>
        total + (mockTest.durationMinutes || 0),
      0,
    );
  }, [mockTests]);

  const freeMockTests = useMemo(() => {
    return mockTests.filter(
      (mockTest) => mockTest.accessType === "FREE",
    ).length;
  }, [mockTests]);

  const premiumMockTests =
    mockTests.length - freeMockTests;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(220,38,38,0.22),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(79,70,229,0.22),transparent_32%)]" />

          <div className="relative mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-20">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Loader2 className="h-8 w-8 animate-spin text-red-400" />
              </div>

              <h1 className="text-2xl font-bold">
                Loading Test Series
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Preparing your mock test dashboard...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !series) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-20">
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold">
              Test Series Not Found
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
              {error ||
                "This test series is unavailable or has not been published yet."}
            </p>

            <Link
              href="/exams"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse Exams
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-10%] h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />

        <div className="absolute right-[-10%] top-[10%] h-[550px] w-[550px] rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="absolute bottom-[-15%] left-[35%] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      {/* Top navigation */}
      <div className="relative border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Link
              href="/exams"
              className="transition hover:text-white"
            >
              Exams
            </Link>

            <span>/</span>

            {exam && (
              <>
                <span className="hidden sm:inline">
                  {exam.name}
                </span>

                <span className="hidden sm:inline">/</span>
              </>
            )}

            <span className="max-w-[180px] truncate text-white">
              {series.title}
            </span>
          </div>

          <Link
            href="/exams"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Exams
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(220,38,38,0.20),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(79,70,229,0.24),transparent_38%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-12 lg:px-8 lg:pb-20 lg:pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {exam && (
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
                    {exam.name}
                  </span>
                )}

                <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-bold text-indigo-300">
                  TEST SERIES
                </span>

                {series.accessType === "PREMIUM" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
                    <Crown className="h-3.5 w-3.5" />
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Free Access
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {series.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                {series.description ||
                  "Practice smarter with carefully structured mock tests designed to help you improve accuracy, speed and exam confidence."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#mock-tests"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-white/10 transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  <Zap className="h-4 w-4" />
                  Start Practicing
                  <ArrowRight className="h-4 w-4" />
                </a>

                <Link
                  href="/exams"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Explore More Exams
                </Link>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-red-500/20 via-indigo-500/10 to-blue-500/20 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Your Practice Hub
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      Ready to improve?
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                    <Trophy className="h-5 w-5 text-red-400" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-2xl font-black text-white">
                      {formatNumber(mockTests.length)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Mock Tests
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-2xl font-black text-white">
                      {formatNumber(totalQuestions)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Questions
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-2xl font-black text-white">
                      {formatNumber(freeMockTests)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Free Tests
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-2xl font-black text-white">
                      {formatNumber(totalDuration)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Total Minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 lg:grid-cols-4 lg:px-8">
          <div className="px-5 py-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <Layers3 className="h-5 w-5 text-red-400" />
              </div>

              <div>
                <p className="text-xl font-black">
                  {mockTests.length}
                </p>

                <p className="text-xs text-slate-500">
                  Mock Tests
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <FileQuestion className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <p className="text-xl font-black">
                  {formatNumber(totalQuestions)}
                </p>

                <p className="text-xs text-slate-500">
                  Practice Questions
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <p className="text-xl font-black">
                  {freeMockTests}
                </p>

                <p className="text-xs text-slate-500">
                  Free Tests
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Clock3 className="h-5 w-5 text-violet-400" />
              </div>

              <div>
                <p className="text-xl font-black">
                  {formatNumber(totalDuration)}
                </p>

                <p className="text-xs text-slate-500">
                  Practice Minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section
        id="mock-tests"
        className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          {/* Mock tests */}
          <div>
            <div className="mb-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                <Sparkles className="h-4 w-4" />
                Practice Collection
              </div>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Choose a Mock Test
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Attempt tests, improve your accuracy and build the
                confidence you need for the real examination.
              </p>
            </div>

            {mockTests.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-10 text-center backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <BookOpen className="h-7 w-7 text-slate-500" />
                </div>

                <h3 className="text-lg font-bold">
                  Mock Tests Coming Soon
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  This test series is published, but no mock tests
                  have been added yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockTests.map((mockTest, index) => {
                  const isPremium =
                    mockTest.accessType === "PREMIUM";

                  return (
                    <div
                      key={mockTest.id}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.075] sm:p-6"
                    >
                      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl transition group-hover:bg-indigo-500/10" />

                      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/15 to-indigo-500/15 text-sm font-black text-white ring-1 ring-white/10">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-white sm:text-lg">
                                {mockTest.title}
                              </h3>

                              {isPremium ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                                  <Crown className="h-3 w-3" />
                                  Premium
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Free
                                </span>
                              )}
                            </div>

                            <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-500">
                              {mockTest.description ||
                                "Practice this mock test in a real-exam style environment."}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-400">
                              <span className="inline-flex items-center gap-1.5">
                                <FileQuestion className="h-3.5 w-3.5 text-blue-400" />
                                {mockTest.totalQuestions} Questions
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="h-3.5 w-3.5 text-violet-400" />
                                {mockTest.durationMinutes} Minutes
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                                {mockTest.marksPerQuestion} Mark
                                / Question
                              </span>

                              {mockTest.negativeMarking > 0 && (
                                <span className="inline-flex items-center gap-1.5 text-rose-300">
                                  <XCircle className="h-3.5 w-3.5" />
                                  -{mockTest.negativeMarking} Negative
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 lg:pl-4">
                          <Link
                            href={`/mock-tests/${encodeURIComponent(
                              mockTest.slug,
                            )}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 sm:w-auto"
                          >
                            {isPremium ? (
                              <>
                                <Lock className="h-4 w-4" />
                                View Test
                              </>
                            ) : (
                              <>
                                Start Test
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Access card */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-xl backdrop-blur-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
                <Crown className="h-5 w-5 text-indigo-300" />
              </div>

              <h3 className="mt-4 text-lg font-bold">
                Series Access
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {series.accessType === "PREMIUM"
                  ? "This series contains premium practice material. Upgrade your access to unlock all tests."
                  : "You can start practicing these tests immediately."}
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Free tests
                  </span>

                  <span className="font-bold text-emerald-300">
                    {freeMockTests}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Premium tests
                  </span>

                  <span className="font-bold text-amber-300">
                    {premiumMockTests}
                  </span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-xl backdrop-blur-xl">
              <h3 className="text-lg font-bold">
                Why Practice Here?
              </h3>

              <div className="mt-5 space-y-4">
                {[
                  {
                    icon: Clock3,
                    title: "Real Exam Timing",
                    text: "Practice with realistic time limits.",
                  },
                  {
                    icon: Trophy,
                    title: "Performance Focused",
                    text: "Build speed and accuracy together.",
                  },
                  {
                    icon: Users,
                    title: "Structured Practice",
                    text: "Progress through organized mock tests.",
                  },
                  {
                    icon: Zap,
                    title: "Instant Experience",
                    text: "Jump into your next test quickly.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex gap-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <Icon className="h-4 w-4 text-slate-300" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <Link
              href="/exams"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Explore other exams
              </span>

              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/10 via-indigo-500/10 to-blue-500/10 p-8 text-center sm:p-12">
            <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-6 w-6 text-white" />
              </div>

              <h2 className="mt-5 text-2xl font-black sm:text-3xl">
                Your preparation starts here.
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Pick a mock test, attempt it under exam conditions
                and use your performance to decide what to improve
                next.
              </p>

              <a
                href="#mock-tests"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
              >
                Browse Mock Tests
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}