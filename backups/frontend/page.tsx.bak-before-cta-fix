"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Globe2,
  GraduationCap,
  IndianRupee,
  Languages,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCourse, type Course } from "@/lib/api";

type CourseLesson = {
  title?: string;
  description?: string;
  content?: string;
  keyPoints?: string[];
  bullets?: string[];
  sourceSection?: string;
  order?: number;
};

type CourseModule = {
  title?: string;
  description?: string;
  order?: number;
  lessons?: CourseLesson[];
};

type CoursePracticeQuestion = {
  type?: string;
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  sourceSection?: string;
  order?: number;
};

type CoursePractice = {
  title?: string;
  type?: string;
  description?: string;
  questions?: CoursePracticeQuestion[];
  order?: number;
};

type CourseCurriculum = {
  modules?: CourseModule[];
  practice?: CoursePractice[];
  sourceFileName?: string;
  generationMode?: string;
  detectionMode?: string;
};

type ExtendedCourse = Course & {
  curriculum?: CourseCurriculum;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function getCourseCurriculum(course: Course): CourseCurriculum {
  return (course as ExtendedCourse).curriculum || {};
}

function CourseSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-slate-200" />

            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
              <div>
                <div className="aspect-video rounded-3xl bg-slate-200" />

                <div className="mt-8 h-8 w-3/4 rounded bg-slate-200" />

                <div className="mt-4 h-4 w-full rounded bg-slate-200" />
                <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
              </div>

              <div className="h-[420px] rounded-3xl bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CourseDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openModules, setOpenModules] = useState<Record<number, boolean>>({
    0: true,
  });

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const response = await getCourse(slug);

        if (!cancelled) {
          setCourse(response.course);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this course.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const curriculum = useMemo(
    () => (course ? getCourseCurriculum(course) : {}),
    [course],
  );

  const modules = curriculum.modules || [];
  const practice = curriculum.practice || [];

  const totalLessons = modules.reduce(
    (total, module) => total + (module.lessons?.length || 0),
    0,
  );

  const totalQuestions = practice.reduce(
    (total, section) => total + (section.questions?.length || 0),
    0,
  );

  const displayPrice =
    course && course.discountPrice > 0
      ? course.discountPrice
      : course?.price || 0;

  const hasDiscount =
    Boolean(
      course &&
        course.discountPrice > 0 &&
        course.price > course.discountPrice,
    );

  function toggleModule(index: number) {
    setOpenModules((current) => ({
      ...current,
      [index]: !current[index],
    }));
  }

  if (loading) {
    return <CourseSkeleton />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />

        <main className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-4 py-16">
          <div className="w-full rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <BookOpen className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Course unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              {error || "This course could not be found or is no longer available."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-[#E13032] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#c9282a]"
              >
                Try Again
              </button>

              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Link>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>
        {/* =====================================================
            BREADCRUMB
           ===================================================== */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#E13032]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
          </div>
        </div>

        {/* =====================================================
            COURSE HERO
           ===================================================== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div>
                <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-red-50 via-white to-orange-50 shadow-sm">
                  {course.bannerImage ? (
                    <img
                      src={course.bannerImage}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-20 w-20 text-red-200" />
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent p-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#E13032] shadow-sm">
                        {course.category}
                      </span>

                      <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                        {course.level}
                      </span>

                      {course.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-orange-700 shadow-sm">
                          <Sparkles className="h-3.5 w-3.5" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#E13032]">
                      {course.category}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {course.level}
                    </span>
                  </div>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                    {course.title}
                  </h1>

                  <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
                    {course.description}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-x-7 gap-y-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-[#E13032]" />
                      {course.duration}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <Languages className="h-4 w-4 text-[#E13032]" />
                      {course.language}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-[#E13032]" />
                      {course.instructor}
                    </span>
                  </div>
                </div>
              </div>

              {/* =================================================
                  COURSE ACTION CARD
                 ================================================= */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
                  <div className="border-b border-slate-100 bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E13032]">
                      Start Learning
                    </p>

                    <div className="mt-3 flex items-end gap-3">
                      {displayPrice > 0 ? (
                        <>
                          <span className="text-3xl font-extrabold text-slate-950">
                            ₹{formatPrice(displayPrice)}
                          </span>

                          {hasDiscount && (
                            <span className="pb-1 text-sm text-slate-400 line-through">
                              ₹{formatPrice(course.price)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-2xl font-extrabold text-green-700">
                          Free Course
                        </span>
                      )}
                    </div>

                    {hasDiscount && (
                      <p className="mt-2 text-xs font-semibold text-green-700">
                        Special discounted price available
                      </p>
                    )}
                  </div>

                  <div className="p-6">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#c9282a] hover:shadow-md"
                    >
                      {displayPrice > 0 ? "Enroll Now" : "Start Learning"}
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-[#E13032]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      I&apos;m Interested
                    </button>

                    <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Instructor</span>
                        <span className="font-semibold text-slate-800">
                          {course.instructor}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Duration</span>
                        <span className="font-semibold text-slate-800">
                          {course.duration}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Language</span>
                        <span className="font-semibold text-slate-800">
                          {course.language}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                      <p className="text-xs leading-5 text-slate-600">
                        Your course access and learning progress will be
                        managed through your JobWay student account.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* =====================================================
            COURSE OVERVIEW
           ===================================================== */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {modules.length}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      Modules
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <PlayCircle className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {totalLessons}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      Lessons
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {totalQuestions}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      Practice Questions
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {course.level}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      Course Level
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES + CURRICULUM
           ===================================================== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              {/* FEATURES */}
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#E13032]">
                  What You&apos;ll Get
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Course Benefits
                </h2>

                <div className="mt-7 space-y-3">
                  {course.features?.length ? (
                    course.features.map((feature, index) => (
                      <div
                        key={`${feature}-${index}`}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                        <p className="text-sm font-medium leading-6 text-slate-700">
                          {feature}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                      Course benefits will be added soon.
                    </div>
                  )}
                </div>
              </div>

              {/* CURRICULUM */}
              <div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#E13032]">
                      Curriculum
                    </p>

                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      What You&apos;ll Learn
                    </h2>
                  </div>

                  <div className="text-sm text-slate-500">
                    {modules.length} modules · {totalLessons} lessons
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {modules.length ? (
                    modules.map((module, moduleIndex) => {
                      const lessons = module.lessons || [];
                      const isOpen = Boolean(openModules[moduleIndex]);

                      return (
                        <div
                          key={`${module.title}-${moduleIndex}`}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => toggleModule(moduleIndex)}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
                          >
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-[#E13032]">
                                {moduleIndex + 1}
                              </div>

                              <div className="min-w-0">
                                <h3 className="font-bold text-slate-900">
                                  {module.title || `Module ${moduleIndex + 1}`}
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                  {lessons.length}{" "}
                                  {lessons.length === 1 ? "lesson" : "lessons"}
                                </p>
                              </div>
                            </div>

                            <ChevronDown
                              className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isOpen && (
                            <div className="border-t border-slate-100">
                              {module.description && (
                                <p className="px-5 py-4 text-sm leading-6 text-slate-600">
                                  {module.description}
                                </p>
                              )}

                              {lessons.length ? (
                                <div className="divide-y divide-slate-100">
                                  {lessons.map((lesson, lessonIndex) => (
                                    <div
                                      key={`${lesson.title}-${lessonIndex}`}
                                      className="flex items-start gap-4 px-5 py-4"
                                    >
                                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                        <PlayCircle className="h-4 w-4" />
                                      </div>

                                      <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800">
                                          {lesson.title ||
                                            `Lesson ${lessonIndex + 1}`}
                                        </h4>

                                        {lesson.description && (
                                          <p className="mt-1 text-sm leading-6 text-slate-500">
                                            {lesson.description}
                                          </p>
                                        )}

                                        {lesson.keyPoints?.length ? (
                                          <div className="mt-3 flex flex-wrap gap-2">
                                            {lesson.keyPoints
                                              .slice(0, 4)
                                              .map((point, pointIndex) => (
                                                <span
                                                  key={`${point}-${pointIndex}`}
                                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                                                >
                                                  {point}
                                                </span>
                                              ))}
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="px-5 py-5 text-sm text-slate-500">
                                  Lessons for this module are being prepared.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                      <BookOpen className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Curriculum is being prepared
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Course lessons will appear here once they are available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PRACTICE
           ===================================================== */}
        {practice.length > 0 && (
          <section className="border-t border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#E13032]">
                  Practice & Revision
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Test Your Preparation
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Strengthen your preparation with practice sections and
                  questions prepared from the course material.
                </p>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {practice.map((section, index) => (
                  <div
                    key={`${section.title}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 font-bold text-slate-900">
                      {section.title || `Practice ${index + 1}`}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {section.description ||
                        "Practice questions from this course section."}
                    </p>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Questions
                      </span>

                      <p className="mt-1 text-xl font-extrabold text-slate-900">
                        {section.questions?.length || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            FINAL CTA
           ===================================================== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10">
              <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-300">
                    <GraduationCap className="h-5 w-5" />
                    JobWay Learning
                  </div>

                  <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                    Ready to start your preparation?
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Join this course and continue your learning journey with
                    JobWay.
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#E13032] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#c9282a]"
                >
                  {displayPrice > 0 ? "Enroll Now" : "Start Learning"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}