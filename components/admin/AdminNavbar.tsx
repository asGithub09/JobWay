"use client";

import Link from "next/link";
import {
  Bell,
  Menu,
  Home,
} from "lucide-react";

interface AdminNavbarProps {
  onMenuClick?: () => void;
}

export function AdminNavbar({
  onMenuClick,
}: AdminNavbarProps) {
  return (
    <header
      className="
        sticky
        top-0
        z-30
        border-b
        border-slate-200/80
        bg-white/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          h-[76px]
          items-center
          justify-between
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              p-2.5
              text-slate-600
              shadow-sm
              transition
              hover:border-violet-200
              hover:bg-violet-50
              hover:text-violet-700
              lg:hidden
            "
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Administration
            </p>

            <p className="text-sm font-bold text-slate-900">
              JobWay Admin Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="
              hidden
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              transition
              hover:border-violet-200
              hover:bg-violet-50
              hover:text-violet-700
              sm:flex
            "
          >
            <Home className="h-4 w-4" />
            View Website
          </Link>

          <button
            type="button"
            className="
              relative
              rounded-xl
              border
              border-slate-200
              bg-white
              p-2.5
              text-slate-600
              shadow-sm
              transition
              hover:border-violet-200
              hover:bg-violet-50
              hover:text-violet-700
            "
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />

            <span
              className="
                absolute
                right-2
                top-2
                h-1.5
                w-1.5
                rounded-full
                bg-fuchsia-500
              "
            />
          </button>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-slate-200
              bg-white
              px-2
              py-1.5
              shadow-sm
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-gradient-to-br
                from-violet-600
                to-fuchsia-600
                text-xs
                font-black
                text-white
              "
            >
              A
            </div>

            <div className="hidden pr-2 sm:block">
              <p className="text-xs font-bold text-slate-900">
                Administrator
              </p>

              <p className="text-[10px] text-slate-400">
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}