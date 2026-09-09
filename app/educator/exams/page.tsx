"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

type ExamStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type AccessType = "FREE" | "PREMIUM";

type EducatorExam = {
  id: string;
  title: string;
  shortName?: string;
  category?: string;
  subject?: string;
  topic?: string;
  durationMinutes?: number;
  questionCount?: number;
  totalMarks?: number;
  accessType: AccessType;
  status: ExamStatus;
  attemptCount?: number;
  completionCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE_URL = "/api";

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("jobway_token");
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function AccessBadge({ type }: { type: AccessType }) {
  if (type === "PREMIUM") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        Premium
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      Free
    </span>
  );
}

function StatusBadge({ status }: { status: ExamStatus }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        Published
      </span>
    );
  }

  if (status === "ARCHIVED") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        Archived
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
      <Clock3 size={13} />
      Draft
    </span>
  );
}

export default function EducatorExamsPage() {
  const [exams, setExams] = useState<EducatorExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "FREE" | "PREMIUM" | "DRAFT" | "PUBLISHED"
  >("ALL");

  const loadExams = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = getStoredToken();

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_BASE_URL}/educator/exams`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load exams.",
        );
      }

      setExams(
        Array.isArray(data?.exams)
          ? data.exams
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load exams.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const stats = useMemo(() => {
    return {
      all: exams.length,
      free: exams.filter(
        (exam) => exam.accessType === "FREE",
      ).length,
      premium: exams.filter(
        (exam) => exam.accessType === "PREMIUM",
      ).length,
      drafts: exams.filter(
        (exam) => exam.status === "DRAFT",
      ).length,
      published: exams.filter(
        (exam) => exam.status === "PUBLISHED",
      ).length,
    };
  }, [exams]);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch =
        !query ||
        exam.title?.toLowerCase().includes(query) ||
        exam.category?.toLowerCase().includes(query) ||
        exam.subject?.toLowerCase().includes(query) ||
        exam.topic?.toLowerCase().includes(query);

      let matchesFilter = true;

      if (filter === "FREE") {
        matchesFilter =
          exam.accessType === "FREE";
      }

      if (filter === "PREMIUM") {
        matchesFilter =
          exam.accessType === "PREMIUM";
      }

      if (filter === "DRAFT") {
        matchesFilter =
          exam.status === "DRAFT";
      }

      if (filter === "PUBLISHED") {
        matchesFilter =
          exam.status === "PUBLISHED";
      }

      return matchesSearch && matchesFilter;
    });
  }, [exams, search, filter]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <GraduationCap size={17} />
              Educator EMS
              <span>/</span>
              Exams
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Exam Management
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Create, manage and publish examinations for your
              students and assigned batches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadExams(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            <Link
              href="/educator/exams/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Create Exam
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="All Exams"
            value={stats.all}
            icon={FileText}
          />

          <StatCard
            label="Free Exams"
            value={stats.free}
            icon={BookOpen}
          />

          <StatCard
            label="Premium"
            value={stats.premium}
            icon={ShieldCheck}
          />

          <StatCard
            label="Drafts"
            value={stats.drafts}
            icon={Clock3}
          />

          <StatCard
            label="Published"
            value={stats.published}
            icon={CheckCircle2}
          />
        </div>

        {/* Main panel */}
        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Your Exams
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your exam drafts and published tests.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search exams..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white sm:w-64"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(
                      event.target.value as typeof filter,
                    )
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="ALL">
                    All Exams
                  </option>
                  <option value="FREE">
                    Free
                  </option>
                  <option value="PREMIUM">
                    Premium
                  </option>
                  <option value="DRAFT">
                    Drafts
                  </option>
                  <option value="PUBLISHED">
                    Published
                  </option>
                </select>
              </div>
            </div>
          </div>

          {error ? (
            <div className="p-6">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Unable to load exams
                </p>
                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadExams()}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
              <p className="mt-3 text-sm text-slate-500">
                Loading your exams...
              </p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <FileText size={25} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                {exams.length === 0
                  ? "No exams created yet"
                  : "No exams found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {exams.length === 0
                  ? "Create your first exam to start building your Educator EMS."
                  : "Try changing your search or filter."}
              </p>

              {exams.length === 0 && (
                <Link
                  href="/educator/exams/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={17} />
                  Create First Exam
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Exam
                      </th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Access
                      </th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Questions
                      </th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Attempts
                      </th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredExams.map((exam) => (
                      <tr
                        key={exam.id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="max-w-md">
                            <p className="font-semibold text-slate-950">
                              {exam.title}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              {exam.category && (
                                <span>
                                  {exam.category}
                                </span>
                              )}

                              {exam.subject && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {exam.subject}
                                  </span>
                                </>
                              )}

                              <span>•</span>

                              <span>
                                Updated{" "}
                                {formatDate(
                                  exam.updatedAt,
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <AccessBadge
                            type={
                              exam.accessType
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {exam.questionCount ?? 0}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                            <Users size={15} />
                            {exam.attemptCount ?? 0}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={exam.status}
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/educator/exams/${exam.id}`}
                            className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {exam.title}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {exam.category || "General"}
                          {exam.subject
                            ? ` • ${exam.subject}`
                            : ""}
                        </p>
                      </div>

                      <StatusBadge
                        status={exam.status}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <AccessBadge
                        type={exam.accessType}
                      />

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {exam.questionCount ?? 0} Questions
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {exam.attemptCount ?? 0} Attempts
                      </span>
                    </div>

                    <Link
                      href={`/educator/exams/${exam.id}`}
                      className="mt-4 flex h-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Manage Exam
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}