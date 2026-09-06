"use client";

import Link from "next/link";
import {
  Award,
  CalendarDays,
  ChevronRight,
  FileBadge,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import StudentPortalShell from "@/components/student-portal/StudentPortalShell";
import {
  getStudentCertificates,
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
    month: "short",
    year: "numeric",
  }).format(date);
}

function getCourseSlug(
  certificate: StudentCertificate,
) {
  if (
    typeof certificate.course === "object" &&
    certificate.course
  ) {
    return certificate.course.slug;
  }

  return "";
}

function getCourseTitle(
  certificate: StudentCertificate,
) {
  if (
    typeof certificate.course === "object" &&
    certificate.course
  ) {
    return certificate.course.title;
  }

  return certificate.courseTitle;
}

/* =========================================================
   CERTIFICATE CARD
   ========================================================= */

function CertificateCard({
  certificate,
}: {
  certificate: StudentCertificate;
}) {
  const courseSlug =
    getCourseSlug(certificate);

  const courseTitle =
    getCourseTitle(certificate);

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-xl">
      {/* Certificate visual header */}

      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 px-6 py-7">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-500/10 blur-2xl" />

        <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
              <Award
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/50">
              JobWay Certificate
            </p>

            <h2 className="mt-2 max-w-[300px] text-xl font-black leading-tight text-white">
              {courseTitle}
            </h2>
          </div>

          <div className="shrink-0 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-300/10">
            Issued
          </div>
        </div>
      </div>

      {/* Certificate information */}

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarDays
                className="h-4 w-4"
                aria-hidden="true"
              />

              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                Issued On
              </span>
            </div>

            <p className="mt-2 text-sm font-extrabold text-slate-900">
              {formatDate(
                certificate.issuedAt,
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck
                className="h-4 w-4"
                aria-hidden="true"
              />

              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                Completion
              </span>
            </div>

            <p className="mt-2 text-sm font-extrabold text-slate-900">
              {certificate.completionPercentage}%
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Certificate Number
          </p>

          <p className="mt-1 break-all font-mono text-sm font-bold text-slate-700">
            {certificate.certificateNumber}
          </p>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Verification ID
          </p>

          <p className="mt-1 break-all font-mono text-sm font-bold text-slate-700">
            {certificate.verificationId}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/dashboard/certificates/${encodeURIComponent(
              certificate._id,
            )}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-4 py-3 text-sm font-extrabold text-white shadow-[0_6px_20px_rgba(225,48,50,0.18)] transition-all hover:bg-[#c92729] hover:shadow-[0_8px_24px_rgba(225,48,50,0.24)]"
          >
            View Certificate

            <ChevronRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>

          {courseSlug ? (
            <Link
              href={`/dashboard/courses/${encodeURIComponent(
                courseSlug,
              )}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-[#E13032]"
            >
              Course
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export default function CertificatesPage() {
  const [
    certificates,
    setCertificates,
  ] = useState<StudentCertificate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCertificates() {
      try {
        setLoading(true);
        setError("");

        const response =
          await getStudentCertificates();

        if (cancelled) {
          return;
        }

        setCertificates(
          response.certificates || [],
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load certificates:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load certificates.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCertificates();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StudentPortalShell>
      <main className="min-h-screen bg-slate-50">
        {/* =====================================================
            HEADER
           ===================================================== */}

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#E13032]">
                  <Award
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />

                  Official Credentials
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  My Certificates
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
                  View and manage your official
                  JobWay course completion
                  certificates.
                </p>
              </div>

              {!loading ? (
                <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#E13032] shadow-sm">
                    <FileBadge
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-2xl font-black leading-none text-slate-950">
                      {certificates.length}
                    </p>

                    <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Certificates
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTENT
           ===================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
                >
                  <div className="h-48 animate-pulse bg-slate-200" />

                  <div className="space-y-4 p-6">
                    <div className="h-5 w-2/3 animate-pulse rounded-lg bg-slate-200" />

                    <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />

                    <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#E13032]">
                <ShieldCheck
                  className="h-7 w-7"
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950">
                Certificates could not be loaded
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6 text-slate-500">
                {error}
              </p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">
                <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-100/60 blur-3xl" />

                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-[#E13032]">
                  <Award
                    className="h-9 w-9"
                    aria-hidden="true"
                  />
                </div>

                <div className="relative">
                  <div className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    <Sparkles
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />

                    Your credentials will appear here
                  </div>

                  <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                    No certificates yet
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500">
                    Complete an assigned course
                    to 100% and your official
                    JobWay certificate will appear
                    here.
                  </p>

                  <Link
                    href="/dashboard/courses"
                    className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-extrabold text-white shadow-[0_6px_20px_rgba(225,48,50,0.18)] transition-all hover:bg-[#c92729]"
                  >
                    Browse My Courses

                    <ChevronRight
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {certificates.map(
                (certificate) => (
                  <CertificateCard
                    key={certificate._id}
                    certificate={certificate}
                  />
                ),
              )}
            </div>
          )}
        </section>
      </main>
    </StudentPortalShell>
  );
}
