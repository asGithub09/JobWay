"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import StudentPortalShell from "@/components/student-portal/StudentPortalShell";
import {
  getMyCourses,
  type GetMyCoursesResponse,
} from "@/lib/api";

type StudentCourseItem = GetMyCoursesResponse["courses"][number];

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getCourseImage(course: StudentCourseItem["course"]) {
  return (
    course.bannerImage ||
    "/images/course-placeholder.svg"
  );
}

function CourseCard({
  item,
}: {
  item: StudentCourseItem;
}) {
  const course = item.course;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl">
      {/* Course Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={getCourseImage(course)}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(event) => {
            const image = event.currentTarget;

            if (
              image.src.endsWith(
                "/images/course-placeholder.svg",
              )
            ) {
              image.style.display = "none";
              return;
            }

            image.src = "/images/course-placeholder.svg";
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/70 to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-600 shadow-sm backdrop-blur">
            My Course
          </span>

          {course.isFeatured ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-sm">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          ) : null}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xs font-semibold text-white/80">
            Assigned {formatDate(item.assignedAt)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-red-500">
              {course.category || "Course"}
            </p>

            <h2 className="line-clamp-2 text-lg font-black leading-snug text-slate-900">
              {course.title}
            </h2>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        {course.description ? (
          <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">
            {course.description}
          </p>
        ) : (
          <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-400">
            Continue your learning journey with this course.
          </p>
        )}

        {/* Meta */}
        <div className="mb-5 flex flex-wrap gap-2">
          {course.level ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600">
              <GraduationCap className="h-3.5 w-3.5" />
              {course.level}
            </span>
          ) : null}

          {course.duration ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600">
              <Clock3 className="h-3.5 w-3.5" />
              {course.duration}
            </span>
          ) : null}

          {course.language ? (
            <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600">
              {course.language}
            </span>
          ) : null}
        </div>

        {/* CTA */}
        <Link
          href={`/dashboard/courses/${encodeURIComponent(course.slug)}`}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E13032] px-4 py-3 text-sm font-black text-white shadow-[0_8px_20px_rgba(225,48,50,0.18)] transition-all duration-200 hover:bg-[#c92729] hover:shadow-[0_10px_24px_rgba(225,48,50,0.24)]"
        >
          Continue Learning
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="aspect-[16/9] animate-pulse bg-slate-200" />

          <div className="space-y-4 p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <BookOpen className="h-7 w-7" />
      </div>

      <h2 className="text-xl font-black text-slate-900">
        No courses assigned yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Your courses will appear here when an administrator assigns
        them to your current batch.
      </p>

      <Link
        href="/courses"
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        Browse Courses
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-3xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <RefreshCw className="h-6 w-6" />
      </div>

      <h2 className="text-lg font-black text-slate-900">
        Unable to load your courses
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#c92729]"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}

export default function MyCoursesPage() {
  const [data, setData] =
    useState<GetMyCoursesResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const response = await getMyCourses();

      if (!response?.success) {
        throw new Error(
          "Unable to load your assigned courses.",
        );
      }

      setData(response);
    } catch (err) {
      console.error("My courses load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your courses.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  const courses = data?.courses ?? [];

  const filteredCourses = courses.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const course = item.course;

    return [
      course.title,
      course.category,
      course.level,
      course.instructor,
      course.language,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(query),
      );
  });

  return (
    <StudentPortalShell>
      <main className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-red-600">
                  <BookOpen className="h-3.5 w-3.5" />
                  Student Learning
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  My Courses
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Access the courses assigned to your current
                  batch and continue your preparation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadCourses()}
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() => void loadCourses()}
            />
          ) : (
            <>
              {/* Batch + Stats */}
              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Current Batch
                      </p>

                      <p className="mt-2 text-lg font-black text-slate-900">
                        {data?.batch?.name ||
                          "No active batch"}
                      </p>

                      {data?.batch?.code ? (
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {data.batch.code}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <Layers3 className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Assigned Courses
                      </p>

                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {courses.length}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Available to you
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Learning Access
                      </p>

                      <p className="mt-2 text-lg font-black text-emerald-600">
                        Active
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Batch-based access enabled
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              {courses.length > 0 ? (
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Your Learning Library
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {filteredCourses.length}{" "}
                      {filteredCourses.length === 1
                        ? "course"
                        : "courses"}{" "}
                      shown
                    </p>
                  </div>

                  <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search your courses..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
                    />
                  </div>
                </div>
              ) : null}

              {/* Course Grid */}
              {courses.length === 0 ? (
                <EmptyState />
              ) : filteredCourses.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Search className="h-6 w-6" />
                  </div>

                  <h2 className="text-lg font-black text-slate-900">
                    No matching courses
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Try a different course name, category, or
                    keyword.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 text-sm font-black text-red-600 hover:text-red-700"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredCourses.map((item) => (
                    <CourseCard
                      key={item.assignmentId}
                      item={item}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </StudentPortalShell>
  );
}