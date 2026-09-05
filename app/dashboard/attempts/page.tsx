"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileQuestion,
  History,
  Loader2,
  RefreshCw,
  Search,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import StudentPortalShell from "@/components/student-portal/StudentPortalShell";
import {
  getMyMockTestAttempts,
  type MockTestAttempt,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type AttemptWithMockTest = MockTestAttempt & {
  mockTest: {
    id: string;
    title: string;
    slug: string;
    durationMinutes: number;
    totalQuestions: number;
    marksPerQuestion: number;
    negativeMarking: number;
    accessType: "FREE" | "PREMIUM";
  } | null;
};

type AttemptFilter =
  | "ALL"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "EXPIRED";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: AttemptFilter) {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "SUBMITTED":
      return "Completed";
    case "EXPIRED":
      return "Expired";
    default:
      return "All Attempts";
  }
}

function getStatusClasses(status: AttemptFilter) {
  switch (status) {
    case "IN_PROGRESS":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "SUBMITTED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "EXPIRED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getPercentage(attempt: AttemptWithMockTest) {
  if (typeof attempt.percentage === "number") {
    return attempt.percentage;
  }

  if (attempt.totalQuestions > 0) {
    return (
      (attempt.correctAnswers / attempt.totalQuestions) * 100
    );
  }

  return 0;
}

function getScoreText(attempt: AttemptWithMockTest) {
  const marksPerQuestion =
    attempt.mockTest?.marksPerQuestion ?? 1;

  const totalMarks =
    (attempt.totalQuestions || 0) * marksPerQuestion;

  return `${attempt.score.toFixed(2)} / ${totalMarks.toFixed(2)}`;
}

function StatCard({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  tone: "red" | "violet" | "emerald" | "amber";
}) {
  const tones = {
    red: {
      icon: "bg-red-50 text-[#E13032]",
      value: "text-[#E13032]",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      value: "text-violet-700",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      value: "text-amber-700",
    },
  };

  const toneClasses = tones[tone];

  return (
    <div className="rounded-[22px] border border-white/80 bg-white/80 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses.icon}`}
        >
          {icon}
        </div>

        <span
          className={`text-2xl font-black tracking-tight ${toneClasses.value}`}
        >
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-black text-slate-900">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">
        {description}
      </p>
    </div>
  );
}

function EmptyState({
  filter,
  search,
}: {
  filter: AttemptFilter;
  search: string;
}) {
  const filtered = filter !== "ALL";
  const searching = search.trim().length > 0;

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/80 px-6 py-16 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-100 text-slate-400">
        <History className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950">
        {searching
          ? "No matching attempts"
          : filtered
            ? `No ${getStatusLabel(filter).toLowerCase()}`
            : "No attempts yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {searching
          ? "Try a different test name or clear the search."
          : "Your mock test attempts will appear here after you start practicing."}
      </p>

      {!searching && !filtered ? (
        <Link
          href="/exams"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 text-sm font-black text-white shadow-[0_10px_25px_rgba(225,48,50,0.2)] transition hover:-translate-y-0.5 hover:bg-[#c92426]"
        >
          Explore Mock Tests
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function AttemptCard({
  attempt,
}: {
  attempt: AttemptWithMockTest;
}) {
  const isInProgress = attempt.status === "IN_PROGRESS";
  const isCompleted = attempt.status === "SUBMITTED";
  const percentage = getPercentage(attempt);

  const href = attempt.mockTest
  ? `/mock-tests/${encodeURIComponent(
      attempt.mockTest.slug,
    )}/start`
  : "/exams";

const resultHref = `/dashboard/attempts/${encodeURIComponent(
  attempt.id,
)}`;

  return (
    <article className="group overflow-hidden rounded-[26px] border border-white/80 bg-white/80 shadow-[0_16px_50px_rgba(15,23,42,0.055)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusClasses(
                  attempt.status,
                )}`}
              >
                {getStatusLabel(attempt.status)}
              </span>

              {attempt.mockTest?.accessType === "PREMIUM" ? (
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700">
                  Premium
                </span>
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Free
                </span>
              )}
            </div>

            <h2 className="mt-3 truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
              {attempt.mockTest?.title || "Mock Test"}
            </h2>

            <p className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              Attempted {formatDate(attempt.createdAt)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Score
              </p>
              <p className="mt-1 text-xl font-black text-slate-950">
                {isCompleted
                  ? getScoreText(attempt)
                  : "—"}
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E13032] to-violet-600 text-sm font-black text-white shadow-[0_10px_25px_rgba(225,48,50,0.16)]">
              {isCompleted
                ? `${Math.round(percentage)}%`
                : "—"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-slate-50/80 p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Questions
            </p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {attempt.totalQuestions}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50/60 p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-emerald-600">
              Correct
            </p>
            <p className="mt-1 text-sm font-black text-emerald-700">
              {attempt.correctAnswers}
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50/60 p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-rose-600">
              Incorrect
            </p>
            <p className="mt-1 text-sm font-black text-rose-700">
              {attempt.incorrectAnswers}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50/80 p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Unanswered
            </p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {attempt.unansweredQuestions}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Target className="h-4 w-4 text-violet-500" />

            <span>
              {attempt.attemptedQuestions} of{" "}
              {attempt.totalQuestions} answered
            </span>
          </div>

          {isInProgress ? (
            <Link
              href={href}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 text-sm font-black text-white shadow-[0_9px_22px_rgba(225,48,50,0.18)] transition hover:-translate-y-0.5 hover:bg-[#c92426]"
            >
              Resume Test
              <RefreshCw className="h-4 w-4" />
            </Link>
          ) : (
            <Link
  href={resultHref}
  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
>
  View Result
  <ChevronRight className="h-4 w-4" />
</Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function MyAttemptsPage() {
  const { isAuthenticated, user } = useAuth();

  const [attempts, setAttempts] = useState<
    AttemptWithMockTest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] =
    useState<AttemptFilter>("ALL");
  const [search, setSearch] = useState("");

  const loadAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyMockTestAttempts();

      setAttempts(
        (response.attempts || []) as AttemptWithMockTest[],
      );
    } catch (err) {
      console.error("Failed to load attempts:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load your attempts.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    void loadAttempts();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/";
      return;
    }

    if (user?.role === "admin") {
      window.location.href = "/admin";
    }
  }, [isAuthenticated, user]);

  const filteredAttempts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attempts.filter((attempt) => {
      const matchesFilter =
        filter === "ALL" || attempt.status === filter;

      const title =
        attempt.mockTest?.title?.toLowerCase() || "";

      const matchesSearch =
        !query || title.includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [attempts, filter, search]);

  const summary = useMemo(() => {
    const completed = attempts.filter(
      (attempt) => attempt.status === "SUBMITTED",
    );

    const inProgress = attempts.filter(
      (attempt) => attempt.status === "IN_PROGRESS",
    );

    const average =
      completed.length > 0
        ? completed.reduce(
            (sum, attempt) =>
              sum + getPercentage(attempt),
            0,
          ) / completed.length
        : 0;

    const best =
      completed.length > 0
        ? Math.max(
            ...completed.map((attempt) =>
              getPercentage(attempt),
            ),
          )
        : 0;

    return {
      total: attempts.length,
      completed: completed.length,
      inProgress: inProgress.length,
      average,
      best,
    };
  }, [attempts]);

  if (!isAuthenticated || user?.role === "admin") {
    return (
      <StudentPortalShell>
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
          <Loader2 className="h-7 w-7 animate-spin text-[#E13032]" />
        </div>
      </StudentPortalShell>
    );
  }

  return (
    <StudentPortalShell>
      <main className="min-h-screen overflow-x-hidden bg-[#f6f8fc]">
        <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
          <div className="absolute left-[7%] top-[5%] h-[350px] w-[350px] rounded-full bg-red-200/20 blur-[100px]" />
          <div className="absolute right-[5%] top-[12%] h-[420px] w-[420px] rounded-full bg-violet-200/20 blur-[110px]" />
          <div className="absolute bottom-[5%] left-[35%] h-[380px] w-[380px] rounded-full bg-blue-200/15 blur-[110px]" />
        </div>

        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-2xl">
          <div className="mx-auto flex min-h-[76px] w-full max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-7 xl:px-10">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E13032]">
                  Student Workspace
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                <span className="hidden text-[10px] font-bold text-slate-400 sm:block">
                  Practice History
                </span>
              </div>

              <h1 className="mt-1 truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                My Attempts
              </h1>

              <p className="hidden text-xs font-medium text-slate-500 sm:block">
                Review your mock tests, scores and preparation progress.
              </p>
            </div>

            <Link
              href="/exams"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-4 text-xs font-black text-white shadow-[0_9px_22px_rgba(225,48,50,0.18)] transition hover:-translate-y-0.5 hover:bg-[#c92426] sm:px-5 sm:text-sm"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">
                Explore Tests
              </span>
              <span className="sm:hidden">Tests</span>
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-12 pt-6 sm:px-7 sm:pt-8 xl:px-10">
          <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-red-100/60 blur-3xl" />
            <div className="pointer-events-none absolute right-[20%] top-0 h-48 w-48 rounded-full bg-violet-100/50 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
                    <History className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Practice History
                  </span>
                </div>

                <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  Your Test Journey
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Track every mock test, identify your strengths and
                  keep improving with every attempt.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">
                    {summary.total}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-emerald-600">
                    Completed
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">
                    {summary.completed}
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3 sm:col-span-1">
                  <p className="text-[10px] font-black uppercase tracking-wide text-amber-600">
                    In Progress
                  </p>
                  <p className="mt-1 text-2xl font-black text-amber-700">
                    {summary.inProgress}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<History className="h-5 w-5" />}
              label="Total Attempts"
              value={summary.total}
              description="All mock test activity"
              tone="red"
            />

            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Completed"
              value={summary.completed}
              description="Successfully submitted"
              tone="emerald"
            />

            <StatCard
              icon={<BarChart3 className="h-5 w-5" />}
              label="Average Score"
              value={`${Math.round(summary.average)}%`}
              description="Across completed tests"
              tone="violet"
            />

            <StatCard
              icon={<Trophy className="h-5 w-5" />}
              label="Best Score"
              value={`${Math.round(summary.best)}%`}
              description="Your highest percentage"
              tone="amber"
            />
          </section>

          <section className="mt-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#E13032]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#E13032]">
                    Attempts
                  </span>
                </div>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                  Your Mock Tests
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-3 shadow-sm sm:w-[260px]">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search test name..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm">
                  {(
                    [
                      "ALL",
                      "IN_PROGRESS",
                      "SUBMITTED",
                      "EXPIRED",
                    ] as AttemptFilter[]
                  ).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-black transition ${
                        filter === item
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      {getStatusLabel(item)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="mt-5 rounded-[26px] border border-white/80 bg-white/80 px-6 py-20 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#E13032]" />

                <p className="mt-4 text-sm font-black text-slate-700">
                  Loading your attempts...
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Fetching your latest mock test activity.
                </p>
              </div>
            ) : error ? (
              <div className="mt-5 rounded-[26px] border border-rose-200 bg-rose-50/70 px-6 py-12 text-center">
                <XCircle className="mx-auto h-8 w-8 text-rose-500" />

                <h3 className="mt-4 text-lg font-black text-rose-900">
                  Could not load attempts
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-rose-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => void loadAttempts()}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-rose-700 shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </div>
            ) : filteredAttempts.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  filter={filter}
                  search={search}
                />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {filteredAttempts.map((attempt) => (
                  <AttemptCard
                    key={attempt.id}
                    attempt={attempt}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-[24px] border border-violet-100 bg-violet-50/60 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                <FileQuestion className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-black text-slate-900">
                  Keep your preparation moving
                </h3>

                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                  Take another mock test to strengthen your preparation
                  and improve your score.
                </p>
              </div>

              <Link
                href="/exams"
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-violet-700 shadow-sm ring-1 ring-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-50"
              >
                Browse Tests
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </StudentPortalShell>
  );
}