"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const PRELOADER_MIN_TIME = 350;
const PRELOADER_FADE_TIME = 180;

/*
 * ============================================================
 * ROUTE HELPERS
 * ============================================================
 */

/**
 * Dashboard/application routes.
 *
 * These routes are treated as one persistent application.
 * The global full-screen preloader does NOT appear when
 * navigating between these pages.
 */
function isDashboardArea(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/courses" ||
    pathname.startsWith("/courses/") ||
    pathname === "/test-series" ||
    pathname.startsWith("/test-series/") ||
    pathname === "/exams" ||
    pathname.startsWith("/exams/") ||
    pathname === "/resources" ||
    pathname.startsWith("/resources/") ||
    pathname === "/educator" ||
    pathname.startsWith("/educator/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

/**
 * Actual examination experience.
 *
 * The exam interface controls its own fullscreen,
 * timer, camera/microphone and proctoring state.
 *
 * GlobalPreloader must never interfere with it.
 */
function isActiveExamArea(pathname: string) {
  return (
    pathname.startsWith("/mock-tests/") &&
    pathname.endsWith("/start")
  );
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function GlobalPreloader() {
  const pathname = usePathname();

  const dashboardArea =
    isDashboardArea(pathname);

  const activeExamArea =
    isActiveExamArea(pathname);

  /*
   * Important:
   *
   * Initialize the loader based on the current route.
   *
   * This prevents a full-screen loader flash when the user
   * directly opens a dashboard page.
   */
  const [visible, setVisible] = useState(
    !dashboardArea && !activeExamArea,
  );

  const [fading, setFading] =
    useState(false);

  const firstRender = useRef(true);

  const navigationStartedAt =
    useRef(Date.now());

  /*
   * ==========================================================
   * ROUTE CHANGE HANDLING
   * ==========================================================
   */

  useEffect(() => {
    let fadeTimer:
      | ReturnType<typeof setTimeout>
      | undefined;

    let hideTimer:
      | ReturnType<typeof setTimeout>
      | undefined;

    /*
     * --------------------------------------------------------
     * DASHBOARD / APPLICATION
     * --------------------------------------------------------
     *
     * Never show the global loader here.
     *
     * The dashboard shell remains visible and Next.js changes
     * only the page content.
     */

    if (
      dashboardArea ||
      activeExamArea
    ) {
      setVisible(false);
      setFading(false);

      navigationStartedAt.current =
        Date.now();

      return () => {
        if (fadeTimer) {
          clearTimeout(fadeTimer);
        }

        if (hideTimer) {
          clearTimeout(hideTimer);
        }
      };
    }

    /*
     * --------------------------------------------------------
     * PUBLIC PAGE LOADING
     * --------------------------------------------------------
     */

    const finishLoading = () => {
      const elapsed =
        Date.now() -
        navigationStartedAt.current;

      const remaining = Math.max(
        PRELOADER_MIN_TIME - elapsed,
        0,
      );

      fadeTimer = setTimeout(() => {
        setFading(true);

        hideTimer = setTimeout(() => {
          setVisible(false);
          setFading(false);
        }, PRELOADER_FADE_TIME);
      }, remaining);
    };

    /*
     * --------------------------------------------------------
     * FIRST PUBLIC PAGE LOAD
     * --------------------------------------------------------
     */

    if (firstRender.current) {
      firstRender.current = false;

      navigationStartedAt.current =
        Date.now();

      if (
        document.readyState ===
        "complete"
      ) {
        finishLoading();
      } else {
        window.addEventListener(
          "load",
          finishLoading,
          { once: true },
        );
      }
    } else {
      /*
       * A public route has changed.
       *
       * Keep the branded public preloader.
       */

      navigationStartedAt.current =
        Date.now();

      setFading(false);
      setVisible(true);

      finishLoading();
    }

    return () => {
      window.removeEventListener(
        "load",
        finishLoading,
      );

      if (fadeTimer) {
        clearTimeout(fadeTimer);
      }

      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, [
    pathname,
    dashboardArea,
    activeExamArea,
  ]);

  /*
   * ============================================================
   * INTERNAL NAVIGATION CLICK HANDLING
   * ============================================================
   *
   * The important change:
   *
   * If the destination is another dashboard/application route,
   * we do NOTHING.
   *
   * Next.js handles the URL transition normally.
   */

  useEffect(() => {
    const handleClick = (
      event: MouseEvent,
    ) => {
      /*
       * Only normal left-clicks.
       */

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      const anchor =
        target.closest(
          "a",
        ) as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      /*
       * Ignore downloads.
       */

      if (
        anchor.hasAttribute(
          "download",
        )
      ) {
        return;
      }

      /*
       * Ignore new tabs/windows.
       */

      if (
        anchor.target === "_blank" ||
        anchor.target === "_new"
      ) {
        return;
      }

      /*
       * Ignore JavaScript URLs.
       */

      if (
        anchor.href.startsWith(
          "javascript:",
        )
      ) {
        return;
      }

      const url = new URL(
        anchor.href,
        window.location.href,
      );

      /*
       * Ignore external websites.
       */

      if (
        url.origin !==
        window.location.origin
      ) {
        return;
      }

      /*
       * Ignore same-page hash navigation.
       */

      if (
        url.pathname ===
          window.location.pathname &&
        url.search ===
          window.location.search &&
        url.hash
      ) {
        return;
      }

      /*
       * Ignore hash-only navigation.
       */

      if (
        url.pathname ===
          window.location.pathname &&
        url.search ===
          window.location.search &&
        url.hash !==
          window.location.hash
      ) {
        return;
      }

      /*
       * Ignore clicking the current URL.
       */

      if (
        url.pathname ===
          window.location.pathname &&
        url.search ===
          window.location.search
      ) {
        return;
      }

      /*
       * --------------------------------------------------------
       * ACTIVE EXAM
       * --------------------------------------------------------
       *
       * Never interfere with the examination interface.
       */

      if (
        isActiveExamArea(
          url.pathname,
        )
      ) {
        setVisible(false);
        setFading(false);

        return;
      }

      /*
       * --------------------------------------------------------
       * DASHBOARD NAVIGATION
       * --------------------------------------------------------
       *
       * THIS IS THE IMPORTANT PART.
       *
       * When moving:
       *
       * /dashboard
       *      ↓
       * /courses
       *
       * or:
       *
       * /courses
       *      ↓
       * /test-series
       *
       * or:
       *
       * /dashboard/results
       *      ↓
       * /dashboard/profile
       *
       * we do NOT show the global loader.
       */

      if (
        isDashboardArea(
          url.pathname,
        )
      ) {
        return;
      }

      /*
       * --------------------------------------------------------
       * PUBLIC NAVIGATION
       * --------------------------------------------------------
       *
       * For normal public pages, retain the branded
       * full-screen JobWay transition.
       */

      navigationStartedAt.current =
        Date.now();

      setFading(false);
      setVisible(true);
    };

    document.addEventListener(
      "click",
      handleClick,
      true,
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        true,
      );
    };
  }, []);

  /*
   * ============================================================
   * NOTHING TO RENDER
   * ============================================================
   */

  if (
    !visible ||
    dashboardArea ||
    activeExamArea
  ) {
    return null;
  }

  /*
   * ============================================================
   * PUBLIC JOBWAY PRELOADER
   * ============================================================
   *
   * This is intentionally kept unchanged in appearance.
   * It is only used outside the application/dashboard area.
   */

  return (
    <div
      className={`jobway-preloader ${
        fading
          ? "jobway-preloader--fade"
          : ""
      }`}
      aria-hidden="true"
    >
      <div className="jobway-preloader__content">
        <div className="jobway-preloader__logo">
          <span className="jobway-preloader__logo-mark">
            J
          </span>

          <span className="jobway-preloader__logo-text">
            JobWay
          </span>
        </div>

        <div className="jobway-preloader__loader">
          <span />
        </div>

        <p className="jobway-preloader__message">
          Preparing your learning experience
        </p>
      </div>
    </div>
  );
}