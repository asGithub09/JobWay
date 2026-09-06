"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { getPublishedExams, type Exam } from "@/lib/api";
import { SiteHeader } from "@/components/layout/site-header";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    const loadExams = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPublishedExams();

        if (!active) return;

        if (response.success) {
          setExams(response.exams || []);
        } else {
          setError("Unable to load exams.");
        }
      } catch (err) {
        console.error("Load published exams error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load exams.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadExams();

    return () => {
      active = false;
    };
  }, []);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return exams;
    }

    return exams.filter((exam) => {
      return (
        exam.name.toLowerCase().includes(query) ||
        exam.shortName?.toLowerCase().includes(query) ||
        exam.category.toLowerCase().includes(query) ||
        exam.description.toLowerCase().includes(query)
      );
    });
  }, [exams, search]);

  const groupedExams = useMemo(() => {
    return filteredExams.reduce<Record<string, Exam[]>>(
      (groups, exam) => {
        const category = exam.category || "Other Exams";

        if (!groups[category]) {
          groups[category] = [];
        }

        groups[category].push(exam);

        return groups;
      },
      {},
    );
  }, [filteredExams]);

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-10 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              Exam Preparation
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                  Crack your next competitive exam with JobWay.
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                  Choose your target examination and access structured
                  preparation, test series, mock tests and performance-focused
                  practice.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Target className="h-5 w-5 text-violet-200" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">
                      Available Exams
                    </p>

                    <p className="mt-1 text-2xl font-black">
                      {loading ? "—" : exams.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="mt-7 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                Find your exam
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                Explore published examinations
              </h2>
            </div>

            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search SBI, IBPS, RBI..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mt-8">
          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950">
                Loading exams
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Fetching the latest published examinations from JobWay.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
              <h2 className="text-xl font-black text-rose-900">
                Unable to load exams
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-rose-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-700"
              >
                Try Again
              </button>
            </div>
          ) : exams.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <GraduationCap className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950">
                No exams published yet
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Published exams created from the Admin Exam Management panel
                will automatically appear here.
              </p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Search className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950">
                No matching exams
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try another exam name, category or keyword.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedExams).map(
                ([category, categoryExams]) => (
                  <div key={category}>
                    <div className="mb-5 flex items-end justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                          <BookOpen className="h-3.5 w-3.5" />
                          Exam Category
                        </div>

                        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                          {category}
                        </h2>
                      </div>

                      <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 sm:inline-flex">
                        {categoryExams.length}{" "}
                        {categoryExams.length === 1
                          ? "exam"
                          : "exams"}
                      </span>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryExams.map((exam) => (
                        <Link
                          key={exam.id}
                          href={`/exams/${encodeURIComponent(
                            exam.category.toLowerCase().replace(
                              /\s+/g,
                              "-",
                            ),
                          )}/${encodeURIComponent(exam.slug)}`}
                          className="group flex min-h-[280px] flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                              <GraduationCap className="h-6 w-6" />
                            </div>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-600">
                              Published
                            </span>
                          </div>

                          <h3 className="mt-6 text-xl font-black tracking-tight text-slate-950">
                            {exam.name}
                          </h3>

                          {exam.shortName ? (
                            <p className="mt-1 text-xs font-bold text-violet-600">
                              {exam.shortName}
                            </p>
                          ) : null}

                          <p className="mt-4 flex-1 text-sm leading-6 text-slate-500">
                            {exam.description ||
                              "Explore structured preparation, test series and mock tests for this examination."}
                          </p>

                          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-violet-600">
                              Explore Exam
                              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </span>

                            <ShieldCheck className="h-4 w-4 text-slate-300 transition group-hover:text-violet-500" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* FOOTER FEATURE */}
        <section className="mt-12 rounded-[28px] border border-violet-100 bg-white p-7 shadow-sm sm:p-9">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <BookOpen className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-black text-slate-950">
                  Structured Preparation
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Follow preparation content organized around your target
                  examination.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BarChart3 className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-black text-slate-950">
                  Practice & Performance
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use test series and mock tests to measure your preparation.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-black text-slate-950">
                  One Preparation Platform
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Courses, resources, practice and exams are being brought
                  together in JobWay.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}