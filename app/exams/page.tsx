import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const examCategories = [
  {
    title: "Banking Exams",
    description:
      "Prepare for SBI, IBPS, RBI, NABARD and insurance examinations.",
    href: "/exams/banking",
    label: "Explore Banking",
  },
];

export default function ExamsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-12 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:px-10 lg:px-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              Exam Preparation
            </div>

            <h1 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl">
              Crack your next competitive exam with JobWay.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Explore structured exam preparation, practice, mock tests and
              resources built around the exams you are targeting.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {examCategories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <BookOpen className="h-6 w-6" />
              </div>

              <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
                {category.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {category.description}
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-violet-600">
                {category.label}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}

          <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <GraduationCap className="h-6 w-6" />
            </div>

            <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
              More exams coming soon
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              JobWay will expand into additional government and competitive
              exam categories as the preparation platform grows.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
              <ShieldCheck className="h-4 w-4" />
              Built for focused preparation
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}