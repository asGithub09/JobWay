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
import { useState } from "react";

import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";

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
};

const COURSE_CATEGORIES: CourseCategory[] = [
  "All",
  "Banking",
  "SSC & Railway",
  "UPSC",
  "Teaching",
  "Engineering",
];

const COURSES: Course[] = [
  {
    id: "banking-complete-foundation",
    category: "Banking",
    title: "Banking Exam Complete Foundation",
    instructor: "JobWay Expert Faculty",
    description:
      "Build strong fundamentals in Quantitative Aptitude, Reasoning, English and Banking Awareness.",
    lessons: 120,
    duration: "85 Hours",
    students: "2.4K",
    rating: 4.8,
    reviews: "428",
    price: "₹1,999",
    originalPrice: "₹3,999",
    badge: "Bestseller",
    level: "Beginner to Advanced",
    image: "/images/courses/banking.png",
  },
  {
    id: "ssc-cgl-complete",
    category: "SSC & Railway",
    title: "SSC CGL Complete Preparation",
    instructor: "JobWay SSC Faculty",
    description:
      "A structured preparation program covering the core subjects and practice required for SSC CGL.",
    lessons: 145,
    duration: "100 Hours",
    students: "3.1K",
    rating: 4.9,
    reviews: "612",
    price: "₹2,499",
    originalPrice: "₹4,999",
    badge: "Popular",
    level: "All Levels",
  },
  {
    id: "upsc-gs-foundation",
    category: "UPSC",
    title: "UPSC General Studies Foundation",
    instructor: "JobWay UPSC Faculty",
    description:
      "Develop a systematic approach to General Studies with structured lessons and revision resources.",
    lessons: 180,
    duration: "140 Hours",
    students: "1.8K",
    rating: 4.8,
    reviews: "305",
    price: "₹3,999",
    originalPrice: "₹6,999",
    badge: "Featured",
    level: "Foundation",
    image: "/images/courses/ssc.avif",
  },
  {
    id: "teaching-tet-master",
    category: "Teaching",
    title: "Teaching Exams Master Preparation",
    instructor: "JobWay Teaching Faculty",
    description:
      "Prepare for teaching examinations with concept lessons, practice questions and revision support.",
    lessons: 110,
    duration: "75 Hours",
    students: "1.6K",
    rating: 4.7,
    reviews: "264",
    price: "₹1,799",
    originalPrice: "₹3,499",
    badge: "New",
    level: "Beginner to Advanced",
    image: "/images/courses/prime.png",
  },
  {
    id: "engineering-technical",
    category: "Engineering",
    title: "Engineering Competitive Exam Program",
    instructor: "JobWay Technical Faculty",
    description:
      "Strengthen technical concepts and develop exam-solving speed through structured preparation.",
    lessons: 160,
    duration: "125 Hours",
    students: "1.2K",
    rating: 4.8,
    reviews: "198",
    price: "₹2,999",
    originalPrice: "₹5,499",
    badge: "Featured",
    level: "Intermediate",
  },
  {
    id: "banking-speed-practice",
    category: "Banking",
    title: "Banking Speed & Accuracy Program",
    instructor: "JobWay Banking Faculty",
    description:
      "Improve calculation speed, reasoning accuracy and exam-time decision making.",
    lessons: 90,
    duration: "60 Hours",
    students: "1.4K",
    rating: 4.7,
    reviews: "221",
    price: "₹1,499",
    originalPrice: "₹2,999",
    badge: "Value Pick",
    level: "Intermediate",
  },
];

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

function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-3.5 w-3.5 ${
            index < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
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
          <RatingStars rating={course.rating} />

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
            {course.lessons} lessons
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

              <span className="text-xs font-medium text-[#9aa5b3] line-through">
                {course.originalPrice}
              </span>
            </div>

            <span className="text-[10px] font-semibold text-green-600">
              Limited-time pricing
            </span>
          </div>

          <Link
            href={`/courses/${course.id}`}
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

export function PopularCourses() {
  const [activeCategory, setActiveCategory] =
    useState<CourseCategory>("All");

  const filteredCourses =
    activeCategory === "All"
      ? COURSES
      : COURSES.filter(
          (course) =>
            course.category === activeCategory,
        );

  const [visibleStart, setVisibleStart] =
    useState(0);

  const canGoPrevious = visibleStart > 0;
  const canGoNext =
    visibleStart + 3 < filteredCourses.length;

  const handleCategoryChange = (
    category: CourseCategory,
  ) => {
    setActiveCategory(category);
    setVisibleStart(0);
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setVisibleStart((current) =>
        Math.max(0, current - 1),
      );
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setVisibleStart((current) =>
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
                  category === activeCategory;

                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
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

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
            />
          ))}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-bold text-slate-600">
              Courses for this category will be
              available soon.
            </p>
          </div>
        ) : null}

        {filteredCourses.length > 3 ? (
          <div className="mt-7 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
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
              of {filteredCourses.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
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
                Looking for something specific?
              </p>

              <p className="mt-0.5 text-xs text-[#8b97a7]">
                Browse the complete JobWay course
                catalogue.
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
