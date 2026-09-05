"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const PRELOADER_MIN_TIME = 650;

export default function GlobalPreloader() {
  const pathname = usePathname();

  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const firstRender = useRef(true);
  const navigationStartedAt = useRef(Date.now());

  /*
   * Hide the loader after the current page is ready.
   */
  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const finishLoading = () => {
      const elapsed =
        Date.now() - navigationStartedAt.current;

      const remaining = Math.max(
        PRELOADER_MIN_TIME - elapsed,
        0,
      );

      fadeTimer = setTimeout(() => {
        setFading(true);

        hideTimer = setTimeout(() => {
          setVisible(false);
          setFading(false);
        }, 400);
      }, remaining);
    };

    /*
     * First page load.
     */
    if (firstRender.current) {
      firstRender.current = false;
      navigationStartedAt.current = Date.now();

      if (document.readyState === "complete") {
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
       * Next.js has rendered the new route.
       */
      navigationStartedAt.current = Date.now();
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
  }, [pathname]);

  /*
   * Detect internal navigation clicks.
   *
   * This makes the loader appear immediately when
   * the user clicks an internal link.
   */
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
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
        target.closest("a") as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      /*
       * Ignore downloads.
       */
      if (anchor.hasAttribute("download")) {
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
        anchor.href.startsWith("javascript:")
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
       *
       * Example:
       * /#courses
       * /dashboard#profile
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
       * Ignore any hash-only navigation.
       */
      if (
        url.pathname ===
          window.location.pathname &&
        url.search ===
          window.location.search &&
        url.hash !== window.location.hash
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
       * This is an internal page navigation.
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

  if (!visible) {
    return null;
  }

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