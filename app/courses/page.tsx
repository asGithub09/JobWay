"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Languages,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCourses, type Course } from "@/lib/api";

/* =========================================================
   HELPERS
   ========================================================= */

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

/* =========================================================
   COURSE BANNER
   ========================================================= */

function CourseBanner({
  course,
  large = false,
}: {
  course: Course;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!course.bannerImage || failed) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#fff1f2] via-white to-[#f3e8ff]">
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-red-200/40 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-violet-200/50 blur-3xl" />

        <div className="relative flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-white bg-white/90 shadow-xl">
            <BookOpen
              className={
                large
                  ? "h-10 w-10 text-[#E13032]"
                  : "h-8 w-8 text-[#E13032]"
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={course.bannerImage}
      alt={course.title}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
    />
  );
}

/* =========================================================
   META ITEM
   ========================================================= */

function MetaItem({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
      {icon}
      {children}
    </span>
  );
}

/* =========================================================
   COURSE CARD
   ========================================================= */

function CourseCard({ course }: { course: Course }) {
  const price =
    course.discountPrice > 0 ? course.discountPrice : course.price;

  const discounted =
    course.price > 0 &&
    course.discountPrice > 0 &&
    course.price > course.discountPrice;

  const discountPercent = discounted
    ? Math.round(
        ((course.price - course.discountPrice) / course.price) * 100,
      )
    : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.055)] transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      {/* IMAGE */}
      <Link
        href={`/courses/${course.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-slate-100"
      >
        <CourseBanner course={course} />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-800 shadow-sm backdrop-blur">
              {course.category || "Course"}
            </span>

            {course.isFeatured ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-slate-950/90 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-sm backdrop-blur">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            ) : null}
          </div>

          {discounted ? (
            <span className="shrink-0 rounded-full bg-[#E13032] px-3 py-1.5 text-[11px] font-extrabold text-white shadow-lg">
              -{discountPercent}%
            </span>
          ) : null}
        </div>
      </Link>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700">
            {course.level || "All Levels"}
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-current" />
            4.8
          </span>
        </div>

        <Link href={`/courses/${course.slug}`}>
          <h3 className="mt-4 line-clamp-2 text-xl font-extrabold leading-tight tracking-tight text-slate-950 transition-colors group-hover:text-[#c9282a]">
            {course.title}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
          {course.description ||
            "Structured learning designed to help you prepare with confidence."}
        </p>

        {/* COURSE META */}
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
          <MetaItem
            icon={<Clock3 className="h-3.5 w-3.5 text-violet-600" />}
          >
            {course.duration || "Flexible"}
          </MetaItem>

          <MetaItem
            icon={<Languages className="h-3.5 w-3.5 text-blue-600" />}
          >
            {course.language || "English"}
          </MetaItem>

          <MetaItem
            icon={<Users className="h-3.5 w-3.5 text-emerald-600" />}
          >
            {formatNumber(course.enrolledCount)} learners
          </MetaItem>
        </div>

        {/* PRICE + CTA */}
        <div className="mt-auto pt-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              {price > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-950">
                    ₹{formatNumber(price)}
                  </span>

                  {discounted ? (
                    <span className="text-sm font-medium text-slate-400 line-through">
                      ₹{formatNumber(course.price)}
                    </span>
                  ) : null}
                </div>
              ) : (
                <span className="text-base font-extrabold text-emerald-600">
                  Free
                </span>
              )}
            </div>

            <span className="max-w-[150px] truncate text-xs font-semibold text-slate-400">
              {course.instructor || "JobWay Faculty"}
            </span>
          </div>

          <Link
            href={`/courses/${course.slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-[#E13032]"
          >
            Explore Course
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   FEATURED COURSE
   ========================================================= */

function FeaturedCourse({ course }: { course: Course }) {
  const price =
    course.discountPrice > 0 ? course.discountPrice : course.price;

  const discounted =
    course.price > 0 &&
    course.discountPrice > 0 &&
    course.price > course.discountPrice;

  const discountPercent = discounted
    ? Math.round(
        ((course.price - course.discountPrice) / course.price) * 100,
      )
    : 0;

  return (
    <article className="group relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.09)]">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-100/70 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-red-100/50 blur-3xl" />

      <div className="relative grid lg:grid-cols-[1.05fr_0.95fr]">
        {/* IMAGE */}
        <div className="relative min-h-[280px] overflow-hidden lg:min-h-[390px]">
          <CourseBanner course={course} large />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent p-6 lg:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-slate-900 shadow">
                {course.category || "Featured Course"}
              </span>

              {course.level ? (
                <span className="rounded-full bg-slate-950/90 px-3 py-1.5 text-xs font-bold text-white">
                  {course.level}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#B51F22]">
            <Sparkles className="h-3.5 w-3.5" />
            Featured Learning Program
          </div>

          <h3 className="mt-5 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
            {course.title}
          </h3>

          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600 sm:text-base">
            {course.description ||
              "Build your preparation with structured lessons, focused resources and a clear learning path."}
          </p>

          {/* STATS */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Rating
              </div>

              <p className="mt-1 text-sm font-extrabold text-slate-900">
                4.8 / 5
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Users className="h-3.5 w-3.5 text-violet-600" />
                Learners
              </div>

              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {formatNumber(course.enrolledCount)}+
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Clock3 className="h-3.5 w-3.5 text-blue-600" />
                Duration
              </div>

              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {course.duration || "Flexible"}
              </p>
            </div>
          </div>

          {/* PRICE */}
          <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {price > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-3xl font-black tracking-tight text-slate-950">
                    ₹{formatNumber(price)}
                  </span>

                  {discounted ? (
                    <>
                      <span className="text-sm text-slate-400 line-through">
                        ₹{formatNumber(course.price)}
                      </span>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        Save {discountPercent}%
                      </span>
                    </>
                  ) : null}
                </div>
              ) : (
                <span className="text-lg font-extrabold text-emerald-600">
                  Free Access
                </span>
              )}

              <p className="mt-1 text-xs text-slate-400">
                By {course.instructor || "JobWay Faculty"}
              </p>
            </div>

            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E13032] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(225,48,50,0.22)] transition hover:bg-[#c9282a] hover:shadow-[0_14px_30px_rgba(225,48,50,0.28)]"
            >
              View Course
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   LOADING SKELETON
   ========================================================= */

function CourseSkeletons() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"
        >
          <div className="aspect-[16/9] animate-pulse bg-slate-100" />

          <div className="space-y-4 p-6">
            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
            <div className="h-7 w-4/5 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyCourses() {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-red-50 to-violet-50">
        <GraduationCap className="h-9 w-9 text-[#E13032]" />
      </div>

      <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950">
        Your learning journey starts soon
      </h2>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
        We&apos;re preparing new JobWay learning programs. Check back soon
        for upcoming courses.
      </p>
    </div>
  );
}

/* =========================================================
   NO SEARCH RESULTS
   ========================================================= */

function NoResults({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Search className="h-7 w-7 text-slate-500" />
      </div>

      <h2 className="mt-5 text-2xl font-black text-slate-950">
        No courses found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Try a different search term or clear your filters to explore all
        available learning programs.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-[#E13032]"
      >
        Reset Filters
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  );
}

/* =========================================================
   COURSES PAGE
   ========================================================= */

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  /* =======================================================
     LOAD COURSES
     ======================================================= */

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const response = await getCourses();

      setCourses(
        Array.isArray(response.courses)
          ? response.courses.filter(
              (course) => course.isPublished !== false,
            )
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load courses.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const response = await getCourses();

        if (!cancelled) {
          setCourses(
            Array.isArray(response.courses)
              ? response.courses.filter(
                  (course) => course.isPublished !== false,
                )
              : [],
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load courses.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     CATEGORIES
     ======================================================= */

  const categories = useMemo(() => {
    const values = courses
      .map((course) => course.category?.trim())
      .filter(Boolean) as string[];

    return ["All", ...Array.from(new Set(values))];
  }, [courses]);

  /* =======================================================
     LEVELS
     ======================================================= */

  const levels = useMemo(() => {
    const values = courses
      .map((course) => course.level?.trim())
      .filter(Boolean) as string[];

    return ["All", ...Array.from(new Set(values))];
  }, [courses]);

  /* =======================================================
     FILTER COURSES
     ======================================================= */

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses.filter((course) => {
      const searchable = [
        course.title,
        course.category,
        course.level,
        course.description,
        course.instructor,
        course.language,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (category === "All" || course.category === category) &&
        (level === "All" || course.level === level)
      );
    });
  }, [courses, search, category, level]);

  /* =======================================================
     FEATURED COURSE
     ======================================================= */

  const featured =
    filteredCourses.find((course) => course.isFeatured) ||
    filteredCourses[0];

  const otherCourses = featured
    ? filteredCourses.filter((course) => course.id !== featured.id)
    : [];

  /* =======================================================
     GLOBAL COURSE STATS
     ======================================================= */

  const learnerCount = courses.reduce(
    (total, course) => total + (course.enrolledCount || 0),
    0,
  );

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setLevel("All");
  };

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* =====================================================
          EXISTING JOBWAY WEBSITE HEADER
         ===================================================== */}

      <SiteHeader />

      {/* =====================================================
          HERO
         ===================================================== */}

      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-red-100/60 blur-3xl" />

          <div className="absolute right-[-180px] top-[-100px] h-[500px] w-[500px] rounded-full bg-violet-100/70 blur-3xl" />

          <div className="absolute bottom-[-220px] left-[40%] h-[400px] w-[400px] rounded-full bg-blue-100/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_380px]">
            {/* HERO COPY */}

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#B51F22]">
                <Sparkles className="h-3.5 w-3.5" />
                JobWay Learning Hub
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
                Your preparation
                <span className="block">
                  deserves a{" "}
                  <span className="bg-gradient-to-r from-[#E13032] via-[#c42ad9] to-violet-700 bg-clip-text text-transparent">
                    better path.
                  </span>
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Discover focused courses, structured learning programs and
                exam-ready preparation designed around your career goals.
              </p>

              {/* SEARCH */}

              <div className="mt-8 max-w-2xl">
                <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="What do you want to learn?"
                    className="h-12 w-full rounded-xl bg-slate-50 pl-12 pr-12 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:ring-4 focus:ring-violet-100 sm:text-base"
                  />

                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* HERO STATS */}

              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                <div>
                  <p className="text-2xl font-black text-slate-950">
                    {courses.length}+
                  </p>

                  <p className="text-xs font-semibold text-slate-500">
                    Learning programs
                  </p>
                </div>

                <div className="h-8 w-px bg-slate-200" />

                <div>
                  <p className="text-2xl font-black text-slate-950">
                    {formatNumber(learnerCount)}+
                  </p>

                  <p className="text-xs font-semibold text-slate-500">
                    Learners enrolled
                  </p>
                </div>

                <div className="h-8 w-px bg-slate-200" />

                <div>
                  <p className="text-2xl font-black text-slate-950">
                    {Math.max(categories.length - 1, 0)}
                  </p>

                  <p className="text-xs font-semibold text-slate-500">
                    Exam categories
                  </p>
                </div>
              </div>
            </div>

            {/* HERO VISUAL */}

            <div className="hidden lg:block">
              <div className="relative mx-auto h-[350px] w-full max-w-[360px]">
                <div className="absolute right-0 top-3 h-[300px] w-[290px] rotate-3 rounded-[34px] bg-gradient-to-br from-[#E13032] to-violet-700 shadow-[0_35px_80px_rgba(89,43,120,0.22)]" />

                <div className="absolute left-0 top-10 w-[300px] rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
                      <GraduationCap className="h-6 w-6 text-[#E13032]" />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      Learning
                    </span>
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Your learning journey
                  </p>

                  <p className="mt-2 text-xl font-black tracking-tight text-slate-950">
                    Learn. Practice. Progress.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
                        <BookOpen className="h-4 w-4 text-violet-700" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Structured Courses
                        </p>

                        <p className="text-[11px] text-slate-500">
                          Learn at your pace
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                        <CheckCircle2 className="h-4 w-4 text-blue-700" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Exam-focused
                        </p>

                        <p className="text-[11px] text-slate-500">
                          Prepare with purpose
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-2 right-[-5px] rounded-2xl border border-white bg-white px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-950">
                        4.8/5
                      </p>

                      <p className="text-[10px] font-semibold text-slate-400">
                        Learner rating
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY NAVIGATION
         ===================================================== */}

      <section className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3">
            <span className="mr-1 hidden shrink-0 text-xs font-extrabold uppercase tracking-wider text-slate-400 sm:block">
              Explore:
            </span>

            {categories.map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={[
                    "shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition",
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
         ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* LOADING */}

        {loading ? (
          <CourseSkeletons />
        ) : error ? (
          /* ERROR */

          <div className="rounded-[30px] border border-red-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <RefreshCw className="h-7 w-7 text-[#E13032]" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              We couldn&apos;t load the learning hub
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadCourses}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c9282a]"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : courses.length === 0 ? (
          /* NO COURSES */

          <EmptyCourses />
        ) : filteredCourses.length === 0 ? (
          /* NO RESULTS */

          <NoResults onReset={resetFilters} />
        ) : (
          <>
            {/* =================================================
                FEATURED COURSE
               ================================================= */}

            {featured ? (
              <section>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#E13032]">
                      Start here
                    </p>

                    <h2 className="mt-2 text-3xl font-black tracking-[-0.025em] text-slate-950">
                      Featured for your preparation
                    </h2>
                  </div>
                </div>

                <FeaturedCourse course={featured} />
              </section>
            ) : null}

            {/* =================================================
                ALL COURSES
               ================================================= */}

            <section className="mt-14">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-600">
                    Learning programs
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-[-0.025em] text-slate-950">
                    Explore all courses
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  >
                    {levels.map((item) => (
                      <option key={item} value={item}>
                        {item === "All" ? "All Levels" : item}
                      </option>
                    ))}
                  </select>

                  <span className="hidden rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-500 sm:block">
                    {filteredCourses.length}{" "}
                    {filteredCourses.length === 1 ? "course" : "courses"}
                  </span>
                </div>
              </div>

              {otherCourses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {otherCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                  <p className="text-sm font-semibold text-slate-500">
                    This is the only course matching your current filters.
                  </p>
                </div>
              )}
            </section>

            {/* =================================================
                VALUE STRIP
               ================================================= */}

            <section className="mt-14">
              <div className="grid overflow-hidden rounded-[30px] border border-slate-200 bg-white sm:grid-cols-3">
                <div className="flex gap-4 p-6 sm:p-7">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                    <BookOpen className="h-5 w-5 text-[#E13032]" />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950">
                      Structured learning
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Focused programs designed around your preparation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-slate-100 p-6 sm:border-l sm:border-t-0 sm:p-7">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
                    <GraduationCap className="h-5 w-5 text-violet-700" />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950">
                      Exam-focused approach
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Learn with a clear path from concepts to preparation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-slate-100 p-6 sm:border-l sm:border-t-0 sm:p-7">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                    <Users className="h-5 w-5 text-blue-700" />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950">
                      Built for learners
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A simple experience that keeps your next action clear.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                FINAL CTA
               ================================================= */}

            <section className="relative mt-14 overflow-hidden rounded-[32px] bg-slate-950 px-6 py-12 sm:px-10 sm:py-14">
              <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />

              <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />

              <div className="relative max-w-2xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-300">
                  Your next step
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Don&apos;t just study.
                  <span className="block text-white/70">
                    Prepare with direction.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                  Choose a learning program, build your preparation and keep
                  moving toward your career goal with JobWay.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-slate-100"
                  >
                    Browse Courses
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <Link
                    href="/resources"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    Study Resources
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* =====================================================
          EXISTING JOBWAY WEBSITE FOOTER
         ===================================================== */}

      <SiteFooter />
    </div>
  );
}