import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const courses = [
  {
    id: "banking",
    title: "Banking Preparation",
    category: "Banking",
    level: "All Levels",
    description:
      "Build a strong foundation for banking examinations with structured preparation and practice.",
    duration: "Self Paced",
    language: "English / Hindi",
    price: "Coming Soon",
  },
  {
    id: "ssc",
    title: "SSC Preparation",
    category: "SSC",
    level: "All Levels",
    description:
      "Prepare for SSC examinations with comprehensive learning resources and practice-focused preparation.",
    duration: "Self Paced",
    language: "English / Hindi",
    price: "Coming Soon",
  },
  {
    id: "government-exams",
    title: "Government Exam Preparation",
    category: "Government Exams",
    level: "All Levels",
    description:
      "Explore structured preparation resources for government examinations across multiple categories.",
    duration: "Self Paced",
    language: "English / Hindi",
    price: "Coming Soon",
  },
];

export default function CoursesPage() {
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
                Discover JobWay learning programs designed to help students
                prepare, practice, and progress toward their career goals.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-green-50">
                  <BookOpen className="h-14 w-14 text-orange-300 transition duration-300 group-hover:scale-110" />
                </div>

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
                    <span className="text-sm font-semibold text-green-700">
                      {course.price}
                    </span>

                    <Link
                      href={`/courses/${course.id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                    >
                      Explore
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}