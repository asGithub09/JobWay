"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Filter,
  Loader2,
  Search,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  getEducatorExamReview,
  getMyEducatorExamResults,
  type EducatorExamResultItem,
  type EducatorExamReviewResponse,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const RESULTS_PER_PAGE = 10;

type StatusFilter =
  | "ALL"
  | "SUBMITTED"
  | "PASSED"
  | "FAILED"
  | "EXPIRED"
  | "TERMINATED"
  | "LOCKED";

type SortOption =
  | "RECENT"
  | "OLDEST"
  | "HIGHEST_SCORE"
  | "LOWEST_SCORE";

function formatDate(value: string | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "SUBMITTED":
      return "Submitted";
    case "EXPIRED":
      return "Expired";
    case "TERMINATED":
      return "Terminated";
    case "LOCKED":
      return "Locked";
    default:
      return status || "Completed";
  }
}

function statusClass(status: string) {
  switch (status) {
    case "SUBMITTED":
      return "bg-emerald-50 text-emerald-700";
    case "EXPIRED":
      return "bg-amber-50 text-amber-700";
    case "TERMINATED":
    case "LOCKED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function answerText(
  review: EducatorExamReviewResponse,
  questionIndex: number,
  keys: string[],
) {
  const question = review.wrongAnswers[questionIndex];

  if (!keys.length) return "Not answered";

  return keys
    .map(
      (key) =>
        question.options.find((option) => option.key === key)?.text || key,
    )
    .join(", ");
}

export default function StudentResultsPage() {
  const { isAuthenticated, user } = useAuth();

  const [results, setResults] = useState<EducatorExamResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [reviewId, setReviewId] = useState<string | null>(null);
  const [review, setReview] =
    useState<EducatorExamReviewResponse | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [sortOption, setSortOption] =
    useState<SortOption>("RECENT");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!user) {
      window.location.href = "/";
      return;
    }

    if (user.role === "admin") {
      window.location.href = "/admin";
      return;
    }

    let mounted = true;

    const loadResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyEducatorExamResults();

        if (mounted) {
          setResults(response.results || []);
        }
      } catch (err) {
        console.error("Load educator exam results error:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your exam results.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadResults();

    return () => {
      mounted = false;
    };
  }, [user, isAuthenticated]);

  const summary = useMemo(() => {
    const completed = results.filter(
      (item) => item.status === "SUBMITTED",
    );

    const passed = completed.filter((item) => item.passed);

    const averagePercentage =
      completed.length > 0
        ? completed.reduce(
            (sum, item) => sum + Number(item.percentage || 0),
            0,
          ) / completed.length
        : 0;

    const bestPercentage =
      completed.length > 0
        ? Math.max(
            ...completed.map((item) =>
              Number(item.percentage || 0),
            ),
          )
        : 0;

    return {
      total: results.length,
      completed: completed.length,
      passed: passed.length,
      averagePercentage,
      bestPercentage,
    };
  }, [results]);

  const filteredResults = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = results.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          item.exam?.title,
          item.exam?.subject,
          item.exam?.category,
          item.exam?.topic,
          item.status,
          statusLabel(item.status),
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch),
          );

      let matchesStatus = true;

      switch (statusFilter) {
        case "SUBMITTED":
          matchesStatus = item.status === "SUBMITTED";
          break;

        case "PASSED":
          matchesStatus =
            item.status === "SUBMITTED" && item.passed;
          break;

        case "FAILED":
          matchesStatus =
            item.status === "SUBMITTED" && !item.passed;
          break;

        case "EXPIRED":
          matchesStatus = item.status === "EXPIRED";
          break;

        case "TERMINATED":
          matchesStatus = item.status === "TERMINATED";
          break;

        case "LOCKED":
          matchesStatus = item.status === "LOCKED";
          break;

        default:
          matchesStatus = true;
      }

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortOption === "HIGHEST_SCORE") {
        return (
          Number(b.percentage || 0) -
          Number(a.percentage || 0)
        );
      }

      if (sortOption === "LOWEST_SCORE") {
        return (
          Number(a.percentage || 0) -
          Number(b.percentage || 0)
        );
      }

      const dateA = a.submittedAt
        ? new Date(a.submittedAt).getTime()
        : 0;

      const dateB = b.submittedAt
        ? new Date(b.submittedAt).getTime()
        : 0;

      if (sortOption === "OLDEST") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });
  }, [results, search, statusFilter, sortOption]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResults.length / RESULTS_PER_PAGE),
  );

  const paginatedResults = useMemo(() => {
    const start =
      (currentPage - 1) * RESULTS_PER_PAGE;

    return filteredResults.slice(
      start,
      start + RESULTS_PER_PAGE,
    );
  }, [filteredResults, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortOption]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  const openReview = async (attemptId: string) => {
    if (reviewId === attemptId) {
      setReviewId(null);
      setReview(null);
      setReviewError("");
      return;
    }

    try {
      setReviewId(attemptId);
      setReview(null);
      setReviewError("");
      setReviewLoading(true);

      const response = await getEducatorExamReview(attemptId);
      setReview(response);
    } catch (err) {
      console.error("Load exam review error:", err);

      setReviewError(
        err instanceof Error
          ? err.message
          : "Unable to load answer review.",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (

        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your results...
          </div>
        </div>

    );
  }

  return (

      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-violet-600">
              <Trophy className="h-4 w-4" />
              Student Performance
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              My Results
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              View your completed Educator EMS examination results,
              scores and performance details.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">
                  Total Results
                </span>
                <FileText className="h-5 w-5 text-violet-600" />
              </div>

              <div className="text-3xl font-black text-slate-900">
                {summary.total}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">
                  Completed
                </span>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="text-3xl font-black text-slate-900">
                {summary.completed}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">
                  Passed
                </span>
                <Award className="h-5 w-5 text-amber-500" />
              </div>

              <div className="text-3xl font-black text-slate-900">
                {summary.passed}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">
                  Best Score
                </span>
                <Trophy className="h-5 w-5 text-violet-600" />
              </div>

              <div className="text-3xl font-black text-slate-900">
                {summary.bestPercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No results yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Your completed Educator EMS examinations will appear
                here after submission.
              </p>

              <Link
                href="/exams"
                className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700"
              >
                Browse Exams
              </Link>
            </div>
          ) : (
            <>
              <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search exam, subject, category or topic..."
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative">
                      <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(
                            event.target.value as StatusFilter,
                          )
                        }
                        className="h-12 w-full min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-bold text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="ALL">All Results</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="PASSED">Passed</option>
                        <option value="FAILED">Failed</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="TERMINATED">Terminated</option>
                        <option value="LOCKED">Locked</option>
                      </select>
                    </div>

                    <select
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(
                          event.target.value as SortOption,
                        )
                      }
                      className="h-12 min-w-[170px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="RECENT">
                        Most Recent
                      </option>
                      <option value="OLDEST">
                        Oldest First
                      </option>
                      <option value="HIGHEST_SCORE">
                        Highest Score
                      </option>
                      <option value="LOWEST_SCORE">
                        Lowest Score
                      </option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing{" "}
                    {filteredResults.length === 0
                      ? 0
                      : (currentPage - 1) *
                          RESULTS_PER_PAGE +
                        1}{" "}
                    -{" "}
                    {Math.min(
                      currentPage * RESULTS_PER_PAGE,
                      filteredResults.length,
                    )}{" "}
                    of {filteredResults.length} results
                  </span>

                  {(search || statusFilter !== "ALL") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("ALL");
                      }}
                      className="w-fit text-violet-600 transition hover:text-violet-800"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </section>

              {filteredResults.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <Search className="mx-auto h-10 w-10 text-slate-300" />

                  <h2 className="mt-4 text-xl font-black text-slate-900">
                    No matching results
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Try another search term or change the selected
                    filters.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-5">
                    {paginatedResults.map((item) => {
                      const isExpanded =
                        expandedId === item.id;
                      const isReviewOpen =
                        reviewId === item.id;

                      return (
                        <article
                          key={item.id}
                          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                        >
                          <div className="p-5 sm:p-6">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(
                                      item.status,
                                    )}`}
                                  >
                                    {statusLabel(item.status)}
                                  </span>

                                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                                    {item.accessType}
                                  </span>

                                  {item.passed && (
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                                      PASSED
                                    </span>
                                  )}
                                </div>

                                <h2 className="text-xl font-black text-slate-900">
                                  {item.exam?.title ||
                                    "Educator Examination"}
                                </h2>

                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-500">
                                  {item.exam?.subject && (
                                    <span>
                                      {item.exam.subject}
                                    </span>
                                  )}

                                  {item.exam?.category && (
                                    <span>
                                      {item.exam.category}
                                    </span>
                                  )}

                                  <span>
                                    Submitted:{" "}
                                    {formatDate(item.submittedAt)}
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0 rounded-2xl bg-slate-50 px-6 py-4 text-center">
                                <div className="text-3xl font-black text-slate-900">
                                  {Number(
                                    item.percentage || 0,
                                  ).toFixed(1)}
                                  %
                                </div>

                                <div className="mt-1 text-xs font-bold text-slate-500">
                                  {item.obtainedMarks} /{" "}
                                  {item.totalMarks} marks
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="text-xs font-bold text-slate-500">
                                  Questions
                                </div>

                                <div className="mt-1 text-lg font-black text-slate-900">
                                  {item.totalQuestions}
                                </div>
                              </div>

                              <div className="rounded-2xl bg-emerald-50 p-4">
                                <div className="text-xs font-bold text-emerald-700">
                                  Correct
                                </div>

                                <div className="mt-1 text-lg font-black text-emerald-800">
                                  {item.correctAnswers}
                                </div>
                              </div>

                              <div className="rounded-2xl bg-red-50 p-4">
                                <div className="text-xs font-bold text-red-700">
                                  Incorrect
                                </div>

                                <div className="mt-1 text-lg font-black text-red-800">
                                  {item.incorrectAnswers}
                                </div>
                              </div>

                              <div className="rounded-2xl bg-amber-50 p-4">
                                <div className="text-xs font-bold text-amber-700">
                                  Unanswered
                                </div>

                                <div className="mt-1 text-lg font-black text-amber-800">
                                  {item.unansweredQuestions}
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <Clock3 className="h-4 w-4" />
                                Attempt status:{" "}
                                {statusLabel(item.status)}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {item.incorrectAnswers > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void openReview(item.id)
                                    }
                                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                                      isReviewOpen
                                        ? "bg-violet-100 text-violet-700"
                                        : "bg-violet-600 text-white hover:bg-violet-700"
                                    }`}
                                  >
                                    <Eye className="h-4 w-4" />

                                    {isReviewOpen
                                      ? "Hide Review"
                                      : "Review Answers"}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedId(
                                      isExpanded
                                        ? null
                                        : item.id,
                                    )
                                  }
                                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                                >
                                  {isExpanded
                                    ? "Hide Details"
                                    : "View Details"}
                                </button>
                              </div>
                            </div>

                            {isReviewOpen && (
                              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4 sm:p-6">
                                {reviewLoading && (
                                  <div className="flex items-center justify-center gap-2 py-10 text-sm font-bold text-slate-500">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Loading answer review...
                                  </div>
                                )}

                                {reviewError && (
                                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                                    {reviewError}
                                  </div>
                                )}

                                {review &&
                                  !reviewLoading &&
                                  !reviewError && (
                                    <>
                                      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                          <h3 className="text-lg font-black text-slate-900">
                                            Wrong Answer Review
                                          </h3>

                                          <p className="text-sm font-semibold text-slate-500">
                                            {review.exam?.title ||
                                              "Examination"}
                                          </p>
                                        </div>

                                        <span className="w-fit rounded-full bg-red-100 px-3 py-1.5 text-xs font-black text-red-700">
                                          {review.totalWrong} wrong
                                        </span>
                                      </div>

                                      {review.wrongAnswers.length ===
                                      0 ? (
                                        <div className="rounded-xl bg-white p-6 text-center text-sm font-semibold text-slate-500">
                                          No wrong answers found for
                                          this attempt.
                                        </div>
                                      ) : (
                                        <div className="space-y-4">
                                          {review.wrongAnswers.map(
                                            (
                                              question,
                                              index,
                                            ) => (
                                              <div
                                                key={
                                                  question.questionId
                                                }
                                                className="rounded-2xl border border-slate-200 bg-white p-5"
                                              >
                                                <div className="mb-3 flex items-start justify-between gap-4">
                                                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                                                    Wrong #
                                                    {index + 1}
                                                  </span>

                                                  {question.difficulty && (
                                                    <span className="text-xs font-bold uppercase text-slate-400">
                                                      {
                                                        question.difficulty
                                                      }
                                                    </span>
                                                  )}
                                                </div>

                                                <h4 className="text-base font-black leading-6 text-slate-900">
                                                  {
                                                    question.questionText
                                                  }
                                                </h4>

                                                {question.options
                                                  .length > 0 && (
                                                  <div className="mt-4 space-y-2">
                                                    {question.options.map(
                                                      (
                                                        option,
                                                      ) => {
                                                        const selected =
                                                          question.selectedAnswers.includes(
                                                            option.key,
                                                          );

                                                        const correct =
                                                          question.correctAnswers.includes(
                                                            option.key,
                                                          );

                                                        return (
                                                          <div
                                                            key={
                                                              option.key
                                                            }
                                                            className={`rounded-xl border p-3 text-sm font-semibold ${
                                                              correct
                                                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                                : selected
                                                                  ? "border-red-200 bg-red-50 text-red-800"
                                                                  : "border-slate-100 bg-slate-50 text-slate-600"
                                                            }`}
                                                          >
                                                            <div className="flex gap-3">
                                                              <span className="font-black">
                                                                {
                                                                  option.key
                                                                }
                                                                .
                                                              </span>

                                                              <span className="flex-1">
                                                                {
                                                                  option.text
                                                                }
                                                              </span>

                                                              {correct && (
                                                                <span className="text-xs font-black text-emerald-700">
                                                                  Correct
                                                                </span>
                                                              )}

                                                              {selected &&
                                                                !correct && (
                                                                  <span className="text-xs font-black text-red-700">
                                                                    Your
                                                                    answer
                                                                  </span>
                                                                )}
                                                            </div>
                                                          </div>
                                                        );
                                                      },
                                                    )}
                                                  </div>
                                                )}

                                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                  <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                                    <div className="text-xs font-black uppercase tracking-wide text-red-600">
                                                      Your Answer
                                                    </div>

                                                    <div className="mt-1 text-sm font-bold text-red-900">
                                                      {answerText(
                                                        review,
                                                        index,
                                                        question.selectedAnswers,
                                                      )}
                                                    </div>
                                                  </div>

                                                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                                    <div className="text-xs font-black uppercase tracking-wide text-emerald-600">
                                                      Correct Answer
                                                    </div>

                                                    <div className="mt-1 text-sm font-bold text-emerald-900">
                                                      {answerText(
                                                        review,
                                                        index,
                                                        question.correctAnswers,
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>

                                                {question.explanation && (
                                                  <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-4">
                                                    <div className="text-xs font-black uppercase tracking-wide text-violet-600">
                                                      Explanation
                                                    </div>

                                                    <p className="mt-1 text-sm font-semibold leading-6 text-violet-950">
                                                      {
                                                        question.explanation
                                                      }
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      )}
                                    </>
                                  )}
                              </div>
                            )}

                            {isExpanded && (
                              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  <div>
                                    <div className="text-xs font-bold text-slate-500">
                                      Passing Percentage
                                    </div>

                                    <div className="mt-1 text-sm font-black text-slate-900">
                                      {item.exam?.passingPercentage ??
                                        0}
                                      %
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs font-bold text-slate-500">
                                      Average Score
                                    </div>

                                    <div className="mt-1 text-sm font-black text-slate-900">
                                      {summary.averagePercentage.toFixed(
                                        1,
                                      )}
                                      %
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs font-bold text-slate-500">
                                      Attempted
                                    </div>

                                    <div className="mt-1 text-sm font-black text-slate-900">
                                      {item.attemptedQuestions}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs font-bold text-slate-500">
                                      Re-entry
                                    </div>

                                    <div className="mt-1 text-sm font-black text-slate-900">
                                      {item.reentryLocked
                                        ? "Locked"
                                        : "Available"}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-5 flex items-center gap-2 text-sm font-bold">
                                  {item.passed ? (
                                    <>
                                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                                      <span className="text-emerald-700">
                                        You passed this examination.
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-5 w-5 text-red-600" />

                                      <span className="text-red-700">
                                        You did not meet the passing
                                        percentage.
                                      </span>
                                    </>
                                  )}
                                </div>

                                {item.terminationReason && (
                                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                    Termination note:{" "}
                                    {item.terminationReason}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm font-bold text-slate-500">
                        Page {currentPage} of {totalPages}
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.max(1, page - 1),
                            )
                          }
                          className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            Previous
                          </span>
                        </button>

                        <div className="flex items-center gap-1">
                          {pageNumbers.map((page) => (
                            <button
                              key={page}
                              type="button"
                              onClick={() =>
                                setCurrentPage(page)
                              }
                              className={`h-10 min-w-10 rounded-xl px-3 text-sm font-black transition ${
                                currentPage === page
                                  ? "bg-violet-600 text-white"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.min(totalPages, page + 1),
                            )
                          }
                          className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="hidden sm:inline">
                            Next
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

  );
}
