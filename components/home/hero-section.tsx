"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type HeroSlide = {
  id: string;
  badge: string;
  eyebrow: string;
  title: string;
  highlightedTitle: string;
  description: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
  bannerTitle: string;
  bannerAccent: string;
  bannerPrice: string;
  bannerOldPrice: string;
  bannerValidity: string;
  stats: {
    value: string;
    label: string;
    icon: "users" | "star" | "target";
  }[];
};

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "jobway-month-end",
    badge: "10 M+ Students Trust Us",
    eyebrow: "THE COMPLETE PREPARATION PLATFORM",
    title: "India's Most Trusted",
    highlightedTitle:
      "Platform for Government Exams, Private Jobs & Upskilling",
    description:
      "Learn from structured courses, practice with realistic mock tests and build the confidence you need for your next examination.",
    primaryCta: "Explore Courses",
    primaryHref: "/courses",
    secondaryCta: "Explore Test Series",
    secondaryHref: "/test-series",
    bannerTitle: "MONTH END",
    bannerAccent: "SALE",
    bannerPrice: "₹279",
    bannerOldPrice: "₹3099",
    bannerValidity: "12 Months Validity",
    stats: [
      {
        value: "4 Crore+",
        label: "Monthly Active Users",
        icon: "users",
      },
      {
        value: "10 Lakhs+",
        label: "Student Selections",
        icon: "star",
      },
      {
        value: "400+",
        label: "YouTube Channels",
        icon: "target",
      },
      {
        value: "350 Crore+",
        label: "Monthly YouTube Views",
        icon: "users",
      },
    ],
  },
  {
    id: "jobway-test-prime",
    badge: "10 M+ Students Trust Us",
    eyebrow: "PRACTICE THAT BUILDS CONFIDENCE",
    title: "Practice smarter.",
    highlightedTitle: "Perform better.",
    description:
      "Get exam-focused mock tests, detailed solutions and performance insights designed around the way you prepare.",
    primaryCta: "Start Practising",
    primaryHref: "/test-series",
    secondaryCta: "View Free Tests",
    secondaryHref: "/free-resources",
    bannerTitle: "TEST",
    bannerAccent: "PRIME",
    bannerPrice: "₹499",
    bannerOldPrice: "₹1999",
    bannerValidity: "12 Months Practice",
    stats: [
      {
        value: "100K+",
        label: "Questions",
        icon: "users",
      },
      {
        value: "Expert",
        label: "Solutions",
        icon: "star",
      },
      {
        value: "Live",
        label: "Analytics",
        icon: "target",
      },
      {
        value: "800+",
        label: "Exams",
        icon: "users",
      },
    ],
  },
  {
    id: "jobway-career",
    badge: "10 M+ Students Trust Us",
    eyebrow: "YOUR CAREER, YOUR PREPARATION",
    title: "Build skills.",
    highlightedTitle: "Build your future.",
    description:
      "Discover career-focused courses, practical learning resources and exam preparation tools in one powerful learning platform.",
    primaryCta: "Find Your Exam",
    primaryHref: "/exams",
    secondaryCta: "Explore Courses",
    secondaryHref: "/courses",
    bannerTitle: "CAREER",
    bannerAccent: "BOOST",
    bannerPrice: "₹999",
    bannerOldPrice: "₹2499",
    bannerValidity: "Complete Access",
    stats: [
      {
        value: "50+",
        label: "Exam Areas",
        icon: "users",
      },
      {
        value: "Expert",
        label: "Educators",
        icon: "star",
      },
      {
        value: "Fresh",
        label: "Resources",
        icon: "target",
      },
      {
        value: "24×7",
        label: "Learning",
        icon: "users",
      },
    ],
  },
];

const POPULAR_SEARCHES = [
  "Digital Marketing",
  "SBI Clerk",
  "Data Analyst",
  "SSC CGL",
  "NABARD Assistant",
];

