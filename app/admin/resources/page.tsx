"use client";

import { useEffect, useState } from "react";

import {
  getAdminCourses,
  getAdminCourseMaterials,
  uploadCourseMaterial,
  deleteCourseMaterial,
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

function courseId(material: CourseMaterial) {
  if (typeof material.course === "string") {
    return material.course;
  }

  return material.course?.id || "";
}

function courseName(
  material: CourseMaterial,
  courses: Course[],
) {
  if (
    typeof material.course === "object" &&
    material.course
  ) {
    return material.course.title;
  }

  return (
    courses.find(
      (course) =>
        course.id === courseId(material),
    )?.title || "Unknown course"
  );
}

export default function AdminResourcesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        courseResponse,
        materialResponse,
      ] = await Promise.all([
        getAdminCourses(),
        getAdminCourseMaterials(),
      ]);

      setCourses(
        Array.isArray(courseResponse)
          ? courseResponse
          : [],
      );

      setMaterials(
        Array.isArray(materialResponse)
          ? materialResponse
          : [],
      );

      if (
        !selectedCourse &&
        Array.isArray(courseResponse) &&
        courseResponse.length > 0
      ) {
        setSelectedCourse(
          courseResponse[0].id,
        );
      }
    } catch (requestError) {
      console.error(
        "Failed to load admin resources:",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load resources.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUpload(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedCourse) {
      setError(
        "Please select a course first.",
      );
      return;
    }

    if (!selectedFile) {
      setError(
        "Please choose a PDF or DOCX file.",
      );
      return;
    }

    const lowerName =
      selectedFile.name.toLowerCase();

    if (
      !lowerName.endsWith(".pdf") &&
      !lowerName.endsWith(".docx")
    ) {
      setError(
        "Only PDF and DOCX files are supported.",
      );
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setError(
        "File is too large. Maximum allowed size is 25 MB.",
      );
      return;
    }

    try {
      setUploading(true);

      await uploadCourseMaterial(
        selectedCourse,
        selectedFile,
      );

      setSuccess(
        "Study material uploaded successfully. Processing may take a moment.",
      );

      setSelectedFile(null);

      const input =
        document.getElementById(
          "resource-file",
        ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      await loadData();
    } catch (requestError) {
      console.error(
        "Resource upload failed:",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to upload the resource.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(
    material: CourseMaterial,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${material.originalName}"? This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(material.id);
      setError("");
      setSuccess("");

      await deleteCourseMaterial(
        material.id,
      );

      setMaterials((current) =>
        current.filter(
          (item) =>
            item.id !== material.id,
        ),
      );

      setSuccess(
        "Study material deleted successfully.",
      );
    } catch (requestError) {
      console.error(
        "Resource deletion failed:",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete the resource.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const readyCount = materials.filter(
    (material) =>
      material.status === "READY",
  ).length;

  const processingCount =
    materials.filter(
      (material) =>
        material.status === "PROCESSING" ||
        material.status === "UPLOADED",
    ).length;

  const failedCount = materials.filter(
    (material) =>
      material.status === "FAILED",
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-5 py-7 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7">
          <div className="mb-2 inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-[#800E13]">
            Content Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Study Resources
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Upload and manage PDF and DOCX study
            material for your courses.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Resources
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "—" : materials.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Ready
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {loading ? "—" : readyCount}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Processing
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {loading ? "—" : processingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
              Failed
            </p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {loading ? "—" : failedCount}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Upload */}
        <section className="mb-7 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Upload Study Material
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload a PDF or DOCX document and assign it
              to a course.
            </p>
          </div>

          <form
            onSubmit={handleUpload}
            className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr_auto] lg:items-end"
          >
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Course
              </span>

              <select
                value={selectedCourse}
                onChange={(event) =>
                  setSelectedCourse(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
              >
                <option value="">
                  Select course
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
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                File
              </span>

              <input
                id="resource-file"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) =>
                  setSelectedFile(
                    event.target.files?.[0] ||
                      null,
                  )
                }
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-red-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#800E13]"
              />

              <span className="mt-1 block text-[11px] text-slate-400">
                PDF/DOCX • Maximum 25 MB
              </span>
            </label>

            <button
              type="submit"
              disabled={uploading}
              className="rounded-xl bg-[#800E13] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/10 transition hover:bg-[#690b0f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : "Upload Material"}
            </button>
          </form>
        </section>

        {/* Resource List */}
        <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Resource Library
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Manage all uploaded course materials.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:border-red-200 hover:text-[#800E13]"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              Loading resources...
            </div>
          ) : materials.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                📚
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No resources uploaded
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Upload your first study document above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/70 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[10px] font-extrabold text-[#800E13]">
                      {material.mimeType.includes(
                        "pdf",
                      )
                        ? "PDF"
                        : "DOCX"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-900">
                        {material.originalName}
                      </h3>

                      <p className="mt-1 text-xs font-medium text-[#800E13]">
                        {courseName(
                          material,
                          courses,
                        )}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span>
                          {formatFileSize(
                            material.fileSize,
                          )}
                        </span>

                        {material.pageCount >
                          0 && (
                          <>
                            <span>•</span>
                            <span>
                              {material.pageCount}{" "}
                              pages
                            </span>
                          </>
                        )}

                        {material.wordCount >
                          0 && (
                          <>
                            <span>•</span>
                            <span>
                              {material.wordCount.toLocaleString()}{" "}
                              words
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        material.status ===
                        "READY"
                          ? "bg-emerald-50 text-emerald-700"
                          : material.status ===
                              "FAILED"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {material.status}
                    </span>

                    <button
                      type="button"
                      disabled={
                        deletingId ===
                        material.id
                      }
                      onClick={() =>
                        handleDelete(material)
                      }
                      className="rounded-xl border border-red-100 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId ===
                      material.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}