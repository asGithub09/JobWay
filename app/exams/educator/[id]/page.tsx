"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Crown,
  FileQuestion,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import {
  getMyEducatorExams,
  type StudentEducatorExam,
} from "@/lib/api";

interface EducatorExamDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EducatorExamDetailsPage({
  params,
}: EducatorExamDetailsPageProps) {
  const [exam, setExam] = useState<StudentEducatorExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const loadExam = async () => {
      try {
        const { id } = await params;

        const response = await getMyEducatorExams();

        if (!active) {
          return;
        }

        if (!response.success) {
          setNotFound(true);
          return;
        }

        const foundExam = response.exams.find(
          (item) => String(item.id) === String(id),
        );

        if (!foundExam) {
          setNotFound(true);
          return;
        }

        setExam(foundExam);
      } catch (error) {
        console.error("Load educator exam details error:", error);

        if (active) {
          setNotFound(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadExam();

    return () => {
      active = false;
    };
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
            <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-950">
            Loading exam
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Fetching your exam information.
          </p>
        </div>
      </main>
    );
  }

  if (notFound || !exam) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <BookOpen className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Exam not available
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This examination is not available to your current account or
            active batch.
          </p>

          <Link
            href="/exams"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </Link>
        </div>
      </main>
    );
  }

  const isPremium = exam.accessType === "PREMIUM";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* TOP NAV */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/exams"
            className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-violet-600 sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            Educator EMS
          </div>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:p-9 lg:p-12">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white/80">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Published Exam
                  </span>

                  <span
                    className={
                      isPremium
                        ? "inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-amber-200"
                        : "inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-200"
                    }
                  >
                    {isPremium ? (
                      <Crown className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {exam.accessType}
                  </span>
                </div>

                <h1 className="mt-6 max-w-4xl text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  {exam.title}
                </h1>

                {exam.shortName ? (
                  <p className="mt-2 text-sm font-bold text-violet-300">
                    {exam.shortName}
                  </p>
                ) : null}

                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
                  {exam.description ||
                    "Complete this examination to measure your preparation and performance."}
                </p>
              </div>

              <div className="shrink-0 rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-md lg:min-w-[220px]">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                  Examination
                </p>

                <p className="mt-2 text-2xl font-black">
                  {exam.category || "General"}
                </p>

                {exam.subject ? (
                  <p className="mt-1 text-xs font-bold text-white/50">
                    {exam.subject}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Duration"
            value={`${exam.durationMinutes} min`}
          />

          <StatCard
            icon={<FileQuestion className="h-5 w-5" />}
            label="Questions"
            value={String(exam.questionCount)}
          />

          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Total Marks"
            value={String(exam.totalMarks)}
          />

          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Passing"
            value={`${exam.passingPercentage}%`}
          />
        </section>

        {/* DETAILS */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <BookOpen className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                  Examination Details
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Before you begin
                </h2>
              </div>
            </div>

            <div className="mt-7 divide-y divide-slate-100">
              <DetailRow
                label="Category"
                value={exam.category || "General"}
              />

              <DetailRow
                label="Subject"
                value={exam.subject || "Not specified"}
              />

              <DetailRow
                label="Topic"
                value={exam.topic || "Not specified"}
              />

              <DetailRow
                label="Access"
                value={exam.accessType}
              />

              <DetailRow
                label="Attempt Policy"
                value={
                  exam.attemptPolicy === "SINGLE_ATTEMPT"
                    ? "Single Attempt"
                    : `Multiple Attempts${
                        exam.maxAttempts
                          ? ` — up to ${exam.maxAttempts}`
                          : ""
                      }`
                }
              />
            </div>

            <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />

                <div>
                  <p className="text-sm font-black text-slate-800">
                    Secure examination environment
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Exam questions are protected and are only delivered after
                    the secure exam attempt is started.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* START CARD */}
          <aside className="h-fit rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7 lg:sticky lg:top-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
              <GraduationCap className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              Ready to begin?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review the examination information before entering the secure
              attempt environment.
            </p>

            <div className="mt-6 space-y-3">
              <InfoLine
                label="Duration"
                value={`${exam.durationMinutes} minutes`}
              />

              <InfoLine
                label="Questions"
                value={String(exam.questionCount)}
              />

              <InfoLine
                label="Access"
                value={exam.accessType}
              />
            </div>

            <Link
              href={`/exams/educator/${encodeURIComponent(exam.id)}/start`}
              className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              Continue to Exam
              <ArrowRight className="h-4 w-4" />
            </Link>

            {isPremium ? (
              <p className="mt-3 text-center text-[10px] font-bold leading-5 text-slate-400">
                Premium access will be verified securely when you start the
                examination.
              </p>
            ) : (
              <p className="mt-3 text-center text-[10px] font-bold leading-5 text-slate-400">
                Your authenticated JobWay account is required to start.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </div>

        <span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-xs font-bold text-slate-400">
        {label}
      </span>

      <span className="text-sm font-black text-slate-700 sm:text-right">
        {value}
      </span>
    </div>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3">
      <span className="text-xs font-bold text-slate-400">
        {label}
      </span>

      <span className="text-xs font-black text-slate-700">
        {value}
      </span>
    </div>
  );
}