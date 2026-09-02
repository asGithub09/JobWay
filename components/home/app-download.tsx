import Link from "next/link";
import {
  Apple,
  ArrowRight,
  BookOpen,
  Check,
  Download,
  PlayCircle,
  Smartphone,
  Target,
  Users,
  Zap,
} from "lucide-react";

import { Container } from "@/components/shared/container";

const BENEFITS = [
  {
    icon: PlayCircle,
    title: "Live & recorded classes",
  },
  {
    icon: Target,
    title: "Mock tests & practice",
  },
  {
    icon: BookOpen,
    title: "Courses & study material",
  },
  {
    icon: Zap,
    title: "Learn anytime, anywhere",
  },
];

export function AppDownload() {
  return (
    <section
      aria-labelledby="app-download-heading"
      className="bg-white py-14 sm:py-16 lg:py-[72px]"
    >
      <Container size="wide">
        <div className="relative overflow-hidden rounded-[24px] bg-[#E13032] shadow-[0_20px_55px_rgba(225,48,50,0.16)]">
          {/* Decorative circles */}
          <div
            className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border-[70px] border-white/10"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full border-[55px] border-white/10"
            aria-hidden="true"
          />

          {/* Background grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
            aria-hidden="true"
          />

          <div className="relative grid lg:grid-cols-[1fr_0.8fr]">
            {/* Left content */}
            <div className="px-6 py-9 sm:px-10 sm:py-11 lg:px-14 lg:py-14 xl:px-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white">
                <Smartphone
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                JobWay mobile app
              </div>

              <h2
                id="app-download-heading"
                className="mt-5 max-w-xl text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.9rem]"
              >
                Your preparation,
                <span className="block text-white/75">
                  wherever you go.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                Take your courses, mock tests, study material and daily
                preparation resources with you. Learn at your own pace,
                whenever and wherever you want.
              </p>

              {/* Benefits */}
              <div className="mt-7 grid max-w-2xl gap-2.5 sm:grid-cols-2">
                {BENEFITS.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <div
                      key={benefit.title}
                      className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-3 backdrop-blur-sm transition-colors duration-200 hover:bg-white/15"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#E13032]">
                        <Icon
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </span>

                      <span className="text-xs font-bold text-white">
                        {benefit.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/download-app"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#E13032] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  <Download
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Download JobWay App

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href="/courses"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  Explore courses
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold text-white/65">
                <Users
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                One place for your complete preparation journey.
              </div>
            </div>

            {/* Phone showcase */}
            <div className="relative min-h-[420px] border-t border-white/10 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-12">
                <div className="relative h-[350px] w-[190px]">
                  {/* Phone glow */}
                  <div
                    className="absolute -inset-5 rounded-[3rem] bg-white/10 blur-2xl"
                    aria-hidden="true"
                  />

                  {/* Phone frame */}
                  <div className="relative h-full w-full rounded-[2.5rem] border-[6px] border-slate-900 bg-slate-900 p-1.5 shadow-2xl shadow-red-950/40">
                    <div className="relative h-full overflow-hidden rounded-[2rem] bg-white">
                      {/* Notch */}
                      <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-900" />

                      <div className="h-full bg-slate-50 pt-10">
                        {/* App header */}
                        <div className="bg-[#E13032] px-4 pb-6 pt-3">
                          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/70">
                            JobWay
                          </p>

                          <p className="mt-1 text-base font-black text-white">
                            Learn smarter.
                          </p>

                          <p className="mt-0.5 text-[9px] font-medium text-white/75">
                            Prepare with confidence.
                          </p>
                        </div>

                        {/* App cards */}
                        <div className="-mt-3 space-y-2.5 px-3">
                          <div className="rounded-xl bg-white p-3 shadow-md">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-[#E13032]">
                                <PlayCircle
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </div>

                              <div>
                                <p className="text-[9px] font-black text-slate-800">
                                  Live Classes
                                </p>

                                <p className="text-[7px] text-slate-400">
                                  Join today's classes
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-xl bg-white p-3 shadow-md">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                <Target
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </div>

                              <div>
                                <p className="text-[9px] font-black text-slate-800">
                                  Mock Tests
                                </p>

                                <p className="text-[7px] text-slate-400">
                                  Practice your exam
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-xl bg-white p-3 shadow-md">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                <Check
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </div>

                              <div>
                                <p className="text-[9px] font-black text-slate-800">
                                  Your Progress
                                </p>

                                <p className="text-[7px] text-slate-400">
                                  Keep your streak alive
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="rounded-xl bg-slate-950 p-3">
                            <p className="text-[8px] font-bold text-slate-400">
                              Today's progress
                            </p>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full w-[76%] rounded-full bg-[#E13032]" />
                            </div>

                            <div className="mt-1.5 flex justify-between">
                              <span className="text-[7px] font-bold text-slate-500">
                                76% complete
                              </span>

                              <span className="text-[7px] font-bold text-white">
                                Keep going
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom navigation */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-around rounded-xl bg-white px-2 py-2 shadow-lg">
                          <div className="flex flex-col items-center gap-1 text-[#E13032]">
                            <BookOpen
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />

                            <span className="text-[6px] font-bold">
                              Learn
                            </span>
                          </div>

                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            <Target
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />

                            <span className="text-[6px] font-bold">
                              Tests
                            </span>
                          </div>

                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            <Users
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />

                            <span className="text-[6px] font-bold">
                              Profile
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating live classes badge */}
                  <div className="absolute -left-16 top-16 hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md sm:block">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#E13032]">
                        <PlayCircle
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-white">
                          Live classes
                        </p>

                        <p className="text-[8px] text-white/50">
                          Learn anywhere
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floating mock tests badge */}
                  <div className="absolute -right-16 bottom-20 hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md sm:block">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#E13032]">
                        <Target
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-white">
                          Mock tests
                        </p>

                        <p className="text-[8px] text-white/50">
                          Practice daily
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom app-store bar */}
          <div className="relative border-t border-white/10 px-6 py-4 sm:px-10 lg:px-14 xl:px-16">
            <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
              <div>
                <p className="text-xs font-black text-white">
                  Available on your favourite devices
                </p>

                <p className="mt-0.5 text-[10px] font-medium text-white/60">
                  Download the JobWay app and continue your preparation on the
                  go.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/download-app"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-white/15"
                >
                  <PlayCircle
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Google Play
                </Link>

                <Link
                  href="/download-app"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-white/15"
                >
                  <Apple
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  App Store
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}