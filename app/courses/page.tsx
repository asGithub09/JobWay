"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  getCourses,
  type Course,
} from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const response = await getCourses();

        if (!cancelled) {
          setCourses(response.courses);
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

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>
        {/* =====================================================
            PAGE INTRO
           ===================================================== */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
                JobWay Learning
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Explore Our Courses
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                Discover JobWay learning programs designed to help students
                prepare, practice, and progress toward their career goals.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            COURSE LIST
           ===================================================== */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="aspect-[16/9] animate-pulse bg-slate-100" />

                  <div className="space-y-4 p-5">
                    <div className="flex gap-2">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
                    </div>

                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-100" />

                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    </div>

                    <div className="flex gap-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                      <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
                      <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
              <h2 className="text-lg font-bold text-red-900">
                Unable to load courses
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-xl bg-[#E13032] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#c9282a]"
              >
                Try Again
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <BookOpen className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Courses Coming Soon
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                We are preparing new learning programs for you.
                Please check back soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const displayPrice =
                  course.discountPrice > 0
                    ? course.discountPrice
                    : course.price;

                const hasPrice = displayPrice > 0;

                return (
                  <article
                    key={course.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* COURSE BANNER */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-orange-50 via-white to-green-50">
                      {course.bannerImage ? (
                        <img
                          src={course.bannerImage}
                          alt={course.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BookOpen className="h-14 w-14 text-orange-300 transition duration-300 group-hover:scale-110" />
                        </div>
                      )}

                      {course.isFeatured && (
                        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-orange-700 shadow-sm backdrop-blur">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* COURSE CONTENT */}
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                          {course.category}
                        </span>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          {course.level}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-bold text-slate-900">
                        {course.title}
                      </h2>

                      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                        {course.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          {course.duration}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          {course.language}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                        <div>
                          {hasPrice ? (
                            <>
                              {course.discountPrice > 0 &&
                                course.price >
                                  course.discountPrice && (
                                  <span className="mr-2 text-xs text-slate-400 line-through">
                                    ₹{course.price}
                                  </span>
                                )}

                              <span className="text-sm font-bold text-green-700">
                                ₹{displayPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-green-700">
                              Coming Soon
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/courses/${course.slug}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                        >
                          Explore
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}