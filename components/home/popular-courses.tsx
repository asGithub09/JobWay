"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCourses } from "@/lib/api";

type CourseCategory =
  | "All"
  | "Banking"
  | "SSC & Railway"
  | "UPSC"
  | "Teaching"
  | "Engineering";

type Course = {
  id: string;
  category: Exclude<CourseCategory, "All">;
  title: string;
  instructor: string;
  description: string;
  lessons: number;
  duration: string;
  students: string;
  rating: number;
  reviews: string;
  price: string;
  originalPrice: string;
  badge: string;
  level: string;
  image?: string;
  slug: string;
};

type ApiCourse = {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  description: string;
  bannerImage?: string;
  duration: string;
  language: string;
  price: number;
  discountPrice: number;
  instructor: string;
  syllabus?: Array<{
    title?: string;
    lessons?: unknown[];
  }>;
  isFeatured: boolean;
  isPublished: boolean;
  interestedCount: number;
  enrolledCount: number;
};

const COURSE_CATEGORIES: CourseCategory[] = [
  "All",
  "Banking",
  "SSC & Railway",
  "UPSC",
  "Teaching",
  "Engineering",
];

/* =========================================================
   DISPLAY HELPERS
   ========================================================= */

function formatPrice(value: number) {
  if (!value || value <= 0) {
    return "Free";
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

function formatLearners(value: number) {
  if (!value || value <= 0) {
    return "0";
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".0", "")}K`;
  }

  return value.toLocaleString("en-IN");
}

function getOriginalPrice(course: ApiCourse) {
  const currentPrice =
    course.discountPrice > 0
      ? course.discountPrice
      : course.price;

  if (!currentPrice || currentPrice <= 0) {
    return "";
  }

  if (course.discountPrice > 0 && course.price > course.discountPrice) {
    return formatPrice(course.price);
  }

  return "";
}

function getCourseLessons(course: ApiCourse) {
  if (!course.syllabus?.length) {
    return 0;
  }

  return course.syllabus.reduce((total, module) => {
    const lessons = Array.isArray(module.lessons)
      ? module.lessons.length
      : 0;

    return total + lessons;
  }, 0);
}

function normalizeCategory(category: string): Exclude<
  CourseCategory,
  "All"
> {
  const normalized = category.trim().toLowerCase();

  if (
    normalized.includes("bank")
  ) {
    return "Banking";
  }

  if (
    normalized.includes("ssc") ||
    normalized.includes("railway")
  ) {
    return "SSC & Railway";
  }

  if (
    normalized.includes("upsc")
  ) {
    return "UPSC";
  }

  if (
    normalized.includes("teach") ||
    normalized.includes("tet")
  ) {
    return "Teaching";
  }

  if (
    normalized.includes("engineer") ||
    normalized.includes("technical")
  ) {
    return "Engineering";
  }

  return "SSC & Railway";
}

function getCourseBadge(course: ApiCourse) {
  if (course.isFeatured) {
    return "Featured";
  }

  if (course.enrolledCount >= 1000) {
    return "Popular";
  }

  return "New";
}

function mapApiCourse(course: ApiCourse): Course {
  const effectivePrice =
    course.discountPrice > 0
      ? course.discountPrice
      : course.price;

  return {
    id: course.id,
    slug: course.slug,
    category: normalizeCategory(course.category),
    title: course.title,
    instructor:
      course.instructor || "JobWay Expert Faculty",
    description:
      course.description ||
      "Structured preparation designed to help you learn concepts, practice consistently and prepare with confidence.",
    lessons: getCourseLessons(course),
    duration:
      course.duration || "Self Paced",
    students: formatLearners(
      course.enrolledCount,
    ),
    rating: 4.8,
    reviews:
      course.enrolledCount > 0
        ? String(course.enrolledCount)
        : "0",
    price: formatPrice(effectivePrice),
    originalPrice: getOriginalPrice(course),
    badge: getCourseBadge(course),
    level:
      course.level || "All Levels",
    image:
      course.bannerImage || undefined,
  };
}

/* =========================================================
   COURSE THUMBNAIL
   ========================================================= */

function CourseThumbnail({
  category,
  badge,
  image,
}: {
  category: Course["category"];
  badge: string;
  image?: string;
}) {
  const categoryInitial =
    category === "SSC & Railway"
      ? "S"
      : category === "UPSC"
        ? "U"
        : category === "Teaching"
          ? "T"
          : category === "Engineering"
            ? "E"
            : "B";

  return (
    <div className="group relative h-[190px] overflow-hidden bg-[#f3f5f8]">
      {image ? (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(225,48,50,0.13), transparent 34%), radial-gradient(circle at 80% 80%, rgba(15,23,42,0.07), transparent 42%)",
            }}
            aria-hidden="true"
          />

          <div
            className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[24px] border-white/70"
            aria-hidden="true"
          />

          <div
            className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full border-[30px] border-red-100/70"
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-white text-3xl font-black text-[#E13032] shadow-[0_12px_30px_rgba(15,23,42,0.10)] transition duration-300 group-hover:scale-105">
              {categoryInitial}
            </div>
          </div>
        </>
      )}

      <span className="absolute left-4 top-4 rounded-full bg-[#E13032] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow-md">
        {badge}
      </span>

      <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold text-slate-700 shadow-md backdrop-blur">
        <PlayCircle
          className="h-3.5 w-3.5 text-[#E13032]"
          aria-hidden="true"
        />
        Preview
      </span>
    </div>
  );
}

/* =========================================================
   RATING
   ========================================================= */

function RatingStars({
  rating,
}: {
  rating: number;
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <Star
            key={index}
            className={`h-3.5 w-3.5 ${
              index < Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200"
            }`}
            aria-hidden="true"
          />
        ),
      )}
    </div>
  );
}

/* =========================================================
   COURSE CARD
   ========================================================= */

function CourseCard({
  course,
}: {
  course: Course;
}) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] border border-[#e5e8ed] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-[0_16px_38px_rgba(15,23,42,0.10)]">
      <CourseThumbnail
        category={course.category}
        badge={course.badge}
        image={course.image}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#f3f5f8] px-2.5 py-1 text-[10px] font-extrabold text-[#617087]">
            {course.category}
          </span>

          <span className="truncate text-[10px] font-bold text-[#9aa5b3]">
            {course.level}
          </span>
        </div>

        <h3 className="mt-4 line-clamp-2 min-h-[48px] text-[15px] font-black leading-6 tracking-tight text-[#121b2a] transition-colors group-hover:text-[#E13032]">
          {course.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#718096]">
          {course.description}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-[10px] font-black text-[#E13032]">
            JW
          </div>

          <span className="truncate text-xs font-bold text-[#5d6b7e]">
            {course.instructor}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[#edf0f3] pt-4">
          <RatingStars
            rating={course.rating}
          />

          <span className="text-xs font-black text-[#39475b]">
            {course.rating}
          </span>

          <span className="text-[10px] text-[#9aa5b3]">
            ({course.reviews})
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] font-semibold text-[#8b97a7]">
          <div className="flex items-center gap-1.5">
            <BookOpen
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {course.lessons > 0
              ? `${course.lessons} lessons`
              : "Structured course"}
          </div>

          <div className="flex items-center gap-1.5">
            <Clock3
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {course.duration}
          </div>

          <div className="col-span-2 flex items-center gap-1.5">
            <Users
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {course.students} learners enrolled
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#edf0f3] pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black tracking-tight text-[#111827]">
                {course.price}
              </span>

              {course.originalPrice ? (
                <span className="text-xs font-medium text-[#9aa5b3] line-through">
                  {course.originalPrice}
                </span>
              ) : null}
            </div>

            <span className="text-[10px] font-semibold text-green-600">
              {course.price === "Free"
                ? "Start learning today"
                : "Limited-time pricing"}
            </span>
          </div>

          <Link
            href={`/courses/${course.slug}`}
            aria-label={`View ${course.title}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E13032] transition-all duration-200 hover:bg-[#E13032] hover:text-white focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
          >
            <ArrowRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   POPULAR COURSES
   ========================================================= */

export function PopularCourses() {
  const [
    apiCourses,
    setApiCourses,
  ] = useState<ApiCourse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [activeCategory, setActiveCategory] =
    useState<CourseCategory>("All");

  const [visibleStart, setVisibleStart] =
    useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      try {
        setLoading(true);

        const response = await getCourses();

        if (!mounted) {
          return;
        }

        const publishedCourses =
          (response.courses || []).filter(
            (course: ApiCourse) =>
              course.isPublished,
          );

        setApiCourses(
          publishedCourses,
        );
      } catch (error) {
        console.error(
          "Failed to load popular courses:",
          error,
        );

        if (mounted) {
          setApiCourses([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      mounted = false;
    };
  }, []);

  const courses = useMemo(
    () =>
      apiCourses.map(
        mapApiCourse,
      ),
    [apiCourses],
  );

  const filteredCourses =
    activeCategory === "All"
      ? courses
      : courses.filter(
          (course) =>
            course.category ===
            activeCategory,
        );

  const canGoPrevious =
    visibleStart > 0;

  const canGoNext =
    visibleStart + 3 <
    filteredCourses.length;

  const handleCategoryChange = (
    category: CourseCategory,
  ) => {
    setActiveCategory(category);
    setVisibleStart(0);
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setVisibleStart(
        (current) =>
          Math.max(
            0,
            current - 1,
          ),
      );
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setVisibleStart(
        (current) =>
          Math.min(
            filteredCourses.length - 3,
            current + 1,
          ),
      );
    }
  };

  const visibleCourses =
    filteredCourses.slice(
      visibleStart,
      visibleStart + 3,
    );

  return (
    <section
      aria-labelledby="popular-courses-heading"
      className="relative overflow-hidden bg-[#f8f9fb] py-14 sm:py-16 lg:py-[72px]"
    >
      <div
        className="pointer-events-none absolute -left-40 top-24 h-80 w-80 rounded-full bg-red-50/60 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-orange-50/50 blur-3xl"
        aria-hidden="true"
      />

      <Container size="wide">
        <SectionHeading
          eyebrow="LEARN FROM JOBWAY"
          title="Popular courses"
          description="Explore structured preparation programs designed to help you learn concepts, practice consistently and prepare with confidence."
          action={
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#E13032] transition hover:text-[#B91C1C]"
            >
              View all courses

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          }
        />

        <div className="mb-7 mt-8 overflow-x-auto pb-1 scrollbar-none">
          <div
            role="tablist"
            aria-label="Course categories"
            className="flex min-w-max items-center gap-2"
          >
            {COURSE_CATEGORIES.map(
              (category) => {
                const isActive =
                  category ===
                  activeCategory;

                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={
                      isActive
                    }
                    onClick={() =>
                      handleCategoryChange(
                        category,
                      )
                    }
                    className={`rounded-full border px-4 py-2.5 text-xs font-extrabold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2 ${
                      isActive
                        ? "border-[#E13032] bg-[#E13032] text-white shadow-[0_7px_18px_rgba(225,48,50,0.18)]"
                        : "border-[#e0e5eb] bg-white text-[#647286] hover:border-red-200 hover:bg-red-50 hover:text-[#E13032]"
                    }`}
                  >
                    {category}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-[470px] animate-pulse overflow-hidden rounded-[18px] border border-[#e5e8ed] bg-white"
                >
                  <div className="h-[190px] bg-slate-100" />

                  <div className="space-y-4 p-5">
                    <div className="h-5 w-24 rounded-full bg-slate-100" />
                    <div className="h-6 w-4/5 rounded bg-slate-100" />
                    <div className="h-10 w-full rounded bg-slate-100" />
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                    <div className="mt-8 h-20 rounded bg-slate-100" />
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map(
              (course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                />
              ),
            )}
          </div>
        )}

        {!loading &&
        filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-bold text-slate-600">
              Courses for this category
              will be available soon.
            </p>
          </div>
        ) : null}

        {filteredCourses.length > 3 ? (
          <div className="mt-7 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={
                handlePrevious
              }
              disabled={
                !canGoPrevious
              }
              aria-label="Previous courses"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e0e5eb] bg-white text-[#607087] transition hover:border-red-200 hover:bg-red-50 hover:text-[#E13032] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>

            <span className="min-w-[72px] px-3 text-center text-xs font-bold text-[#97a2b1]">
              {visibleStart + 1}–
              {Math.min(
                visibleStart +
                  visibleCourses.length,
                filteredCourses.length,
              )}{" "}
              of{" "}
              {filteredCourses.length}
            </span>

            <button
              type="button"
              onClick={
                handleNext
              }
              disabled={
                !canGoNext
              }
              aria-label="Next courses"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e0e5eb] bg-white text-[#607087] transition hover:border-red-200 hover:bg-red-50 hover:text-[#E13032] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e4e8ed] bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.04)] sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle2
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#172033]">
                Looking for something
                specific?
              </p>

              <p className="mt-0.5 text-xs text-[#8b97a7]">
                Browse the complete
                JobWay course catalogue.
              </p>
            </div>
          </div>

          <Link
            href="/courses"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 text-xs font-extrabold text-white transition hover:bg-[#2d2d2d] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
          >
            Explore all courses

            <ArrowRight
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}