"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getCourses, type Course } from "@/lib/api";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

function getCourseId(course: Course) {
  return course.slug || course._id || course.id || "";
}

function getCoursePrice(course: Course) {
  if (
    typeof course.discountedPrice === "number" &&
    typeof course.price === "number" &&
    course.discountedPrice < course.price
  ) {
    return {
      current: course.discountedPrice,
      original: course.price,
    };
  }

  if (typeof course.discountedPrice === "number") {
    return {
      current: course.discountedPrice,
      original: null,
    };
  }

  if (typeof course.price === "number") {
    return {
      current: course.price,
      original: null,
    };
  }

  return {
    current: null,
    original: null,
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const response = await getCourses();

      if (response?.success === false) {
        throw new Error(response.message || "Unable to load courses.");
      }

      setCourses(Array.isArray(response?.courses) ? response.courses : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load courses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>
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
                Choose from our latest exam preparation and professional
                learning programs designed to help you learn, practice, and
                achieve your goals.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading courses...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-white px-6 text-center">
              <div className="mb-4 rounded-full bg-red-50 p-3 text-red-600">
                <RefreshCw className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-semibold text-slate-900">
                Unable to load courses
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={loadCourses}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center">
              <div className="mb-4 rounded-full bg-orange-50 p-4 text-orange-600">
                <BookOpen className="h-7 w-7" />
              </div>

              <h2 className="text-xl font-semibold text-slate-900">
                No courses available yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Courses will appear here once they are published from the
                JobWay learning platform.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => {
                const courseId = getCourseId(course);
                const pricing = getCoursePrice(course);

                if (!courseId) {
                  return null;
                }

                const thumbnail =
                  typeof course.thumbnailUrl === "string" &&
                  course.thumbnailUrl.trim() &&
                  course.thumbnailUrl !== "na"
                    ? course.thumbnailUrl
                    : null;

                return (
                  <article
                    key={courseId || index}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-orange-50 via-white to-green-50">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={course.title || "Course"}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BookOpen className="h-12 w-12 text-orange-300" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {course.category && (
                          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                            {course.category}
                          </span>
                        )}

                        {course.level && (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            {course.level}
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 line-clamp-2 min-h-[56px] text-xl font-bold text-slate-900">
                        {course.title || "Untitled Course"}
                      </h2>

                      <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
                        {course.shortDescription ||
                          course.description ||
                          "Start learning with JobWay and build your preparation with structured courses and practice."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                        {course.duration && (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            {course.duration}
                          </span>
                        )}

                        {course.language && (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            {course.language}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                        <div>
                          {pricing.current !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-slate-900">
                                ₹{pricing.current}
                              </span>

                              {pricing.original !== null && (
                                <span className="text-sm text-slate-400 line-through">
                                  ₹{pricing.original}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-green-700">
                              View Course
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/courses/${courseId}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                        >
                          View Course
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