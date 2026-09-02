"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect } from "react";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({
  open,
  onClose,
}: AuthModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-3 py-5 backdrop-blur-[3px] sm:px-5 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jobway-auth-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative flex w-full max-w-[920px] overflow-hidden rounded-[20px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.30)]"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Close */}
        <button
          type="button"
          aria-label="Close login and register dialog"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
        >
          <X
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>

        {/* =====================================================
            LEFT PROMOTIONAL SIDE
           ===================================================== */}
        <div className="hidden w-[48%] shrink-0 flex-col justify-between border-r border-slate-100 bg-white p-8 md:flex lg:p-11">
          <div>
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E13032] text-lg font-black text-white shadow-[0_8px_20px_rgba(225,48,50,0.20)]">
                J
              </div>

              <div>
                <p className="text-lg font-black tracking-tight text-slate-950">
                  JobWay
                </p>

                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Learn. Prepare. Achieve.
                </p>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative mx-auto mt-10 flex h-[245px] max-w-[310px] items-center justify-center">
              {/* Background circles */}
              <div className="absolute left-1/2 top-1/2 h-[190px] w-[245px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-red-50" />

              <div className="absolute left-[25px] top-[28px] h-10 w-10 rounded-full bg-red-100" />

              <div className="absolute right-[25px] top-[35px] h-6 w-6 rounded-full bg-slate-100" />

              {/* Laptop */}
              <div className="absolute left-1/2 top-[68px] h-[125px] w-[205px] -translate-x-1/2 rounded-[14px] border-[5px] border-slate-800 bg-white shadow-[0_18px_35px_rgba(15,23,42,0.15)]">
                <div className="absolute inset-[8px] overflow-hidden rounded-[7px] bg-slate-50">
                  <div className="flex h-7 items-center gap-1 border-b border-slate-100 bg-white px-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-200" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                  </div>

                  <div className="grid grid-cols-[1fr_0.7fr] gap-2 p-3">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <div className="h-2 w-12 rounded-full bg-[#E13032]" />
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100" />
                      <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-slate-100" />
                      <div className="mt-3 h-8 rounded-md bg-red-50" />
                    </div>

                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <div className="mx-auto h-7 w-7 rounded-full bg-red-100" />
                      <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-slate-200" />
                      <div className="mx-auto mt-1.5 h-1.5 w-7 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop base */}
              <div className="absolute bottom-[27px] left-1/2 h-3 w-[235px] -translate-x-1/2 rounded-full bg-slate-800 shadow-md" />

              {/* Person */}
              <div className="absolute bottom-[29px] left-[72px]">
                <div className="mx-auto h-10 w-10 rounded-full bg-[#E13032]" />

                <div className="mt-1 h-[54px] w-[58px] rounded-t-[28px] bg-[#E13032]" />
              </div>

              {/* Floating verified card */}
              <div className="absolute right-[15px] top-[50px] flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-[0_10px_25px_rgba(15,23,42,0.12)]">
                <CheckCircle2
                  className="h-6 w-6 text-[#E13032]"
                  aria-hidden="true"
                />
              </div>

              {/* Floating shield */}
              <div className="absolute left-[12px] top-[72px] flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-[0_10px_25px_rgba(15,23,42,0.12)]">
                <ShieldCheck
                  className="h-5 w-5 text-green-600"
                  aria-hidden="true"
                />
              </div>

              {/* Sparkle */}
              <div className="absolute right-[38px] bottom-[35px] flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md">
                <Sparkles
                  className="h-4 w-4 text-[#E13032]"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="mx-auto max-w-[330px] text-center">
              <h2 className="text-[25px] font-semibold leading-tight tracking-tight text-slate-900">
                India's{" "}
                <span className="text-[#E13032]">
                  Leading
                </span>{" "}
                Learning Destination
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Learn smarter, practice better and
                prepare confidently for your next big
                opportunity.
              </p>
            </div>
          </div>

          {/* Trust points */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 px-2 py-3 text-center">
              <Users
                className="mx-auto h-4 w-4 text-[#E13032]"
                aria-hidden="true"
              />

              <p className="mt-1 text-[10px] font-bold text-slate-500">
                Learners
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-2 py-3 text-center">
              <BookOpen
                className="mx-auto h-4 w-4 text-[#E13032]"
                aria-hidden="true"
              />

              <p className="mt-1 text-[10px] font-bold text-slate-500">
                Courses
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-2 py-3 text-center">
              <ShieldCheck
                className="mx-auto h-4 w-4 text-green-600"
                aria-hidden="true"
              />

              <p className="mt-1 text-[10px] font-bold text-slate-500">
                Secure
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT AUTH SIDE
           ===================================================== */}
        <div className="flex min-w-0 flex-1 items-center">
          <div className="w-full px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
            <div className="mx-auto w-full max-w-[390px]">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E13032]">
                  Welcome to JobWay
                </p>

                <h1
                  id="jobway-auth-modal-title"
                  className="mt-2 text-[29px] font-semibold tracking-tight text-slate-900"
                >
                  Login or Register
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Access your courses, mock tests and
                  personalized preparation dashboard.
                </p>
              </div>

              {/* Login */}
              <Link
                href="/login"
                onClick={onClose}
                className="group flex min-h-[72px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E13032]/30 hover:bg-red-50/40 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
                    <CheckCircle2
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      Login
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Already have a JobWay account?
                    </p>
                  </div>
                </div>

                <ArrowRight
                  className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-[#E13032]"
                  aria-hidden="true"
                />
              </Link>

              {/* Register */}
              <Link
                href="/register"
                onClick={onClose}
                className="group mt-3 flex min-h-[72px] w-full items-center justify-between rounded-2xl bg-[#E13032] px-5 py-4 text-white shadow-[0_12px_30px_rgba(225,48,50,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#C92426] hover:shadow-[0_15px_35px_rgba(225,48,50,0.25)] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                    <Sparkles
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-extrabold">
                      Create Account
                    </p>

                    <p className="mt-0.5 text-xs text-white/75">
                      New to JobWay? Sign up here.
                    </p>
                  </div>
                </div>

                <ArrowRight
                  className="h-5 w-5 text-white/70 transition-transform group-hover:translate-x-1 group-hover:text-white"
                  aria-hidden="true"
                />
              </Link>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-100" />

                <span className="text-[11px] font-semibold text-slate-400">
                  SECURE ACCESS
                </span>

                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Security information */}
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <ShieldCheck
                      className="h-4 w-4 text-green-600"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Your account is secure
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      We use secure authentication and
                      verification to protect your JobWay
                      account.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-center text-[10px] leading-5 text-slate-400">
                By continuing, you agree to JobWay's
                Terms of Use and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}