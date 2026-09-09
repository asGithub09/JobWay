"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FilePlus2,
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

type CourseStatus = "DRAFT" | "PUBLISHED";

interface EducatorCourse {
  id: string;
  draftId?: string | null;
  title: string;
  slug: string;
  category: string;
  level: string;
  description: string;
  bannerImage: string;
  duration: string;
  language: string;
  price: number;
  discountPrice: number;
  features: string[];
  modules: unknown[];
  status: CourseStatus;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE_URL = "/api";

export default function EducatorCoursesPage() {
  const { user, token } = useAuth();

  const [courses, setCourses] = useState<EducatorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | CourseStatus>("ALL");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/educator/courses`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load courses."
        );
      }

      setCourses(
        Array.isArray(data?.courses)
          ? data.courses
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load educator courses."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "educator") {
      fetchCourses();
    }
  }, [user?.role, fetchCourses]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.level.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        course.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [courses, search, statusFilter]);

  const draftCount = courses.filter(
    (course) => course.status === "DRAFT"
  ).length;

  const publishedCount = courses.filter(
    (course) => course.status === "PUBLISHED"
  ).length;

  const handlePublish = async (
    course: EducatorCourse
  ) => {
    const confirmed = window.confirm(
      `Publish "${course.title}"?\n\nOnce published, this course cannot be edited or deleted in the current educator workflow.`
    );

    if (!confirmed) return;

    setActionLoading(`publish-${course.id}`);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/educator/courses/${course.id}/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to publish course."
        );
      }

      setCourses((current) =>
        current.map((item) =>
          item.id === course.id
            ? data.course
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish course."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (
    course: EducatorCourse
  ) => {
    const confirmed = window.confirm(
      `Delete "${course.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoading(`delete-${course.id}`);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/educator/courses/${course.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete course."
        );
      }

      setCourses((current) =>
        current.filter(
          (item) => item.id !== course.id
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete course."
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <section className="mb-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#E13032]">
                <GraduationCap className="h-3.5 w-3.5" />
                Course Management
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Your Courses
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Create, organize and publish courses from your educator
                workspace.
              </p>
            </div>

            <Link
              href="/educator/courses/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-100 transition hover:bg-[#c92729]"
            >
              <Plus className="h-4 w-4" />
              Create Course
            </Link>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                All Courses
              </span>
              <BookOpen className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-3 text-3xl font-black text-slate-950">
              {courses.length}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-amber-600">
                Drafts
              </span>
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>

            <div className="mt-3 text-3xl font-black text-slate-950">
              {draftCount}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
                Published
              </span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="mt-3 text-3xl font-black text-slate-950">
              {publishedCount}
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search courses, categories or levels..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                ["ALL", "DRAFT", "PUBLISHED"] as const
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(status)
                  }
                  className={[
                    "rounded-xl px-4 py-2.5 text-xs font-black transition",
                    statusFilter === status
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  ].join(" ")}
                >
                  {status === "ALL"
                    ? "All"
                    : status === "DRAFT"
                      ? "Drafts"
                      : "Published"}
                </button>
              ))}

              <button
                type="button"
                onClick={fetchCourses}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={[
                    "h-4 w-4",
                    loading ? "animate-spin" : "",
                  ].join(" ")}
                />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-[#E13032]" />

              <p className="text-sm font-semibold">
                Loading your courses...
              </p>
            </div>
          </section>
        ) : filteredCourses.length === 0 ? (
          <section className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#E13032]">
              <GraduationCap className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              {courses.length === 0
                ? "No courses yet"
                : "No matching courses"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {courses.length === 0
                ? "Create your first educator course and start building its curriculum."
                : "Try a different search term or change the course status filter."}
            </p>

            {courses.length === 0 && (
              <Link
                href="/educator/courses/create"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c92729]"
              >
                <FilePlus2 className="h-4 w-4" />
                Create Your First Course
              </Link>
            )}
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <article
                key={course.id}
                className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
              >
                <div className="relative flex h-36 items-end overflow-hidden bg-gradient-to-br from-slate-950 via-slate-800 to-red-900 p-5">
                  {course.bannerImage ? (
                    <img
                      src={course.bannerImage}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="absolute inset-0 opacity-20">
                      <GraduationCap className="absolute -bottom-8 -right-3 h-36 w-36" />
                    </div>
                  )}

                  <div className="relative z-10 flex w-full items-end justify-between gap-3">
                    <span
                      className={[
                        "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em]",
                        course.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700",
                      ].join(" ")}
                    >
                      {course.status}
                    </span>

                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black text-slate-700">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-2 text-lg font-black leading-6 text-slate-950">
                    {course.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                    {course.description ||
                      "No course description added yet."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                      {course.level}
                    </span>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                      {course.duration}
                    </span>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                      {course.modules?.length || 0} modules
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <Link
                      href={
                        course.status === "DRAFT" &&
                        course.draftId
                          ? `/educator/courses/review/${course.draftId}`
                          : `/educator/courses/${course.id}`
                      }
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      Manage Course
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {course.status === "DRAFT" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handlePublish(course)
                          }
                          disabled={
                            actionLoading !== null
                          }
                          className="inline-flex items-center justify-center rounded-xl bg-emerald-50 px-3 py-2.5 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Publish course"
                        >
                          {actionLoading ===
                          `publish-${course.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(course)
                          }
                          disabled={
                            actionLoading !== null
                          }
                          className="inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-2.5 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete course"
                        >
                          {actionLoading ===
                          `delete-${course.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    )}

                    {course.status === "PUBLISHED" && (
                      <span
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
                        title="Published course"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  {course.updatedAt && (
                    <p className="mt-4 text-[11px] font-medium text-slate-400">
                      Updated{" "}
                      {new Date(
                        course.updatedAt
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="mt-8 rounded-[24px] border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Upload className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-950">
                Course material workflow
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                PDF/DOCX material import and curriculum
                generation will be connected to this educator
                course workflow after the core course management
                flow is verified.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}