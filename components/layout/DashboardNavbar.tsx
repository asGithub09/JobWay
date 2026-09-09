"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  Home,
  Menu,
  Search,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";

export type DashboardNavbarRole =
  | "student"
  | "educator"
  | "admin";

export interface DashboardNavbarProps {
  role: DashboardNavbarRole;
  onMenuClick?: () => void;
}

type NavbarItem = {
  label: string;
  href: string;
  icon?: typeof Home;
  external?: boolean;
};

const studentItems: NavbarItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    label: "Preparation",
    href: "/test-series",
    icon: Trophy,
  },
  {
    label: "Free & Trial",
    href: "/exams",
    icon: Trophy,
  },
  {
    label: "Resources",
    href: "/resources",
    icon: BookOpen,
  },
];

const educatorItems: NavbarItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Courses",
    href: "/educator/courses",
    icon: BookOpen,
  },
  {
    label: "Exams",
    href: "/educator/exams",
    icon: Trophy,
  },
  {
    label: "Questions",
    href: "/educator/questions",
    icon: BookOpen,
  },
];

const adminItems: NavbarItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Batches",
    href: "/admin/batches",
    icon: UsersRound,
  },
  {
    label: "Exams",
    href: "/admin/exams",
    icon: Trophy,
  },
  {
    label: "Resources",
    href: "/admin/resources",
    icon: BookOpen,
  },
];

function getItems(role: DashboardNavbarRole) {
  switch (role) {
    case "educator":
      return educatorItems;

    case "admin":
      return adminItems;

    case "student":
    default:
      return studentItems;
  }
}

function isActivePath(
  pathname: string,
  item: NavbarItem,
) {
  if (item.href === "/") {
    return pathname === "/";
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}

export function DashboardNavbar({
  role,
  onMenuClick,
}: DashboardNavbarProps) {
  const pathname = usePathname();

  const [mobileNavigationOpen, setMobileNavigationOpen] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const items = getItems(role);

  useEffect(() => {
    setMobileNavigationOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavigationOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [mobileNavigationOpen]);

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    window.location.href =
      `/search?q=${encodeURIComponent(query)}`;
  };

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
      return;
    }

    setMobileNavigationOpen(
      (current) => !current,
    );
  };

  const workspaceLabel =
    role === "student"
      ? "Student"
      : role === "educator"
        ? "Educator"
        : "Administration";

  return (
    <>
      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-slate-200/80
          bg-white/95
          backdrop-blur-xl
        "
      >
        <div
          className="
            flex
            min-h-[72px]
            items-center
            gap-3
            px-4
            sm:px-6
            lg:px-8
          "
        >
          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={handleMenuClick}
            className="
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
              text-slate-700
              shadow-sm
              transition
              hover:border-red-200
              hover:bg-red-50
              hover:text-[#E13032]
              lg:hidden
            "
            aria-label={`Open ${workspaceLabel.toLowerCase()} navigation`}
            aria-expanded={
              mobileNavigationOpen
            }
          >
            {mobileNavigationOpen ? (
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

          {/* BRAND */}
          <Link
            href="/"
            className="
              flex
              min-w-0
              shrink-0
              items-center
              rounded-lg
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#E13032]
              focus-visible:ring-offset-2
            "
            aria-label="JobWay Home"
          >
            <BrandLogo />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav
            className="
              ml-3
              hidden
              min-w-0
              flex-1
              items-center
              justify-center
              gap-1
              lg:flex
            "
            aria-label={`${workspaceLabel} navigation`}
          >
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(
                pathname,
                item,
              );

              return (
                <Link
                  key={`${role}-${item.href}`}
                  href={item.href}
                  className={`
                    group
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-semibold
                    transition
                    ${
                      active
                        ? "bg-red-50 text-[#E13032]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#E13032]"
                    }
                  `}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                >
                  {Icon ? (
                    <Icon
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  ) : null}

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div
            className="
              ml-auto
              flex
              shrink-0
              items-center
              gap-2
            "
          >
            {/* SEARCH */}
            <div className="relative">
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="
                    absolute
                    right-0
                    top-12
                    z-50
                    w-[min(82vw,360px)]
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-2
                    shadow-xl
                    lg:static
                    lg:flex
                    lg:w-auto
                    lg:items-center
                    lg:border-0
                    lg:bg-transparent
                    lg:p-0
                    lg:shadow-none
                  "
                >
                  <div className="relative">
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
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(
                          event.target.value,
                        )
                      }
                      placeholder="Search"
                      autoFocus
                      className="
                        h-10
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        pl-9
                        pr-3
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        focus:border-red-300
                        focus:bg-white
                        focus:ring-2
                        focus:ring-red-100
                        lg:w-[190px]
                      "
                    />
                  </div>
                </form>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  setSearchOpen(
                    (current) => !current,
                  )
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-600
                  shadow-sm
                  transition
                  hover:border-red-200
                  hover:bg-red-50
                  hover:text-[#E13032]
                "
                aria-label={
                  searchOpen
                    ? "Close search"
                    : "Search JobWay"
                }
                aria-expanded={searchOpen}
              >
                {searchOpen ? (
                  <X
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                ) : (
                  <Search
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>

            {/* WORKSPACE INDICATOR */}
            <div
              className="
                hidden
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2
                text-xs
                font-bold
                text-slate-600
                sm:block
              "
            >
              {workspaceLabel}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION */}
      {mobileNavigationOpen ? (
        <div
          className="
            fixed
            inset-0
            z-50
            lg:hidden
          "
        >
          <button
            type="button"
            aria-label="Close navigation"
            className="
              absolute
              inset-0
              bg-slate-950/30
              backdrop-blur-[2px]
            "
            onClick={() =>
              setMobileNavigationOpen(false)
            }
          />

          <aside
            className="
              relative
              flex
              h-full
              w-[300px]
              max-w-[86vw]
              flex-col
              border-r
              border-slate-200
              bg-white
              shadow-2xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-4
                py-4
              "
            >
              <Link
                href="/"
                onClick={() =>
                  setMobileNavigationOpen(
                    false,
                  )
                }
                className="flex items-center"
              >
                <BrandLogo />
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMobileNavigationOpen(
                    false,
                  )
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-500
                  hover:bg-slate-100
                  hover:text-slate-900
                "
                aria-label="Close navigation"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Workspace
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {workspaceLabel}
              </p>
            </div>

            <nav
              className="
                flex-1
                overflow-y-auto
                p-3
              "
              aria-label={`${workspaceLabel} mobile navigation`}
            >
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(
                  pathname,
                  item,
                );

                return (
                  <Link
                    key={`mobile-${role}-${item.href}`}
                    href={item.href}
                    onClick={() =>
                      setMobileNavigationOpen(
                        false,
                      )
                    }
                    className={`
                      mb-1
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-bold
                      transition
                      ${
                        active
                          ? "bg-red-50 text-[#E13032]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#E13032]"
                      }
                    `}
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                  >
                    {Icon ? (
                      <Icon
                        className="h-[18px] w-[18px]"
                        aria-hidden="true"
                      />
                    ) : null}

                    <span>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div
              className="
                border-t
                border-slate-100
                p-3
              "
            >
              <Link
                href="/"
                onClick={() =>
                  setMobileNavigationOpen(
                    false,
                  )
                }
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-bold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  hover:text-[#E13032]
                "
              >
                <Home
                  className="h-[18px] w-[18px]"
                  aria-hidden="true"
                />

                Back to JobWay
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default DashboardNavbar;