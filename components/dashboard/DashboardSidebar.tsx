"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";

type DashboardUser = {
  name: string;
  email: string;
};

export type DashboardSidebarItem =
  | "dashboard"
  | "profile"
  | "courses"
  | "test-series"
  | "mock-tests"
  | "resources"
  | "performance"
  | "achievements"
  | "purchases"
  | "settings";

type DashboardSidebarProps = {
  user: DashboardUser;
  activeItem: DashboardSidebarItem;
  onNavigate?: () => void;
  onLogout: () => void;
};

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
};

function SidebarSectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mb-2 mt-5 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400 first:mt-0">
      {children}
    </p>
  );
}

function SidebarItem({
  icon,
  label,
  href,
  active = false,
  onClick,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
        active
          ? "bg-[#E13032] text-white shadow-[0_5px_18px_rgba(225,48,50,0.18)]"
          : "text-slate-600 hover:bg-red-50 hover:text-[#E13032]"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active
            ? "bg-white/15 text-white"
            : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-[#E13032]"
        }`}
      >
        {icon}
      </span>

      <span className="flex-1 truncate">{label}</span>

      <ChevronRight
        className={`h-4 w-4 shrink-0 transition-all duration-200 ${
          active
            ? "text-white/70"
            : "text-slate-300 opacity-0 group-hover:translate-x-0.5 group-hover:text-[#E13032] group-hover:opacity-100"
        }`}
        aria-hidden="true"
      />
    </Link>
  );
}

export default function DashboardSidebar({
  user,
  activeItem,
  onNavigate,
  onLogout,
}: DashboardSidebarProps) {
  const firstName =
    user.name?.trim().split(/\s+/)[0] || "Student";

  return (
    <div className="flex h-full w-full flex-col">
      {/* =====================================================
          BRAND
         ===================================================== */}
      <div className="flex h-[72px] shrink-0 items-center border-b border-slate-100 px-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#E13032] transition-transform duration-200 group-hover:scale-105">
            <GraduationCap
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <div className="text-xl font-black tracking-tight text-slate-900">
              JobWay
            </div>

            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Student Portal
            </div>
          </div>
        </Link>
      </div>

      {/* =====================================================
          STUDENT PROFILE
         ===================================================== */}
      <div className="px-4 pt-5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#E13032] shadow-sm">
              <UserRound
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900">
                {firstName}
              </p>

              <p className="truncate text-xs font-medium text-slate-500">
                Student Account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
         ===================================================== */}
      <nav
        aria-label="Student dashboard navigation"
        className="mt-5 flex-1 overflow-y-auto px-3 pb-4"
      >
        <SidebarSectionLabel>
          Overview
        </SidebarSectionLabel>

        <SidebarItem
          icon={
            <LayoutDashboard
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          }
          label="Dashboard"
          href="/dashboard"
          active={activeItem === "dashboard"}
          onClick={onNavigate}
        />

        <SidebarItem
          icon={
            <UserRound
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          }
          label="My Profile"
          href="/dashboard/profile"
          active={activeItem === "profile"}
          onClick={onNavigate}
        />

        <SidebarSectionLabel>
          My Preparation
        </SidebarSectionLabel>

        <SidebarItem
          icon={
            <BookOpen
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          }
          label="My Courses"
          href="/courses"
          active={activeItem === "courses"}
          onClick={onNavigate}
        />

        <SidebarItem
          icon={
            <ClipboardList
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          }
          label="Test Series"
          href="/test-series"
          active={activeItem === "test-series"}
          onClick={onNavigate}
        />

        <SidebarItem
          icon={
            <Target
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          }
          label="Mock Tests"
          href="/exams"
          active={activeItem === "mock-tests"}
          onClick={onNavigate}
        />

        <SidebarItem
          icon={
            <FileText
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          }
          label="Study Resources"
          href="/resources"
          active={activeItem === "resources"}
          onClick={onNavigate}
        />

        <SidebarSectionLabel>
          Performance
        </SidebarSectionLabel>

        <SidebarItem
          icon={
            <BarChart3
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          }
          label="My Performance"
          href="/dashboard/performance"
          active={activeItem === "performance"}
          onClick={onNavigate}
        />

        <SidebarItem
          icon={
            <Trophy
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          }
          label="Achievements"
          href="/dashboard/achievements"
          active={activeItem === "achievements"}
          onClick={onNavigate}
        />

        <SidebarSectionLabel>
          Account
        </SidebarSectionLabel>

        <SidebarItem
          icon={
            <ShoppingBag
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          }
          label="My Purchases"
          href="/dashboard/purchases"
          active={activeItem === "purchases"}
          onClick={onNavigate}
        />

        <SidebarItem
          icon={
            <Settings
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          }
          label="Settings"
          href="/dashboard/settings"
          active={activeItem === "settings"}
          onClick={onNavigate}
        />
      </nav>

      {/* =====================================================
          BOTTOM AREA
         ===================================================== */}
      <div className="shrink-0 border-t border-slate-100 p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#E13032]"
        >
          <ArrowRight
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          />

          Back to JobWay
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          />

          Logout
        </button>
      </div>
    </div>
  );
}