"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { verifyEmail } from "@/lib/api";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    const queryEmail = params.get("email") || "";

    const storedEmail =
      sessionStorage.getItem(
        "jobway_verification_email",
      ) || "";

    setEmail(queryEmail || storedEmail);
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    if (!normalizedEmail) {
      setError(
        "Verification email is missing. Please register again.",
      );
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyEmail({
        email: normalizedEmail,
        otp: normalizedOtp,
      });

      if (!response.success) {
        throw new Error(
          response.message ||
            "Email verification failed.",
        );
      }

      setSuccess(
        response.message ||
          "Email verified successfully. You can now log in.",
      );

      sessionStorage.removeItem(
        "jobway_verification_email",
      );

      window.setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "OTP verification failed. Please try again.";

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
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] bg-white/15 backdrop-blur-sm">
              <MailCheck className="h-10 w-10" />
            </div>

            <h2 className="text-[38px] font-black leading-[1.08] tracking-[-0.04em]">
              One quick step
              <br />
              to get{" "}
              <span className="text-yellow-300">
                started
              </span>
            </h2>

            <p className="mt-5 max-w-[370px] text-sm leading-6 text-white/80">
              We've sent a verification code to your
              email. Confirm it to activate your JobWay
              account.
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <p className="text-sm font-extrabold">
                Secure verification
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Clock3 className="h-5 w-5" />
              </div>

              <p className="text-sm font-extrabold">
                Code expires in 10 minutes
              </p>
            </div>
          </div>
        </div>

        {/* Verification panel */}

        <div className="flex items-center px-6 py-12 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-[430px]">
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

            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#E13032]">
                <MailCheck className="h-3.5 w-3.5" />
                Email Verification
              </div>

              <h1 className="text-[30px] font-black tracking-[-0.035em] text-slate-950 sm:text-[34px]">
                Verify your email
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter the 6-digit code we sent to your
                email address.
              </p>

              {email ? (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <MailCheck className="h-4 w-4 text-[#E13032]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Verification email
                    </p>

                    <p className="truncate text-xs font-extrabold text-slate-700">
                      {email}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="verification-otp"
                  className="mb-2 block text-[13px] font-extrabold text-slate-800"
                >
                  Verification Code
                </label>

                <input
                  id="verification-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    )
                  }
                  disabled={loading}
                  placeholder="000000"
                  className="h-16 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-center text-2xl font-black tracking-[0.45em] text-slate-900 outline-none transition hover:border-slate-300 hover:bg-white focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:opacity-60"
                />

                <p className="mt-2 text-center text-[10px] font-semibold text-slate-400">
                  Enter all 6 digits
                </p>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700"
                >
                  {error}
                </div>
              ) : null}

              {success ? (
                <div
                  role="status"
                  className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-xs font-semibold leading-5 text-green-700"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  {success}
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
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 rounded-2xl bg-slate-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#E13032]" />
                </div>

                <div>
                  <p className="text-xs font-extrabold text-slate-700">
                    Didn't receive the code?
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    Check your spam or promotions folder.
                    A new registration can be requested
                    if the code expires.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-6 text-sm">
              <Link
                href="/register"
                className="font-bold text-slate-500 transition hover:text-slate-900"
              >
                ? Back to register
              </Link>

              <Link
                href="/login"
                className="font-black text-[#E13032] hover:underline"
              >
                Go to login
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              Secure JobWay authentication
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