function getStatIcon(
  icon: HeroSlide["stats"][number]["icon"],
) {
  if (icon === "users") {
    return Users;
  }

  if (icon === "star") {
    return Star;
  }

  return Target;
}

function TrustBadge({
  label,
}: {
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 shadow-sm sm:px-3.5 sm:py-2">
      <span
        className="flex -space-x-1.5"
        aria-hidden="true"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#E13032] text-[9px] font-black text-white">
          J
        </span>

        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-[9px] font-black text-white">
          W
        </span>

        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-orange-400 text-[9px] font-black text-white">
          +
        </span>
      </span>

      <span>{label}</span>
    </div>
  );
}

function PromotionalBanner({
  slide,
}: {
  slide: HeroSlide;
}) {
  return (
    <div className="relative w-full">
      {/* Soft banner glow */}
      <div
        className="absolute -inset-6 rounded-[2.5rem] bg-red-100/60 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="
          relative
          min-h-[265px]
          overflow-hidden
          rounded-[1.35rem]
          border
          border-red-200
          bg-[#D90000]
          shadow-[0_28px_75px_rgba(15,23,42,0.18)]
          lg:min-h-[265px]
          xl:min-h-[265px]
        "
      >
        {/* Pattern */}
        <div
          className="absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(45deg, rgba(255,255,255,.10) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,.07) 25%, transparent 25%)",
            backgroundSize: "42px 42px",
          }}
        />

        {/* Decorative circles */}
        <div
          className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[38px] border-yellow-300/20"
          aria-hidden="true"
        />

        <div
          className="absolute -bottom-28 -left-20 h-56 w-56 rounded-full border-[30px] border-yellow-300/10"
          aria-hidden="true"
        />

        <div
          className="absolute right-[22%] top-0 h-full w-px bg-white/5"
          aria-hidden="true"
        />

        {/* Banner content */}
        <div className="relative flex min-h-[265px] flex-col justify-between px-7 py-7 sm:px-8 sm:py-8 lg:min-h-[265px] lg:px-9 lg:py-8 xl:px-10">
          {/* Top */}
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-black tracking-wide text-[#D90000] shadow-sm">
              JOBWAY
            </div>

            <div className="rounded-full border border-yellow-200/60 bg-yellow-300 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-red-950">
              Limited Offer
            </div>
          </div>

          {/* Main content */}
          <div className="grid gap-6 grid-cols-[minmax(0,1fr)_150px] items-center sm:grid-cols-[minmax(0,1fr)_160px]">
            <div className="max-w-[510px]">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-200">
                Test Prime
              </p>

              <h2 className="mt-2 text-[2rem] font-black uppercase leading-[0.88] tracking-[-0.045em] text-white sm:text-[2.9rem] lg:text-[3.1rem] xl:text-[3.2rem]">
                {slide.bannerTitle}

                <span className="block text-yellow-300">
                  {slide.bannerAccent}
                </span>
              </h2>

              <p className="mt-3 max-w-[330px] text-xs font-semibold leading-4 text-white/90 lg:text-[15px] lg:leading-6">
                Unlimited practice, exam-focused mock tests and detailed
                solutions built for serious preparation.
              </p>
            </div>

            {/* Price */}
            <div className="rounded-[1.5rem] border-4 border-white bg-yellow-300 px-3 py-3 text-center shadow-xl lg:px-4 lg:py-4">
              <p className="text-[10px] font-black uppercase text-red-900">
                Now Only
              </p>

              <p className="mt-1 text-[2.65rem] font-black leading-none tracking-tight text-red-700 lg:text-[2.9rem]">
                {slide.bannerPrice}
              </p>

              <p className="mt-2 text-xs font-bold text-red-950/50 line-through">
                {slide.bannerOldPrice}
              </p>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-black/25 px-3 py-1.5 text-xs font-black text-white">
                150,000+ Mock Tests
              </span>

              <span className="rounded-lg bg-black/25 px-3 py-1.5 text-xs font-black text-white">
                800+ Exams
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white sm:text-sm">
                {slide.bannerValidity}
              </span>

              <Link
                href="/test-series"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-yellow-300 px-4 text-xs font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-200 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:h-11 sm:px-5 sm:text-sm"
              >
                Buy Now

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden={true}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active learners */}
      <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
            <Users
              className="h-4 w-4"
              aria-hidden={true}
            />
          </span>

          <div>
            <p className="text-xs font-black text-slate-900">
              10M+
            </p>

            <p className="text-[10px] text-slate-400">
              Active learners
            </p>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="absolute -right-2 top-10 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block lg:-right-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Star
              className="h-4 w-4 fill-current"
              aria-hidden={true}
            />
          </span>

          <div>
            <p className="text-xs font-black text-slate-900">
              4.8/5
            </p>

            <p className="text-[10px] text-slate-400">
              Learner rating
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStatRow({
  stats,
}: {
  stats: HeroSlide["stats"];
}) {
  return (
    <div className="mt-10 w-full rounded-[1.35rem] border border-slate-100 bg-white px-7 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:px-9 lg:mt-12 lg:px-12 lg:py-6">
      <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-x-8">
        {stats.map((stat) => {
          const Icon = getStatIcon(stat.icon);

          return (
            <div
              key={`${stat.value}-${stat.label}`}
              className="flex items-center gap-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon
                  className="h-[18px] w-[18px]"
                  aria-hidden={true}
                />
              </span>

              <div>
                <p className="text-base font-black leading-tight text-[#E13032] sm:text-lg">
                  {stat.value}
                </p>

                <p className="mt-0.5 text-xs font-medium leading-5 text-slate-400 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeSlide = HERO_SLIDES[activeIndex];

  const goToNext = useCallback(() => {
    setActiveIndex(
      (current) =>
        (current + 1) % HERO_SLIDES.length,
    );
  }, []);

  const goToPrevious = useCallback(() => {
    setActiveIndex(
      (current) =>
        (current - 1 + HERO_SLIDES.length) %
        HERO_SLIDES.length,
    );
  }, []);

  /*
   * Promotional banner rotation.
   *
   * 2 seconds requested.
   *
   * Hovering/focusing the hero pauses the rotation.
   * Leaving the hero resumes it.
   */
  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(
      goToNext,
      2000,
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [goToNext, isPaused]);

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "ArrowLeft") {
        goToPrevious();
      }

      if (event.key === "ArrowRight") {
        goToNext();
      }

      if (event.key === "Escape") {
        setSearchQuery("");
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [goToNext, goToPrevious]);

  const searchHref = useMemo(() => {
    const query = searchQuery.trim();

    if (!query) {
      return "/courses";
    }

    return `/search?q=${encodeURIComponent(query)}`;
  }, [searchQuery]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="JobWay featured campaigns"
      className="relative overflow-hidden border-b border-slate-200 bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Subtle Adda247-inspired background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden={true}
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.025) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      <div
        className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-red-50/70 blur-3xl"
        aria-hidden={true}
      />

      <div
        className="pointer-events-none absolute -right-40 top-0 h-[460px] w-[460px] rounded-full bg-orange-50/60 blur-3xl"
        aria-hidden={true}
      />

      {/* Reference layout:
          viewport padding: 40px
          left column: 460px
          column gap: 43px
          banner: 480px
          max content width: 1200px
      */}
      <div className="relative mx-auto w-full max-w-[1200px] px-10">
        <div className="py-10 sm:py-12 lg:py-[54px]">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-[43px]">
            {/* LEFT CONTENT */}
            <div
              key={activeSlide.id}
              className="min-w-0 w-full animate-[fadeIn_450ms_ease-out] lg:w-[460px] lg:shrink-0"
              aria-live="polite"
            >
              <TrustBadge label={activeSlide.badge} />

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-sm">
                {activeSlide.eyebrow}
              </p>

              <h1 className="mt-3 max-w-[460px] text-balance text-[35.74px] font-bold leading-[42.89px] tracking-normal text-[#121212]">
                {activeSlide.title}
                <span className="block text-[#E13032]">
                  {activeSlide.highlightedTitle}
                </span>
              </h1>

              <p className="mt-5 max-w-[460px] text-[15px] leading-[22.5px] text-[#666666]">
                {activeSlide.description}
              </p>

              {/* Search */}
              <form
                action={searchHref}
                role="search"
                className="mt-6 w-full"
              >
                <div className="relative flex h-[50px] w-full items-center rounded-full border border-[#ececec] bg-white px-4 shadow-[0_4px_14px_rgba(0,0,0,0.07)] transition focus-within:border-slate-300 focus-within:shadow-[0_5px_18px_rgba(0,0,0,0.09)]">
                  <Search
                    className="pointer-events-none h-5 w-5 shrink-0 text-slate-400"
                    aria-hidden={true}
                  />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Find Live Class, Test Series, Books and Video courses"
                    aria-label="Search JobWay courses, test series and resources"
                    className="h-full min-w-0 flex-1 bg-transparent px-2 text-[15px] font-normal leading-[22.5px] text-[#121212] outline-none placeholder:text-[#9b9b9b]"
                  />
                </div>
              </form>

              {/* Popular searches */}
              <div
                className="mt-4 flex w-full flex-wrap gap-2"
                aria-label="Popular searches"
              >
                {POPULAR_SEARCHES.map((search) => (
                  <button
                    key={search}
                    type="button"
                    onClick={() => setSearchQuery(search)}
                    className="inline-flex h-[34px] items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-4 text-[12px] font-normal leading-4 text-[#9b9b9b] shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-[#E13032] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
                  >
                    <Search
                      className="h-3.5 w-3.5"
                      aria-hidden={true}
                    />
                    {search}
                  </button>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={activeSlide.primaryHref}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(225,48,50,0.18)] transition hover:-translate-y-0.5 hover:bg-[#C92628] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
                >
                  {activeSlide.primaryCta}
                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden={true}
                  />
                </Link>

                <Link
                  href={activeSlide.secondaryHref}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] bg-white px-5 text-sm font-bold text-[#333333] transition hover:border-red-200 hover:bg-red-50 hover:text-[#E13032] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
                >
                  {activeSlide.secondaryCta}
                </Link>
              </div>
            </div>

            {/* RIGHT PROMOTIONAL BANNER */}
            <div className="relative w-full lg:w-[480px] lg:shrink-0">
              <PromotionalBanner slide={activeSlide} />

              {/* Dots */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {HERO_SLIDES.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Show featured campaign ${index + 1}`}
                    aria-current={index === activeIndex}
                    onClick={() => setActiveIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2 ${
                      index === activeIndex
                        ? "w-7 bg-[#E13032]"
                        : "w-1.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>

              {/* Previous / next */}
              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  aria-label="Previous featured campaign"
                  onClick={goToPrevious}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-[#E13032] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
                >
                  <ChevronLeft
                    className="h-4 w-4"
                    aria-hidden={true}
                  />
                </button>

                <button
                  type="button"
                  aria-label="Next featured campaign"
                  onClick={goToNext}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-[#E13032] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
                >
                  <ChevronRight
                    className="h-4 w-4"
                    aria-hidden={true}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* FULL WIDTH TRUST / STAT BAR */}
          <HeroStatRow stats={activeSlide.stats} />

          <div className="mt-6 hidden items-center justify-center gap-2 text-xs font-semibold text-slate-400 lg:flex">
            <Sparkles
              className="h-3.5 w-3.5 text-[#E13032]"
              aria-hidden={true}
            />
            Trusted learning, practice and career preparation from JobWay
          </div>
        </div>
      </div>
    </section>
  );
}
