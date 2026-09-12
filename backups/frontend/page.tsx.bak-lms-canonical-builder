"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Layers3,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import {
  buildCourseDraft,
  getAdminCourses,
  getCourseDrafts,
  uploadCourseMaterial,
  type Course,
  type CourseDraft,
} from "@/lib/api";

function getDraftId(draft: CourseDraft) {
  return draft._id || draft.id || "";
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "READY_FOR_REVIEW":
      return "Ready for Review";
    case "DRAFT":
      return "Draft";
    case "APPROVED":
      return "Approved";
    case "PUBLISHED":
      return "Published";
    case "FAILED":
      return "Failed";
    default:
      return status || "Unknown";
  }
}

function getStatusClasses(status?: string) {
  switch (status) {
    case "READY_FOR_REVIEW":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "APPROVED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "PUBLISHED":
      return "border-green-200 bg-green-50 text-green-700";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(bytes: number) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getModuleCount(draft: CourseDraft) {
  return Array.isArray(draft.modules)
    ? draft.modules.length
    : 0;
}

function getLessonCount(draft: CourseDraft) {
  if (!Array.isArray(draft.modules)) {
    return 0;
  }

  return draft.modules.reduce(
    (total, module) =>
      total +
      (Array.isArray(module.lessons)
        ? module.lessons.length
        : 0),
    0,
  );
}

function getPracticeCount(draft: CourseDraft) {
  if (!Array.isArray(draft.practice)) {
    return 0;
  }

  return draft.practice.reduce(
    (total, practice) =>
      total +
      (Array.isArray(practice.questions)
        ? practice.questions.length
        : 0),
    0,
  );
}

function getMcqCount(draft: CourseDraft) {
  if (!Array.isArray(draft.practice)) {
    return 0;
  }

  return draft.practice.reduce(
    (total, practice) => {
      if (practice.type !== "mcq") {
        return total;
      }

      return (
        total +
        (Array.isArray(practice.questions)
          ? practice.questions.length
          : 0)
      );
    },
    0,
  );
}

function DraftCard({
  draft,
}: {
  draft: CourseDraft;
}) {
  const draftId = getDraftId(draft);

  const moduleCount = getModuleCount(draft);
  const lessonCount = getLessonCount(draft);
  const practiceCount = getPracticeCount(draft);
  const mcqCount = getMcqCount(draft);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50 via-white to-green-50 px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-slate-950">
                {draft.title || "Untitled Course"}
              </h2>

              <p className="mt-1 truncate text-sm text-slate-500">
                {draft.sourceFileName ||
                  "Source material not specified"}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(
              draft.status,
            )}`}
          >
            {draft.status === "READY_FOR_REVIEW" && (
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            )}

            {getStatusLabel(draft.status)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
          {draft.description ||
            "This course draft was generated from uploaded source material and is ready for administrative review."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            icon={<Layers3 className="h-4 w-4" />}
            label="Modules"
            value={moduleCount}
          />

          <Stat
            icon={<BookOpen className="h-4 w-4" />}
            label="Lessons"
            value={lessonCount}
          />

          <Stat
            icon={<FileText className="h-4 w-4" />}
            label="Practice"
            value={practiceCount}
          />

          <Stat
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="MCQs"
            value={mcqCount}
          />
        </div>

        {draft.summary && (
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
              <span>
                Sections:{" "}
                <strong className="text-slate-800">
                  {draft.summary.sectionCount ?? 0}
                </strong>
              </span>

              <span>
                Questions:{" "}
                <strong className="text-slate-800">
                  {draft.summary.questionCount ?? 0}
                </strong>
              </span>

              <span>
                Units:{" "}
                <strong className="text-slate-800">
                  {draft.summary.unitCount ?? 0}
                </strong>
              </span>

              <span>
                Generated:{" "}
                <strong className="text-slate-800">
                  {formatDate(draft.createdAt)}
                </strong>
              </span>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Clock3 className="h-3.5 w-3.5" />
            Updated {formatDate(draft.updatedAt)}
          </div>

          {draftId ? (
            <Link
              href={`/admin/course-factory/${draftId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Review Draft
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="text-xs font-semibold text-red-500">
              Draft ID unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[11px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xl font-extrabold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
          {icon}
        </div>

        <span className="text-2xl font-extrabold tracking-tight text-slate-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-bold text-slate-600">
        {label}
      </p>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <span className="text-xs font-extrabold tracking-[0.15em] text-orange-600">
        {number}
      </span>

      <h3 className="mt-2 text-sm font-extrabold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function CourseFactoryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [drafts, setDrafts] = useState<CourseDraft[]>([]);

  const [selectedCourseId, setSelectedCourseId] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [loadingCourses, setLoadingCourses] =
    useState(true);

  const [loadingDrafts, setLoadingDrafts] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  async function loadCourses() {
    try {
      setLoadingCourses(true);

      const response = await getAdminCourses();

      if (response?.success === false) {
  throw new Error(
    "Unable to load courses.",
  );
}

      setCourses(
        Array.isArray(response?.courses)
          ? response.courses
          : [],
      );
    } catch (err) {
      console.error(
        "Course Factory courses error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load courses.",
      );
    } finally {
      setLoadingCourses(false);
    }
  }

  async function loadDrafts(
    showRefreshState = false,
  ) {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoadingDrafts(true);
      }

      setError("");

      const response = await getCourseDrafts();

      if (response?.success === false) {
        throw new Error(
          response.message ||
            "Unable to load Course Factory drafts.",
        );
      }

      setDrafts(
        Array.isArray(response?.drafts)
          ? response.drafts
          : [],
      );
    } catch (err) {
      console.error(
        "Course Factory drafts error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Course Factory drafts.",
      );
    } finally {
      setLoadingDrafts(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCourses();
    loadDrafts();
  }, []);

  function handleFileChange(
    file?: File | null,
  ) {
    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "";

    const allowedExtensions = [
      "pdf",
      "docx",
    ];

    if (!allowedExtensions.includes(extension)) {
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError(
        "Only PDF and DOCX files are supported.",
      );

      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError(
        "The selected file is larger than 25 MB.",
      );

      return;
    }

    setSelectedFile(file);
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    handleFileChange(file);
  }

  function clearFile() {
    setSelectedFile(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleUploadAndBuild() {
    if (!selectedCourseId) {
      setError(
        "Please select a course first.",
      );
      return;
    }

    if (!selectedFile) {
      setError(
        "Please select a PDF or DOCX file.",
      );
      return;
    }

    try {
      setUploading(true);
      setLoading(false);
      setError("");
      setSuccess("");

      const uploadResponse =
        await uploadCourseMaterial(
          selectedCourseId,
          selectedFile,
        );

      if (
        uploadResponse?.success === false ||
        !uploadResponse?.material?.id
      ) {
        throw new Error(
          uploadResponse?.message ||
            "Failed to upload course material.",
        );
      }

      const materialId =
        uploadResponse.material.id;

      setUploading(false);
      setLoading(true);

      const buildResponse =
        await buildCourseDraft({
          courseId: selectedCourseId,
          materialId,
          regenerate: false,
        });

      if (
        buildResponse?.success === false ||
        !buildResponse?.draft
      ) {
        throw new Error(
          buildResponse?.message ||
            "Material was uploaded, but the course draft could not be generated.",
        );
      }

      const draftId =
        buildResponse.draft._id ||
        buildResponse.draft.id ||
        "";

      setSuccess(
        "Course draft generated successfully.",
      );

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadDrafts();

      if (draftId) {
        window.location.href =
          `/admin/course-factory/${draftId}`;
      }
    } catch (err) {
      console.error(
        "Course Factory build error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload and build the course.",
      );
    } finally {
      setUploading(false);
      setLoading(false);
    }
  }

  const readyDraftCount = useMemo(
    () =>
      drafts.filter(
        (draft) =>
          draft.status === "READY_FOR_REVIEW",
      ).length,
    [drafts],
  );

  const approvedDraftCount = useMemo(
    () =>
      drafts.filter(
        (draft) =>
          draft.status === "APPROVED",
      ).length,
    [drafts],
  );

  const selectedCourse = useMemo(
    () =>
      courses.find(
        (course) =>
          course.id === selectedCourseId,
      ),
    [courses, selectedCourseId],
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-orange-700">
                <Sparkles className="h-3.5 w-3.5" />
                Course Factory
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Build Courses from Study Material
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Upload your PDF or DOCX study material and
                JobWay will automatically create a structured
                course draft for administrative review.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <BookOpen className="h-4 w-4" />
                Courses
              </Link>

              <button
                type="button"
                onClick={() => loadDrafts(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* GLOBAL ERROR */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="min-w-0">
              <p className="font-bold">
                Something went wrong
              </p>

              <p className="mt-1 leading-6">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto shrink-0 rounded-lg p-1 text-red-500 transition hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-bold">
                Course Factory
              </p>

              <p className="mt-1">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* CREATE COURSE */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50 via-white to-green-50 px-6 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                <Upload className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-950">
                  Create Course from Study Material
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Select an existing course, upload its source
                  material, and generate a reviewable course draft.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">

            {/* COURSE SELECTOR */}
            <div>
              <label
                htmlFor="course-selector"
                className="text-sm font-extrabold text-slate-900"
              >
                Select Course
              </label>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                The uploaded material will be used to generate
                content for this course.
              </p>

              <select
                id="course-selector"
                value={selectedCourseId}
                onChange={(event) => {
                  setSelectedCourseId(
                    event.target.value,
                  );
                  setError("");
                  setSuccess("");
                }}
                disabled={
                  loadingCourses ||
                  uploading ||
                  loading
                }
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50 sm:max-w-2xl"
              >
                <option value="">
                  {loadingCourses
                    ? "Loading courses..."
                    : "Select a course"}
                </option>

                {courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.title}
                    {course.isPublished
                      ? " — Published"
                      : " — Unpublished"}
                  </option>
                ))}
              </select>

              {selectedCourse && (
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                    <span>
                      Category:{" "}
                      <strong className="text-slate-800">
                        {selectedCourse.category}
                      </strong>
                    </span>

                    <span>
                      Level:{" "}
                      <strong className="text-slate-800">
                        {selectedCourse.level}
                      </strong>
                    </span>

                    <span>
                      Language:{" "}
                      <strong className="text-slate-800">
                        {selectedCourse.language}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* FILE UPLOAD */}
            <div className="mt-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-sm font-extrabold text-slate-900">
                    Upload Study Material
                  </label>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    PDF or DOCX files only. Maximum file size:
                    25 MB.
                  </p>
                </div>
              </div>

              {!selectedFile ? (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={handleDrop}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="mt-4 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-orange-300 hover:bg-orange-50/40"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
                    <Upload className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 text-base font-extrabold text-slate-900">
                    Drop your PDF or DOCX here
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    or{" "}
                    <span className="font-bold text-orange-600">
                      browse files
                    </span>
                  </p>

                  <p className="mt-4 text-xs font-semibold text-slate-400">
                    PDF / DOCX • Maximum 25 MB
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(event) =>
                      handleFileChange(
                        event.target.files?.[0],
                      )
                    }
                  />
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                        <FileText className="h-6 w-6" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                          {selectedFile.name}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {formatFileSize(
                            selectedFile.size,
                          )}{" "}
                          •{" "}
                          {selectedFile.name
                            .split(".")
                            .pop()
                            ?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearFile}
                      disabled={
                        uploading || loading
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BUILD BUTTON */}
            <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs leading-5 text-slate-500">
                <p className="font-bold text-slate-700">
                  What happens next?
                </p>

                <p className="mt-1">
                  Upload → Extract → Detect Structure →
                  Generate Draft → Open Review Studio
                </p>
              </div>

              <button
                type="button"
                onClick={handleUploadAndBuild}
                disabled={
                  !selectedCourseId ||
                  !selectedFile ||
                  uploading ||
                  loading
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading Material...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building Course...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Upload & Build Course
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <OverviewCard
            icon={<Sparkles className="h-5 w-5" />}
            label="Total Drafts"
            value={drafts.length}
          />

          <OverviewCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Ready for Review"
            value={readyDraftCount}
          />

          <OverviewCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Approved"
            value={approvedDraftCount}
          />
        </section>

        {/* DRAFTS */}
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Generated Drafts
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                Course Review Queue
              </h2>
            </div>

            {drafts.length > 0 && (
              <span className="text-sm font-semibold text-slate-500">
                {drafts.length}{" "}
                {drafts.length === 1
                  ? "draft"
                  : "drafts"}
              </span>
            )}
          </div>

          {loadingDrafts ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading Course Factory drafts...
              </div>
            </div>
          ) : drafts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Sparkles className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-xl font-extrabold text-slate-950">
                No generated drafts yet
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Select a course and upload study material above
                to create your first Course Factory draft.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {drafts.map((draft) => (
                <DraftCard
                  key={getDraftId(draft)}
                  draft={draft}
                />
              ))}
            </div>
          )}
        </section>

        {/* WORKFLOW */}
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <Layers3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-slate-950">
                Course Factory Workflow
              </h2>

              <p className="text-sm text-slate-500">
                Generated content remains under admin control.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <WorkflowStep
              number="01"
              title="Source"
              description="Upload PDF or DOCX material"
            />

            <WorkflowStep
              number="02"
              title="Generate"
              description="Extract structure and practice"
            />

            <WorkflowStep
              number="03"
              title="Review"
              description="Admin edits the draft"
            />

            <WorkflowStep
              number="04"
              title="Publish"
              description="Release the finished course"
            />
          </div>
        </section>

        <div className="mt-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900"
          >
            Back to Admin
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}