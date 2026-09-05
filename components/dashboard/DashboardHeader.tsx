"use client";

import Link from "next/link";

import {
  Bell,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

type DashboardHeaderProps = {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
};

export function DashboardHeader({
  title = "Dashboard",
  subtitle,
  onMenuClick,
  showSearch = true,
  showNotifications = true,
}: DashboardHeaderProps) {
  const router = useRouter();

  const { user, signOut } = useAuth();

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || "User";

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : "Student";

  const handleLogout = () => {
    signOut();
    router.replace("/");
  };

  return (
    <header className="dashboard-header sticky top-0 z-30 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
      <div className="flex min-h-[76px] w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            LEFT SIDE
           ===================================================== */}

        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              aria-label="Open dashboard navigation"
              onClick={onMenuClick}
              className="
                dashboard-focus-ring
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-600
                shadow-sm
                transition-all
                duration-200
                hover:border-red-200
                hover:bg-red-50
                hover:text-[#E13032]
                lg:hidden
              "
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {roleLabel} Workspace
            </p>

            <h1 className="truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
              {title}
            </h1>

            {subtitle && (
              <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
           ===================================================== */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Search */}

          {showSearch && (
            <div className="hidden w-[220px] lg:block xl:w-[280px]">
              <label className="relative block w-full">
                <Search
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                  aria-hidden="true"
                />

                <input
                  type="search"
                  placeholder="Search dashboard..."
                  className="
                    dashboard-focus-ring
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white/80
                    pl-9
                    pr-3
                    text-xs
                    font-semibold
                    text-slate-700
                    outline-none
                    transition-all
                    placeholder:text-slate-400
                    focus:border-red-300
                    focus:bg-white
                    focus:ring-4
                    focus:ring-red-500/10
                  "
                />
              </label>
            </div>
          )}

          {/* Home */}

          <Link
            href="/"
            aria-label="View JobWay website"
            className="
              dashboard-focus-ring
              hidden
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white/80
              text-slate-500
              shadow-sm
              transition-all
              duration-200
              hover:border-red-200
              hover:bg-red-50
              hover:text-[#E13032]
              sm:flex
            "
          >
            <Home className="h-4 w-4" />
          </Link>

          {/* Notifications */}

          {showNotifications && (
            <button
              type="button"
              aria-label="Notifications"
              className="
                dashboard-focus-ring
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white/80
                text-slate-500
                shadow-sm
                transition-all
                duration-200
                hover:border-violet-200
                hover:bg-violet-50
                hover:text-violet-700
              "
            >
              <Bell className="h-4 w-4" />

              <span
                className="
                  absolute
                  right-2.5
                  top-2.5
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-fuchsia-500
                  ring-2
                  ring-white
                "
              />
            </button>
          )}

          {/* Profile */}

          <div className="group relative">
            <button
              type="button"
              aria-label="Open profile menu"
              className="
                dashboard-focus-ring
                flex
                min-h-10
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white/85
                px-2
                py-1.5
                shadow-sm
                transition-all
                duration-200
                hover:border-violet-200
                hover:bg-white
              "
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-gradient-to-br
                  from-[#E13032]
                  to-violet-600
                  text-[10px]
                  font-black
                  text-white
                "
              >
                {initials}
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-[120px] truncate text-xs font-black text-slate-900">
                  {firstName}
                </p>

                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  {roleLabel}
                </p>
              </div>

              <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
            </button>

            {/* Profile dropdown */}

            <div
              className="
                invisible
                absolute
                right-0
                top-[calc(100%+8px)]
                w-52
                translate-y-1
                rounded-2xl
                border
                border-slate-200/80
                bg-white/95
                p-2
                opacity-0
                shadow-[0_20px_45px_rgba(15,23,42,0.12)]
                backdrop-blur-xl
                transition-all
                duration-150
                group-hover:visible
                group-hover:translate-y-0
                group-hover:opacity-100
                group-focus-within:visible
                group-focus-within:translate-y-0
                group-focus-within:opacity-100
              "
            >
              <div className="mb-1 rounded-xl bg-slate-50 px-3 py-2">
                <p className="truncate text-xs font-black text-slate-900">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-[10px] font-medium text-slate-500">
                  {user?.email || ""}
                </p>
              </div>

              <Link
                href="/dashboard/profile"
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  px-3
                  py-2.5
                  text-xs
                  font-bold
                  text-slate-600
                  transition-colors
                  hover:bg-red-50
                  hover:text-[#E13032]
                "
              >
                <UserRound className="h-4 w-4" />
                My Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  gap-2
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-xs
                  font-bold
                  text-rose-600
                  transition-colors
                  hover:bg-rose-50
                "
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}