"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  LibraryBig,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useAuth } from "@/context/AuthContext";
import {
  downloadCourseMaterial,
  getCourseMaterials,
  getCourses,
  openCourseMaterial,
  type Course,
  type CourseMaterial,
} from "@/lib/api";

function formatFileSize(bytes: number) {
  if (!bytes) return "0 KB";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(mimeType: string, fileName: string) {
  const value = `${mimeType || ""} ${fileName || ""}`.toLowerCase();

  if (value.includes("pdf")) {
    return "PDF";
  }

  if (
    value.includes("word") ||
    value.endsWith(".doc") ||
    value.endsWith(".docx")
  ) {
    return "DOCX";
  }

  return "FILE";
}

function getCourseId(material: CourseMaterial) {
  if (typeof material.course === "string") {
    return material.course;
  }

  return material.course?.id || "";
}

function getCourseName(material: CourseMaterial, courses: Course[]) {
  if (typeof material.course === "object" && material.course) {
    return material.course.title;
  }

  const course = courses.find(
    (item) => item.id === getCourseId(material),
  );

  return course?.title || "Course Material";
}

function getMaterialTone(fileType: string) {
  if (fileType === "PDF") {
    return {
      icon: "bg-red-50 text-[#E13032]",
      badge: "border-red-100 bg-red-50 text-red-700",
    };
  }

  if (fileType === "DOCX") {
    return {
      icon: "bg-blue-50 text-blue-600",
      badge: "border-blue-100 bg-blue-50 text-blue-700",
    };
  }

  return {
    icon: "bg-violet-50 text-violet-600",
    badge: "border-violet-100 bg-violet-50 text-violet-700",
  };
}

function formatDate(value?: string) {
  if (!value) {
    return "Recently added";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently added";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <SiteHeader />

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-56 animate-pulse rounded-[32px] bg-white shadow-sm" />

          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="mb-7 h-20 animate-pulse rounded-2xl bg-white shadow-sm" />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-[28px] bg-white shadow-sm"
              />
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <SiteHeader />

      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center">
          <section className="relative w-full overflow-hidden rounded-[32px] border border-white bg-white px-6 py-12 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-12 sm:py-16">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-100/70 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-red-100/60 blur-3xl" />

            <div className="relative">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-violet-50 text-[#E13032] shadow-sm">
                <LibraryBig className="h-8 w-8" />
              </div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E13032]">
                JobWay Study Centre
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Your learning library is waiting.
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                Sign in to access course-wise notes, preparation
                material, study guides and downloadable resources.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E13032] to-[#7C3AED] px-6 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(225,48,50,0.2)] transition hover:-translate-y-0.5"
                >
                  Sign In to Study Centre
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/courses"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-[#E13032]"
                >
                  Explore Courses
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="group rounded-[22px] border border-white bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
          {label}
        </span>
      </div>

      <p className="text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">
        {description}
      </p>
    </div>
  );
}

function MaterialCard({
  material,
  courses,
}: {
  material: CourseMaterial;
  courses: Course[];
}) {
  const fileType = getFileType(
    material.mimeType,
    material.originalName,
  );

  const tone = getMaterialTone(fileType);
  const courseName = getCourseName(material, courses);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-white bg-white/95 shadow-[0_14px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.11)]">
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}
          >
            <FileText className="h-6 w-6" />
          </div>

          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${tone.badge}`}
          >
            {fileType}
          </span>
        </div>

        <div className="mt-5">
          <h3 className="line-clamp-2 min-h-[48px] text-[17px] font-black leading-6 text-slate-950">
            {material.originalName}
          </h3>

          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <BookOpen className="h-3.5 w-3.5" />
            </span>

            <p className="truncate text-xs font-bold text-slate-500">
              {courseName}
            </p>
          </div>
        </div>

        <div className="my-5 h-px bg-slate-100" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              File size
            </p>

            <p className="mt-1 text-xs font-bold text-slate-700">
              {formatFileSize(material.fileSize)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Added
            </p>

            <p className="mt-1 truncate text-xs font-bold text-slate-700">
              {formatDate(material.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/70 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openCourseMaterial(material.id)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 text-xs font-extrabold text-white transition hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" />
            View
          </button>

          <button
            type="button"
            onClick={() =>
              downloadCourseMaterial(
                material.id,
                material.originalName,
              )
            }
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-[#E13032]"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center shadow-sm backdrop-blur-xl sm:px-10">
      <div className="absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full bg-violet-100/50 blur-3xl" />

      <div className="relative">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <LibraryBig className="h-8 w-8" />
        </div>

        {hasFilters ? (
          <>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E13032]">
              Refine your search
            </p>

            <h3 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
              No matching resources
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              We could not find study material matching your
              current search or course filter.
            </p>

            <button
              type="button"
              onClick={onClear}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-xs font-extrabold text-white transition hover:bg-slate-800"
            >
              Clear Filters
            </button>
          </>
        ) : (
          <>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E13032]">
              Library is getting ready
            </p>

            <h3 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
              No study material available yet
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Study resources will appear here once they are
              uploaded and processed by the JobWay team.
            </p>

            <Link
              href="/courses"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E13032] to-[#7C3AED] px-5 text-xs font-extrabold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export default function ResourcesPage() {
  const { isAuthenticated, token } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (!isAuthenticated || !token) {
      setCourses([]);
      setMaterials([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadResources() {
      try {
        setLoading(true);
        setError("");

        const [courseResponse, materialResponse] =
          await Promise.all([
            getCourses(),
            getCourseMaterials(),
          ]);

        if (cancelled) {
          return;
        }

        const publishedCourses = Array.isArray(
          courseResponse?.courses,
        )
          ? courseResponse.courses.filter(
              (course) => course.isPublished,
            )
          : [];

        const materialValue: unknown = materialResponse;

        let materialList: CourseMaterial[] = [];

        if (Array.isArray(materialValue)) {
          materialList = materialValue as CourseMaterial[];
        } else if (
          materialValue &&
          typeof materialValue === "object" &&
          "materials" in materialValue &&
          Array.isArray(
            (materialValue as { materials?: unknown }).materials,
          )
        ) {
          materialList = (
            materialValue as {
              materials: CourseMaterial[];
            }
          ).materials;
        }

        const availableMaterials = materialList.filter(
          (material) => material.status === "READY",
        );

        setCourses(publishedCourses);
        setMaterials(availableMaterials);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load study resources:",
          requestError,
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load study resources.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResources();

    return () => {
      cancelled = true;
    };
  }, [mounted, isAuthenticated, token]);

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesCourse =
        selectedCourse === "all" ||
        getCourseId(material) === selectedCourse;

      if (!matchesCourse) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const courseName = getCourseName(
        material,
        courses,
      ).toLowerCase();

      const fileName = (
        material.originalName || ""
      ).toLowerCase();

      return (
        courseName.includes(normalizedSearch) ||
        fileName.includes(normalizedSearch)
      );
    });
  }, [
    courses,
    materials,
    searchQuery,
    selectedCourse,
  ]);

  const courseCount = courses.length;
  const resourceCount = materials.length;

  const pdfCount = materials.filter(
    (material) =>
      getFileType(
        material.mimeType,
        material.originalName,
      ) === "PDF",
  ).length;

  const docCount = materials.filter(
    (material) =>
      getFileType(
        material.mimeType,
        material.originalName,
      ) === "DOCX",
  ).length;

  if (!mounted) {
    return <LoadingState />;
  }

  if (!isAuthenticated || !token) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.10),transparent_32%),radial-gradient(circle_at_15%_80%,rgba(225,48,50,0.08),transparent_30%)]" />

          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#B91C1C]">
                  <Sparkles className="h-3.5 w-3.5" />
                  JobWay Study Centre
                </div>

                <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[56px] lg:leading-[1.04]">
                  Learn smarter.
                  <span className="block bg-gradient-to-r from-[#E13032] via-[#C026D3] to-[#4F46E5] bg-clip-text text-transparent">
                    Prepare better.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  Your focused learning library for course-wise
                  notes, preparation material, study guides and
                  downloadable resources.
                </p>
              </div>

              <Link
                href="/courses"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* STATS */}
            <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<BookOpen className="h-5 w-5" />}
                label="Courses"
                value={courseCount}
                description="Published learning programs"
                iconClass="bg-red-50 text-[#E13032]"
              />

              <StatCard
                icon={<LibraryBig className="h-5 w-5" />}
                label="Materials"
                value={resourceCount}
                description="Ready-to-study resources"
                iconClass="bg-violet-50 text-violet-600"
              />

              <StatCard
                icon={<FileText className="h-5 w-5" />}
                label="PDF Library"
                value={pdfCount}
                description="PDF resources available"
                iconClass="bg-blue-50 text-blue-600"
              />

              <StatCard
                icon={<Clock3 className="h-5 w-5" />}
                label="Access"
                value="24/7"
                description="Learn at your own pace"
                iconClass="bg-emerald-50 text-emerald-600"
              />
            </div>

            {/* SEARCH */}
            <section className="mb-8 rounded-[24px] border border-white bg-white/90 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search notes, PDFs, guides or course material..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:flex">
                    <Filter className="h-4 w-4" />
                  </div>

                  <select
                    value={selectedCourse}
                    onChange={(event) =>
                      setSelectedCourse(event.target.value)
                    }
                    className="h-12 min-w-[220px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
                    aria-label="Filter resources by course"
                  >
                    <option value="all">
                      All Courses
                    </option>

                    {courses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* ERROR */}
            {error ? (
              <section className="mb-7 rounded-2xl border border-red-100 bg-red-50/80 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-black text-red-900">
                      Unable to load study resources
                    </h2>

                    <p className="mt-1 text-xs leading-6 text-red-700">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-xs font-extrabold text-red-700 shadow-sm transition hover:bg-red-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                </div>
              </section>
            ) : null}

            {/* CONTENT HEADER */}
            <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E13032]">
                  Your library
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                  Study Materials
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Finding your learning resources..."
                    : `${filteredMaterials.length} resource${
                        filteredMaterials.length === 1
                          ? ""
                          : "s"
                      } available`}
                </p>
              </div>

              {!loading && resourceCount > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-black text-red-700">
                    {pdfCount} PDFs
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700">
                    {docCount} DOCX
                  </span>
                </div>
              ) : null}
            </section>

            {/* CONTENT */}
            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-72 animate-pulse rounded-[26px] border border-white bg-white"
                  />
                ))}
              </div>
            ) : filteredMaterials.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    courses={courses}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                hasFilters={
                  Boolean(searchQuery.trim()) ||
                  selectedCourse !== "all"
                }
                onClear={() => {
                  setSearchQuery("");
                  setSelectedCourse("all");
                }}
              />
            )}

            {/* TRUST NOTE */}
            <div className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] font-medium text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Resources shown here are ready for study and
              download.
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}