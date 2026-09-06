"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

type VerificationCertificate = {
  id: string;
  certificateNumber: string;
  verificationId: string;
  studentName: string;
  courseTitle: string;
  completionPercentage: number;
  issuedAt: string;
  status: "issued" | "revoked";
};

type VerificationResponse = {
  success: boolean;
  valid: boolean;
  message?: string;
  certificate?: VerificationCertificate;
};

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getApiBaseUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return "http://localhost:5001/api";
}

export default function PublicCertificateVerificationPage() {
  const params = useParams();

  const rawVerificationId = params?.verificationId;

  const verificationId =
    typeof rawVerificationId === "string"
      ? rawVerificationId
      : Array.isArray(rawVerificationId)
        ? rawVerificationId[0] || ""
        : "";

  const [certificate, setCertificate] =
    useState<VerificationCertificate | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!verificationId) {
      setCertificate(null);
      setError("Verification ID is missing.");
      setLoading(false);
      return;
    }

    const verificationIdValue =
      verificationId;

    let cancelled = false;

    async function verifyCertificate() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${getApiBaseUrl()}/certificates/verify/${encodeURIComponent(
            verificationIdValue,
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        const data =
          (await response.json()) as VerificationResponse;

        if (cancelled) {
          return;
        }

        if (
          !response.ok ||
          !data.valid ||
          !data.certificate
        ) {
          setCertificate(null);
          setError(
            data.message ||
              "This certificate could not be verified.",
          );
          return;
        }

        setCertificate(data.certificate);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Certificate verification failed:",
          err,
        );

        setCertificate(null);

        setError(
          "Unable to verify this certificate right now. Please try again later.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void verifyCertificate();

    return () => {
      cancelled = true;
    };
  }, [verificationId]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          HEADER
         ===================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E13032] text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="text-lg font-black">
                J
              </span>
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-950">
                JobWay
              </p>

              <p className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Learn • Prepare • Succeed
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
            <ShieldCheck
              className="h-4 w-4 text-emerald-600"
              aria-hidden="true"
            />

            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Credential Verification
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
         ===================================================== */}

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-red-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          {/* Loading */}

          {loading ? (
            <div className="mx-auto max-w-3xl">
              <div className="mb-8 text-center">
                <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />

                <div className="mx-auto mt-5 h-8 w-72 animate-pulse rounded-lg bg-slate-200" />

                <div className="mx-auto mt-3 h-5 w-96 max-w-full animate-pulse rounded-lg bg-slate-200" />
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
                <div className="h-2 animate-pulse bg-slate-200" />

                <div className="space-y-8 p-7 sm:p-10">
                  <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-slate-100" />

                  <div className="mx-auto h-8 w-64 animate-pulse rounded-lg bg-slate-200" />

                  <div className="mx-auto h-5 w-80 max-w-full animate-pulse rounded-lg bg-slate-100" />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          ) : certificate ? (
            <>
              {/* =================================================
                  VALID CERTIFICATE
                 ================================================= */}

              <div className="mx-auto max-w-3xl text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <CheckCircle2
                    className="h-8 w-8"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-600">
                  Verified Credential
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Certificate Verified
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
                  This JobWay certificate is authentic and
                  currently valid.
                </p>
              </div>

              <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
                <div className="h-2 bg-[#E13032]" />

                <div className="relative overflow-hidden p-6 sm:p-10">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-red-50 blur-3xl" />

                  <div className="relative">
                    <div className="flex justify-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-50 bg-white text-[#E13032] shadow-sm">
                        <Award
                          className="h-11 w-11"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    <div className="mt-7 text-center">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                        Certificate awarded to
                      </p>

                      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                        {certificate.studentName}
                      </h2>
                    </div>

                    <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center sm:p-6">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                        Course Completed
                      </p>

                      <h3 className="mt-2 text-lg font-black leading-7 text-slate-900 sm:text-xl">
                        {certificate.courseTitle}
                      </h3>

                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Completion:{" "}
                        <span className="font-black text-slate-700">
                          {certificate.completionPercentage}%
                        </span>
                      </p>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-white p-5">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Certificate Number
                        </p>

                        <p className="mt-2 break-all font-mono text-sm font-black text-slate-800">
                          {certificate.certificateNumber}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-5">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Issued On
                        </p>

                        <p className="mt-2 text-sm font-black text-slate-800">
                          {formatDate(
                            certificate.issuedAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                          <ShieldCheck
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700/70">
                            Verification ID
                          </p>

                          <p className="mt-1 break-all font-mono text-sm font-black text-slate-800">
                            {certificate.verificationId}
                          </p>

                          <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                            This ID can be used to verify the
                            authenticity of this credential.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                      <CheckCircle2
                        className="h-4 w-4 text-emerald-600"
                        aria-hidden="true"
                      />

                      <span className="text-xs font-extrabold text-emerald-700">
                        Valid JobWay Certificate
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-[#E13032]"
                >
                  <ArrowLeft
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Back to JobWay
                </Link>

                <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">
                  <ExternalLink
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Official Verification
                </div>
              </div>
            </>
          ) : (
            <>
              {/* =================================================
                  INVALID CERTIFICATE
                 ================================================= */}

              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#E13032] shadow-sm ring-1 ring-red-100">
                  <AlertCircle
                    className="h-8 w-8"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#E13032]">
                  Verification Failed
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Certificate Not Verified
                </h1>

                <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
                  We could not find a valid JobWay certificate
                  matching this verification ID.
                </p>
              </div>

              <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] border border-red-100 bg-white p-7 text-center shadow-xl sm:p-10">
                <div className="rounded-2xl bg-red-50 p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">
                    Verification ID
                  </p>

                  <p className="mt-2 break-all font-mono text-sm font-black text-slate-800">
                    {verificationId || "Not provided"}
                  </p>
                </div>

                <p className="mt-5 text-sm font-medium leading-6 text-slate-500">
                  {error ||
                    "The certificate may not exist, may have been revoked, or the verification ID may be incorrect."}
                </p>

                <Link
                  href="/"
                  className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-extrabold text-white shadow-[0_6px_20px_rgba(225,48,50,0.18)] transition-all hover:bg-[#c92729]"
                >
                  <ArrowLeft
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Back to JobWay
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* =====================================================
          FOOTER
         ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-medium text-slate-400">
            JobWay Certificate Verification
          </p>
        </div>
      </footer>
    </main>
  );
}