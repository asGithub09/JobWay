"use client";

import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Users,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type TrustMetric = {
  id: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
  icon: "users" | "book" | "check" | "chart";
};

const TRUST_METRICS: TrustMetric[] = [
  {
    id: "active-users",
    value: 4,
    suffix: " Crore+",
    label: "Monthly Active Users",
    description: "Learners preparing every month",
    icon: "users",
  },
  {
    id: "selections",
    value: 10,
    suffix: " Lakhs+",
    label: "Student Selections",
    description: "A growing community of achievers",
    icon: "check",
  },
  {
    id: "channels",
    value: 400,
    suffix: "+",
    label: "YouTube Channels",
    description: "Learning content across categories",
    icon: "book",
  },
  {
    id: "views",
    value: 350,
    suffix: " Crore+",
    label: "Monthly YouTube Views",
    description: "Millions of learning moments",
    icon: "chart",
  },
];

function getIcon(
  icon: TrustMetric["icon"],
) {
  if (icon === "users") {
    return Users;
  }

  if (icon === "book") {
    return BookOpen;
  }

  if (icon === "check") {
    return CheckCircle2;
  }

  return BarChart3;
}

function AnimatedValue({
  value,
  suffix,
  active,
}: {
  value: number;
  suffix: string;
  active: boolean;
}) {
  const [displayValue, setDisplayValue] =
    useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    const duration = 1100;
    const startTime = performance.now();
    let animationFrame = 0;

    const animate = (
      currentTime: number,
    ) => {
      const elapsed =
        currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1,
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      setDisplayValue(value * eased);

      if (progress < 1) {
        animationFrame =
          window.requestAnimationFrame(
            animate,
          );
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame =
      window.requestAnimationFrame(
        animate,
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [active, value]);

  const formatted =
    value % 1 === 0
      ? Math.round(displayValue).toString()
      : displayValue.toFixed(1);

  return (
    <>
      {formatted}
      {suffix}
    </>
  );
}

function StudentAvatars() {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={true}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#E13032] text-xs font-black text-white shadow-sm sm:h-11 sm:w-11">
        J
      </span>

      <span className="-ml-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-slate-800 text-xs font-black text-white shadow-sm sm:h-11 sm:w-11">
        W
      </span>

      <span className="-ml-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-orange-400 text-xs font-black text-white shadow-sm sm:h-11 sm:w-11">
        +
      </span>
    </div>
  );
}

export function TrustStats() {
  const sectionRef =
    useRef<HTMLElement | null>(null);

  const [hasEnteredViewport, setHasEnteredViewport] =
    useState(false);

  useEffect(() => {
    const element =
      sectionRef.current;

    if (!element) {
      return;
    }

    if (
      !("IntersectionObserver" in window)
    ) {
      setHasEnteredViewport(true);
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHasEnteredViewport(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.2,
        },
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="JobWay platform statistics"
      className="relative bg-white"
    >
      <div className="mx-auto w-full max-w-[1062px] px-10">
        <div className="py-8 sm:py-10 lg:py-12">
          <div className="relative overflow-hidden rounded-[20px] border border-[#eeeeee] bg-white px-6 py-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:px-8 lg:px-8 lg:py-6">
            {/* Very subtle background treatment */}
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden={true}
              style={{
                background:
                  "radial-gradient(circle at 0% 50%, rgba(225,48,50,0.035), transparent 32%), radial-gradient(circle at 100% 50%, rgba(225,48,50,0.025), transparent 32%)",
              }}
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
              {/* Student avatars */}
              <div className="flex shrink-0 items-center justify-center lg:justify-start">
                <StudentAvatars />
              </div>

              {/* Metrics */}
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-y-0">
                {TRUST_METRICS.map(
                  (metric, index) => {
                    const Icon = getIcon(
                      metric.icon,
                    );

                    return (
                      <div
                        key={metric.id}
                        className={`flex min-w-0 items-center gap-3 sm:px-4 lg:px-5 ${
                          index > 0
                            ? "sm:border-l sm:border-[#eeeeee]"
                            : ""
                        }`}
                      >
                        {/* Icon is useful on smaller screens */}
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E13032] sm:hidden">
                          <Icon
                            className="h-4 w-4"
                            aria-hidden={true}
                          />
                        </span>

                        <div className="min-w-0">
                          <p className="text-[19px] font-bold leading-[24px] tracking-tight text-[#E13032] lg:text-[21px]">
                            <AnimatedValue
                              value={metric.value}
                              suffix={metric.suffix}
                              active={
                                hasEnteredViewport
                              }
                            />
                          </p>

                          <p className="mt-1 text-xs font-semibold leading-4 text-[#555555] sm:text-[13px]">
                            {metric.label}
                          </p>

                          <p className="mt-0.5 hidden text-[10px] leading-4 text-[#9b9b9b] xl:block">
                            {metric.description}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Mobile trust message */}
            <div className="relative mt-5 flex items-center justify-center gap-2 border-t border-[#eeeeee] pt-4 lg:hidden">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E13032]" />

              <span className="text-center text-[10px] font-semibold leading-4 text-[#9b9b9b]">
                Trusted by learners preparing for
                their next big opportunity
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}