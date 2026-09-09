"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckSquare,
  ClipboardCheck,
  BookOpenCheck,
  GraduationCap,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const modules = [
  {
    title: "Mock Tests",
    description:
      "Create and manage mock tests assigned to your batches.",
    href: "/educator/mock-tests",
    icon: ClipboardCheck,
  },
  {
    title: "Tasks",
    description:
      "View and manage teaching tasks assigned to your workspace.",
    href: "/educator/tasks",
    icon: CheckSquare,
  },
  {
    title: "Courses",
    description:
      "Create, organize and publish courses for JobWay learners.",
    href: "/educator/courses",
    icon: GraduationCap,
  },
  {
    title: "Lesson Plans",
    description:
      "Maintain lesson plans and keep teaching progress updated.",
    href: "/educator/lesson-plans",
    icon: BookOpenCheck,
  },
];

export default function EducatorDashboardPage() {
  const { user } = useAuth();

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <section className="mb-8 overflow-hidden rounded-[28px] border border-red-100 bg-gradient-to-br from-white via-red-50/70 to-orange-50/60 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-red-200 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#E13032]">
                Educator Workspace
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Welcome, {user?.name?.split(" ")[0] || "Educator"}.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage your mock tests, courses, teaching tasks and lesson plans
                from one focused workspace.
              </p>
            </div>

            <Link
              href="/educator/profile"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-100 transition hover:bg-[#c92729]"
            >
              View Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Quick Access
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Your teaching workspace
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#E13032]">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-black text-slate-950">
                    {module.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                    {module.description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#E13032]">
                    Open module
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Account
              </p>

              <h2 className="mt-1 text-lg font-black text-slate-950">
                Educator account
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {user?.email || "Your educator email"}
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
              Educator Access
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}