"use client";

import Link from "next/link";
import { Bell, Home, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface EducatorNavbarProps {
  onMenuClick?: () => void;
}

export function EducatorNavbar({
  onMenuClick,
}: EducatorNavbarProps) {
  const { user } = useAuth();

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ED";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-[76px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 lg:hidden"
            aria-label="Open educator menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Educator Workspace
            </p>

            <p className="text-sm font-bold text-slate-900">
              JobWay Educator Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:flex"
          >
            <Home className="h-4 w-4" />
            View Website
          </Link>

          <button
            type="button"
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E13032] text-xs font-black text-white">
              {initials}
            </div>

            <div className="hidden pr-2 sm:block">
              <p className="max-w-[160px] truncate text-xs font-bold text-slate-900">
                {user?.name || "Educator"}
              </p>

              <p className="text-[10px] text-slate-400">
                Educator
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}