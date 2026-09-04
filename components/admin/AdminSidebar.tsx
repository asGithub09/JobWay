"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  LayoutDashboard,
  Megaphone,
  Users,
  UserRound,
  GraduationCap,
  ClipboardCheck,
  CreditCard,
  Settings,
  X,
  UserCog,
  Factory,
  FolderTree,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        comingSoon: true,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        comingSoon: true,
      },
      {
        label: "Leads",
        href: "/admin/leads",
        icon: UserRound,
      },
      {
        label: "Enrollments",
        href: "/admin/enrollments",
        icon: GraduationCap,
        comingSoon: true,
      },
      {
        label: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
        comingSoon: true,
      },
      {
        label: "Faculty",
        href: "/admin/faculty",
        icon: UserCog,
        comingSoon: true,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        label: "Courses",
        href: "/admin/courses",
        icon: BookOpen,
      },
      {
        label: "Course Categories",
        href: "/admin/course-categories",
        icon: FolderTree,
      },
      {
        label: "Course Factory",
        href: "/admin/course-factory",
        icon: Factory,
      },
      {
        label: "Exams",
        href: "/admin/exams",
        icon: ClipboardCheck,
        comingSoon: true,
      },
      {
        label: "Jobs",
        href: "/admin/jobs",
        icon: BriefcaseBusiness,
        comingSoon: true,
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        label: "Campaigns",
        href: "/admin/campaigns",
        icon: Megaphone,
        comingSoon: true,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        comingSoon: true,
      },
    ],
  },
];

export function AdminSidebar({
  mobileOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center justify-between border-b border-slate-200/80 px-5">
        <Link
          href="/admin"
          onClick={onClose}
          className="group"
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-violet-600
                via-fuchsia-600
                to-indigo-600
                text-sm
                font-black
                text-white
                shadow-lg
                shadow-violet-200
              "
            >
              JW
            </div>

            <div>
              <div className="text-base font-black tracking-tight text-slate-950">
                JobWay
              </div>

              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Admin Workspace
              </div>
            </div>
          </div>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-slate-500
              hover:bg-slate-100
              lg:hidden
            "
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((section) => (
          <div
            key={section.label}
            className="mb-6"
          >
            <div className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {section.label}
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  (
                    item.href !== "/admin" &&
                    pathname.startsWith(
                      `${item.href}/`,
                    )
                  );

                if (item.comingSoon) {
                  return (
                    <div
                      key={item.href}
                      className="
                        flex
                        cursor-not-allowed
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-400
                        opacity-70
                      "
                      title="Coming soon"
                    >
                      <Icon className="h-[18px] w-[18px]" />

                      <span className="flex-1">
                        {item.label}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        Soon
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      group
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-sm
                      font-semibold
                      transition
                      ${
                        active
                          ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                          : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        h-[18px]
                        w-[18px]
                        ${
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-violet-600"
                        }
                      `}
                    />

                    <span>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 p-4">
        <div
          className="
            rounded-2xl
            border
            border-violet-100
            bg-gradient-to-br
            from-violet-50
            via-white
            to-fuchsia-50
            p-4
          "
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-bold text-slate-700">
              System Online
            </span>
          </div>

          <p className="text-[11px] leading-5 text-slate-500">
            JobWay administration workspace
            is ready.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-50
          hidden
          w-[270px]
          border-r
          border-slate-200/80
          bg-white/95
          backdrop-blur-xl
          lg:block
        "
      >
        {content}
      </aside>

      {mobileOpen && (
        <>
          <div
            className="
              fixed
              inset-0
              z-40
              bg-slate-950/30
              backdrop-blur-sm
              lg:hidden
            "
            onClick={onClose}
          />

          <aside
            className="
              fixed
              inset-y-0
              left-0
              z-50
              w-[285px]
              border-r
              border-slate-200
              bg-white
              shadow-2xl
              lg:hidden
            "
          >
            {content}
          </aside>
        </>
      )}
    </>
  );
}