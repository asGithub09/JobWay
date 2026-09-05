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
  Info,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  Trophy,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

import {
  getPublishedMockTest,
  type MockTest,
  type MockTestQuestion,
} from "@/lib/api";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function getInstructions(mockTest: MockTest) {
  if (
    Array.isArray(mockTest.instructions) &&
    mockTest.instructions.length > 0
  ) {
    return mockTest.instructions;
  }

  return [
    "Read each question carefully before selecting your answer.",
    "The test will run with the specified time limit.",
    "You can move between questions during the test.",
    "Review your answers before submitting whenever time permits.",
    "Once the test is submitted, your performance will be calculated.",
  ];
}

export default function MockTestDetailsPage({
  params,
}: PageProps) {
  const [slug, setSlug] = useState("");

  const [mockTest, setMockTest] =
    useState<MockTest | null>(null);

  const [questions, setQuestions] = useState<
    MockTestQuestion[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMockTest() {
      try {
        setLoading(true);
        setError("");

        const resolvedParams = await params;

        if (!active) return;

        const currentSlug = decodeURIComponent(
          resolvedParams.slug || "",
        );

        setSlug(currentSlug);

        if (!currentSlug) {
          throw new Error("Mock test not found.");
        }

        const response =
          await getPublishedMockTest(currentSlug);

        if (!active) return;

        if (!response?.mockTest) {
          throw new Error("Mock test not found.");
        }

        setMockTest(response.mockTest);
        setQuestions(response.questions || []);
      } catch (err) {
        if (!active) return;

        console.error(
          "Failed to load mock test:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this mock test.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMockTest();

    return () => {
      active = false;
    };
  }, [params]);

  const instructions = useMemo(() => {
    if (!mockTest) {
      return [];
    }

    return getInstructions(mockTest);
  }, [mockTest]);

  const questionCount = mockTest
    ? mockTest.totalQuestions || questions.length
    : 0;

  const totalMarks = mockTest
    ? questionCount * (mockTest.marksPerQuestion || 0)
    : 0;

  const hasNegativeMarking =
    Boolean(mockTest?.negativeMarking) &&
    mockTest!.negativeMarking > 0;

  const isPremium =
    mockTest?.accessType === "PREMIUM";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(220,38,38,0.20),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(79,70,229,0.24),transparent_35%)]" />

          <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-20">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] shadow-xl backdrop-blur-xl">
                <Loader2 className="h-8 w-8 animate-spin text-red-400" />
              </div>

              <h1 className="text-2xl font-black">
                Loading Mock Test
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Preparing your test instructions...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !mockTest) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(220,38,38,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(79,70,229,0.20),transparent_35%)]" />

          <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-20">
            <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>

              <h1 className="text-2xl font-black">
                Mock Test Not Found
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                {error ||
                  "This mock test is unavailable or has not been published yet."}
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/exams"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Browse Exams
                </Link>

                <Link
                  href="/test-series"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Test Series
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-8%] h-[520px] w-[520px] rounded-full bg-red-600/10 blur-3xl" />

        <div className="absolute right-[-12%] top-[5%] h-[580px] w-[580px] rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="absolute bottom-[-15%] left-[30%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      {/* Top navigation */}
      <header className="relative border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <Link
            href="/test-series"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Back to Test Series
            </span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 sm:inline">
              JobWay
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-700" />

            <span className="text-xs font-semibold text-slate-500">
              Mock Test
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(220,38,38,0.20),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(79,70,229,0.25),transparent_40%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-10 lg:px-8 lg:pb-16 lg:pt-14">
          {/* Breadcrumb */}
          <div className="mb-8 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Link
              href="/exams"
              className="transition hover:text-white"
            >
              Exams
            </Link>

            <span>/</span>

            <Link
              href="/test-series"
              className="transition hover:text-white"
            >
              Test Series
            </Link>

            <span>/</span>

            <span className="max-w-[220px] truncate text-slate-300">
              {mockTest.title}
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
            {/* Hero copy */}
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-indigo-300">
                  <Target className="h-3.5 w-3.5" />
                  Mock Test
                </span>

                {isPremium ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-300">
                    <Crown className="h-3.5 w-3.5" />
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Free Test
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {mockTest.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                {mockTest.description ||
                  "Test your preparation in a focused exam-style environment designed to improve your speed, accuracy and confidence."}
              </p>

              {/* Quick stats */}
              <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                  <FileQuestion className="h-5 w-5 text-blue-400" />

                  <p className="mt-3 text-xl font-black">
                    {formatNumber(questionCount)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Questions
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                  <Clock3 className="h-5 w-5 text-violet-400" />

                  <p className="mt-3 text-xl font-black">
                    {formatNumber(
                      mockTest.durationMinutes,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Minutes
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                  <Trophy className="h-5 w-5 text-amber-400" />

                  <p className="mt-3 text-xl font-black">
                    {formatNumber(totalMarks)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Total Marks
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                  <TimerReset className="h-5 w-5 text-cyan-400" />

                  <p className="mt-3 text-xl font-black">
                    {mockTest.attemptLimit === 0
                      ? "∞"
                      : formatNumber(
                          mockTest.attemptLimit,
                        )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Attempts
                  </p>
                </div>
              </div>
            </div>

            {/* Start card */}
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-red-500/20 via-indigo-500/10 to-blue-500/20 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Ready?
                    </p>

                    <p className="mt-1 text-xl font-black">
                      Begin your attempt
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                    <Zap className="h-6 w-6 text-red-400" />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />

                    <p className="text-xs leading-5 text-slate-400">
                      Please read the instructions below before
                      starting. Once your attempt begins, the
                      timer will start running.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/mock-tests/${encodeURIComponent(
                    slug,
                  )}/start`}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-white/10 transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  <Zap className="h-4 w-4" />
                  Start Test
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">
                  By starting, you agree to follow the test
                  instructions and time limit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information strip */}
      <section className="relative border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 lg:grid-cols-4 lg:px-8">
          <div className="px-5 py-5 lg:px-8">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-violet-400" />

              <div>
                <p className="text-sm font-bold">
                  {mockTest.durationMinutes} min
                </p>

                <p className="text-[11px] text-slate-500">
                  Time Limit
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 lg:px-8">
            <div className="flex items-center gap-3">
              <FileQuestion className="h-5 w-5 text-blue-400" />

              <div>
                <p className="text-sm font-bold">
                  {formatNumber(questionCount)}
                </p>

                <p className="text-[11px] text-slate-500">
                  Questions
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 lg:px-8">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-amber-400" />

              <div>
                <p className="text-sm font-bold">
                  {formatNumber(totalMarks)}
                </p>

                <p className="text-[11px] text-slate-500">
                  Maximum Marks
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 lg:px-8">
            <div className="flex items-center gap-3">
              {hasNegativeMarking ? (
                <XCircle className="h-5 w-5 text-rose-400" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              )}

              <div>
                <p className="text-sm font-bold">
                  {hasNegativeMarking
                    ? `-${mockTest.negativeMarking}`
                    : "None"}
                </p>

                <p className="text-[11px] text-slate-500">
                  Negative Marking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Main instructions */}
          <div>
            <div className="mb-7">
              <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                <BookOpen className="h-4 w-4" />
                Test Instructions
              </div>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Before you start
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Take a moment to understand how this mock test
                works. A good attempt starts with a clear strategy.
              </p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-xl backdrop-blur-xl">
              <div className="border-b border-white/10 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                    <ShieldCheck className="h-5 w-5 text-indigo-300" />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Important Instructions
                    </h3>

                    <p className="text-xs text-slate-500">
                      Please read before starting the test.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {instructions.map(
                  (instruction, index) => (
                    <div
                      key={`${instruction}-${index}`}
                      className="flex gap-4 px-5 py-5 sm:px-7"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-black text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <p className="pt-1 text-sm leading-6 text-slate-300">
                        {instruction}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Right information */}
          <aside className="space-y-5">
            {/* Scoring */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-xl backdrop-blur-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                <Trophy className="h-5 w-5 text-amber-300" />
              </div>

              <h3 className="mt-4 text-lg font-black">
                Scoring
              </h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                  <span className="text-xs text-slate-500">
                    Correct answer
                  </span>

                  <span className="text-sm font-bold text-emerald-300">
                    +{mockTest.marksPerQuestion}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                  <span className="text-xs text-slate-500">
                    Incorrect answer
                  </span>

                  <span className="text-sm font-bold text-rose-300">
                    {hasNegativeMarking
                      ? `-${mockTest.negativeMarking}`
                      : "0"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                  <span className="text-xs text-slate-500">
                    Unanswered
                  </span>

                  <span className="text-sm font-bold text-slate-300">
                    0
                  </span>
                </div>
              </div>
            </div>

            {/* Test experience */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-lg font-black">
                Test Experience
              </h3>

              <div className="mt-5 space-y-4">
                {[
                  {
                    icon: TimerReset,
                    title: "Timed Attempt",
                    text: "Your test follows the configured time limit.",
                  },
                  {
                    icon: Target,
                    title: "Focused Practice",
                    text: "Use every attempt to improve your preparation.",
                  },
                  {
                    icon: Trophy,
                    title: "Performance",
                    text: "Your result will help identify areas to improve.",
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

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attempts */}
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/10 via-indigo-500/10 to-blue-500/10 p-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-indigo-300" />

                <h3 className="font-bold">
                  Attempt Limit
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {mockTest.attemptLimit === 0
                  ? "You can attempt this mock test without a configured attempt limit."
                  : `You can attempt this mock test up to ${mockTest.attemptLimit} time${
                      mockTest.attemptLimit === 1
                        ? ""
                        : "s"
                    }.`}
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/10 via-indigo-500/10 to-blue-500/10 p-8 text-center shadow-2xl sm:p-12">
            <div className="absolute left-1/2 top-[-80px] h-56 w-96 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-6 w-6 text-white" />
              </div>

              <h2 className="mt-5 text-2xl font-black sm:text-3xl">
                Ready to test your preparation?
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Find your rhythm, manage your time and give this
                mock test your best attempt.
              </p>

              <Link
                href={`/mock-tests/${encodeURIComponent(
                  slug,
                )}/start`}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-white/10 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Start Test
                <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-4 text-[11px] text-slate-600">
                {questionCount} questions •{" "}
                {mockTest.durationMinutes} minutes •{" "}
                {totalMarks} marks
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}