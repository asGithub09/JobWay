"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  GraduationCap,
  Menu,
  Search,
  Target,
  TestTube2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { EXAM_CATEGORIES } from "@/lib/constants";

const categoryIcons = {
  banking: BriefcaseBusiness,
  "ssc-railway": Target,
  "upsc-state-psc": GraduationCap,
  teaching: BookOpen,
  engineering: TestTube2,
  "private-skilling": Zap,
} as const;

type MobileNavigationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCategory?: string;
};

export function MobileNavigation({
  open,
  onOpenChange,
  activeCategory,
}: MobileNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredCategories = EXAM_CATEGORIES.filter((category) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      category.name.toLowerCase().includes(normalizedSearch) ||
      category.description.toLowerCase().includes(normalizedSearch)
    );
  });

  const closeNavigation = () => {
    onOpenChange(false);
    setSearchQuery("");
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] lg:hidden"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close navigation"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        onClick={closeNavigation}
      />

      <aside
        id="jobway-mobile-navigation"
        aria-label="Mobile navigation"
        aria-modal="true"
        role="dialog"
        className="relative flex h-full w-[88%] max-w-sm flex-col overflow-hidden bg-white shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 px-4">
          <BrandLogo compact />

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeNavigation}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Search */}
        <div className="shrink-0 border-b border-slate-100 p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search exams..."
              aria-label="Search exams"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <section aria-labelledby="mobile-exam-heading">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2
                id="mobile-exam-heading"
                className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400"
              >
                Exam Categories
              </h2>

              <Link
                href="/exams"
                onClick={closeNavigation}
                className="text-xs font-bold text-[#E13032]"
              >
                View all
              </Link>
            </div>

            <div className="space-y-1">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => {
                  const Icon =
                    categoryIcons[
                      category.id as keyof typeof categoryIcons
                    ];

                  const isActive = activeCategory === category.id;

                  return (
                    <Link
                      key={category.id}
                      href={`/exams/${category.id}`}
                      onClick={closeNavigation}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                        isActive
                          ? "bg-red-50 text-[#E13032]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          isActive
                            ? "bg-red-100 text-[#E13032]"
                            : "bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-[#E13032]"
                        }`}
                      >
                        <Icon
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">
                          {category.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {category.description}
                        </span>
                      </span>

                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-[#E13032]"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-xl bg-slate-50 px-4 py-7 text-center">
                  <Search className="mx-auto h-5 w-5 text-slate-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    No exams found
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-xs font-bold text-[#E13032]"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="my-6 h-px bg-slate-200" />

          <section aria-labelledby="mobile-links-heading">
            <h2
              id="mobile-links-heading"
              className="mb-3 px-1 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400"
            >
              Explore JobWay
            </h2>

            <nav className="space-y-1" aria-label="Mobile secondary navigation">
              {[
                {
                  label: "Courses",
                  href: "/courses",
                },
                {
                  label: "Test Series",
                  href: "/test-series",
                },
                {
                  label: "Books & Study Material",
                  href: "/books",
                },
                {
                  label: "Current Affairs",
                  href: "/current-affairs",
                },
                {
                  label: "Free Resources",
                  href: "/free-resources",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeNavigation}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#E13032]"
                >
                  {item.label}
                  <ChevronRight
                    className="h-4 w-4 text-slate-300"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </nav>
          </section>

          <div className="my-6 h-px bg-slate-200" />

          {/* Mobile CTA */}
          <div className="rounded-2xl bg-slate-950 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </div>

            <h2 className="mt-4 text-lg font-black text-white">
              Start your preparation
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Explore courses and test series designed for your target exam.
            </p>

            <Link
              href="/courses"
              onClick={closeNavigation}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-red-500"
            >
              Explore Courses
              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}