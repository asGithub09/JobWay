"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { login } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({
  open,
  onClose,
}: AuthModalProps) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email: normalizedEmail,
        password,
      });

      if (
        response.requiresVerification &&
        response.email
      ) {
        window.location.href = `/verify-email?email=${encodeURIComponent(
          response.email,
        )}`;

        return;
      }

      if (!response.token || !response.user) {
        throw new Error(
          "Login succeeded, but authentication data was not returned.",
        );
      }

      signIn(response.token, response.user);

      onClose();

      window.location.href = "/";
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Login failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/65 px-3 py-4 backdrop-blur-md sm:px-5 sm:py-8"
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
        className="jobway-auth-modal relative flex w-full max-w-[1000px] overflow-hidden rounded-[28px] bg-white shadow-[0_35px_120px_rgba(15,23,42,0.35)]"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* =====================================================
            CLOSE BUTTON
           ===================================================== */}

        <button
          type="button"
          aria-label="Close login dialog"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-[0_8px_25px_rgba(15,23,42,0.12)] transition-all duration-200 hover:scale-105 hover:bg-slate-50 hover:text-[#E13032] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2 sm:right-5 sm:top-5"
        >
          <X
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>

        {/* =====================================================
            LEFT PROMOTIONAL PANEL
           ===================================================== */}

        <div className="relative hidden w-[47%] shrink-0 overflow-hidden bg-gradient-to-br from-[#E13032] via-[#ed3037] to-[#c91f43] px-8 py-9 text-white md:flex md:flex-col lg:px-10">
          {/* Decorative circles */}

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-white/10" />

          <div className="absolute right-10 top-24 h-2 w-2 rounded-full bg-white/60 shadow-[18px_12px_0_rgba(255,255,255,0.3),36px_-4px_0_rgba(255,255,255,0.2)]" />

          {/* Brand */}

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#E13032] shadow-[0_10px_25px_rgba(0,0,0,0.12)]">
              J
            </div>

            <div>
              <p className="text-xl font-black tracking-tight">
                JobWay
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">
                Learn. Prepare. Achieve.
              </p>
            </div>
          </div>

          {/* Hero copy */}

          <div className="relative z-10 mt-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Your career starts here
            </div>

            <h2 className="max-w-[390px] text-[34px] font-black leading-[1.08] tracking-[-0.04em] lg:text-[40px]">
              Your Dream Job
              <br />
              Starts{" "}
              <span className="text-yellow-300">
                Here
              </span>{" "}
              ??
            </h2>

            <p className="mt-5 max-w-[390px] text-sm leading-6 text-white/80">
              Join thousands of aspirants preparing
              smarter every day with JobWay.
            </p>
          </div>

          {/* Feature list */}

          <div className="relative z-10 mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-extrabold">
                  Target Top Government Jobs
                </p>

                <p className="mt-0.5 text-[11px] text-white/65">
                  SSC, Banking, Railway, UPSC & more
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <BookOpen className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-extrabold">
                  Expert-Led Learning
                </p>

                <p className="mt-0.5 text-[11px] text-white/65">
                  Courses designed for serious aspirants
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <TrendingUp className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-extrabold">
                  Track & Improve
                </p>

                <p className="mt-0.5 text-[11px] text-white/65">
                  Mock tests, quizzes & performance insights
                </p>
              </div>
            </div>
          </div>

          {/* Floating stats card */}

          <div className="relative z-10 mt-auto pt-8">
            <div className="rounded-2xl border border-white/15 bg-white px-4 py-4 text-slate-900 shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <Users className="mx-auto h-4 w-4 text-[#E13032]" />

                  <p className="mt-1.5 text-lg font-black">
                    25K+
                  </p>

                  <p className="text-[9px] font-semibold text-slate-400">
                    Learners
                  </p>
                </div>

                <div className="border-x border-slate-100 text-center">
                  <Award className="mx-auto h-4 w-4 text-[#E13032]" />

                  <p className="mt-1.5 text-lg font-black">
                    150+
                  </p>

                  <p className="text-[9px] font-semibold text-slate-400">
                    Selections
                  </p>
                </div>

                <div className="text-center">
                  <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />

                  <p className="mt-1.5 text-lg font-black">
                    4.8/5
                  </p>

                  <p className="text-[9px] font-semibold text-slate-400">
                    Rating
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT LOGIN PANEL
           ===================================================== */}

        <div className="min-w-0 flex-1 bg-white">
          <div className="flex min-h-[620px] items-center px-6 py-12 sm:px-10 lg:px-12">
            <div className="mx-auto w-full max-w-[410px]">
              {/* Mobile brand */}

              <div className="mb-7 flex items-center gap-2 md:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E13032] text-sm font-black text-white">
                  J
                </div>

                <p className="text-lg font-black text-slate-950">
                  JobWay
                </p>
              </div>

              {/* Heading */}

              <div className="mb-7">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#E13032]">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Secure Login
                </div>

                <h1
                  id="jobway-auth-modal-title"
                  className="text-[30px] font-black tracking-[-0.035em] text-slate-950 sm:text-[34px]"
                >
                  Welcome Back!{" "}
                  <span className="inline-block">
                    ??
                  </span>
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Login to continue your preparation
                  journey.
                </p>
              </div>

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}

                <div>
                  <label
                    htmlFor="jobway-modal-email"
                    className="mb-2 block text-[13px] font-extrabold text-slate-800"
                  >
                    Email Address
                  </label>

                  <div className="group relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#E13032]" />

                    <input
                      id="jobway-modal-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      autoComplete="email"
                      disabled={loading}
                      placeholder="you@example.com"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Password */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="jobway-modal-password"
                      className="block text-[13px] font-extrabold text-slate-800"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-[11px] font-bold text-[#E13032] transition hover:text-[#C92426] hover:underline"
                      onClick={() => {
                        setError(
                          "Password recovery will be available soon.",
                        );
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="group relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#E13032]" />

                    <input
                      id="jobway-modal-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      disabled={loading}
                      placeholder="Enter your password"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (current) => !current,
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#E13032] focus-visible:outline-2 focus-visible:outline-[#E13032]"
                    >
                      {showPassword ? (
                        <EyeOff
                          className="h-4.5 w-4.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <Eye
                          className="h-4.5 w-4.5"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me */}

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(
                          event.target.checked,
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 accent-[#E13032]"
                    />

                    Remember me
                  </label>

                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secure
                  </div>
                </div>

                {/* Error */}

                {error ? (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700"
                  >
                    {error}
                  </div>
                ) : null}

                {/* Login button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F15A24] via-[#E13032] to-[#D91F68] px-5 text-sm font-black text-white shadow-[0_12px_30px_rgba(225,48,50,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(225,48,50,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-3"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Signing you in...
                    </>
                  ) : (
                    <>
                      Login

                      <ArrowRight className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Secure information */}

              <div className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] font-semibold text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />

                Your account is protected with secure
                authentication
              </div>

              {/* Register */}

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="font-black text-[#E13032] transition hover:text-[#C92426] hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>

              {/* Small benefit row */}

              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 px-2 py-2.5 text-center">
                  <LockKeyhole className="mx-auto h-4 w-4 text-[#E13032]" />

                  <p className="mt-1 text-[9px] font-bold text-slate-500">
                    Secure
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 px-2 py-2.5 text-center">
                  <Sparkles className="mx-auto h-4 w-4 text-[#E13032]" />

                  <p className="mt-1 text-[9px] font-bold text-slate-500">
                    Simple
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 px-2 py-2.5 text-center">
                  <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />

                  <p className="mt-1 text-[9px] font-bold text-slate-500">
                    Trusted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .jobway-auth-modal {
          animation: jobwayAuthModalIn 240ms
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes jobwayAuthModalIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 767px) {
          .jobway-auth-modal {
            border-radius: 24px;
          }
        }
      `}</style>
    </div>
  );
}
