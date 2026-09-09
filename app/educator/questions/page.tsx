"use client";

import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Import,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

const API_BASE_URL = "/api";

type QuestionStatus =
  | "ACTIVE"
  | "DRAFT"
  | "ARCHIVED"
  | "REJECTED";

type ImportQuestionStatus =
  | "READY"
  | "DUPLICATE"
  | "NEEDS_REVIEW";

type Difficulty =
  | "EASY"
  | "MEDIUM"
  | "HARD";

type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "MULTIPLE_SELECT"
  | "NUMERICAL"
  | "SHORT_ANSWER"
  | "LONG_ANSWER";

type Option = {
  key: string;
  text: string;
};

type EducatorQuestion = {
  id: string | null;
  questionCode?: string;
  questionHash?: string;
  questionText: string;
  questionType: QuestionType;
  options: Option[];
  correctAnswers?: string[];
  explanation?: string;
  subject?: string;
  topic?: string;
  subtopic?: string;
  difficulty?: Difficulty;
  defaultMarks?: number;
  defaultNegativeMarks?: number;
  sourceType?: string;
  sourceFileName?: string;
  sourceRow?: number | null;
  status: QuestionStatus | ImportQuestionStatus;
  validationErrors?: string[];
  duplicateInBank?: boolean;
  duplicateInImport?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ImportSummary = {
  extracted: number;
  valid: number;
  inserted: number;
  duplicates: number;
  needsReview: number;
};

type FilterValue =
  | "ALL"
  | "EASY"
  | "MEDIUM"
  | "HARD"
  | "ACTIVE"
  | "ARCHIVED";

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("jobway_token");
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

function getFileIcon(extension: string) {
  if (
    extension === ".xlsx" ||
    extension === ".xls"
  ) {
    return FileSpreadsheet;
  }

  return FileText;
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty?: Difficulty;
}) {
  const value = difficulty || "MEDIUM";

  if (value === "EASY") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Easy
      </span>
    );
  }

  if (value === "HARD") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        Hard
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      Medium
    </span>
  );
}

