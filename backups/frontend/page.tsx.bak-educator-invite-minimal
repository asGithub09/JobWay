"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  acceptFacultyInvitation,
  validateFacultyInvitation,
  type FacultyInvitationValidation,
} from "@/lib/api";

type PageState = "loading" | "ready" | "error" | "success";

export default function EducatorInvitationPage() {
  const params = useParams();
  const router = useRouter();

  const token =
    typeof params.token === "string"
      ? params.token
      : Array.isArray(params.token)
        ? params.token[0]
        : "";

  const [pageState, setPageState] =
    useState<PageState>("loading");

  const [invitation, setInvitation] =
    useState<FacultyInvitationValidation | null>(null);

  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("This invitation link is invalid.");
      setPageState("error");
      return;
    }

    let cancelled = false;

    async function loadInvitation() {
      try {
        setPageState("loading");
        setError("");

        const response =
          await validateFacultyInvitation(token);

        if (cancelled) {
          return;
        }

        setInvitation(response.invitation);

        if (response.invitation.name) {
          setName(response.invitation.name);
        }

        setPageState("ready");
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "This invitation link is invalid or has expired.",
        );

        setPageState("error");
      }
    }

    loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token || !invitation) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Name must be 100 characters or less.");
      return;
    }

    if (!trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await acceptFacultyInvitation(token, {
        name: trimmedName,
        phone: trimmedPhone,
        password,
      });

      setPageState("success");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create your educator account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (pageState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-5">
        <div className="w-full max-w-md rounded-[28px] border border-white bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-red-50">
            <GraduationCap className="h-7 w-7 text-[#E13032]" />
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-950">
            Checking your invitation
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Please wait while we verify your JobWay educator invitation.
          </p>
        </div>
      </main>
    );
  }

  if (pageState === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-5 py-10">
        <div className="w-full max-w-lg rounded-[30px] border border-white bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-red-50">
            <ShieldCheck className="h-8 w-8 text-[#E13032]" />
          </div>

          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-[#E13032]">
            JobWay Educator Access
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Invitation unavailable
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            {error ||
              "This invitation link is invalid, expired, revoked, or has already been accepted."}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#E13032] px-6 text-sm font-black text-white transition hover:bg-[#c92426]"
            >
              Go to Login
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Back to JobWay
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (pageState === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-5 py-10">
        <div className="w-full max-w-lg rounded-[30px] border border-white bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-emerald-50">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>

          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">
            Account Created
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Welcome to JobWay
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Your educator account has been created successfully.
            Sign in using your new credentials to access the
            Educator Dashboard.
          </p>

          <Link
            href="/login"
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#E13032] px-6 text-sm font-black text-white shadow-[0_12px_28px_rgba(225,48,50,0.22)] transition hover:bg-[#c92426]"
          >
            Continue to Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fc] px-5 py-8 sm:px-8 lg:px-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-red-200/20 blur-[110px]" />
        <div className="absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-violet-200/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/80 bg-white/85 shadow-[0_30px_100px_rgba(15,23,42,0.09)] backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:block xl:p-12">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative flex h-full flex-col">
              <Link
                href="/"
                className="inline-flex w-fit items-center gap-2"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E13032]">
                  <GraduationCap className="h-5 w-5" />
                </span>

                <span className="text-lg font-black tracking-tight">
                  JobWay
                </span>
              </Link>

              <div className="my-auto">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-red-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Invitation
                </div>

                <h1 className="max-w-md text-4xl font-black leading-[1.08] tracking-[-0.04em] xl:text-5xl">
                  Start your journey as a JobWay educator.
                </h1>

                <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                  Your educator account gives you a focused workspace
                  to manage mock tests, tasks and lesson plans for
                  your assigned batches.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    "Manage mock tests for your batches",
                    "Keep tasks and lesson plans updated",
                    "Work from one dedicated educator workspace",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm font-semibold text-slate-200"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-red-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs font-medium text-slate-500">
                Secure educator onboarding • JobWay
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-9 lg:p-10 xl:p-12">
            <div className="mx-auto max-w-xl">
              <div className="flex items-center gap-3 lg:hidden">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E13032] text-white">
                  <GraduationCap className="h-5 w-5" />
                </span>

                <span className="text-lg font-black text-slate-950">
                  JobWay
                </span>
              </div>

              <div className="mt-7 lg:mt-0">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#E13032]">
                  Educator Invitation
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  Create your educator account
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Complete your profile to activate your JobWay
                  educator access.
                </p>
              </div>

              <div className="mt-7 rounded-2xl border border-red-100 bg-red-50/70 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#E13032]" />

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-red-500">
                      Invitation sent to
                    </p>

                    <p className="mt-1 truncate text-sm font-black text-slate-900">
                      {invitation?.email}
                    </p>

                    {invitation?.name && (
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Invited as {invitation.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >
                {error && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="educator-name"
                    className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="educator-name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-4 focus:ring-red-50"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="educator-phone"
                    className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="educator-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-4 focus:ring-red-50"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="educator-password"
                    className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="educator-password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Create a secure password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-4 focus:ring-red-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-[11px] font-medium text-slate-400">
                    Minimum 6 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="educator-confirm-password"
                    className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="educator-confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Enter your password again"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-4 focus:ring-red-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value,
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#E13032] px-6 text-sm font-black text-white shadow-[0_14px_30px_rgba(225,48,50,0.22)] transition hover:bg-[#c92426] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Creating Account..."
                    : "Create Educator Account"}

                  {!submitting && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Your invitation is securely verified by JobWay.
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}