"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  Users,
  UserRound,
  Sparkles,
} from "lucide-react";

import { AdminBackButton } from "@/components/admin/AdminBackButton";

const cards = [
  {
    title: "Users",
    description:
      "Manage JobWay student and administrator accounts.",
    href: "/admin/users",
    icon: Users,
    value: "Coming soon",
  },
  {
    title: "Leads",
    description:
      "View and manage career-interest leads captured from the website.",
    href: "/admin/leads",
    icon: UserRound,
    value: "Live",
  },
  {
    title: "Enrollments",
    description:
      "Track course enrollments and learner access.",
    href: "/admin/enrollments",
    icon: GraduationCap,
    value: "Coming soon",
  },
  {
    title: "Payments",
    description:
      "Monitor purchases, transactions and payment status.",
    href: "/admin/payments",
    icon: BarChart3,
    value: "Coming soon",
  },
  {
    title: "Courses",
    description:
      "Manage JobWay learning products and course content.",
    href: "/admin/courses",
    icon: GraduationCap,
    value: "Coming soon",
  },
  {
    title: "Exams",
    description:
      "Manage examinations, mock tests and assessment content.",
    href: "/admin/exams",
    icon: ClipboardCheck,
    value: "Coming soon",
  },
  {
    title: "Jobs",
    description:
      "Manage government and private job discovery content.",
    href: "/admin/jobs",
    icon: BriefcaseBusiness,
    value: "Coming soon",
  },
  {
    title: "Campaigns",
    description:
      "Create promotional campaigns and site-wide marketing banners.",
    href: "/admin/campaigns",
    icon: Megaphone,
    value: "Coming soon",
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* PAGE TOP */}
        <div className="mb-8">
          <div className="mb-5">
            <AdminBackButton
              fallback="/"
              label="Back"
            />
          </div>

          <div
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-violet-100
              bg-gradient-to-br
              from-white
              via-violet-50/70
              to-fuchsia-50/60
              p-6
              shadow-sm
              sm:p-8
            "
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div
                  className="
                    mb-4
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-violet-200
                    bg-white/80
                    px-3
                    py-1.5
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-violet-700
                  "
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  JobWay Control Center
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Admin Dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Manage users, leads, learning,
                  examinations, jobs and the
                  complete JobWay platform from
                  one workspace.
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-white
                  bg-white/80
                  px-5
                  py-4
                  shadow-sm
                  backdrop-blur
                "
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  System
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                  <span className="text-sm font-black text-slate-800">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Users", "—", "Platform users"],
            ["Leads", "Live", "Lead CRM"],
            ["Courses", "—", "Learning"],
            ["Exams", "—", "Assessments"],
          ].map(
            ([label, value, description]) => (
              <div
                key={label}
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </p>

                <p className="mt-2 text-2xl font-black text-slate-950">
                  {value}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {description}
                </p>
              </div>
            ),
          )}
        </section>

        {/* MODULES */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
              Administration
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              Platform Modules
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              const live = card.value === "Live";

              return (
                <div
                  key={card.title}
                  className="
                    group
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                    transition
                    hover:-translate-y-1
                    hover:border-violet-200
                    hover:shadow-xl
                    hover:shadow-violet-100/50
                  "
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-violet-50
                        text-violet-600
                        transition
                        group-hover:bg-violet-600
                        group-hover:text-white
                      "
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <span
                      className={`
                        rounded-full
                        px-2.5
                        py-1
                        text-[10px]
                        font-black
                        uppercase
                        tracking-wide
                        ${
                          live
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }
                      `}
                    >
                      {card.value}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-900">
                    {card.title}
                  </h3>

                  <p className="mt-2 min-h-[60px] text-sm leading-5 text-slate-500">
                    {card.description}
                  </p>

                  {live ? (
                    <Link
                      href={card.href}
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-black
                        text-violet-600
                        transition
                        hover:text-violet-800
                      "
                    >
                      Open module
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-400">
                      Available in next phase
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}