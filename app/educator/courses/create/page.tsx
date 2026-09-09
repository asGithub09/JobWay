"use client";

import {
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".xlsx",
  ".xls",
];

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1
    ? `.${parts.pop()!.toLowerCase()}`
    : "";
}

function getFileIcon(fileName: string) {
  const extension = getFileExtension(fileName);

  if (
    extension === ".xlsx" ||
    extension === ".xls"
  ) {
    return FileSpreadsheet;
  }

  return FileText;
}

export default function CreateEducatorCoursePage() {
  const router = useRouter();
  const { token } = useAuth();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [dragActive, setDragActive] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [progressStep, setProgressStep] =
    useState("");

  const validateFile = (file: File) => {
    const extension =
      getFileExtension(file.name);

    if (
      !ACCEPTED_EXTENSIONS.includes(extension)
    ) {
      return "Please upload a PDF, Word or Excel file.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be 25 MB or less.";
    }

    if (
      file.type &&
      !ACCEPTED_TYPES.includes(file.type) &&
      extension !== ".xls"
    ) {
      return "The selected file type is not supported.";
    }

    return "";
  };

  const selectFile = (file: File) => {
    setError("");

    const validationError =
      validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      selectFile(file);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    setDragActive(false);
    setError("");

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      selectFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${Math.ceil(size / 1024)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(
      2
    )} MB`;
  };

  const handleBuildCourse = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");

    if (!selectedFile) {
      setError(
        "Please select a PDF, Word or Excel file first."
      );
      return;
    }

    if (!token) {
      router.push("/login");
      return;
    }

    setUploading(true);
    setProgressStep("Uploading your material...");

    try {
      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      setProgressStep(
        "Reading your teaching material..."
      );

      const response = await fetch(
        "/api/educator/course-import",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to build the course."
        );
      }

      if (!data?.draft?.id) {
        throw new Error(
          "Course was generated but no draft ID was returned."
        );
      }

      setProgressStep(
        "Course structure created. Opening review..."
      );

      router.push(
        `/educator/courses/review/${data.draft.id}`
      );
    } catch (err) {
      console.error(
        "Educator course creation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while building the course."
      );

      setUploading(false);
      setProgressStep("");
    }
  };

  const FileIcon = selectedFile
    ? getFileIcon(selectedFile.name)
    : Upload;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.push("/educator/courses")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />
            Back to Courses
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <GraduationCap
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create a Course
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Upload your teaching material and
                JobWay will turn it into a structured
                course for you to review.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleBuildCourse}
          className="space-y-6"
        >
          {/* Main upload card */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <BookOpen
                    className="h-5 w-5 text-slate-700"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Upload your material
                  </h2>

                  <p className="text-sm text-slate-500">
                    Use one file containing your
                    course or teaching content.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {!selectedFile ? (
                <div
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={handleDrop}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className={[
                    "group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-12",
                    dragActive
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-400 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 transition group-hover:bg-slate-200">
                    <Upload
                      className="h-7 w-7 text-slate-700"
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-slate-900">
                    Drop your file here
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    or click to browse from your
                    computer
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {[
                      "PDF",
                      "Word",
                      "Excel",
                    ].map((type) => (
                      <span
                        key={type}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Maximum file size: 25 MB
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <FileIcon
                        className="h-6 w-6 text-slate-700"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {selectedFile.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatFileSize(
                              selectedFile.size
                            )}
                          </p>
                        </div>

                        {!uploading && (
                          <button
                            type="button"
                            onClick={removeFile}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
                            aria-label="Remove file"
                          >
                            <X
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                        )}
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        Ready to build your course
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}
            </div>
          </section>

          {/* How it works */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-semibold text-slate-900">
              What happens next?
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Step
                number="1"
                title="Read"
                description="Your PDF, Word or Excel material is extracted."
              />

              <Step
                number="2"
                title="Build"
                description="Topics are organized into modules and lessons."
              />

              <Step
                number="3"
                title="Review"
                description="You review and edit everything before saving."
              />
            </div>
          </section>

          {/* Progress */}
          {uploading && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Loader2
                  className="h-5 w-5 animate-spin text-slate-700"
                  aria-hidden="true"
                />

                <div>
                  <p className="font-medium text-slate-900">
                    Building your course
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {progressStep}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Action */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push("/educator/courses")
              }
              disabled={uploading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                uploading || !selectedFile
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Building Course...
                </>
              ) : (
                <>
                  <GraduationCap
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Build Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {number}
        </span>

        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}