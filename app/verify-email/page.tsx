"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { verifyEmail } from "@/lib/api";

export default function VerifyEmailPage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    const queryUserId = params.get("userId") || "";
    const storedUserId =
      sessionStorage.getItem(
        "jobway_verification_user_id",
      ) || "";

    const storedEmail =
      sessionStorage.getItem(
        "jobway_verification_email",
      ) || "";

    setUserId(queryUserId || storedUserId);
    setEmail(storedEmail);
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const verificationUserId =
      userId.trim();

    const normalizedOtp = otp.trim();

    if (!verificationUserId) {
      setError(
        "Verification session is missing. Please register again.",
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
        userId: verificationUserId,
        otp: normalizedOtp,
      });

      setSuccess(
        response.message ||
          "Email verified successfully. You can now log in.",
      );

      sessionStorage.removeItem(
        "jobway_verification_user_id",
      );

      sessionStorage.removeItem(
        "jobway_verification_email",
      );

      window.setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
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
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-black text-[#E13032]">
            JobWay
          </p>

          <h1 className="mt-2 text-2xl font-black text-slate-950">
            Verify your email
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter the 6-digit verification code sent
            to your email address.
          </p>

          {email ? (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
              {email}
            </p>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="otp"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Verification code
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
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
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-center text-lg font-black tracking-[0.35em] text-slate-900 outline-none transition focus:border-[#E13032] focus:ring-4 focus:ring-red-50 disabled:bg-slate-50"
              placeholder="000000"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700"
            >
              {error}
            </div>
          ) : null}

          {success ? (
            <div
              role="status"
              className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold leading-5 text-green-700"
            >
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#E13032] px-5 text-sm font-black text-white shadow-[0_10px_25px_rgba(225,48,50,0.18)] transition hover:bg-[#C92628] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Verifying..."
              : "Verify email"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <Link
            href="/register"
            className="font-bold text-slate-500 hover:text-slate-900"
          >
            Back to register
          </Link>

          <Link
            href="/login"
            className="font-black text-[#E13032] hover:underline"
          >
            Go to login
          </Link>
        </div>
      </div>
    </main>
  );
}