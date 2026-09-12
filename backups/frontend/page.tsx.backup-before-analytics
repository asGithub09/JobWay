"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  Factory,
  FolderTree,
  GraduationCap,
  Layers3,
  Megaphone,
  Settings,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { AdminBackButton } from "@/components/admin/AdminBackButton";

const stats = [
  {
    label: "Students",
    value: "Live",
    description: "Student management",
  },
  {
    label: "Leads",
    value: "Live",
    description: "Lead management",
  },
  {
    label: "Batches",
    value: "Live",
    description: "Batch management",
  },
  {
    label: "Courses",
    value: "Live",
    description: "Learning management",
  },
];

const modules = [
  {
    title: "Students",
    description:
      "Manage student accounts, profiles and learner information.",
    href: "/admin/students",
    icon: Users,
    status: "Live",
  },
  {
    title: "Leads",
    description:
      "View and manage career-interest leads captured from the website.",
    href: "/admin/leads",
    icon: UserRound,
    status: "Live",
  },
  {
    title: "Batches",
    description:
      "Create and manage batches and control learner access.",
    href: "/admin/batches",
    icon: Layers3,
    status: "Live",
  },
  {
    title: "Courses",
    description:
      "Manage JobWay learning products and course content.",
    href: "/admin/courses",
    icon: BookOpen,
    status: "Live",
  },
  {
    title: "Course Categories",
    description:
      "Organize courses into structured categories.",
    href: "/admin/course-categories",
    icon: FolderTree,
    status: "Live",
  },
  {
    title: "Course Factory",
    description:
      "Build and manage structured course content and lessons.",
    href: "/admin/course-factory",
    icon: Factory,
    status: "Live",
  },
  {
    title: "Exams",
    description:
      "Manage examinations, test series, mock tests and assessment content.",
    href: "/admin/exams",
    icon: ClipboardCheck,
    status: "Live",
  },
  {
    title: "Jobs",
    description:
      "Manage government and private job discovery content.",
    href: "/admin/jobs",
    icon: BriefcaseBusiness,
    status: "Soon",
  },
];

const websiteModules = [
  {
    title: "Banners",
    description:
      "Manage homepage banners, images, CTAs, links and display order.",
    icon: Sparkles,
    status: "Phase 2",
  },
  {
    title: "Notices",
    description:
      "Create important announcements and notices for website visitors.",
    icon: Megaphone,
    status: "Phase 3",
  },
  {
    title: "Advertisements",
    description:
      "Manage promotional advertisements and website placements.",
    icon: Megaphone,
    status: "Phase 4",
  },
  {
    title: "Campaigns",
    description:
      "Create and manage promotional campaigns across the platform.",
    icon: Megaphone,
    status: "Phase 5",
  },
  {
    title: "Media Library",
    description:
      "Centralize website images, banners and other media assets.",
    icon: BookOpen,
    status: "Phase 6",
  },
  {
    title: "Website Content",
    description:
      "Control important website sections and editable content.",
    icon: Settings,
    status: "Phase 7",
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        {/* PAGE HEADER */}
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
            <div
              className="
                flex
                flex-col
                gap-6
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
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

                <h1
                  className="
                    text-3xl
                    font-black
                    tracking-tight
                    text-slate-950
                    sm:text-4xl
                  "
                >
                  Admin Dashboard
                </h1>

                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-600
                    sm:text-base
                  "
                >
                  Manage the JobWay platform, learning
                  services, assessments and website
                  operations from one workspace.
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
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
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
        <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
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
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                {stat.label}
              </p>

              <p className="mt-2 text-2xl font-black text-slate-950">
                {stat.value}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {stat.description}
              </p>
            </div>
          ))}
        </section>

        {/* CORE MODULES */}
        <section className="mb-12">
          <div className="mb-5">
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.16em]
                text-violet-600
              "
            >
              Administration
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-black
                tracking-tight
                text-slate-950
              "
            >
              Core Platform
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage the existing JobWay platform services.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => {
              const Icon = module.icon;
              const live = module.status === "Live";

              return (
                <div
                  key={module.title}
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
                      {module.status}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-900">
                    {module.title}
                  </h3>

                  <p
                    className="
                      mt-2
                      min-h-[60px]
                      text-sm
                      leading-5
                      text-slate-500
                    "
                  >
                    {module.description}
                  </p>

                  {live ? (
                    <Link
                      href={module.href}
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
                      <ArrowRight
                        className="
                          h-4
                          w-4
                          transition
                          group-hover:translate-x-1
                        "
                      />
                    </Link>
                  ) : (
                    <span
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-bold
                        text-slate-400
                      "
                    >
                      Available in next phase
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* WEBSITE MANAGEMENT */}
        <section>
          <div className="mb-5">
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.16em]
                text-fuchsia-600
              "
            >
              Website Operations
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-black
                tracking-tight
                text-slate-950
              "
            >
              Website Management
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage the public-facing JobWay website without
              interfering with the existing learning and
              administration services.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {websiteModules.map((module) => {
              const Icon = module.icon;

              return (
                <div
                  key={module.title}
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
                    hover:border-fuchsia-200
                    hover:shadow-xl
                    hover:shadow-fuchsia-100/40
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
                        bg-fuchsia-50
                        text-fuchsia-600
                        transition
                        group-hover:bg-fuchsia-600
                        group-hover:text-white
                      "
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-2.5
                        py-1
                        text-[10px]
                        font-black
                        uppercase
                        tracking-wide
                        text-slate-500
                      "
                    >
                      {module.status}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-900">
                    {module.title}
                  </h3>

                  <p
                    className="
                      mt-2
                      min-h-[60px]
                      text-sm
                      leading-5
                      text-slate-500
                    "
                  >
                    {module.description}
                  </p>

                  <span
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      font-bold
                      text-slate-400
                    "
                  >
                    Planned for website management
                  </span>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}