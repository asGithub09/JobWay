"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { request } from "@/lib/api";

type Status = "DRAFT" | "PUBLISHED";

type Course = {
  id: string;
  source?: "LEGACY" | "V2";
  draftId?: string | null;
  title: string;
  category: string;
  level: string;
  description: string;
  modules?: unknown[];
  status: Status;
  publishedAt?: string | null;
  updatedAt?: string;
};

const API = "/api";

export default function EducatorCoursesPage() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const legacyPromise = fetch(`${API}/educator/courses`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load legacy courses.");
        }

        return Array.isArray(data?.courses) ? data.courses : [];
      });

      const v2Promise = request<{
        success?: boolean;
        courses?: Array<{
          _id: string;
          title: string;
          category?: string;
          level?: string;
          language?: string;
          status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
          createdAt?: string;
          updatedAt?: string;
          isLandingPagePublished?: boolean;
        }>;
      }>("/courses-v2", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const [legacyCourses, v2Data] = await Promise.all([
        legacyPromise,
        v2Promise,
      ]);

      const normalizedV2Courses: Course[] = (v2Data.courses || [])
        .filter(
          (course) =>
            course.status === "DRAFT" ||
            course.status === "PUBLISHED"
        )
        .map((course) => ({
          id: course._id,
          source: "V2",
          title: course.title,
          category: course.category || "",
          level: course.level || "",
          description: "",
          status:
            course.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
          updatedAt: course.updatedAt || course.createdAt,
          publishedAt:
            course.status === "PUBLISHED"
              ? course.updatedAt || course.createdAt
              : null,
        }));

      const normalizedLegacyCourses: Course[] = legacyCourses.map(
        (course: Course) => ({
          ...course,
          source: "LEGACY",
        })
      );

      setCourses([
        ...normalizedV2Courses,
        ...normalizedLegacyCourses,
      ]);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "educator") load();
  }, [user?.role, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter(
      (c) =>
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const drafts = filtered.filter((c) => c.status === "DRAFT");
  const published = filtered.filter((c) => c.status === "PUBLISHED");

  const publish = async (course: Course) => {
    if (
      !window.confirm(
        `Publish "${course.title}"?\n\nOnce published, students may receive access immediately.`
      )
    )
      return;

    setBusy(`p-${course.id}`);
    setError("");

    try {
      if (course.source === "V2") {
        const data = await request<{
          success?: boolean;
          message?: string;
          course?: unknown;
        }>(
          `/courses-v2/${encodeURIComponent(course.id)}/publish`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to publish.");
        }

        setCourses((all) =>
          all.map((c) =>
            c.id === course.id
              ? {
                  ...c,
                  status: "PUBLISHED",
                  publishedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );

        return;
      }

      const res = await fetch(`${API}/educator/courses/${course.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to publish.");

      setCourses((all) =>
        all.map((c) => (c.id === course.id ? data.course : c))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to publish course.");
    } finally {
      setBusy(null);
    }
  };
  const remove = async (course: Course) => {
    const publishedWarning =
      course.status === "PUBLISHED"
        ? "\n\n⚠️ This course is published and may already be available to students."
        : "";

    if (
      !window.confirm(
        `Delete "${course.title}"?${publishedWarning}\n\nThis action cannot be undone.`
      )
    )
      return;

    setBusy(`d-${course.id}`);
    setError("");

    try {
      if (course.source === "V2") {
        const data = await request<{
          success?: boolean;
          message?: string;
        }>(
          `/courses-v2/${encodeURIComponent(course.id)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to delete.");
        }

        setCourses((all) => all.filter((c) => c.id !== course.id));
        return;
      }

      const res = await fetch(`${API}/educator/courses/${course.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to delete.");

      setCourses((all) => all.filter((c) => c.id !== course.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete course.");
    } finally {
      setBusy(null);
    }
  };
  const date = (value?: string | null) =>
    value
      ? new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const row = (course: Course) => (
    <div
      key={course.id}
      className="group flex items-center gap-4 rounded-2xl border border-white/60 bg-white/45 px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/65 hover:shadow-[0_12px_35px_rgba(15,23,42,.10)]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/60 text-slate-600">
        {course.status === "PUBLISHED" ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Clock3 className="h-5 w-5" />
        )}
      </div>

      <Link
        href={
          course.source === "V2"
            ? `/educator/courses/builder?id=${encodeURIComponent(course.id)}`
            : course.status === "DRAFT" && course.draftId
              ? `/educator/courses/review/${course.draftId}`
              : `/educator/courses/${course.id}`
        }
        className="min-w-0 flex-1"
      >
        <div className="truncate text-sm font-bold text-slate-900">
          {course.title}
        </div>
        <div className="mt-1 text-xs font-medium text-slate-400">
          {course.status === "PUBLISHED" ? "Published" : "Draft"} ·{" "}
          {date(course.publishedAt || course.updatedAt)}
        </div>
      </Link>

      <Link
        href={
          course.source === "V2"
            ? `/educator/courses/builder?id=${encodeURIComponent(course.id)}`
            : course.status === "DRAFT" && course.draftId
              ? `/educator/courses/review/${course.draftId}`
              : `/educator/courses/${course.id}`
        }
        className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/55 text-slate-500 transition hover:bg-white sm:flex"
        title="Open course"
      >
        <ArrowRight className="h-4 w-4" />
      </Link>

      {course.status === "DRAFT" && (
        <>
          <button
            onClick={() => publish(course)}
            disabled={!!busy}
            className="hidden rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 sm:block"
          >
            {busy === `p-${course.id}` ? "..." : "Publish"}
          </button>

          <button
            onClick={() => remove(course)}
            disabled={!!busy}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200/60 bg-red-50/60 text-red-500 transition hover:bg-red-100"
            title="Delete"
          >
            {busy === `d-${course.id}` ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </>
      )}

      {course.status === "PUBLISHED" && (
        <button
          onClick={() => remove(course)}
          disabled={!!busy}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200/50 bg-white/45 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          title="Delete published course"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffffff,transparent_45%),linear-gradient(135deg,#eef2f7,#f8fafc_50%,#edf1f6)] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-xs font-black uppercase tracking-[.2em] text-slate-400">
              Educator Workspace
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              My Courses
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, refine and manage your courses.
            </p>
          </div>

          <Link
            href="/educator/courses/builder"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/60 px-5 py-3 text-sm font-bold text-slate-800 shadow-[0_8px_25px_rgba(15,23,42,.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </Link>
        </header>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-2xl border border-white/80 bg-white/55 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-[0_6px_20px_rgba(15,23,42,.05)] outline-none backdrop-blur-xl transition focus:bg-white/80 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/55 px-4 py-3 text-sm font-bold text-slate-600 backdrop-blur-xl transition hover:bg-white/80"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/70 bg-white/45 backdrop-blur-xl">
            <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="space-y-7">
            <section>
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-black text-slate-800">Drafts</h2>
                  <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-black text-slate-400">
                    {drafts.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {drafts.length ? (
                  drafts.map(row)
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/35 px-5 py-8 text-center text-sm text-slate-400 backdrop-blur-xl">
                    No drafts.
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2 px-1">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-black text-slate-800">
                  Published Courses
                </h2>
                <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-black text-slate-400">
                  {published.length}
                </span>
              </div>

              <div className="space-y-2">
                {published.length ? (
                  published.map(row)
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/35 px-5 py-8 text-center text-sm text-slate-400 backdrop-blur-xl">
                    No published courses.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}









