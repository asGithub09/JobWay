"use client";

import Link from "next/link";
import React from "react";
import {
  ChevronDown,
  Download,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { LanguageSelector } from "@/components/layout/language-selector";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { BrandLogo } from "@/components/shared/brand-logo";

type SiteHeaderProps = {
  activeCategory?: string;
};

export type MegaMenuId =
  | "government"
  | "college"
  | "private"
  | "upsc";

export function SiteHeader({
  activeCategory,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [language, setLanguage] =
    useState("english");

  const [activeMegaMenu, setActiveMegaMenu] =
    useState<MegaMenuId | null>(null);

  const closeTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMegaMenu = (menu: MegaMenuId) => {
    clearCloseTimer();
    setActiveMegaMenu(menu);
  };

  const scheduleMegaMenuClose = () => {
    clearCloseTimer();

    closeTimer.current = setTimeout(() => {
      setActiveMegaMenu(null);
      closeTimer.current = null;
    }, 140);
  };

  const closeMegaMenu = () => {
    clearCloseTimer();
    setActiveMegaMenu(null);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMegaMenu();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        !target?.closest(
          "[data-jobway-navigation-area]",
        )
      ) {
        closeMegaMenu();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );

      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );

      clearCloseTimer();
    };
  }, []);

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    closeMegaMenu();

    window.location.href = `/search?q=${encodeURIComponent(
      query,
    )}`;
  };

  const primaryItems: {
    id: MegaMenuId;
    label: string;
    href: string;
  }[] = [
    {
      id: "government",
      label: "Government Jobs",
      href: "/exams",
    },
    {
      id: "college",
      label: "College Entrance Exams",
      href: "/exams/college-entrance",
    },
    {
      id: "private",
      label: "Private Jobs & Upskilling",
      href: "/private-jobs",
    },
    {
      id: "upsc",
      label: "UPSC, PSC & Judiciary",
      href: "/exams/upsc-state-psc",
    },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl"
        data-jobway-navigation-area
      >
        <AnnouncementBar />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[68px] items-center gap-3">
            {/* Mobile menu */}
            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="jobway-mobile-navigation"
              onClick={() =>
                setMobileMenuOpen(
                  (current) => !current,
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 hover:text-[#E13032] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2 lg:hidden"
            >
              {mobileMenuOpen ? (
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

            {/* Brand */}
            <BrandLogo className="shrink-0" />

            {/* Primary navigation */}
            <nav
              aria-label="Primary navigation"
              className="ml-3 hidden items-center gap-0.5 xl:flex"
            >
              {primaryItems.map((item) => {
                const isOpen =
                  activeMegaMenu === item.id;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    onMouseEnter={() =>
                      openMegaMenu(item.id)
                    }
                    onMouseLeave={
                      scheduleMegaMenuClose
                    }
                    onFocus={() =>
                      openMegaMenu(item.id)
                    }
                    onBlur={
                      scheduleMegaMenuClose
                    }
                    onClick={() => {
                      closeMegaMenu();
                    }}
                    className={`inline-flex min-h-10 items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 ${
                      isOpen
                        ? "bg-red-50 text-[#E13032]"
                        : "text-slate-800 hover:bg-slate-50 hover:text-[#E13032]"
                    }`}
                  >
                    <span>{item.label}</span>

                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isOpen
                          ? "rotate-180 text-[#E13032]"
                          : ""
                      }`}
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Desktop search */}
            <div className="ml-auto hidden min-w-0 flex-1 justify-end lg:flex">
              <form
                role="search"
                onSubmit={handleSearchSubmit}
                className="relative w-full max-w-[300px]"
              >
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search exams, courses..."
                  aria-label="Search exams and courses"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#E13032] focus:bg-white focus:ring-2 focus:ring-red-100"
                />
              </form>
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-1.5 lg:flex">
              <LanguageSelector
                value={language}
                onChange={setLanguage}
                compact
              />

              <Link
                href="/download-app"
                onClick={closeMegaMenu}
                className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#E13032] 2xl:inline-flex"
              >
                <Download
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Get App
              </Link>

              <Link
                href="/login"
                onClick={closeMegaMenu}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E13032] px-4 text-sm font-extrabold text-[#E13032] transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
              >
                <UserRound
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Login
              </Link>
            </div>

            {/* Mobile search */}
            <button
              type="button"
              aria-label="Open search"
              aria-expanded={searchOpen}
              onClick={() =>
                setSearchOpen(
                  (current) => !current,
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 hover:text-[#E13032] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2 lg:hidden"
            >
              <Search
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>

            {/* Mobile login */}
            <Link
              href="/login"
              aria-label="Login"
              onClick={closeMegaMenu}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#E13032] px-3 text-xs font-extrabold text-white transition hover:bg-[#B91C1C] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2 sm:px-4 sm:text-sm lg:hidden"
            >
              Login
            </Link>
          </div>

          {/* Mobile search */}
          {searchOpen ? (
            <div className="border-t border-slate-100 py-3 lg:hidden">
              <form
                role="search"
                onSubmit={handleSearchSubmit}
                className="relative"
              >
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search exams, courses..."
                  aria-label="Search exams and courses"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#E13032] focus:bg-white focus:ring-2 focus:ring-red-100"
                />
              </form>
            </div>
          ) : null}
        </div>

        {/* Secondary navigation + all mega menus */}
        <DesktopNavigation
          activeCategory={activeCategory}
          activeMegaMenu={activeMegaMenu}
          onMegaMenuOpen={openMegaMenu}
          onMegaMenuClose={closeMegaMenu}
          onMegaMenuHoverEnter={clearCloseTimer}
          onMegaMenuHoverLeave={
            scheduleMegaMenuClose
          }
        />
      </header>

      <MobileNavigation
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        activeCategory={activeCategory}
      />
    </>
  );
}