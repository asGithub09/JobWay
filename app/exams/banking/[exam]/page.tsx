import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";

type ExamData = {
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  highlights: string[];
};

const exams: Record<string, ExamData> = {
  "sbi-po": {
    title: "SBI PO",
    shortTitle: "State Bank of India Probationary Officer",
    description:
      "Build a structured preparation journey for the SBI Probationary Officer examination with focused learning, practice and mock tests.",
    category: "Banking Exams",
    highlights: [
      "Structured exam preparation",
      "Topic-wise practice",
      "Mock test preparation",
      "Performance-focused learning",
    ],
  },

  "sbi-clerk": {
    title: "SBI Clerk",
    shortTitle: "State Bank of India Junior Associate",
    description:
      "Prepare for SBI Clerk with a focused learning path covering core concepts, practice and examination readiness.",
    category: "Banking Exams",
    highlights: [
      "Concept-focused preparation",
      "Topic-wise practice",
      "Mock test preparation",
      "Revision-oriented learning",
    ],
  },

  "ibps-po": {
    title: "IBPS PO",
    shortTitle: "IBPS Probationary Officer",
    description:
      "Prepare systematically for the IBPS PO examination with structured study, practice and mock-test preparation.",
    category: "Banking Exams",
    highlights: [
      "Structured preparation",
      "Practice-oriented learning",
      "Mock test preparation",
      "Progress-focused revision",
    ],
  },

  "ibps-clerk": {
    title: "IBPS Clerk",
    shortTitle: "IBPS Clerk",
    description:
      "Build your IBPS Clerk preparation with a clear learning path, practice resources and examination-focused preparation.",
    category: "Banking Exams",
    highlights: [
      "Core concept preparation",
      "Topic-wise practice",
      "Revision support",
      "Mock test preparation",
    ],
  },

  "rbi-grade-b": {
    title: "RBI Grade B",
    shortTitle: "Reserve Bank of India Grade B",
    description:
      "Prepare for RBI Grade B with a structured approach to learning, practice, revision and examination readiness.",
    category: "Banking Exams",
    highlights: [
      "Structured learning path",
      "Concept and practice focus",
      "Revision support",
      "Mock test preparation",
    ],
  },

  "nabard-grade-a": {
    title: "NABARD Grade A",
    shortTitle: "NABARD Assistant Manager Grade A",
    description:
      "Build a focused preparation strategy for NABARD Grade A with structured learning and practice.",
    category: "Banking Exams",
    highlights: [
      "Focused preparation",
      "Topic-wise learning",
      "Practice resources",
      "Mock test preparation",
    ],
  },

  insurance: {
    title: "Insurance Exams",
    shortTitle: "Insurance Sector Examinations",
    description:
      "Explore preparation for major insurance-sector competitive examinations through structured learning and practice.",
    category: "Banking Exams",
    highlights: [
      "Insurance exam preparation",
      "Core subject learning",
      "Practice resources",
      "Mock test preparation",
    ],
  },

  "banking-foundation": {
    title: "Banking Foundation",
    shortTitle: "Banking Exam Foundation Program",
    description:
      "Start your banking preparation from the fundamentals with a structured foundation covering the essential preparation areas.",
    category: "Banking Exams",
    highlights: [
      "Build strong fundamentals",
      "Learn core concepts",
      "Practice essential topics",
      "Prepare for advanced exams",
    ],
  },
};

const quickFeatures = [
  {
    icon: BookOpen,
    title: "Structured Learning",
    description:
      "Follow a clear preparation path instead of studying randomly.",
  },
  {
    icon: Target,
    title: "Focused Practice",
    description:
      "Strengthen important concepts through targeted practice.",
  },
  {
    icon: BarChart3,
    title: "Performance",
    description:
      "Use practice and mock tests to understand your preparation level.",
  },
];

export default async function BankingExamPage({
  params,
}: {
  params: Promise<{ exam: string }>;
}) {
  const { exam } = await params;

  const examData = exams[exam];

  if (!examData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
          <Link
            href="/exams"
            className="transition hover:text-violet-600"
          >
            Exams
          </Link>

          <span>/</span>

          <Link
            href="/exams/banking"
            className="transition hover:text-violet-600"
          >
            Banking
          </Link>

          <span>/</span>

          <span className="text-slate-900">
            {examData.title}
          </span>
        </div>

        <section className="relative mt-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-12 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:px-10 lg:px-14">
          <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <div className="relative z-10 max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              {examData.category}
            </div>

            <h1 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl">
              {examData.title}
            </h1>

            <p className="mt-3 text-base font-bold text-violet-200">
              {examData.shortTitle}
            </p>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
              {examData.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/test-series"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
              >
                Test Series
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {quickFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-lg font-black text-slate-950">
                  {feature.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                  Preparation Journey
                </p>

                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  Everything in one place
                </h2>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {examData.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />

                  <span className="text-sm font-bold leading-6 text-slate-700">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-violet-100 bg-white p-7 shadow-sm sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <FileText className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              Preparation tools
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              JobWay is being built to bring courses, resources, practice,
              mock tests and test series together for your target examination.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Clock3 className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-bold text-slate-700">
                  Study at your pace
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <BookOpen className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-bold text-slate-700">
                  Learn topic by topic
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Target className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-bold text-slate-700">
                  Practice with purpose
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <Link
            href="/exams/banking"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Banking Exams
          </Link>
        </div>
      </div>
    </main>
  );
}