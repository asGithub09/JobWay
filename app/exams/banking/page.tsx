import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Landmark,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const bankingExams = [
  {
    title: "SBI PO",
    description:
      "Prepare for State Bank of India Probationary Officer recruitment with structured preparation and practice.",
    href: "/exams/banking/sbi-po",
    icon: Landmark,
  },
  {
    title: "SBI Clerk",
    description:
      "Build your preparation for SBI Junior Associate recruitment with focused practice.",
    href: "/exams/banking/sbi-clerk",
    icon: Building2,
  },
  {
    title: "IBPS PO",
    description:
      "Prepare for the IBPS Probationary Officer examination with a focused study approach.",
    href: "/exams/banking/ibps-po",
    icon: Award,
  },
  {
    title: "IBPS Clerk",
    description:
      "Strengthen your preparation for IBPS Clerk recruitment with practice-oriented learning.",
    href: "/exams/banking/ibps-clerk",
    icon: BriefcaseBusiness,
  },
  {
    title: "RBI Grade B",
    description:
      "Prepare for RBI Grade B with structured coverage of the examination syllabus.",
    href: "/exams/banking/rbi-grade-b",
    icon: BarChart3,
  },
  {
    title: "NABARD Grade A",
    description:
      "Build a strong preparation plan for NABARD Grade A examination.",
    href: "/exams/banking/nabard-grade-a",
    icon: ShieldCheck,
  },
  {
    title: "Insurance Exams",
    description:
      "Explore preparation resources for major insurance-sector competitive examinations.",
    href: "/exams/banking/insurance",
    icon: ShieldCheck,
  },
  {
    title: "Banking Foundation",
    description:
      "Start from the fundamentals of banking, aptitude, reasoning and English.",
    href: "/exams/banking/banking-foundation",
    icon: BookOpen,
  },
];

export default function BankingExamsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/exams"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-violet-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Exams
        </Link>

        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 px-6 py-12 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:px-10 lg:px-14">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              Banking Preparation
            </div>

            <h1 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl">
              Banking Exams
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Choose your target examination and build a focused preparation
              journey with JobWay.
            </p>
          </div>
        </section>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bankingExams.map((exam) => {
            const Icon = exam.icon;

            return (
              <Link
                key={exam.href}
                href={exam.href}
                className="group flex min-h-[270px] flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>

                <h2 className="mt-6 text-xl font-black tracking-tight text-slate-950">
                  {exam.title}
                </h2>

                <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                  {exam.description}
                </p>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-violet-600">
                  Explore Exam
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <section className="mt-10 rounded-[28px] border border-violet-100 bg-white p-7 shadow-sm sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">
                <BookOpen className="h-3.5 w-3.5" />
                One Platform
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                Prepare smarter with JobWay
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Your exam journey will bring together courses, resources,
                practice questions, mock tests and test series in one place.
              </p>
            </div>

            <Link
              href="/courses"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-violet-700"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}