function QuestionStatusBadge({
  status,
}: {
  status: QuestionStatus | ImportQuestionStatus;
}) {
  if (
    status === "ACTIVE" ||
    status === "READY"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        Ready
      </span>
    );
  }

  if (status === "DUPLICATE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
        <AlertCircle size={13} />
        Duplicate
      </span>
    );
  }

  if (status === "NEEDS_REVIEW") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        <AlertCircle size={13} />
        Review Required
      </span>
    );
  }

  if (status === "ARCHIVED") {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        Archived
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      Draft
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function EducatorQuestionsPage() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [questions, setQuestions] = useState<
    EducatorQuestion[]
  >([]);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterValue>("ALL");

  const [isDragging, setIsDragging] =
    useState(false);

  const [selectedFileName, setSelectedFileName] =
    useState("");

  const [importSummary, setImportSummary] =
    useState<ImportSummary | null>(null);

  const [importResults, setImportResults] =
    useState<EducatorQuestion[]>([]);

  const [showImportResults, setShowImportResults] =
    useState(false);

  const [showUploadPanel, setShowUploadPanel] =
    useState(false);

  const [expandedQuestion, setExpandedQuestion] =
    useState<string | null>(null);

  const loadQuestions = useCallback(
    async (isRefresh = false) => {
      try {
        setError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const token =
          getStoredToken();

        if (!token) {
          throw new Error(
            "Authentication token not found.",
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/educator/questions`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            },
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load question bank.",
          );
        }

        setQuestions(
          Array.isArray(data?.questions)
            ? data.questions
            : [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load question bank.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const stats = useMemo(() => {
    return {
      all: questions.length,

      active: questions.filter(
        (question) =>
          question.status === "ACTIVE",
      ).length,

      easy: questions.filter(
        (question) =>
          question.difficulty === "EASY",
      ).length,

      medium: questions.filter(
        (question) =>
          question.difficulty === "MEDIUM",
      ).length,

      hard: questions.filter(
        (question) =>
          question.difficulty === "HARD",
      ).length,
    };
  }, [questions]);

  const filteredQuestions =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return questions.filter(
        (question) => {
          const matchesSearch =
            !query ||
            question.questionText
              ?.toLowerCase()
              .includes(query) ||
            question.questionCode
              ?.toLowerCase()
              .includes(query) ||
            question.subject
              ?.toLowerCase()
              .includes(query) ||
            question.topic
              ?.toLowerCase()
              .includes(query);

          let matchesFilter = true;

          if (filter === "EASY") {
            matchesFilter =
              question.difficulty ===
              "EASY";
          }

          if (filter === "MEDIUM") {
            matchesFilter =
              question.difficulty ===
              "MEDIUM";
          }

          if (filter === "HARD") {
            matchesFilter =
              question.difficulty ===
              "HARD";
          }

          if (filter === "ACTIVE") {
            matchesFilter =
              question.status ===
              "ACTIVE";
          }

          if (filter === "ARCHIVED") {
            matchesFilter =
              question.status ===
              "ARCHIVED";
          }

          return (
            matchesSearch &&
            matchesFilter
          );
        },
      );
    }, [questions, search, filter]);

  const selectedQuestionObjects =
    useMemo(() => {
      return questions.filter(
        (question) =>
          question.id &&
          selectedIds.includes(
            question.id,
          ),
      );
    }, [questions, selectedIds]);

  const allVisibleSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every(
      (question) =>
        question.id &&
        selectedIds.includes(
          question.id,
        ),
    );

  const toggleQuestion = (
    id: string | null,
  ) => {
    if (!id) {
      return;
    }

    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id,
          )
        : [...current, id],
    );
  };

  const toggleVisibleQuestions = () => {
    const visibleIds =
      filteredQuestions
        .map(
          (question) =>
            question.id,
        )
        .filter(
          (id): id is string =>
            Boolean(id),
        );

    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !visibleIds.includes(id),
        ),
      );

      return;
    }

    setSelectedIds((current) =>
      Array.from(
        new Set([
          ...current,
          ...visibleIds,
        ]),
      ),
    );
  };

  const handleFile = async (
    file: File,
  ) => {
    setError("");
    setSuccessMessage("");

    const extension =
      file.name
        .substring(
          file.name.lastIndexOf("."),
        )
        .toLowerCase();

    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".xlsx",
      ".xls",
    ];

    if (
      !allowedExtensions.includes(
        extension,
      )
    ) {
      setError(
        "Only PDF, DOCX, XLSX and XLS files are supported.",
      );

      return;
    }

    if (
      file.size >
      25 * 1024 * 1024
    ) {
      setError(
        "File is too large. Maximum allowed size is 25 MB.",
      );

      return;
    }

    setSelectedFileName(
      file.name,
    );

    setUploading(true);

    try {
      const token =
        getStoredToken();

      if (!token) {
        throw new Error(
          "Authentication token not found.",
        );
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const response =
        await fetch(
          `${API_BASE_URL}/educator/questions/import`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Question bank import failed.",
        );
      }

      setImportSummary(
        data?.summary || null,
      );

      setImportResults(
        Array.isArray(
          data?.questions,
        )
          ? data.questions
          : [],
      );

      setShowImportResults(true);

      setSuccessMessage(
        "Question bank imported. Review the extraction results before building a test.",
      );

      await loadQuestions(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Question bank import failed.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (file) {
      void handleFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    setIsDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      void handleFile(file);
    }
  };

  const clearImportResults = () => {
    setShowImportResults(false);
    setImportResults([]);
    setImportSummary(null);
    setSelectedFileName("");
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <GraduationCap size={17} />

              Educator EMS

              <span>/</span>

              Question Bank
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Question Bank
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Import, review and manage your
              questions before using them to
              build an examination.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                loadQuestions(true)
              }
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                setShowUploadPanel(
                  true,
                )
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Upload size={18} />

              Import Questions
            </button>
          </div>
        </div>

        {/* =====================================================
            STATUS MESSAGES
        ====================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="mt-0.5 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Unable to complete the
                  request
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={19}
                className="mt-0.5 text-emerald-600"
              />

              <p className="text-sm font-semibold text-emerald-700">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="All Questions"
            value={stats.all}
            icon={BookOpen}
          />

          <StatCard
            label="Active"
            value={stats.active}
            icon={CheckCircle2}
          />

          <StatCard
            label="Easy"
            value={stats.easy}
            icon={ShieldCheck}
          />

          <StatCard
            label="Medium"
            value={stats.medium}
            icon={FileText}
          />

          <StatCard
            label="Hard"
            value={stats.hard}
            icon={AlertCircle}
          />
        </div>

        {/* =====================================================
            IMPORT RESULTS
        ====================================================== */}

        {showImportResults && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Import
                    size={19}
                    className="text-slate-700"
                  />

                  <h2 className="text-lg font-bold text-slate-950">
                    Import Review
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedFileName ||
                    "Imported question bank"}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  clearImportResults
                }
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <X size={15} />

                Close
              </button>
            </div>

            {importSummary && (
              <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Extracted
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {importSummary.extracted}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Valid
                  </p>

                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {importSummary.valid}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Added
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {importSummary.inserted}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Duplicates
                  </p>

                  <p className="mt-1 text-2xl font-bold text-orange-700">
                    {importSummary.duplicates}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Review
                  </p>

                  <p className="mt-1 text-2xl font-bold text-red-700">
                    {importSummary.needsReview}
                  </p>
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {importResults.map(
                (question, index) => (
                  <div
                    key={
                      question.id ||
                      `${question.questionCode}-${index}`
                    }
                    className="p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                            {question.questionCode ||
                              `Q${String(
                                index + 1,
                              ).padStart(
                                3,
                                "0",
                              )}`}
                          </span>

                          <QuestionStatusBadge
                            status={
                              question.status
                            }
                          />

                          <DifficultyBadge
                            difficulty={
                              question.difficulty
                            }
                          />
                        </div>

                        <p className="text-sm font-semibold leading-6 text-slate-950">
                          {question.questionText}
                        </p>

                        {question.options
                          ?.length >
                          0 && (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {question.options.map(
                              (option) => (
                                <div
                                  key={`${question.questionCode}-${option.key}`}
                                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                >
                                  <span className="mr-2 font-bold text-slate-500">
                                    {option.key}.
                                  </span>

                                  {option.text}
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {question.validationErrors &&
                          question.validationErrors
                            .length >
                            0 && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                              <p className="text-xs font-semibold text-red-700">
                                Validation issues
                              </p>

                              <ul className="mt-1 list-disc pl-5 text-xs text-red-600">
                                {question.validationErrors.map(
                                  (
                                    validationError,
                                    validationIndex,
                                  ) => (
                                    <li
                                      key={
                                        validationIndex
                                      }
                                    >
                                      {
                                        validationError
                                      }
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                        {question.duplicateInBank && (
                          <p className="mt-2 text-xs font-medium text-orange-700">
                            This question already
                            exists in your question
                            bank.
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {question.status ===
                          "READY" &&
                          question.id && (
                            <button
                              type="button"
                              onClick={() =>
                                toggleQuestion(
                                  question.id,
                                )
                              }
                              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                                selectedIds.includes(
                                  question.id,
                                )
                                  ? "bg-slate-950 text-white"
                                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {selectedIds.includes(
                                question.id,
                              )
                                ? "Selected"
                                : "Select"}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                ),
              )}

              {importResults.length ===
                0 && (
                <div className="p-10 text-center">
                  <p className="text-sm text-slate-500">
                    No extracted questions
                    were returned.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* =====================================================
            QUESTION BANK
        ====================================================== */}

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Your Question Bank
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select questions here and use
                  them to build an exam.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search questions..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white sm:w-64"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={filter}
                    onChange={(event) =>
                      setFilter(
                        event.target
                          .value as FilterValue,
                      )
                    }
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                  >
                    <option value="ALL">
                      All Questions
                    </option>

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="EASY">
                      Easy
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HARD">
                      Hard
                    </option>

                    <option value="ARCHIVED">
                      Archived
                    </option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selection toolbar */}

          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={
                  toggleVisibleQuestions
                }
                disabled={
                  filteredQuestions.length ===
                  0
                }
                className="text-sm font-semibold text-slate-700 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {allVisibleSelected
                  ? "Clear Visible"
                  : "Select Visible"}
              </button>

              <span className="text-sm text-slate-500">
                {selectedIds.length} selected
              </span>
            </div>

            <Link
              href={`/educator/exams/create?questionIds=${encodeURIComponent(selectedIds.join(","))}`}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                selectedIds.length > 0
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "pointer-events-none bg-slate-200 text-slate-400"
              }`}
            >
              <Plus size={17} />

              Build Test
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

              <p className="mt-3 text-sm text-slate-500">
                Loading your question bank...
              </p>
            </div>
          ) : filteredQuestions.length ===
            0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <BookOpen size={25} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                {questions.length === 0
                  ? "Your question bank is empty"
                  : "No questions found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {questions.length === 0
                  ? "Upload a prepared PDF, Word or Excel question bank to automatically create questions."
                  : "Try changing your search or filter."}
              </p>

              {questions.length ===
                0 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowUploadPanel(
                      true,
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Upload size={17} />

                  Import Question Bank
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="w-12 px-5 py-3">
                        <input
                          type="checkbox"
                          checked={
                            allVisibleSelected
                          }
                          onChange={
                            toggleVisibleQuestions
                          }
                          className="h-4 w-4 rounded border-slate-300"
                          aria-label="Select visible questions"
                        />
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Question
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Subject
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Difficulty
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredQuestions.map(
                      (question) => {
                        const questionId =
                          question.id;

                        const isSelected =
                          Boolean(
                            questionId &&
                              selectedIds.includes(
                                questionId,
                              ),
                          );

                        const isExpanded =
                          expandedQuestion ===
                          questionId;

                        return (
                          <tr
                            key={
                              questionId ||
                              question.questionHash
                            }
                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4 align-top">
                              <input
                                type="checkbox"
                                checked={
                                  isSelected
                                }
                                disabled={
                                  !questionId ||
                                  question.status !==
                                    "ACTIVE"
                                }
                                onChange={() =>
                                  toggleQuestion(
                                    questionId,
                                  )
                                }
                                className="mt-1 h-4 w-4 rounded border-slate-300"
                                aria-label={`Select ${question.questionCode || "question"}`}
                              />
                            </td>

                            <td className="px-5 py-4 align-top">
                              <div className="max-w-2xl">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold text-slate-500">
                                    {question.questionCode ||
                                      "Question"}
                                  </span>

                                  {question.sourceType && (
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                      {
                                        question.sourceType
                                      }
                                    </span>
                                  )}
                                </div>

                                <p className="font-semibold leading-6 text-slate-950">
                                  {
                                    question.questionText
                                  }
                                </p>

                                {question.topic && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    Topic:{" "}
                                    {
                                      question.topic
                                    }
                                  </p>
                                )}

                                {isExpanded &&
                                  question.options?.length >
                                    0 && (
                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                      {question.options.map(
                                        (
                                          option,
                                        ) => (
                                          <div
                                            key={`${questionId}-${option.key}`}
                                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                          >
                                            <span className="mr-2 font-bold text-slate-500">
                                              {
                                                option.key
                                              }
                                              .
                                            </span>

                                            {
                                              option.text
                                            }
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}

                                {isExpanded &&
                                  question.explanation && (
                                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                                      <p className="text-xs font-bold text-blue-700">
                                        Explanation
                                      </p>

                                      <p className="mt-1 text-sm text-blue-900">
                                        {
                                          question.explanation
                                        }
                                      </p>
                                    </div>
                                  )}
                              </div>
                            </td>

                            <td className="px-5 py-4 align-top">
                              <div className="text-sm font-semibold text-slate-700">
                                {question.subject ||
                                  "—"}
                              </div>

                              {question.subtopic && (
                                <div className="mt-1 text-xs text-slate-500">
                                  {
                                    question.subtopic
                                  }
                                </div>
                              )}
                            </td>

                            <td className="px-5 py-4 align-top">
                              <DifficultyBadge
                                difficulty={
                                  question.difficulty
                                }
                              />
                            </td>

                            <td className="px-5 py-4 align-top">
                              <QuestionStatusBadge
                                status={
                                  question.status
                                }
                              />
                            </td>

                            <td className="px-5 py-4 text-right align-top">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedQuestion(
                                    isExpanded
                                      ? null
                                      : questionId,
                                  )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                {isExpanded
                                  ? "Hide"
                                  : "View"}
                              </button>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredQuestions.map(
                  (question) => {
                    const questionId =
                      question.id;

                    const isSelected =
                      Boolean(
                        questionId &&
                          selectedIds.includes(
                            questionId,
                          ),
                      );

                    const isExpanded =
                      expandedQuestion ===
                      questionId;

                    return (
                      <div
                        key={
                          questionId ||
                          question.questionHash
                        }
                        className="p-5"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={
                              isSelected
                            }
                            disabled={
                              !questionId ||
                              question.status !==
                                "ACTIVE"
                            }
                            onChange={() =>
                              toggleQuestion(
                                questionId,
                              )
                            }
                            className="mt-1 h-4 w-4 rounded border-slate-300"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">
                                {question.questionCode ||
                                  "Question"}
                              </span>

                              <QuestionStatusBadge
                                status={
                                  question.status
                                }
                              />
                            </div>

                            <p className="mt-2 font-semibold leading-6 text-slate-950">
                              {
                                question.questionText
                              }
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <DifficultyBadge
                                difficulty={
                                  question.difficulty
                                }
                              />

                              {question.subject && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                  {
                                    question.subject
                                  }
                                </span>
                              )}
                            </div>

                            {isExpanded &&
                              question.options
                                ?.length >
                                0 && (
                                <div className="mt-3 space-y-2">
                                  {question.options.map(
                                    (
                                      option,
                                    ) => (
                                      <div
                                        key={`${questionId}-${option.key}`}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                      >
                                        <span className="mr-2 font-bold text-slate-500">
                                          {
                                            option.key
                                          }
                                          .
                                        </span>

                                        {
                                          option.text
                                        }
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}

                            {isExpanded &&
                              question.explanation && (
                                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                                  <p className="text-xs font-bold text-blue-700">
                                    Explanation
                                  </p>

                                  <p className="mt-1 text-sm text-blue-900">
                                    {
                                      question.explanation
                                    }
                                  </p>
                                </div>
                              )}

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedQuestion(
                                  isExpanded
                                    ? null
                                    : questionId,
                                )
                              }
                              className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              {isExpanded
                                ? "Hide Details"
                                : "View Details"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </>
          )}
        </section>

        {/* =====================================================
            SELECTED QUESTIONS BAR
        ====================================================== */}

        {selectedQuestionObjects.length >
          0 && (
          <div className="sticky bottom-4 z-30 mt-5">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-950">
                  {selectedQuestionObjects.length}{" "}
                  questions selected
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  These questions can be used
                  when creating your next exam.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIds([])
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>

                <Link
                  href={`/educator/exams/create?questionIds=${encodeURIComponent(selectedIds.join(","))}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={17} />

                  Build Test
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          UPLOAD MODAL
      ======================================================== */}

      {showUploadPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Import Question Bank
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload a prepared question
                  bank and JobWay will extract
                  the questions automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowUploadPanel(
                    false,
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5">
              <div
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  isDragging
                    ? "border-slate-950 bg-slate-100"
                    : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.xlsx,.xls"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />

                {uploading ? (
                  <>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <RefreshCw
                        size={25}
                        className="animate-spin"
                      />
                    </div>

                    <h3 className="mt-4 font-bold text-slate-950">
                      Importing question bank...
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Extracting and checking
                      your questions.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                      <Upload size={25} />
                    </div>

                    <h3 className="mt-4 font-bold text-slate-950">
                      Drop your file here
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      or click to browse from
                      your computer
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        PDF
                      </span>

                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        DOCX
                      </span>

                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        XLSX
                      </span>

                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        XLS
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      Maximum file size: 25 MB
                    </p>
                  </>
                )}
              </div>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <FileText
                    size={18}
                    className="mt-0.5 text-blue-700"
                  />

                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      Recommended teacher
                      format
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-800">
                      Use Question, Option A,
                      Option B, Option C, Option
                      D, Correct Answer,
                      Explanation, Subject, Topic,
                      Difficulty and Marks fields.
                      This gives the importer the
                      most accurate result.
                    </p>
                  </div>
                </div>
              </div>

              {selectedFileName && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {(() => {
                      const extension =
                        selectedFileName
                          .substring(
                            selectedFileName.lastIndexOf(
                              ".",
                            ),
                          )
                          .toLowerCase();

                      const Icon =
                        getFileIcon(
                          extension,
                        );

                      return (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <Icon size={17} />
                        </div>
                      );
                    })()}

                    <p className="truncate text-sm font-semibold text-slate-700">
                      {selectedFileName}
                    </p>
                  </div>

                  {!uploading && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedFileName(
                          "",
                        )
                      }
                      className="ml-3 text-slate-400 hover:text-slate-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
              <button
                type="button"
                onClick={() =>
                  setShowUploadPanel(
                    false,
                  )
                }
                disabled={uploading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={17} />

                Choose File
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}