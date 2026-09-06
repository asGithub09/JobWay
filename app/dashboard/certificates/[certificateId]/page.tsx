"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import StudentPortalShell from "@/components/student-portal/StudentPortalShell";
import {
  getStudentCertificate,
  type StudentCertificate,
} from "@/lib/api";

/* =========================================================
   HELPERS
   ========================================================= */

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

function getCourseSlug(certificate: StudentCertificate) {
  if (
    typeof certificate.course === "object" &&
    certificate.course
  ) {
    return certificate.course.slug || "";
  }

  return "";
}

function getCourseTitle(certificate: StudentCertificate) {
  if (
    typeof certificate.course === "object" &&
    certificate.course
  ) {
    return certificate.course.title || certificate.courseTitle;
  }

  return certificate.courseTitle;
}

function getVerificationUrl(
  verificationId: string,
) {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/certificates/verify/${encodeURIComponent(
    verificationId,
  )}`;
}

/* =========================================================
   PAGE
   ========================================================= */

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();

  const certificateId = Array.isArray(
    params?.certificateId,
  )
    ? params.certificateId[0]
    : params?.certificateId;

  const [certificate, setCertificate] =
    useState<StudentCertificate | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [verificationUrl, setVerificationUrl] =
    useState("");

  useEffect(() => {
    if (!certificateId) {
      setError("Certificate ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;
async function loadCertificate() {
  try {
    setLoading(true);
    setError("");

    const id = certificateId;

    if (!id) {
      setError("Certificate ID is missing.");
      return;
    }

    const response =
      await getStudentCertificate(id);
   

        if (cancelled) {
          return;
        }

        setCertificate(
          response.certificate,
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load certificate:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load certificate.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCertificate();

    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  useEffect(() => {
    if (!certificate?.verificationId) {
      return;
    }

    setVerificationUrl(
      getVerificationUrl(
        certificate.verificationId,
      ),
    );
  }, [certificate]);

  const courseSlug = useMemo(
    () =>
      certificate
        ? getCourseSlug(certificate)
        : "",
    [certificate],
  );

  const courseTitle = useMemo(
    () =>
      certificate
        ? getCourseTitle(certificate)
        : "",
    [certificate],
  );

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <StudentPortalShell>
        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="mb-6 h-5 w-40 animate-pulse rounded-lg bg-slate-200" />

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="h-[520px] animate-pulse bg-slate-200 sm:h-[620px]" />
            </div>
          </div>
        </main>
      </StudentPortalShell>
    );
  }

  if (error || !certificate) {
    return (
      <StudentPortalShell>
        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/certificates",
                )
              }
              className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-[#E13032]"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />
              Back to Certificates
            </button>

            <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#E13032]">
                <ShieldCheck
                  className="h-8 w-8"
                  aria-hidden="true"
                />
              </div>

              <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
                Certificate unavailable
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm font-medium leading-6 text-slate-500">
                {error ||
                  "The requested certificate could not be found."}
              </p>

              <Link
                href="/dashboard/certificates"
                className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-extrabold text-white shadow-[0_6px_20px_rgba(225,48,50,0.18)] transition-all hover:bg-[#c92729]"
              >
                View My Certificates
              </Link>
            </div>
          </div>
        </main>
      </StudentPortalShell>
    );
  }

  return (
    <>
      <StudentPortalShell>
        <main className="min-h-screen bg-slate-50 print:min-h-0 print:bg-white">
          {/* =====================================================
              ACTION BAR
             ===================================================== */}

          <section className="border-b border-slate-200 bg-white print:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <Link
                href="/dashboard/certificates"
                className="inline-flex w-fit items-center gap-2 text-sm font-extrabold text-slate-600 transition-colors hover:text-[#E13032]"
              >
                <ArrowLeft
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Back to Certificates
              </Link>

              <div className="flex flex-col gap-2 sm:flex-row">
                {courseSlug ? (
                  <Link
                    href={`/dashboard/courses/${encodeURIComponent(
                      courseSlug,
                    )}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-[#E13032]"
                  >
                    <GraduationCap
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    View Course
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-extrabold text-white shadow-[0_6px_20px_rgba(225,48,50,0.18)] transition-all hover:bg-[#c92729] hover:shadow-[0_8px_24px_rgba(225,48,50,0.24)]"
                >
                  <Printer
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Print Certificate
                </button>
              </div>
            </div>
          </section>

          {/* =====================================================
              CERTIFICATE AREA
             ===================================================== */}

          <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12 print:max-w-none print:px-0 print:py-0">
            <div
              id="jobway-certificate"
              className="relative mx-auto aspect-[1.414/1] w-full max-w-[1200px] overflow-hidden border border-slate-200 bg-white shadow-2xl print:aspect-auto print:max-w-none print:border-0 print:shadow-none"
            >
              {/* Outer decorative border */}

              <div className="pointer-events-none absolute inset-3 border border-slate-200 sm:inset-5 print:inset-5" />

              <div className="pointer-events-none absolute inset-5 border border-red-100 sm:inset-7 print:inset-7" />

              {/* Decorative corner shapes */}

              <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full border-[24px] border-red-50" />

              <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full border-[30px] border-slate-50" />

              <div className="pointer-events-none absolute right-[12%] top-[14%] h-24 w-24 rounded-full bg-red-50/60 blur-3xl" />

              <div className="relative flex h-full flex-col px-[8%] py-[7%] text-center">
                {/* Brand */}

                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E13032] text-white shadow-sm sm:h-11 sm:w-11">
                        <span className="text-lg font-black sm:text-xl">
                          J
                        </span>
                      </div>

                      <div>
                        <p className="text-base font-black tracking-tight text-slate-950 sm:text-xl">
                          JobWay
                        </p>

                        <p className="text-[7px] font-extrabold uppercase tracking-[0.18em] text-slate-400 sm:text-[9px]">
                          Learn • Prepare • Succeed
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 sm:h-16 sm:w-16">
                    <Award
                      className="h-6 w-6 text-[#E13032] sm:h-8 sm:w-8"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Heading */}

                <div className="mt-[6%]">
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.35em] text-[#E13032] sm:text-xs">
                    Official Credential
                  </p>

                  <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                    Certificate of Completion
                  </h1>

                  <div className="mx-auto mt-4 h-px w-20 bg-[#E13032] sm:mt-5 sm:w-28" />
                </div>

                {/* Recipient */}

                <div className="mt-[5%]">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:text-[10px]">
                    This certificate is proudly presented to
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-bold italic tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                    {certificate.studentName}
                  </h2>

                  <div className="mx-auto mt-3 h-px w-[55%] bg-slate-200" />
                </div>

                {/* Course */}

                <div className="mx-auto mt-[4%] max-w-3xl">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:text-[10px]">
                    Has successfully completed
                  </p>

                  <h3 className="mt-2 text-xl font-black leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
                    {courseTitle}
                  </h3>

                  <p className="mx-auto mt-2 max-w-2xl text-[8px] font-medium leading-4 text-slate-500 sm:text-xs sm:leading-5">
                    This credential recognizes the successful
                    completion of the assigned JobWay learning
                    program and confirms a completion level of{" "}
                    {certificate.completionPercentage}%.
                  </p>
                </div>

                {/* Bottom information */}

                <div className="mt-auto grid grid-cols-3 items-end gap-4 border-t border-slate-100 pt-4 sm:pt-6">
                  <div className="text-left">
                    <p className="text-[6px] font-extrabold uppercase tracking-wider text-slate-400 sm:text-[8px]">
                      Issued On
                    </p>

                    <p className="mt-1 text-[8px] font-bold text-slate-800 sm:text-xs">
                      {formatDate(
                        certificate.issuedAt,
                      )}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-[#E13032] sm:h-10 sm:w-10">
                      <ShieldCheck
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        aria-hidden="true"
                      />
                    </div>

                    <p className="text-[6px] font-extrabold uppercase tracking-wider text-slate-400 sm:text-[8px]">
                      Verified Credential
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[6px] font-extrabold uppercase tracking-wider text-slate-400 sm:text-[8px]">
                      Certificate No.
                    </p>

                    <p className="mt-1 break-all font-mono text-[7px] font-bold text-slate-800 sm:text-[10px]">
                      {certificate.certificateNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                VERIFICATION INFORMATION
               ===================================================== */}

            <div className="mx-auto mt-6 grid max-w-[1200px] gap-4 md:grid-cols-2 print:hidden">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Certificate Status
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      Officially Issued
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                      This certificate was issued by JobWay after
                      successful course completion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
                    <ShieldCheck
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Verification ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm font-black text-slate-900">
                      {certificate.verificationId}
                    </p>

                    {verificationUrl ? (
                      <Link
                        href={verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#E13032] hover:underline"
                      >
                        Open Public Verification
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                PRINT NOTE
               ===================================================== */}

            <p className="mx-auto mt-5 max-w-[1200px] text-center text-xs font-medium text-slate-400 print:hidden">
              Use your browser&apos;s print dialog to save this
              certificate as a PDF.
            </p>
          </section>
        </main>
      </StudentPortalShell>

      {/* =========================================================
          PRINT STYLES
         ========================================================= */}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

          html,
          body {
            width: 100%;
            min-width: 100%;
            margin: 0;
            padding: 0;
            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          nav,
          header,
          aside,
          button {
            display: none !important;
          }

          #jobway-certificate {
            width: 100vw !important;
            height: 100vh !important;
            min-height: 100vh !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </>
  );
}