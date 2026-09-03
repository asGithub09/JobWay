"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useState } from "react";

import { register } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (!normalizedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^\d{10}$/.test(normalizedPhone)) {
      setError(
        "Please enter a valid 10-digit phone number.",
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await register({
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password,
      });

      if (!response.success) {
        throw new Error(
          response.message || "Registration failed.",
        );
      }

      sessionStorage.setItem(
        "jobway_verification_email",
        normalizedEmail,
      );

      window.location.href = `/verify-email?email=${encodeURIComponent(
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)] md:grid-cols-[0.9fr_1.1fr]">
        {/* Left panel */}

        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#E13032] via-[#ed3037] to-[#c91f43] p-10 text-white md:block lg:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-white/10" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#E13032]">
              J
            </div>

            <div>
              <p className="text-xl font-black">
                JobWay
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">
                Learn. Prepare. Achieve.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]">
              <Sparkles className="h-3.5 w-3.5" />
              Start your journey
            </div>

            <h2 className="text-[38px] font-black leading-[1.08] tracking-[-0.04em]">
              Build your future
              <br />
              with{" "}
              <span className="text-yellow-300">
                JobWay
              </span>{" "}
              ??
            </h2>

            <p className="mt-5 max-w-[380px] text-sm leading-6 text-white/80">
              Create your account and get access to
              courses, mock tests and preparation
              resources built for ambitious learners.
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-4">
            {[
              {
                icon: CheckCircle2,
                title: "Personalized preparation",
              },
              {
                icon: ShieldCheck,
                title: "Secure email verification",
              },
              {
                icon: Sparkles,
                title: "Courses & mock tests",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="h-5 w-5" />
                  </div>

                  <p className="text-sm font-extrabold">
                    {item.title}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-10 left-10 right-10 rounded-2xl border border-white/15 bg-white px-5 py-4 text-slate-900 shadow-lg lg:left-12 lg:right-12">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-100 text-[10px] font-black text-[#E13032]">
                  A
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-100 text-[10px] font-black text-orange-600">
                  R
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-green-100 text-[10px] font-black text-green-600">
                  S
                </span>
              </div>

              <div>
                <p className="text-xs font-black">
                  Join 25K+ learners
                </p>

                <p className="text-[10px] text-slate-400">
                  Preparing smarter with JobWay
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right form */}

        <div className="px-6 py-9 sm:px-10 sm:py-11 lg:px-12">
          <div className="mx-auto max-w-[430px]">
            <div className="mb-7 md:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E13032] text-sm font-black text-white">
                  J
                </div>

                <p className="text-lg font-black text-slate-950">
                  JobWay
                </p>
              </div>
            </div>

            <div className="mb-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#E13032]">
                <Sparkles className="h-3.5 w-3.5" />
                Create account
              </div>

              <h1 className="text-[30px] font-black tracking-[-0.035em] text-slate-950 sm:text-[34px]">
                Join JobWay ??
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create your account and start your
                preparation journey.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Name */}

              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-[13px] font-extrabold text-slate-800"
                >
                  Full Name
                </label>

                <div className="group relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E13032]" />

                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    autoComplete="name"
                    disabled={loading}
                    placeholder="Enter your full name"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 hover:bg-white focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-[13px] font-extrabold text-slate-800"
                >
                  Email Address
                </label>

                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E13032]" />

                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    disabled={loading}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 hover:bg-white focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Phone */}

              <div>
                <label
                  htmlFor="register-phone"
                  className="mb-2 block text-[13px] font-extrabold text-slate-800"
                >
                  Phone Number
                </label>

                <div className="group relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E13032]" />

                  <input
                    id="register-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    autoComplete="tel"
                    disabled={loading}
                    placeholder="10-digit phone number"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 hover:bg-white focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-[13px] font-extrabold text-slate-800"
                >
                  Password
                </label>

                <div className="group relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E13032]" />

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    disabled={loading}
                    placeholder="Minimum 6 characters"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 hover:bg-white focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:opacity-60"
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
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#E13032]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700"
                >
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F15A24] via-[#E13032] to-[#D91F68] px-5 text-sm font-black text-white shadow-[0_12px_30px_rgba(225,48,50,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(225,48,50,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              Your information is securely protected
            </div>

            <p className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-black text-[#E13032] hover:underline"
              >
                Login
              </Link>
            </p>

            <p className="mt-4 text-center text-[10px] leading-5 text-slate-400">
              By creating an account, you agree to
              JobWay's Terms of Use and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
