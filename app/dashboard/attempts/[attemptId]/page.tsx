"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  FileText,
  History,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import StudentPortalShell from "@/components/student-portal/StudentPortalShell";
import {
  getMockTestAttempt,
  MockTestAttempt,
  MockTestQuestionReview,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type ReviewFilter =
  | "ALL"
  | "CORRECT"
  | "INCORRECT"
  | "UNANSWERED";

/*
 * IMPORTANT:
 * MockTestAttempt.mockTest is an ID string in the existing API type.
 * The GET /attempts/:id response also returns the populated mock-test
 * object separately. Keep that object local to this page instead of
 * changing the global MockTestAttempt type.
 */
type ResultMockTest = {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  durationMinutes?: number;
  totalQuestions?: number;
  marksPerQuestion?: number;
  negativeMarking?: number;
  accessType?: "FREE" | "PREMIUM";
};

type AttemptResultData = {
  attempt: MockTestAttempt;
  mockTest?: ResultMockTest | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(
  startedAt?: string,
  submittedAt?: string | null,
) {
  if (!startedAt) return "—";

  const start = new Date(startedAt).getTime();

  const end = submittedAt
    ? new Date(submittedAt).getTime()
    : Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "—";
  }

  const seconds = Math.max(
    0,
    Math.floor((end - start) / 1000),
  );

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function getReviewResult(
  review: MockTestQuestionReview,
): "CORRECT" | "INCORRECT" | "UNANSWERED" {
  /*
   * Current backend review objects use:
   * result: "CORRECT" | "INCORRECT" | "UNANSWERED"
   *
   * Keep compatibility with the frontend's existing isCorrect type too.
   */
  const result = String(
    (
      review as MockTestQuestionReview & {
        result?: string;
      }
    ).result || "",
  );

  if (result === "CORRECT") {
    return "CORRECT";
  }

  if (result === "INCORRECT") {
    return "INCORRECT";
  }

  if (result === "UNANSWERED") {
    return "UNANSWERED";
  }

  if (review.selectedAnswer === null) {
    return "UNANSWERED";
  }

  if (review.selectedAnswer === review.correctAnswer) {
    return "CORRECT";
  }

  return "INCORRECT";
}

function getFilterCount(
  reviews: MockTestQuestionReview[],
  filter: ReviewFilter,
) {
  if (filter === "ALL") {
    return reviews.length;
  }

  return reviews.filter(
    (review) => getReviewResult(review) === filter,
  ).length;
}

function MetricCard({
  icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helper: string;
  tone: "red" | "green" | "violet" | "amber";
}) {
  const toneClasses = {
    red: {
      icon: "bg-red-50 text-red-600",
      value: "text-red-600",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-600",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      value: "text-violet-600",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      value: "text-amber-600",
    },
  };

  const styles = toneClasses[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${styles.icon}`}
      >
        {icon}
      </div>

      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-black ${styles.value}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">
        {helper}
      </p>
    </div>
  );
}

function ReviewCard({
  review,
  index,
}: {
  review: MockTestQuestionReview;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const result = getReviewResult(review);

  const resultConfig =
    result === "CORRECT"
      ? {
          label: "Correct",
          icon: <CheckCircle2 className="h-4 w-4" />,
          wrapper:
            "border-emerald-200 bg-emerald-50/60",
          badge:
            "bg-emerald-100 text-emerald-700",
        }
      : result === "INCORRECT"
        ? {
            label: "Incorrect",
            icon: <XCircle className="h-4 w-4" />,
            wrapper:
              "border-red-200 bg-red-50/50",
            badge:
              "bg-red-100 text-red-700",
          }
        : {
            label: "Unanswered",
            icon: <CircleAlert className="h-4 w-4" />,
            wrapper:
              "border-amber-200 bg-amber-50/50",
            badge:
              "bg-amber-100 text-amber-700",
          };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">
              {index + 1}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                Question {index + 1}
              </p>

              <h3 className="mt-1 text-sm font-black leading-6 text-slate-900 sm:text-base">
                {review.questionText}
              </h3>
            </div>
          </div>

          <span
            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${resultConfig.badge}`}
          >
            {resultConfig.icon}
            {resultConfig.label}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {review.options.map((option) => {
            const isCorrect =
              option.key === review.correctAnswer;

            const isSelected =
              option.key === review.selectedAnswer;

            let optionClass =
              "border-slate-200 bg-slate-50 text-slate-700";

            if (isCorrect) {
              optionClass =
                "border-emerald-300 bg-emerald-50 text-emerald-800";
            } else if (isSelected && !isCorrect) {
              optionClass =
                "border-red-300 bg-red-50 text-red-800";
            }

            return (
              <div
                key={option.key}
                className={`rounded-xl border p-3 ${optionClass}`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black shadow-sm">
                    {option.key}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {option.text}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-2">
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase tracking-wide">
                          Your answer
                        </span>
                      )}

                      {isCorrect && (
                        <span className="text-[10px] font-black uppercase tracking-wide">
                          Correct answer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(review.explanation ||
          review.subject ||
          review.topic ||
          review.difficulty) && (
          <div
            className={`rounded-xl border p-4 ${resultConfig.wrapper}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {review.subject && (
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                  {review.subject}
                </span>
              )}

              {review.topic && (
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                  {review.topic}
                </span>
              )}

              {review.difficulty && (
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                  {review.difficulty}
                </span>
              )}
            </div>

            {review.explanation && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((value) => !value)
                  }
                  className="mt-3 inline-flex items-center gap-2 text-xs font-black text-slate-700"
                >
                  Explanation

                  {expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {expanded && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {review.explanation}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AttemptResultPage() {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();

  const { isAuthenticated, user } = useAuth();

  const attemptId = params?.attemptId;

  const [attempt, setAttempt] =
    useState<MockTestAttempt | null>(null);

  const [mockTest, setMockTest] =
    useState<ResultMockTest | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filter, setFilter] =
    useState<ReviewFilter>("ALL");

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (user?.role === "admin") {
      window.location.href = "/admin";
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    let active = true;

    async function loadAttempt() {
      if (!isAuthenticated || !attemptId) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await getMockTestAttempt(attemptId);

        if (!active) {
          return;
        }

        /*
         * The API response contains:
         *
         * {
         *   attempt: {...},
         *   mockTest: {...}
         * }
         *
         * MockTestAttempt.mockTest remains a string ID.
         */
        const resultData =
          response as unknown as AttemptResultData;

        setAttempt(resultData.attempt);

        setMockTest(
          resultData.mockTest || null,
        );
      } catch (err) {
        if (!active) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this result.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAttempt();

    return () => {
      active = false;
    };
  }, [attemptId, isAuthenticated]);

  const reviews = useMemo(
    () => attempt?.questionReview || [],
    [attempt],
  );

  const filteredReviews = useMemo(() => {
    if (filter === "ALL") {
      return reviews;
    }

    return reviews.filter(
      (review) =>
        getReviewResult(review) === filter,
    );
  }, [filter, reviews]);

  const scoreText = attempt
    ? `${Number(attempt.score || 0).toFixed(2)} / ${
        Number(attempt.totalQuestions || 0) *
        1
      }`
    : "0";

  if (!isAuthenticated || user?.role === "admin") {
    return (
      <StudentPortalShell>
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-700">
              Redirecting...
            </p>
          </div>
        </div>
      </StudentPortalShell>
    );
  }

  return (
    <StudentPortalShell>
      <div className="min-h-screen bg-[#f6f8fc] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Top actions */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/attempts")
              }
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Attempts
            </button>

            {mockTest?.slug && (
              <Link
                href={`/mock-tests/${encodeURIComponent(
                  mockTest.slug,
                )}/start`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-4 text-sm font-black text-white shadow-[0_9px_22px_rgba(225,48,50,0.18)] transition hover:-translate-y-0.5 hover:bg-[#c92426]"
              >
                Retake Test
                <RotateCcw className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-500" />

              <p className="mt-4 text-sm font-bold text-slate-600">
                Loading your result...
              </p>
            </div>
          ) : error || !attempt ? (
            /* Error */
            <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
              <CircleAlert className="mx-auto h-12 w-12 text-red-500" />

              <h1 className="mt-4 text-xl font-black text-slate-900">
                Result unavailable
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {error ||
                  "We could not find this test attempt."}
              </p>

              <Link
                href="/dashboard/attempts"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#E13032] px-5 text-sm font-black text-white"
              >
                Go to My Attempts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Hero */}
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.07)]">
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-violet-50/50 to-red-50/50 p-6 sm:p-8 lg:p-10">
                  <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />

                  <div className="absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-red-200/20 blur-3xl" />

                  <div className="relative">
                    <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-red-600">
                          <Trophy className="h-3.5 w-3.5" />
                          Test Result
                        </div>

                        <h1 className="mt-4 max-w-3xl text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
                          {mockTest?.title ||
                            "Mock Test Result"}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <History className="h-4 w-4" />
                            Attempted{" "}
                            {formatDate(
                              attempt.submittedAt ||
                                attempt.createdAt,
                            )}
                          </span>

                          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-4 w-4" />
                            Time used{" "}
                            {formatDuration(
                              attempt.startedAt,
                              attempt.submittedAt,
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Percentage */}
                      <div className="flex shrink-0 items-center gap-5 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-violet-100 bg-white">
                          <div className="text-center">
                            <p className="text-2xl font-black text-violet-700">
                              {Number(
                                attempt.percentage || 0,
                              ).toFixed(0)}
                              %
                            </p>

                            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                              Score
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                            Result
                          </p>

                          <p className="mt-1 text-lg font-black text-slate-900">
                            {attempt.status ===
                            "SUBMITTED"
                              ? "Completed"
                              : attempt.status}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {attempt.attemptedQuestions}{" "}
                            of{" "}
                            {attempt.totalQuestions}{" "}
                            attempted
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Metrics */}
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={
                    <Target className="h-5 w-5" />
                  }
                  label="Score"
                  value={scoreText}
                  helper="Marks obtained"
                  tone="red"
                />

                <MetricCard
                  icon={
                    <CheckCircle2 className="h-5 w-5" />
                  }
                  label="Correct"
                  value={attempt.correctAnswers}
                  helper="Correct answers"
                  tone="green"
                />

                <MetricCard
                  icon={
                    <XCircle className="h-5 w-5" />
                  }
                  label="Incorrect"
                  value={attempt.incorrectAnswers}
                  helper="Needs improvement"
                  tone="violet"
                />

                <MetricCard
                  icon={
                    <CircleAlert className="h-5 w-5" />
                  }
                  label="Unanswered"
                  value={
                    attempt.unansweredQuestions
                  }
                  helper="Questions skipped"
                  tone="amber"
                />
              </section>

              {/* Main content */}
              <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-6">
                  {/* Answer review header */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-violet-600" />

                          <h2 className="text-xl font-black text-slate-950">
                            Answer Review
                          </h2>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Review every question and understand your mistakes.
                        </p>
                      </div>

                      <div className="text-xs font-bold text-slate-400">
                        {filteredReviews.length}{" "}
                        of {reviews.length} questions
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(
                        [
                          "ALL",
                          "CORRECT",
                          "INCORRECT",
                          "UNANSWERED",
                        ] as ReviewFilter[]
                      ).map((item) => {
                        const active =
                          filter === item;

                        const label =
                          item === "ALL"
                            ? "All"
                            : item === "CORRECT"
                              ? "Correct"
                              : item === "INCORRECT"
                                ? "Incorrect"
                                : "Unanswered";

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() =>
                              setFilter(item)
                            }
                            className={`rounded-xl px-3.5 py-2 text-xs font-black transition ${
                              active
                                ? "bg-slate-950 text-white shadow-sm"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                            }`}
                          >
                            {label} (
                            {getFilterCount(
                              reviews,
                              item,
                            )}
                            )
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review list */}
                  {filteredReviews.length > 0 ? (
                    <div className="space-y-4">
                      {filteredReviews.map(
                        (review, index) => (
                          <ReviewCard
                            key={`${review.question}-${index}`}
                            review={review}
                            index={index}
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                      <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />

                      <h3 className="mt-4 text-lg font-black text-slate-900">
                        No questions in this filter
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try another answer-review filter.
                      </p>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="space-y-5">
                  {/* Performance */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-violet-600" />

                      <h2 className="font-black text-slate-950">
                        Performance
                      </h2>
                    </div>

                    <div className="mt-5 space-y-4">
                      {/* Correct */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500">
                            Correct
                          </span>

                          <span className="text-emerald-600">
                            {attempt.correctAnswers}
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${
                                attempt.totalQuestions
                                  ? Math.min(
                                      100,
                                      (attempt.correctAnswers /
                                        attempt.totalQuestions) *
                                        100,
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Incorrect */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500">
                            Incorrect
                          </span>

                          <span className="text-red-600">
                            {attempt.incorrectAnswers}
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{
                              width: `${
                                attempt.totalQuestions
                                  ? Math.min(
                                      100,
                                      (attempt.incorrectAnswers /
                                        attempt.totalQuestions) *
                                        100,
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Unanswered */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500">
                            Unanswered
                          </span>

                          <span className="text-amber-600">
                            {
                              attempt.unansweredQuestions
                            }
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{
                              width: `${
                                attempt.totalQuestions
                                  ? Math.min(
                                      100,
                                      (attempt.unansweredQuestions /
                                        attempt.totalQuestions) *
                                        100,
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Retake CTA */}
                  <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">
                      Keep improving
                    </p>

                    <h3 className="mt-2 text-lg font-black text-slate-950">
                      Ready for another attempt?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Review your weak areas and try the test again to improve your score.
                    </p>

                    {mockTest?.slug && (
                      <Link
                        href={`/mock-tests/${encodeURIComponent(
                          mockTest.slug,
                        )}/start`}
                        className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-700"
                      >
                        Retake Test
                        <RotateCcw className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </aside>
              </section>
            </>
          )}
        </div>
      </div>
    </StudentPortalShell>
  );
}