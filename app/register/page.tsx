"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { register } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      const userId =
        response.userId ||
        (response.user?.id ?? response.user?._id);

      if (!userId) {
        throw new Error(
          "Registration succeeded, but no user ID was returned.",
        );
      }

      sessionStorage.setItem(
        "jobway_verification_user_id",
        String(userId),
      );

      sessionStorage.setItem(
        "jobway_verification_email",
        email.trim(),
      );

      setSuccess(
        response.message ||
          "Registration successful. Please verify your email.",
      );

      window.location.href = `/verify-email?userId=${encodeURIComponent(
        String(userId),
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
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-black text-[#E13032]">
            JobWay
          </p>

          <h1 className="mt-2 text-2xl font-black text-slate-950">
            Create your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Register to continue your preparation journey.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Full name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              autoComplete="name"
              disabled={loading}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#E13032] focus:ring-4 focus:ring-red-50 disabled:bg-slate-50"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              disabled={loading}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#E13032] focus:ring-4 focus:ring-red-50 disabled:bg-slate-50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Phone number
            </label>

            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value.replace(/\D/g, ""),
                )
              }
              autoComplete="tel"
              disabled={loading}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#E13032] focus:ring-4 focus:ring-red-50 disabled:bg-slate-50"
              placeholder="10-digit phone number"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              disabled={loading}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#E13032] focus:ring-4 focus:ring-red-50 disabled:bg-slate-50"
              placeholder="Minimum 8 characters"
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
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-black text-[#E13032] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}