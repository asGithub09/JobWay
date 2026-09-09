"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  UserCircle,
  X,
  BookOpenCheck,
  GraduationCap,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

interface EducatorSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  {
    label: "Workspace",
    items: [
      {
        label: "Overview",
        href: "/educator",
        icon: LayoutDashboard,
      },
      {
        label: "Exam Builder",
        href: "/educator/exams",
        icon: ClipboardCheck,
      },
      {
        label: "Courses",
        href: "/educator/courses",
        icon: GraduationCap,
      },
      {
        label: "Tasks",
        href: "/educator/tasks",
        icon: CheckSquare,
      },
      {
        label: "Lesson Plans",
        href: "/educator/lesson-plans",
        icon: BookOpenCheck,
      },
      {
        label: "Profile",
        href: "/educator/profile",
        icon: UserCircle,
      },
    ],
  },
];

export function EducatorSidebar({
  mobileOpen = false,
  onClose,
}: EducatorSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center justify-between border-b border-slate-200/80 px-5">
        <Link
          href="/educator"
          onClick={onClose}
          className="group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E13032] text-sm font-black text-white shadow-lg shadow-red-100">
              JW
            </div>

            <div>
              <div className="text-base font-black tracking-tight text-slate-950">
                JobWay
              </div>

              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Educator Workspace
              </div>
            </div>
          </div>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close educator menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((section) => (
          <div key={section.label}>
            <div className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {section.label}
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  (item.href !== "/educator" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                      active
                        ? "bg-red-50 text-[#E13032] shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                    ].join(" ")}
                  >
                    <Icon className="h-[18px] w-[18px]" />

                    <span className="flex-1">
                      {item.label}
                    </span>

                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E13032]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 p-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-[#E13032]"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] border-r border-slate-200/80 bg-white lg:block">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close educator menu"
          />

          <aside className="relative h-full w-[280px] max-w-[88vw] border-r border-slate-200 bg-white shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}