"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  forgotPassword,
  resetPassword,
} from "@/lib/api";

type Step =
  | "email"
  | "otp"
  | "success";

const OTP_DURATION = 10 * 60;

export default function ForgotPasswordPage() {
  const [step, setStep] =
    useState<Step>("email");

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [secondsLeft, setSecondsLeft] =
    useState(OTP_DURATION);

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =====================================================
     OTP COUNTDOWN
     ===================================================== */

  useEffect(() => {
    if (step !== "otp") {
      return;
    }

    if (secondsLeft <= 0) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setSecondsLeft(
          (current) =>
            Math.max(0, current - 1),
        );
      }, 1000);

    return () =>
      window.clearInterval(timer);
  }, [step, secondsLeft]);

  const formattedTime = `${String(
    Math.floor(secondsLeft / 60),
  ).padStart(2, "0")}:${String(
    secondsLeft % 60,
  ).padStart(2, "0")}`;

  /* =====================================================
     SEND RESET OTP
     ===================================================== */

  const handleSendOTP = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await forgotPassword({
          email: normalizedEmail,
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

      if (!response.success) {
        throw new Error(
          response.message ||
            "Could not send the reset code.",
        );
      }

      setEmail(normalizedEmail);
      setSecondsLeft(OTP_DURATION);
      setStep("otp");

      setSuccessMessage(
        "A password reset code has been sent to your email.",
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not send the reset code.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RESET PASSWORD
     ===================================================== */

  const handleResetPassword = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const normalizedOTP =
      otp.trim();

    if (!/^\d{6}$/.test(normalizedOTP)) {
      setError(
        "Please enter the 6-digit OTP.",
      );
      return;
    }

    if (secondsLeft <= 0) {
      setError(
        "Your OTP has expired. Please request a new code.",
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await resetPassword({
          email,
          otp: normalizedOTP,
          newPassword: password,
        });

      if (!response.success) {
        throw new Error(
          response.message ||
            "Password reset failed.",
        );
      }

      setStep("success");
      setSuccessMessage(
        "Your password has been reset successfully.",
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not reset your password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RESEND RESET OTP
     ===================================================== */

  const handleResend = async () => {
    if (
      resending ||
      secondsLeft > 0
    ) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      setResending(true);

      const response =
        await forgotPassword({
          email,
        });

      if (!response.success) {
        throw new Error(
          response.message ||
            "Could not resend the code.",
        );
      }

      setOtp("");
      setSecondsLeft(OTP_DURATION);

      setSuccessMessage(
        "A new password reset code has been sent.",
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not resend the code.";

      setError(message);
    } finally {
      setResending(false);
    }
  };

  /* =====================================================
     CHANGE EMAIL
     ===================================================== */

  const handleBackToEmail = () => {
    setError("");
    setSuccessMessage("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setSecondsLeft(OTP_DURATION);
    setStep("email");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[30px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.12)] lg:grid-cols-[0.85fr_1.15fr]">

          {/* =================================================
              LEFT PROMOTIONAL PANEL
             ================================================= */}

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#E13032] via-[#ed3037] to-[#c91f43] p-10 text-white lg:flex lg:flex-col">
            <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-white/10" />

            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10" />

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

            <div className="relative z-10 mt-20">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Account Security
              </div>

              <h1 className="max-w-md text-4xl font-black leading-[1.08] tracking-[-0.04em]">
                Get Back to Your
                <span className="block text-yellow-300">
                  Career Journey.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/80">
                Securely reset your password and
                continue preparing for your dream
                career with JobWay.
              </p>
            </div>

            <div className="relative z-10 mt-auto space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <Mail className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-extrabold">
                    Secure Email Verification
                  </p>

                  <p className="text-[11px] text-white/65">
                    OTP-based account protection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <KeyRound className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-extrabold">
                    Secure Password Reset
                  </p>

                  <p className="text-[11px] text-white/65">
                    Your new password is securely stored
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT PANEL
             ================================================= */}

          <div className="flex items-center p-6 sm:p-10 lg:p-14">
            <div className="mx-auto w-full max-w-md">

              <Link
                href="/login"
                className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#E13032]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>

              {/* =================================================
                  EMAIL STEP
                 ================================================= */}

              {step === "email" ? (
                <>
                  <div className="mb-8">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#E13032]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Password Recovery
                    </div>

                    <h2 className="text-3xl font-black tracking-[-0.035em] text-slate-950">
                      Forgot your password?
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Enter your registered email and
                      we'll send you a secure OTP to
                      reset your password.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSendOTP}
                    className="space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="reset-email"
                        className="mb-2 block text-[13px] font-extrabold text-slate-800"
                      >
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

                        <input
                          id="reset-email"
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
                          className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:opacity-60"
                        />
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
                      className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F15A24] via-[#E13032] to-[#D91F68] text-sm font-black text-white shadow-[0_12px_30px_rgba(225,48,50,0.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Send Reset Code
                          <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : null}

              {/* =================================================
                  OTP + PASSWORD STEP
                 ================================================= */}

              {step === "otp" ? (
                <>
                  <div className="mb-7">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#E13032]">
                      <KeyRound className="h-3.5 w-3.5" />
                      Verify & Reset
                    </div>

                    <h2 className="text-3xl font-black tracking-[-0.035em] text-slate-950">
                      Create a new password
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Enter the 6-digit code sent to
                      <span className="font-bold text-slate-700">
                        {" "}
                        {email}
                      </span>
                    </p>
                  </div>

                  <form
                    onSubmit={handleResetPassword}
                    className="space-y-5"
                  >
                    {/* OTP */}

                    <div>
                      <label
                        htmlFor="reset-otp"
                        className="mb-2 block text-[13px] font-extrabold text-slate-800"
                      >
                        Verification Code
                      </label>

                      <input
                        id="reset-otp"
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
                        placeholder="000000"
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/60 text-center text-xl font-black tracking-[0.45em] text-slate-900 outline-none transition focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:opacity-60"
                      />

                      <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">
                          Code expires in
                        </span>

                        <span
                          className={
                            secondsLeft === 0
                              ? "font-black text-red-500"
                              : "font-black text-[#E13032]"
                          }
                        >
                          {formattedTime}
                        </span>
                      </div>
                    </div>

                    {/* New Password */}

                    <div>
                      <label
                        htmlFor="new-password"
                        className="mb-2 block text-[13px] font-extrabold text-slate-800"
                      >
                        New Password
                      </label>

                      <div className="relative">
                        <input
                          id="new-password"
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
                          autoComplete="new-password"
                          disabled={loading}
                          placeholder="At least 6 characters"
                          className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 pr-12 text-sm font-medium text-slate-900 outline-none transition focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:opacity-60"
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
                              (current) =>
                                !current,
                            )
                          }
                          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#E13032]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}

                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="mb-2 block text-[13px] font-extrabold text-slate-800"
                      >
                        Confirm New Password
                      </label>

                      <div className="relative">
                        <input
                          id="confirm-password"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(
                              event.target.value,
                            )
                          }
                          autoComplete="new-password"
                          disabled={loading}
                          placeholder="Repeat your password"
                          className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 pr-12 text-sm font-medium text-slate-900 outline-none transition focus:border-[#E13032] focus:bg-white focus:ring-4 focus:ring-red-50 disabled:opacity-60"
                        />

                        <button
                          type="button"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          onClick={() =>
                            setShowConfirmPassword(
                              (current) =>
                                !current,
                            )
                          }
                          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#E13032]"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Messages */}

                    {successMessage ? (
                      <div
                        role="status"
                        className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-xs font-semibold leading-5 text-green-700"
                      >
                        {successMessage}
                      </div>
                    ) : null}

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
                      className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F15A24] via-[#E13032] to-[#D91F68] text-sm font-black text-white shadow-[0_12px_30px_rgba(225,48,50,0.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          Reset Password
                          <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* OTP Actions */}

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="text-xs font-bold text-slate-500 transition hover:text-[#E13032]"
                    >
                      Change Email
                    </button>

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={
                        resending ||
                        secondsLeft > 0
                      }
                      className="text-xs font-black text-[#E13032] transition disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      {resending
                        ? "Sending..."
                        : secondsLeft > 0
                          ? `Resend in ${formattedTime}`
                          : "Resend OTP"}
                    </button>
                  </div>
                </>
              ) : null}

              {/* =================================================
                  SUCCESS
                 ================================================= */}

              {step === "success" ? (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>

                  <h2 className="mt-7 text-3xl font-black tracking-[-0.035em] text-slate-950">
                    Password Reset!
                  </h2>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                    Your password has been updated
                    successfully. You can now log in
                    using your new password.
                  </p>

                  <Link
                    href="/login"
                    className="group mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F15A24] via-[#E13032] to-[#D91F68] text-sm font-black text-white shadow-[0_12px_30px_rgba(225,48,50,0.22)] transition hover:-translate-y-0.5"
                  >
                    Continue to Login

                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              ) : null}

              {/* Security */}

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />

                Your account is protected with secure
                authentication
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}