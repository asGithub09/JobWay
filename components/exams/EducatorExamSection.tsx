"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Crown,
  FileQuestion,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  getMyEducatorExams,
  type StudentEducatorExam,
} from "@/lib/api";

export default function EducatorExamSection() {
  const [exams, setExams] = useState<StudentEducatorExam[]>([]);
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await getMyEducatorExams();

        if (!active) {
          return;
        }

        if (response.success) {
          setExams(response.exams || []);
          setBatchName(response.batch?.name || "");
        }
      } catch (error) {
        console.error("Load educator exams error:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="mt-10">
        <div className="rounded-[28px] border border-violet-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                Educator EMS
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Loading your exams
              </h2>
            </div>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
            <Sparkles className="h-3.5 w-3.5" />
            Educator EMS
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Exams assigned to you
          </h2>

          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Published examinations available through your active batch
            {batchName ? ` — ${batchName}` : ""}.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {exams.length} {exams.length === 1 ? "exam" : "exams"}
        </span>
      </div>

      {exams.length === 0 ? (
        <div className="rounded-[28px] border border-violet-100 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <BookOpen className="h-6 w-6" />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-950">
            No educator exams assigned yet
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Exams published by your educators for your active batch will appear
            here automatically.
          </p>

          {batchName ? (
            <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-violet-600">
              Active batch: {batchName}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
          const isPremium = exam.accessType === "PREMIUM";

          return (
            <Link
              key={exam.id}
              href={`/exams/educator/${encodeURIComponent(exam.id)}`}
              className="group flex min-h-[300px] flex-col overflow-hidden rounded-[28px] border border-violet-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                  <BookOpen className="h-6 w-6" />
                </div>

                <span
                  className={
                    isPremium
                      ? "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-amber-700"
                      : "rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700"
                  }
                >
                  {isPremium ? (
                    <Crown className="h-3 w-3" />
                  ) : null}

                  {exam.accessType}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-black tracking-tight text-slate-950">
                {exam.title}
              </h3>

              {exam.shortName ? (
                <p className="mt-1 text-xs font-bold text-violet-600">
                  {exam.shortName}
                </p>
              ) : null}

              <p className="mt-4 flex-1 text-sm leading-6 text-slate-500">
                {exam.description ||
                  "Complete this published examination to measure your preparation."}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    Duration
                  </div>

                  <p className="mt-1 text-xs font-black text-slate-700">
                    {exam.durationMinutes} min
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
                    <FileQuestion className="h-3.5 w-3.5" />
                    Questions
                  </div>

                  <p className="mt-1 text-xs font-black text-slate-700">
                    {exam.questionCount}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-xs font-black text-violet-600">
                  View Exam
                </span>

                <ArrowRight className="h-4 w-4 text-violet-500 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
          })}
        </div>
      )}
    </section>
  );
}