"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Home,
  Sparkles,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import StudentPortalShell from "@/components/student-portal/StudentPortalShell";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!isAuthenticated) {
      window.location.href = "/";
      return;
    }

    if (user?.role === "admin") {
      window.location.href = "/admin";
    }
  }, [authReady, isAuthenticated, user]);

  if (!authReady) {
    return <DashboardLoading />;
  }

  if (!isAuthenticated || !user || user.role === "admin") {
    return <DashboardLoading message="Redirecting..." />;
  }

  const firstName =
    user.name?.trim().split(/\s+/)[0] || "Student";

  return (
    <StudentPortalShell>
      <main className="student-dashboard min-h-screen overflow-x-hidden bg-[#f6f8fc]">
        {/* =====================================================
            BACKGROUND
           ===================================================== */}

        <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
          <div className="absolute left-[8%] top-[5%] h-[360px] w-[360px] rounded-full bg-red-200/20 blur-[100px]" />

          <div className="absolute right-[5%] top-[10%] h-[420px] w-[420px] rounded-full bg-violet-200/20 blur-[110px]" />

          <div className="absolute bottom-[5%] left-[35%] h-[380px] w-[380px] rounded-full bg-blue-200/15 blur-[110px]" />
        </div>

        {/* =====================================================
            TOP HEADER
           ===================================================== */}

        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-2xl">
          <div className="mx-auto flex min-h-[76px] w-full max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-7 xl:px-10">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E13032]">
                  Student Workspace
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                <span className="hidden text-[10px] font-bold text-slate-400 sm:block">
                  Learning & Preparation
                </span>
              </div>

              <h1 className="mt-1 truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                My Dashboard
              </h1>

              <p className="hidden text-xs font-medium text-slate-500 sm:block">
                Your learning, preparation and performance workspace.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden h-11 w-[230px] items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 shadow-[0_8px_25px_rgba(15,23,42,0.04)] lg:flex">
                <svg
                  className="h-4 w-4 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>

                <span className="text-xs font-semibold text-slate-400">
                  Search dashboard...
                </span>
              </div>

              <Link
                href="/"
                aria-label="Go to JobWay homepage"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-[0_8px_25px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-[#E13032]"
              >
                <Home className="h-[18px] w-[18px]" />
              </Link>

              <button
                type="button"
                aria-label="Notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-[0_8px_25px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
              >
                <Bell className="h-[18px] w-[18px]" />

                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500" />
              </button>

              <div className="hidden items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-2 py-1.5 shadow-[0_8px_25px_rgba(15,23,42,0.04)] sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#E13032] to-violet-600 text-xs font-black text-white shadow-sm">
                  {getInitials(user.name)}
                </div>

                <div className="pr-2">
                  <p className="max-w-[100px] truncate text-xs font-black text-slate-900">
                    {firstName}
                  </p>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Student
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================
            MAIN CONTENT
           ===================================================== */}

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-12 pt-6 sm:px-7 sm:pt-8 xl:px-10">
          {/* =================================================
              WELCOME HERO
             ================================================= */}

          <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-8 lg:p-9">
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-red-100/60 blur-3xl" />

            <div className="pointer-events-none absolute right-[20%] top-0 h-48 w-48 rounded-full bg-violet-100/50 blur-3xl" />

            <div className="relative flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#E13032] to-violet-600 text-white shadow-[0_12px_30px_rgba(225,48,50,0.24)] sm:h-16 sm:w-16 sm:rounded-[20px]">
                  <UserRound className="h-7 w-7 sm:h-8 sm:w-8" />

                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-500">
                      Welcome back,
                    </p>

                    <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#E13032]">
                      Student
                    </span>
                  </div>

                  <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                    {user.name}
                  </h2>

                  <p className="mt-1 truncate text-sm font-medium text-slate-500">
                    {user.email}
                  </p>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                    Continue your preparation, explore courses and build your
                    exam readiness from one place.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:justify-end">
                <Link
                  href="/courses"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#E13032] px-6 text-sm font-black text-white shadow-[0_12px_28px_rgba(225,48,50,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#c92426] hover:shadow-[0_16px_35px_rgba(225,48,50,0.27)]"
                >
                  Start Learning

                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/exams"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 text-sm font-black text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                >
                  Explore Tests
                </Link>
              </div>
            </div>
          </section>

          {/* =================================================
              SNAPSHOT
             ================================================= */}

          <section className="mt-8">
            <SectionHeading
              eyebrow="Overview"
              eyebrowTone="red"
              title="Your Learning Snapshot"
              description="A quick view of your preparation activity."
              right={
                <span className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[10px] font-black text-blue-600 sm:inline-flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Live dashboard
                </span>
              }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={<BookOpen className="h-5 w-5" />}
                label="My Courses"
                value="0"
                description="Courses enrolled"
                tone="red"
              />

              <MetricCard
                icon={<ClipboardList className="h-5 w-5" />}
                label="Test Series"
                value="0"
                description="Test series joined"
                tone="violet"
              />

              <MetricCard
                icon={<Trophy className="h-5 w-5" />}
                label="Tests Attempted"
                value="0"
                description="Tests completed"
                tone="blue"
              />

              <MetricCard
                icon={<Target className="h-5 w-5" />}
                label="Average Score"
                value="—"
                description="Your performance"
                tone="green"
              />
            </div>
          </section>

          {/* =================================================
              QUICK ACTIONS
             ================================================= */}

          <section className="mt-9">
            <SectionHeading
              eyebrow="Quick Actions"
              eyebrowTone="violet"
              title="Continue Your Preparation"
              description="Take your next action without searching through the portal."
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ActionCard
                icon={<BookOpen className="h-6 w-6" />}
                title="My Courses"
                description="View enrolled courses and continue your preparation."
                href="/courses"
                action="View Courses"
                tone="red"
              />

              <ActionCard
                icon={<ClipboardList className="h-6 w-6" />}
                title="Mock Tests"
                description="Practice with mock tests and improve your exam readiness."
                href="/exams"
                action="Explore Tests"
                tone="violet"
              />

              <ActionCard
                icon={<FileText className="h-6 w-6" />}
                title="Study Resources"
                description="Access study material and preparation resources."
                href="/resources"
                action="View Resources"
                tone="blue"
              />
            </div>
          </section>

          {/* =================================================
              ANALYTICS
             ================================================= */}

          <section className="mt-9">
            <SectionHeading
              eyebrow="Analytics"
              eyebrowTone="blue"
              title="Your Progress"
              description="Your performance analytics will grow as you learn and practice."
            />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,1fr)]">
              {/* PERFORMANCE CARD */}

              <div className="group relative overflow-hidden rounded-[24px] border border-white/80 bg-white/75 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_65px_rgba(15,23,42,0.09)] sm:p-7">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-100/40 blur-3xl" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <BarChart3 className="h-6 w-6" />
                      </div>

                      <h3 className="mt-5 text-lg font-black tracking-tight text-slate-950">
                        Performance Analytics
                      </h3>

                      <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                        Track your test scores, accuracy and preparation
                        progress as you begin using JobWay.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-400">
                      Coming soon
                    </span>
                  </div>

                  <div className="mt-7 grid grid-cols-3 gap-3">
                    <MiniMetric label="Tests" value="0" />
                    <MiniMetric label="Accuracy" value="—" />
                    <MiniMetric label="Best Score" value="—" />
                  </div>

                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                        <BarChart3 className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-xs font-black text-slate-600">
                          Your performance chart is waiting for your first test.
                        </p>

                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                          Attempt a mock test to start building your analytics.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GOALS CARD */}

              <div className="group relative overflow-hidden rounded-[24px] border border-white/80 bg-white/75 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_65px_rgba(15,23,42,0.09)] sm:p-7">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-100/40 blur-3xl" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <Target className="h-6 w-6" />
                      </div>

                      <h3 className="mt-5 text-lg font-black tracking-tight text-slate-950">
                        Preparation Goals
                      </h3>

                      <p className="mt-1.5 text-sm leading-6 text-slate-500">
                        Set your exam goals and monitor your preparation
                        journey.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-400">
                      Coming soon
                    </span>
                  </div>

                  <div className="mt-7 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                        <Target className="h-5 w-5" />
                      </div>

                      <p className="mt-4 text-sm font-black text-slate-700">
                        No preparation goal yet
                      </p>

                      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                        Your goal tracking tools will appear here as the
                        preparation system becomes active.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              RECENT ACTIVITY
             ================================================= */}

          <section className="mt-9">
            <SectionHeading
              eyebrow="Activity"
              eyebrowTone="amber"
              title="Recent Activity"
              description="Your latest learning activity will appear here."
            />

            <div className="rounded-[24px] border border-white/80 bg-white/75 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.055)] backdrop-blur-2xl sm:p-8">
              <div className="flex flex-col items-center justify-center py-7 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Clock3 className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-base font-black text-slate-900">
                  No activity yet
                </h3>

                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Start a course or attempt a mock test and your learning
                  activity will appear here.
                </p>

                <Link
                  href="/courses"
                  className="group mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#E13032] px-5 text-xs font-black text-white shadow-[0_8px_22px_rgba(225,48,50,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#c92426]"
                >
                  Start Learning

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </section>

          {/* =================================================
              ACCOUNT INFORMATION
             ================================================= */}

          <section className="mt-9">
            <SectionHeading
              eyebrow="Account"
              eyebrowTone="slate"
              title="Account Information"
              description="Your current JobWay account details."
              right={
                <Link
                  href="/dashboard/profile"
                  className="hidden items-center gap-1.5 text-xs font-black text-[#E13032] transition-colors hover:text-[#b91c1c] sm:inline-flex"
                >
                  Manage Profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />

            <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white/75 shadow-[0_18px_55px_rgba(15,23,42,0.055)] backdrop-blur-2xl">
              <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                <AccountInfo
                  label="Full Name"
                  value={user.name}
                />

                <AccountInfo
                  label="Email Address"
                  value={user.email}
                />

                <AccountInfo
                  label="Phone Number"
                  value={user.phone}
                />

                <AccountInfo
                  label="Account Type"
                  value="Student"
                />
              </div>
            </div>

            <Link
              href="/dashboard/profile"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-[#E13032] sm:hidden"
            >
              Manage Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </div>
      </main>
    </StudentPortalShell>
  );
}

