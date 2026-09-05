"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Target,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";

type DashboardSidebarItem =
  | "dashboard"
  | "profile"
  | "courses"
  | "test-series"
  | "mock-tests"
  | "attempts"
  | "resources"
  | "performance"
  | "achievements"
  | "purchases"
  | "settings";

type StudentPortalShellProps = {
  children: ReactNode;
};

type SidebarItemProps = {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
};

function getActiveItem(pathname: string): DashboardSidebarItem {
  if (pathname === "/dashboard") {
    return "dashboard";
  }

  if (pathname.startsWith("/dashboard/profile")) {
    return "profile";
  }

  if (pathname.startsWith("/dashboard/attempts")) {
    return "attempts";
  }
  if (pathname.startsWith("/dashboard/performance")) {
    return "performance";
  }

  if (pathname.startsWith("/dashboard/achievements")) {
    return "achievements";
  }

  if (pathname.startsWith("/dashboard/purchases")) {
    return "purchases";
  }

  if (pathname.startsWith("/dashboard/settings")) {
    return "settings";
  }

  if (pathname.startsWith("/courses")) {
    return "courses";
  }

  if (pathname.startsWith("/test-series")) {
    return "test-series";
  }

  if (pathname.startsWith("/exams")) {
    return "mock-tests";
  }

  if (pathname.startsWith("/resources")) {
    return "resources";
  }

  return "dashboard";
}

function SidebarSectionLabel({
  children,
}: {
  children: ReactNode;
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

function DashboardSidebar({
  activeItem,
  onNavigate,
  onLogout,
}: {
  activeItem: DashboardSidebarItem;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const { user } = useAuth();

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || "Student";

  return (
    <div className="flex h-full w-full flex-col">
      {/* BRAND */}
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

      {/* STUDENT PROFILE */}
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

      {/* NAVIGATION */}
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

      {/* BOTTOM AREA */}
      <div className="shrink-0 border-t border-slate-100 p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#E13032]"
        >
          <ChevronRight
            className="h-[18px] w-[18px] rotate-180"
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

export default function StudentPortalShell({
  children,
}: StudentPortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, signOut, isAuthenticated } = useAuth();

  /*
   * Prevent hydration mismatches caused by AuthContext restoring
   * authentication state from localStorage on the client.
   */
  const [mounted, setMounted] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * The portal shell only controls the student areas.
   * The public homepage and authentication pages remain
   * completely outside the student portal navigation.
   */
  const studentPortalPaths =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/test-series") ||
    pathname.startsWith("/exams") ||
    pathname.startsWith("/resources");

  /*
   * During the server render and the first client render,
   * keep the output identical. Once mounted, we can safely
   * use the authentication state restored from localStorage.
   */
  if (!mounted || !studentPortalPaths || !isAuthenticated || !user) {
    return <>{children}</>;
  }

  /*
   * Admin users use the separate admin portal and should
   * never receive the student sidebar.
   */
  if (user.role === "admin") {
    return <>{children}</>;
  }

  const activeItem = getActiveItem(pathname);

  const handleLogout = () => {
    setMobileSidebarOpen(false);
    signOut();
    router.replace("/");
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          MOBILE TOP BAR
         ===================================================== */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={closeMobileSidebar}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
            <GraduationCap
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <span className="block text-lg font-black tracking-tight text-slate-900">
              JobWay
            </span>

            <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Student Portal
            </span>
          </div>
        </Link>

        <button
          type="button"
          aria-label={
            mobileSidebarOpen
              ? "Close dashboard menu"
              : "Open dashboard menu"
          }
          aria-expanded={mobileSidebarOpen}
          onClick={() =>
            setMobileSidebarOpen((current) => !current)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#E13032]"
        >
          {mobileSidebarOpen ? (
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          ) : (
            <Menu
              className="h-5 w-5"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE SIDEBAR
         ===================================================== */}
      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard menu"
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
            onClick={closeMobileSidebar}
          />

          <aside className="relative flex h-full w-[290px] max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-2xl">
            <DashboardSidebar
              activeItem={activeItem}
              onNavigate={closeMobileSidebar}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      ) : null}

      {/* =====================================================
          DESKTOP SIDEBAR
         ===================================================== */}
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-[260px] border-r border-slate-200 bg-white lg:flex">
        <DashboardSidebar
          activeItem={activeItem}
          onNavigate={() => undefined}
          onLogout={handleLogout}
        />
      </aside>

      {/* =====================================================
          PAGE CONTENT
         ===================================================== */}
<div className="lg:pl-[260px]">
        {children}
      </div>
    </div>
  );
}


