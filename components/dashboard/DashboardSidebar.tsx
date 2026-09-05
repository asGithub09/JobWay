"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};

export type DashboardNavSection = {
  label: string;
  items: DashboardNavItem[];
};

type DashboardSidebarProps = {
  sections: DashboardNavSection[];
  activeHref?: string;
  onNavigate?: () => void;
  onLogout?: () => void;
  onClose?: () => void;
  mobile?: boolean;
  brandLabel?: string;
  brandSubtitle?: string;
};

function isItemActive(
  pathname: string,
  item: DashboardNavItem,
  activeHref?: string,
) {
  const currentPath = activeHref || pathname;

  if (item.exact) {
    return currentPath === item.href;
  }

  return (
    currentPath === item.href ||
    currentPath.startsWith(`${item.href}/`)
  );
}

export function DashboardSidebar({
  sections,
  activeHref,
  onNavigate,
  onLogout,
  onClose,
  mobile = false,
  brandLabel = "JobWay",
  brandSubtitle = "STUDENT PORTAL",
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const { user } = useAuth();

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || "Student";

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "S";

  const roleLabel =
    user?.role === "admin"
      ? "ADMINISTRATOR"
      : "STUDENT";

  const handleNavigate = () => {
    onNavigate?.();
  };

  const handleLogout = () => {
    onLogout?.();
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* =====================================================
          BRAND
         ===================================================== */}

      <div className="flex h-[76px] shrink-0 items-center border-b border-slate-200/70 px-5">
        <Link
          href="/"
          onClick={handleNavigate}
          className="group flex min-w-0 items-center gap-3"
        >
          <span
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-[#E13032]
              via-[#ef4444]
              to-violet-600
              text-sm
              font-black
              text-white
              shadow-[0_10px_25px_rgba(225,48,50,0.22)]
              transition-transform
              duration-200
              group-hover:scale-105
            "
          >
            J
          </span>

          <span className="min-w-0">
            <span className="block truncate text-[17px] font-black tracking-tight text-slate-950">
              {brandLabel}
            </span>

            <span className="block truncate text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
              {brandSubtitle}
            </span>
          </span>
        </Link>

        {mobile && (
          <button
            type="button"
            aria-label="Close dashboard menu"
            onClick={onClose}
            className="
              dashboard-focus-ring
              ml-auto
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-500
              transition
              hover:border-red-200
              hover:bg-red-50
              hover:text-[#E13032]
            "
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* =====================================================
          USER CARD
         ===================================================== */}

      <div className="px-4 pt-4">
        <div className="dashboard-user-card rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-[#E13032]
                to-violet-600
                text-xs
                font-black
                text-white
                shadow-[0_8px_18px_rgba(124,58,237,0.18)]
              "
            >
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-black text-slate-900">
                {firstName}
              </p>

              <p className="mt-0.5 truncate text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                {roleLabel}
              </p>
            </div>

            <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]" />
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
         ===================================================== */}

      <nav className="dashboard-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-5">
        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.label}>
              <div className="mb-2 px-3">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {section.label}
                </p>
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isItemActive(
                    pathname,
                    item,
                    activeHref,
                  );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavigate}
                      className={`
                        dashboard-nav-item
                        group
                        relative
                        flex
                        min-h-[44px]
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        text-sm
                        font-bold
                        transition-all
                        duration-200
                        ${
                          active
                            ? "bg-gradient-to-r from-red-50 via-white to-violet-50 text-[#E13032] shadow-[0_8px_20px_rgba(225,48,50,0.08)]"
                            : "text-slate-600 hover:bg-white/80 hover:text-slate-950"
                        }
                      `}
                    >
                      {active && (
                        <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-gradient-to-b from-[#E13032] to-violet-600" />
                      )}

                      <span
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          transition-all
                          duration-200
                          ${
                            active
                              ? "bg-white text-[#E13032] shadow-sm"
                              : "text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-700"
                          }
                        `}
                      >
                        {item.icon}
                      </span>

                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>

                      <ChevronRight
                        className={`
                          h-3.5
                          w-3.5
                          shrink-0
                          transition-all
                          duration-200
                          ${
                            active
                              ? "translate-x-0 text-[#E13032] opacity-100"
                              : "-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          }
                        `}
                      />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      {/* =====================================================
          FOOTER ACTIONS
         ===================================================== */}

      <div className="shrink-0 border-t border-slate-200/70 p-3">
        <Link
          href="/"
          onClick={handleNavigate}
          className="
            group
            mb-1
            flex
            min-h-[42px]
            items-center
            gap-3
            rounded-xl
            px-3
            text-xs
            font-bold
            text-slate-500
            transition-all
            hover:bg-white/80
            hover:text-slate-900
          "
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-slate-200">
            <ArrowLeft className="h-4 w-4" />
          </span>

          <span>Back to JobWay</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="
            group
            flex
            min-h-[42px]
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            text-xs
            font-bold
            text-rose-500
            transition-all
            hover:bg-rose-50
          "
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 transition group-hover:bg-rose-100">
            <LogOut className="h-4 w-4" />
          </span>

          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}