/* =========================================================
   SECTION HEADING
   ========================================================= */

function SectionHeading({
  eyebrow,
  eyebrowTone,
  title,
  description,
  right,
}: {
  eyebrow: string;
  eyebrowTone: "red" | "violet" | "blue" | "amber" | "slate";
  title: string;
  description: string;
  right?: React.ReactNode;
}) {
  const eyebrowClasses = {
    red: "text-[#E13032]",
    violet: "text-violet-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
    slate: "text-slate-500",
  };

  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p
          className={`text-[10px] font-black uppercase tracking-[0.18em] ${eyebrowClasses[eyebrowTone]}`}
        >
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
          {title}
        </h2>

        <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
          {description}
        </p>
      </div>

      {right}
    </div>
  );
}

/* =========================================================
   METRIC CARD
   ========================================================= */

function MetricCard({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  tone: "red" | "violet" | "blue" | "green";
}) {
  const toneClasses = {
    red: {
      icon: "bg-red-50 text-[#E13032]",
      glow: "bg-red-100/30",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      glow: "bg-violet-100/30",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600",
      glow: "bg-blue-100/30",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-600",
      glow: "bg-emerald-100/30",
    },
  };

  const currentTone = toneClasses[tone];

  return (
    <div className="group relative min-w-0 overflow-hidden rounded-[22px] border border-white/85 bg-white/75 p-5 shadow-[0_15px_45px_rgba(15,23,42,0.055)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,23,42,0.085)]">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${currentTone.glow}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-[10px] font-bold text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${currentTone.icon} transition-transform duration-300 group-hover:scale-105`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ACTION CARD
   ========================================================= */

function ActionCard({
  icon,
  title,
  description,
  href,
  action,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  action: string;
  tone: "red" | "violet" | "blue";
}) {
  const toneClasses = {
    red: "bg-red-50 text-[#E13032]",
    violet: "bg-violet-50 text-violet-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <Link
      href={href}
      className="group relative flex min-h-[205px] flex-col overflow-hidden rounded-[24px] border border-white/85 bg-white/75 p-6 shadow-[0_16px_48px_rgba(15,23,42,0.055)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_65px_rgba(15,23,42,0.09)]"
    >
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-slate-100/40 blur-3xl transition-transform duration-500 group-hover:scale-125" />

      <div className="relative flex h-full flex-col">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses[tone]} transition-transform duration-300 group-hover:scale-105`}
        >
          {icon}
        </div>

        <h3 className="mt-5 text-base font-black tracking-tight text-slate-950">
          {title}
        </h3>

        <p className="mt-2 flex-1 text-xs leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs font-black text-[#E13032]">
          {action}

          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   MINI METRIC
   ========================================================= */

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/75 p-3.5">
      <span className="block text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>

      <strong className="mt-1 block text-lg font-black tracking-tight text-slate-700">
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   ACCOUNT INFO
   ========================================================= */

function AccountInfo({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="min-w-0 p-5 sm:p-6">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-black text-slate-700">
        {value || "Not available"}
      </p>
    </div>
  );
}

/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(name?: string) {
  if (!name?.trim()) {
    return "S";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

/* =========================================================
   LOADING
   ========================================================= */

function DashboardLoading({
  message = "Loading your account...",
}: {
  message?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#E13032]" />

          <Sparkles className="absolute h-3.5 w-3.5 text-[#E13032]" />
        </div>

        <p className="mt-4 text-sm font-bold text-slate-500">
          {message}
        </p>
      </div>
    </main>
  );
}