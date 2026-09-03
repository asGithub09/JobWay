"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { login, register } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

type AuthMode = "login" | "register";

export function AuthModal({
  open,
  onClose,
}: AuthModalProps) {
  const { signIn } = useAuth();

  const [mode, setMode] =
    useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [rememberMe, setRememberMe] =
    useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      if (event.key === "Escape" && !loading) {
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
  }, [open, onClose, loading]);

  useEffect(() => {
    if (!open) {
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const switchMode = (
    nextMode: AuthMode,
  ) => {
    if (loading || mode === nextMode) {
      return;
    }

    setMode(nextMode);
    setError("");
    setShowPassword(false);
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await login({
        email: normalizedEmail,
        password,
      });

      if (
        response.requiresVerification &&
        response.email
      ) {
        window.location.href =
          `/verify-email?email=${encodeURIComponent(
            response.email,
          )}`;

        return;
      }

      if (!response.token || !response.user) {
        throw new Error(
          "Login succeeded, but authentication data was not returned.",
        );
      }

      /*
       * Store the authenticated user and JWT.
       * The user's role comes from the backend.
       */
      signIn(
        response.token,
        response.user,
      );

      /*
       * Close the modal before redirecting.
       */
      onClose();

      /*
       * Role-based routing:
       *
       * Admin  → Admin Dashboard
       * Student → JobWay Homepage
       */
      if (response.user.role === "admin") {
        window.location.href = "/admin";
        return;
      }

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

  const handleRegister = async () => {
    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName) {
      setError(
        "Please enter your full name.",
      );
      return;
    }

    if (normalizedName.length < 2) {
      setError(
        "Please enter a valid name.",
      );
      return;
    }

    const phoneDigits =
      normalizedPhone.replace(/\D/g, "");

    if (phoneDigits.length !== 10) {
      setError(
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    if (!normalizedEmail) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please create a password.",
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await register({
        name: normalizedName,
        email: normalizedEmail,
        phone: phoneDigits,
        password,
      });

      if (!response.success) {
        throw new Error(
          response.message ||
            "Registration failed. Please try again.",
        );
      }

      if (
        typeof window !== "undefined"
      ) {
        window.sessionStorage.setItem(
          "jobway_verification_email",
          normalizedEmail,
        );
      }

      window.location.href =
        `/verify-email?email=${encodeURIComponent(
          normalizedEmail,
        )}`;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Registration failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (mode === "login") {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 px-3 py-4 backdrop-blur-xl sm:px-5 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jobway-auth-modal-title"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div
        className="jobway-auth-modal relative flex w-full max-w-[1040px] overflow-hidden rounded-[30px] border border-white/60 bg-white/90 shadow-[0_35px_120px_rgba(15,23,42,0.42)] backdrop-blur-2xl"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Close */}

        <button
          type="button"
          aria-label="Close authentication dialog"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-500 shadow-[0_8px_25px_rgba(15,23,42,0.12)] transition-all duration-200 hover:scale-105 hover:bg-white hover:text-[#800E13] disabled:cursor-not-allowed disabled:opacity-50 sm:right-5 sm:top-5"
        >
          <X
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>

        {/* Left promotional panel */}

        <div className="relative hidden w-[45%] shrink-0 overflow-hidden bg-gradient-to-br from-[#800E13] via-[#94151B] to-[#5E080D] px-8 py-9 text-white md:flex md:flex-col lg:px-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10" />

          <div className="absolute right-12 top-28 h-2 w-2 rounded-full bg-white/70 shadow-[20px_14px_0_rgba(255,255,255,0.28),40px_-5px_0_rgba(255,255,255,0.18)]" />

          {/* Brand */}

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#800E13] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
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

          {/* Hero */}

          <div className="relative z-10 mt-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Your career starts here
            </div>

            <h2 className="max-w-[390px] text-[34px] font-black leading-[1.08] tracking-[-0.04em] lg:text-[40px]">
              Your Dream Job
              <br />
              Starts{" "}
              <span className="text-amber-300">
                Here
              </span>
            </h2>

            <p className="mt-5 max-w-[390px] text-sm leading-6 text-white/80">
              Join thousands of aspirants preparing
              smarter every day with JobWay.
            </p>
          </div>

          {/* Benefits */}

          <div className="relative z-10 mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <TrendingUp className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-extrabold">
                  Track & Improve
                </p>

                <p className="mt-0.5 text-[11px] text-white/65">
                  Mock tests, quizzes & insights
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}

          <div className="relative z-10 mt-auto pt-8">
            <div className="rounded-2xl border border-white/20 bg-white/95 px-4 py-4 text-slate-900 shadow-[0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-md">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <Users className="mx-auto h-4 w-4 text-[#800E13]" />

                  <p className="mt-1.5 text-lg font-black">
                    25K+
                  </p>

                  <p className="text-[9px] font-semibold text-slate-400">
                    Learners
                  </p>
                </div>

                <div className="border-x border-slate-100 text-center">
                  <Award className="mx-auto h-4 w-4 text-[#800E13]" />

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

        {/* Right panel */}

        <div className="min-w-0 flex-1 bg-white/75">
          <div className="flex min-h-[620px] items-center px-6 py-10 sm:px-10 lg:px-12">
            <div className="mx-auto w-full max-w-[430px]">
              {/* Mobile brand */}

              <div className="mb-6 flex items-center gap-2 md:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#800E13] text-sm font-black text-white shadow-[0_8px_20px_rgba(128,14,19,0.2)]">
                  J
                </div>

                <p className="text-lg font-black text-slate-950">
                  JobWay
                </p>
              </div>

              {/* Heading */}

              <div className="mb-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#800E13]/10 bg-[#800E13]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#800E13]">
                  <LockKeyhole className="h-3.5 w-3.5" />

                  {mode === "login"
                    ? "Secure Login"
                    : "Create Your Account"}
                </div>

                <h1
                  id="jobway-auth-modal-title"
                  className="text-[30px] font-black tracking-[-0.035em] text-slate-950 sm:text-[34px]"
                >
                  {mode === "login"
                    ? "Welcome Back!"
                    : "Start Your Journey"}
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {mode === "login"
                    ? "Login to continue your preparation journey."
                    : "Create your JobWay account and start preparing smarter."}
                </p>
              </div>

              {/* Mode switch */}

              <div className="mb-6 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5">
                <button
                  type="button"
                  onClick={() =>
                    switchMode("login")
                  }
                  disabled={loading}
                  className={`rounded-xl px-4 py-2.5 text-xs font-black transition-all duration-200 ${
                    mode === "login"
                      ? "bg-white text-[#800E13] shadow-[0_5px_18px_rgba(15,23,42,0.08)]"
                      : "text-slate-500 hover:text-slate-800"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() =>
                    switchMode("register")
                  }
                  disabled={loading}
                  className={`rounded-xl px-4 py-2.5 text-xs font-black transition-all duration-200 ${
                    mode === "register"
                      ? "bg-white text-[#800E13] shadow-[0_5px_18px_rgba(15,23,42,0.08)]"
                      : "text-slate-500 hover:text-slate-800"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  Create Account
                </button>
              </div>

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Register-only fields */}

                {mode === "register" ? (
                  <>
                    <div>
                      <label
                        htmlFor="jobway-modal-name"
                        className="mb-2 block text-[13px] font-extrabold text-slate-800"
                      >
                        Full Name
                      </label>

                      <div className="group relative">
                        <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#800E13]" />

                        <input
                          id="jobway-modal-name"
                          type="text"
                          value={name}
                          onChange={(event) =>
                            setName(
                              event.target.value,
                            )
                          }
                          autoComplete="name"
                          disabled={loading}
                          placeholder="Enter your full name"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#800E13] focus:bg-white focus:ring-4 focus:ring-[#800E13]/5 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="jobway-modal-phone"
                        className="mb-2 block text-[13px] font-extrabold text-slate-800"
                      >
                        Mobile Number
                      </label>

                      <div className="group relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#800E13]" />

                        <input
                          id="jobway-modal-phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={phone}
                          onChange={(event) => {
                            const value =
                              event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);

                            setPhone(value);
                          }}
                          autoComplete="tel"
                          disabled={loading}
                          placeholder="10-digit mobile number"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#800E13] focus:bg-white focus:ring-4 focus:ring-[#800E13]/5 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </>
                ) : null}

                {/* Email */}

                <div>
                  <label
                    htmlFor="jobway-modal-email"
                    className="mb-2 block text-[13px] font-extrabold text-slate-800"
                  >
                    Email Address
                  </label>

                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#800E13]" />

                    <input
                      id="jobway-modal-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value,
                        )
                      }
                      autoComplete="email"
                      disabled={loading}
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#800E13] focus:bg-white focus:ring-4 focus:ring-[#800E13]/5 disabled:cursor-not-allowed disabled:opacity-60"
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

                    {mode === "login" ? (
                      <Link
                        href="/forgot-password"
                        onClick={onClose}
                        className="text-[11px] font-bold text-[#800E13] transition hover:text-[#5E080D] hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    ) : null}
                  </div>

                  <div className="group relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#800E13]" />

                    <input
                      id="jobway-modal-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value,
                        )
                      }
                      autoComplete={
                        mode === "login"
                          ? "current-password"
                          : "new-password"
                      }
                      disabled={loading}
                      placeholder={
                        mode === "login"
                          ? "Enter your password"
                          : "Minimum 6 characters"
                      }
                      minLength={6}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#800E13] focus:bg-white focus:ring-4 focus:ring-[#800E13]/5 disabled:cursor-not-allowed disabled:opacity-60"
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
                      disabled={loading}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[#800E13] disabled:cursor-not-allowed"
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

                {/* Remember */}

                {mode === "login" ? (
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
                        className="h-4 w-4 rounded border-slate-300 accent-[#800E13]"
                      />

                      Remember me
                    </label>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Secure
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-[10px] font-semibold text-green-700">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    Your email will be verified securely with an OTP.
                  </div>
                )}

                {/* Error */}

                {error ? (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700"
                  >
                    {error}
                  </div>
                ) : null}

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#800E13] px-5 text-sm font-black text-white shadow-[0_12px_30px_rgba(128,14,19,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6B0B10] hover:shadow-[0_16px_35px_rgba(128,14,19,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-[#800E13] focus-visible:outline-offset-3"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />

                      {mode === "login"
                        ? "Signing you in..."
                        : "Creating your account..."}
                    </>
                  ) : (
                    <>
                      {mode === "login"
                        ? "Login"
                        : "Create Account"}

                      <ArrowRight className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Secure information */}

              <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] font-semibold text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />

                Your account is protected with secure
                authentication
              </div>

              {/* Bottom switch */}

              <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                {mode === "login" ? (
                  <p className="text-sm text-slate-500">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() =>
                        switchMode("register")
                      }
                      disabled={loading}
                      className="font-black text-[#800E13] transition hover:text-[#5E080D] hover:underline disabled:cursor-not-allowed"
                    >
                      Create one
                    </button>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      switchMode("login")
                    }
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-sm font-black text-[#800E13] transition hover:text-[#5E080D] disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </button>
                )}
              </div>

              {/* Small benefits */}

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-2.5 text-center">
                  <LockKeyhole className="mx-auto h-4 w-4 text-[#800E13]" />

                  <p className="mt-1 text-[9px] font-bold text-slate-500">
                    Secure
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-2.5 text-center">
                  <Sparkles className="mx-auto h-4 w-4 text-[#800E13]" />

                  <p className="mt-1 text-[9px] font-bold text-slate-500">
                    Simple
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-2.5 text-center">
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