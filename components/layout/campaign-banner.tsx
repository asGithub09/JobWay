"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Flame,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CampaignBannerProps = {
  endTime?: string;
  storageKey?: string;
};

type TimeRemaining = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type Campaign = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

const DEFAULT_END_TIME = "2026-09-07T23:59:59+05:30";

const CAMPAIGNS: Campaign[] = [
  {
    title: "Month End Sale Is LIVE",
    subtitle:
      "Hurry up! Grab the best offers on JobWay courses and test series.",
    ctaLabel: "Grab Now",
    ctaHref: "/courses",
  },
  {
    title: "JobWay Test Prime Is LIVE",
    subtitle:
      "Practice with unlimited mock tests and detailed solutions.",
    ctaLabel: "Explore Test Prime",
    ctaHref: "/test-series",
  },
  {
    title: "Prepare Smarter With JobWay",
    subtitle:
      "Access expert-led courses, study material and exam preparation resources.",
    ctaLabel: "Explore Courses",
    ctaHref: "/courses",
  },
  {
    title: "Free Tests Available",
    subtitle:
      "Start practising today with exam-focused questions and performance insights.",
    ctaLabel: "Start Practising",
    ctaHref: "/test-series",
  },
];

function getTimeRemaining(endTime: number): TimeRemaining {
  const total = Math.max(0, endTime - Date.now());

  const days = Math.floor(
    total / (1000 * 60 * 60 * 24),
  );

  const hours = Math.floor(
    (total / (1000 * 60 * 60)) % 24,
  );

  const minutes = Math.floor(
    (total / (1000 * 60)) % 60,
  );

  const seconds = Math.floor(
    (total / 1000) % 60,
  );

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function CampaignBanner({
  endTime = DEFAULT_END_TIME,
  storageKey = "jobway-campaign-banner-dismissed",
}: CampaignBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [campaignIndex, setCampaignIndex] = useState(0);

  const targetTime = useMemo(() => {
    const parsed = new Date(endTime).getTime();

    return Number.isNaN(parsed)
      ? Date.now()
      : parsed;
  }, [endTime]);

  const [remaining, setRemaining] = useState<TimeRemaining>(() =>
    getTimeRemaining(targetTime),
  );

  /*
   * Check whether the user previously closed the banner.
   */
  useEffect(() => {
    setMounted(true);

    try {
      const wasDismissed =
        window.localStorage.getItem(storageKey);

      if (wasDismissed === "true") {
        setDismissed(true);
      }
    } catch {
      // Ignore localStorage failures.
    }
  }, [storageKey]);

  /*
   * Countdown:
   * Updates every second.
   */
  useEffect(() => {
    if (!mounted || dismissed) {
      return;
    }

    const updateTimer = () => {
      setRemaining(
        getTimeRemaining(targetTime),
      );
    };

    updateTimer();

    const interval = window.setInterval(
      updateTimer,
      1000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [
    dismissed,
    mounted,
    targetTime,
  ]);

  /*
   * Promotional carousel:
   * Automatically changes every 5 seconds.
   */
  useEffect(() => {
    if (!mounted || dismissed) {
      return;
    }

    const interval = window.setInterval(() => {
      setCampaignIndex((current) =>
        (current + 1) % CAMPAIGNS.length,
      );
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [mounted, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);

    try {
      window.localStorage.setItem(
        storageKey,
        "true",
      );
    } catch {
      // Ignore storage failures.
    }
  };

  if (!mounted || dismissed) {
    return null;
  }

  if (remaining.total <= 0) {
    return null;
  }

  const campaign =
    CAMPAIGNS[campaignIndex];

  return (
    <aside
      aria-label="JobWay promotional offer"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-red-950/20 bg-[#E13032] text-white shadow-[0_-12px_40px_rgba(15,23,42,0.2)]"
    >
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <div className="flex items-center gap-2.5 sm:gap-4">

          {/* Campaign icon */}
          <div
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:flex"
            aria-hidden="true"
          >
            <Flame
              className="h-5 w-5 animate-pulse"
            />
          </div>

          {/* Campaign content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">

              <Sparkles
                className="h-3.5 w-3.5 shrink-0 animate-pulse text-white/90"
                aria-hidden="true"
              />

              <p
                key={`title-${campaignIndex}`}
                className="truncate text-xs font-black uppercase tracking-[0.08em] sm:text-sm"
              >
                {campaign.title}
              </p>

            </div>

            <p
              key={`subtitle-${campaignIndex}`}
              className="mt-0.5 hidden truncate text-[11px] font-medium text-white/80 sm:block"
            >
              {campaign.subtitle}
            </p>
          </div>

          {/* Countdown */}
          <div className="hidden items-center gap-2 md:flex">

            <Clock3
              className="h-4 w-4 text-white/90 animate-pulse"
              aria-hidden="true"
            />

            <div
              className="flex items-center gap-1"
              aria-label={`Offer ends in ${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes and ${remaining.seconds} seconds`}
            >

              {remaining.days > 0 ? (
                <>
                  <span className="rounded-md bg-white/15 px-2 py-1 font-mono text-sm font-black tabular-nums">
                    {pad(remaining.days)}
                  </span>

                  <span className="text-xs font-bold text-white/70">
                    d
                  </span>
                </>
              ) : null}

              <span className="rounded-md bg-white/15 px-2 py-1 font-mono text-sm font-black tabular-nums">
                {pad(remaining.hours)}
              </span>

              <span className="text-xs font-bold text-white/70">
                :
              </span>

              <span className="rounded-md bg-white/15 px-2 py-1 font-mono text-sm font-black tabular-nums">
                {pad(remaining.minutes)}
              </span>

              <span className="text-xs font-bold text-white/70">
                :
              </span>

              {/* Seconds pulse every second */}
              <span className="rounded-md bg-white/20 px-2 py-1 font-mono text-sm font-black tabular-nums animate-pulse">
                {pad(remaining.seconds)}
              </span>

            </div>
          </div>

          {/* CTA + close */}
          <div className="flex shrink-0 items-center gap-1.5">

            <Link
              href={campaign.ctaHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-black text-[#E13032] shadow-sm transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:h-10 sm:px-4 sm:text-sm"
            >
              <span className="hidden sm:inline">
                {campaign.ctaLabel}
              </span>

              <span className="sm:hidden">
                Explore
              </span>

              <ArrowRight
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            </Link>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close promotional offer"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:h-10 sm:w-10"
            >
              <X
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>

          </div>
        </div>

        {/* Mobile countdown */}
        <div className="mt-1.5 flex items-center justify-end md:hidden">

          <div
            className="flex items-center gap-1.5"
            aria-hidden="true"
          >

            <Clock3
              className="h-3.5 w-3.5 animate-pulse text-white/80"
            />

            <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[11px] font-black tabular-nums">
              {remaining.days > 0
                ? `${pad(remaining.days)}d `
                : ""}

              {pad(remaining.hours)}:
              {pad(remaining.minutes)}:

              <span className="animate-pulse">
                {pad(remaining.seconds)}
              </span>
            </span>

            <span className="text-[10px] font-bold text-white/70">
              remaining
            </span>

          </div>
        </div>

        {/* Carousel indicators */}
        <div className="mt-2 flex justify-center gap-1.5">
          {CAMPAIGNS.map((_, index) => (
            <span
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === campaignIndex
                  ? "w-5 bg-white"
                  : "w-1 bg-white/40"
              }`}
            />
          ))}
        </div>

      </div>
    </aside>
  );
}