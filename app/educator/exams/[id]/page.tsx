"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Edit3,
  FileQuestion,
  Globe2,
  Loader2,
  Lock,
  Plus,
  Search,
  Save,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = "/api";

type ExamStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

type AccessType =
  | "FREE"
  | "PREMIUM";

type AttemptPolicy =
  | "SINGLE_ATTEMPT"
  | "MULTIPLE_ATTEMPTS";

type QuestionSelectionMode =
  | "MANUAL"
  | "RANDOM"
  | "RULE_BASED";

interface ProctoringSettings {
  enabled?: boolean;
  requireCamera?: boolean;
  requireMicrophone?: boolean;
  requireFullscreen?: boolean;
  monitorFullscreen?: boolean;
  monitorVisibility?: boolean;
  monitorBlur?: boolean;
  monitorContextMenu?: boolean;
  maxStrikes?: number;
  saveViolationLogs?: boolean;
  terminationCountdownSeconds?: number;
}

interface ExamQuestion {
  question?:
    | string
    | {
        _id?: string;
        id?: string;
        questionText?: string;
        questionCode?: string;
        questionType?: string;
      };
  _id?: string;
  id?: string;
  marks?: number;
  negativeMarks?: number;
  order?: number;
  questionText?: string;
  questionCode?: string;
  questionType?: string;
  subject?: string;
  topic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
}

interface QuestionBankItem {
  id: string;
  _id?: string;
  questionCode?: string;
  questionText: string;
  questionType?:
    | "MCQ"
    | "TRUE_FALSE"
    | "MULTIPLE_SELECT"
    | "NUMERICAL"
    | "SHORT_ANSWER"
    | "LONG_ANSWER";
  subject?: string;
  topic?: string;
  subtopic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  defaultMarks?: number;
  defaultNegativeMarks?: number;
  status?: string;
}

interface QuestionBankResponse {
  success: boolean;
  questions?: QuestionBankItem[];
  message?: string;
}

interface Batch {
  _id?: string;
  id?: string;
  name: string;
  code?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface EducatorExam {
  id: string;
  title: string;
  slug: string;
  shortName?: string;
  description?: string;
  instructions?: string;
  category: string;
  subject?: string;
  topic?: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  questionCount: number;
  questionSelectionMode: QuestionSelectionMode;
  accessType: AccessType;
  attemptPolicy: AttemptPolicy;
  maxAttempts: number;
  proctoring?: ProctoringSettings;
  questions?: ExamQuestion[];
  targetBatches?: string[] | Batch[];
  targetCourses?: string[];
  status: ExamStatus;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  attemptCount?: number;
  completionCount?: number;
}

interface MyBatchResponse {
  success: boolean;
  message?: string;
  batches: Array<{
    assignmentId: string;
    batch: Batch;
    status: string;
    assignedAt?: string;
  }>;
  total: number;
}

interface ExamResponse {
  success: boolean;
  exam: EducatorExam;
  message?: string;
}

function getToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("jobway_token") || "";
}

function getId(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "_id" in value
  ) {
    return String(
      (value as { _id?: unknown })._id || "",
    );
  }

  return "";
}

function getQuestionRelationId(
  value: unknown,
): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const record =
      value as {
        _id?: unknown;
        id?: unknown;
      };

    return String(
      record._id ||
        record.id ||
        "",
    );
  }

  return "";
}

function getQuestionDisplayText(
  question: ExamQuestion,
  questionBankMap: Map<
    string,
    QuestionBankItem
  >,
): string {
  if (
    question.questionText &&
    question.questionText.trim()
  ) {
    return question.questionText;
  }

  if (
    question.question &&
    typeof question.question ===
      "object"
  ) {
    const populated =
      question.question;

    if (
      populated.questionText &&
      populated.questionText.trim()
    ) {
      return populated.questionText;
    }
  }

  const questionId =
    getQuestionRelationId(
      question.question,
    );

  const bankQuestion =
    questionBankMap.get(
      questionId,
    );

  return (
    bankQuestion?.questionText ||
    "Question content unavailable"
  );
}

function calculateClientTotalMarks(
  questions: ExamQuestion[],
): number {
  return questions.reduce(
    (total, question) =>
      total +
      Math.max(
        0,
        Number(question.marks) || 0,
      ),
    0,
  );
}

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "Not published";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not published";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function statusClasses(
  status: ExamStatus,
): string {
  if (status === "PUBLISHED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "ARCHIVED") {
    return "bg-slate-100 text-slate-600";
  }

  return "bg-amber-50 text-amber-700";
}

function accessClasses(
  accessType: AccessType,
): string {
  return accessType === "PREMIUM"
    ? "bg-violet-50 text-violet-700"
    : "bg-sky-50 text-sky-700";
}

export default function EducatorExamManagePage() {
  const params = useParams<{
    id: string;
  }>();

  const router = useRouter();

  const { user } = useAuth();

  const examId = params?.id;

  const [exam, setExam] =
    useState<EducatorExam | null>(null);

  const [batches, setBatches] =
    useState<Batch[]>([]);

  const [selectedBatches, setSelectedBatches] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingBatches, setLoadingBatches] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [activeSection, setActiveSection] =
    useState<
      | "overview"
      | "questions"
      | "audience"
      | "access"
      | "proctoring"
    >("overview");

  const [editMode, setEditMode] =
    useState(false);

  const [form, setForm] =
    useState({
      title: "",
      shortName: "",
      description: "",
      instructions: "",
      category: "",
      subject: "",
      topic: "",
      durationMinutes: 60,
      passingPercentage: 40,
      accessType: "FREE" as AccessType,
      attemptPolicy:
        "SINGLE_ATTEMPT" as AttemptPolicy,
      maxAttempts: 1,
    });

  const isPublished =
    exam?.status === "PUBLISHED";

  const questionCount =
    exam?.questions?.length ??
    exam?.questionCount ??
    0;

  const totalMarks =
    exam?.totalMarks ?? 0;

  const proctoringEnabled =
    Boolean(exam?.proctoring?.enabled);

  const assignedBatchIds = useMemo(() => {
    if (!exam?.targetBatches) {
      return [];
    }

    return exam.targetBatches
      .map(getId)
      .filter(Boolean);
  }, [exam?.targetBatches]);

  useEffect(() => {
    if (!examId || !user) {
      return;
    }

    let cancelled = false;

    async function loadExam() {
      setLoading(true);
      setError("");

      try {
        const token = getToken();

        const response = await fetch(
          `${API_BASE_URL}/educator/exams/${encodeURIComponent(
            examId,
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data =
          (await response.json()) as ExamResponse;

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load the examination.",
          );
        }

        if (cancelled) {
          return;
        }

        setExam(data.exam);

        setForm({
          title: data.exam.title || "",
          shortName:
            data.exam.shortName || "",
          description:
            data.exam.description || "",
          instructions:
            data.exam.instructions || "",
          category:
            data.exam.category || "",
          subject:
            data.exam.subject || "",
          topic:
            data.exam.topic || "",
          durationMinutes:
            data.exam.durationMinutes || 60,
          passingPercentage:
            data.exam.passingPercentage || 40,
          accessType:
            data.exam.accessType || "FREE",
          attemptPolicy:
            data.exam.attemptPolicy ||
            "SINGLE_ATTEMPT",
          maxAttempts:
            data.exam.maxAttempts || 1,
        });

        setSelectedBatches(
          data.exam.targetBatches
            ?.map(getId)
            .filter(Boolean) || [],
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the examination.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadExam();

    return () => {
      cancelled = true;
    };
  }, [examId, user]);

  useEffect(() => {
    if (
      !user ||
      !exam ||
      exam.accessType !== "PREMIUM"
    ) {
      setBatches([]);
      setLoadingBatches(false);
      return;
    }

    let cancelled = false;

    async function loadBatches() {
      setLoadingBatches(true);

      try {
        const token = getToken();

        const response = await fetch(
          `${API_BASE_URL}/batch-educators/my-batches`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data =
          (await response.json()) as MyBatchResponse;

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load assigned batches.",
          );
        }

        if (!cancelled) {
          setBatches(
            (data.batches || [])
              .map((item) => item.batch)
              .filter(Boolean),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setBatches([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load assigned batches.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingBatches(false);
        }
      }
    }

    void loadBatches();

    return () => {
      cancelled = true;
    };
  }, [user, exam?.accessType]);

  function updateForm(
    field: keyof typeof form,
    value: string | number,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleBatch(
    batchId: string,
  ) {
    setSelectedBatches((current) => {
      if (current.includes(batchId)) {
        return current.filter(
          (id) => id !== batchId,
        );
      }

      return [
        ...current,
        batchId,
      ];
    });
  }

  function updateExamQuestions(
    questions: ExamQuestion[],
  ) {
    setExam((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        questions,
        questionCount:
          questions.length,
        totalMarks:
          calculateClientTotalMarks(
            questions,
          ),
      };
    });
  }

  async function handleSave(
    questionsOverride?: ExamQuestion[],
  ) {
    if (!exam || isPublished) {
      return;
    }

    const questionsToSave = (
      questionsOverride ??
      exam.questions ??
      []
    )
      .map((question, index) => {
        const questionId =
          getQuestionRelationId(
            question.question,
          );

        if (!questionId) {
          return null;
        }

        return {
          question: questionId,
          order: index,
          marks: Math.max(
            0,
            Number(question.marks) || 1,
          ),
          negativeMarks: Math.max(
            0,
            Number(question.negativeMarks) || 0,
          ),
        };
      })
      .filter(
        (
          question,
        ): question is {
          question: string;
          order: number;
          marks: number;
          negativeMarks: number;
        } => Boolean(question),
      );

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/educator/exams/${encodeURIComponent(
          exam.id,
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            maxAttempts:
              form.attemptPolicy ===
              "SINGLE_ATTEMPT"
                ? 1
                : Math.max(
                    1,
                    Number(form.maxAttempts) ||
                      1,
                  ),
            targetBatches:
              selectedBatches,
            questions:
              questionsToSave,
          }),
        },
      );

      const data =
        (await response.json()) as ExamResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save the examination.",
        );
      }

      setExam(data.exam);
      setEditMode(false);
      setSuccess(
        "Examination saved successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the examination.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!exam) {
      return;
    }

    if (questionCount === 0) {
      setError(
        "Add at least one question before publishing.",
      );
      setActiveSection("questions");
      return;
    }

    if (
      exam.accessType === "PREMIUM" &&
      selectedBatches.length === 0
    ) {
      setError(
        "Select at least one assigned batch for a Premium examination.",
      );
      setActiveSection("audience");
      return;
    }

    const confirmed =
      window.confirm(
        "Publish this examination now? Published examinations cannot be edited in this phase.",
      );

    if (!confirmed) {
      return;
    }

    setPublishing(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      const saveResponse = await fetch(
        `${API_BASE_URL}/educator/exams/${encodeURIComponent(
          exam.id,
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            maxAttempts:
              form.attemptPolicy ===
              "SINGLE_ATTEMPT"
                ? 1
                : Math.max(
                    1,
                    Number(form.maxAttempts) ||
                      1,
                  ),
            targetBatches:
              selectedBatches,
            questions:
              exam.questions || [],
          }),
        },
      );

      const saveData =
        (await saveResponse.json()) as ExamResponse;

      if (!saveResponse.ok) {
        throw new Error(
          saveData.message ||
            "Unable to save the examination.",
        );
      }

      const publishResponse =
        await fetch(
          `${API_BASE_URL}/educator/exams/${encodeURIComponent(
            exam.id,
          )}/publish`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      const publishData =
        (await publishResponse.json()) as ExamResponse;

      if (!publishResponse.ok) {
        throw new Error(
          publishData.message ||
            "Unable to publish the examination.",
        );
      }

      setExam(publishData.exam);
      setSuccess(
        "Examination published successfully.",
      );
      setEditMode(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish the examination.",
      );
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading examination...
          </div>
        </div>
      </main>
    );
  }

  if (!exam) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-bold text-red-800">
            Examination unavailable
          </h1>

          <p className="mt-2 text-sm text-red-700">
            {error ||
              "The examination could not be loaded."}
          </p>

          <Link
            href="/educator/exams"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exam Builder
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            href="/educator/exams"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Exam Builder
          </Link>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${statusClasses(
                    exam.status,
                  )}`}
                >
                  {exam.status}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${accessClasses(
                    exam.accessType,
                  )}`}
                >
                  {exam.accessType}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {exam.title}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {exam.category}
                {exam.subject
                  ? ` • ${exam.subject}`
                  : ""}
                {exam.topic
                  ? ` • ${exam.topic}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/educator/exams"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>

              {!isPublished && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setEditMode(
                        (current) => !current,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    {editMode
                      ? "Close Edit"
                      : "Edit Exam"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {publishing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Publish Exam
                  </button>
                </>
              )}

              {isPublished && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white">
                  <CheckCircle2 className="h-4 w-4" />
                  Published
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* SUMMARY */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            icon={
              <FileQuestion className="h-5 w-5" />
            }
            label="Questions"
            value={questionCount}
          />

          <SummaryCard
            icon={
              <BookOpen className="h-5 w-5" />
            }
            label="Total Marks"
            value={totalMarks}
          />

          <SummaryCard
            icon={
              <Clock3 className="h-5 w-5" />
            }
            label="Duration"
            value={`${exam.durationMinutes} min`}
          />

          <SummaryCard
            icon={
              <Users className="h-5 w-5" />
            }
            label="Target Batches"
            value={
              exam.accessType === "FREE"
                ? "All Students"
                : selectedBatches.length
            }
          />

          <SummaryCard
            icon={
              <ShieldCheck className="h-5 w-5" />
            }
            label="Proctoring"
            value={
              proctoringEnabled
                ? "Enabled"
                : "Off"
            }
          />
        </section>

        {/* MANAGEMENT */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* NAVIGATION */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <ManageNav
              active={activeSection}
              onChange={setActiveSection}
              icon={<BookOpen className="h-4 w-4" />}
              label="Overview"
              value="overview"
            />

            <ManageNav
              active={activeSection}
              onChange={setActiveSection}
              icon={
                <FileQuestion className="h-4 w-4" />
              }
              label={`Questions (${questionCount})`}
              value="questions"
            />

            <ManageNav
              active={activeSection}
              onChange={setActiveSection}
              icon={<Users className="h-4 w-4" />}
              label="Audience & Sharing"
              value="audience"
            />

            <ManageNav
              active={activeSection}
              onChange={setActiveSection}
              icon={<Lock className="h-4 w-4" />}
              label="Access & Attempts"
              value="access"
            />

            <ManageNav
              active={activeSection}
              onChange={setActiveSection}
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
              label="Proctoring"
              value="proctoring"
            />
          </aside>

          {/* CONTENT */}
          <div className="min-w-0">
            {activeSection === "overview" && (
              <OverviewSection
                exam={exam}
                editMode={editMode}
                form={form}
                updateForm={updateForm}
                isPublished={isPublished}
                saving={saving}
                onSave={handleSave}
              />
            )}

            {activeSection === "questions" && (
              <QuestionsSection
                exam={exam}
                editMode={editMode}
                isPublished={isPublished}
                saving={saving}
                onQuestionsChange={
                  updateExamQuestions
                }
                onSave={handleSave}
                onEnterEditMode={() =>
                  setEditMode(true)
                }
              />
            )}

            {activeSection === "audience" && (
              <AudienceSection
                exam={exam}
                batches={batches}
                selectedBatches={
                  selectedBatches
                }
                loadingBatches={
                  loadingBatches
                }
                toggleBatch={toggleBatch}
                isPublished={isPublished}
                assignedBatchIds={
                  assignedBatchIds
                }
              />
            )}

            {activeSection === "access" && (
              <AccessSection
                exam={exam}
                editMode={editMode}
                form={form}
                updateForm={updateForm}
                isPublished={isPublished}
              />
            )}

            {activeSection === "proctoring" && (
              <ProctoringSection
                exam={exam}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-slate-500">
          {icon}
        </span>

        <span className="text-xl font-black text-slate-950">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ManageNav({
  active,
  onChange,
  icon,
  label,
  value,
}: {
  active:
    | "overview"
    | "questions"
    | "audience"
    | "access"
    | "proctoring";
  onChange: (
    value:
      | "overview"
      | "questions"
      | "audience"
      | "access"
      | "proctoring",
  ) => void;
  icon: React.ReactNode;
  label: string;
  value:
    | "overview"
    | "questions"
    | "audience"
    | "access"
    | "proctoring";
}) {
  const selected =
    active === value;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
        selected
          ? "bg-slate-950 text-white"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function OverviewSection({
  exam,
  editMode,
  form,
  updateForm,
  isPublished,
  saving,
  onSave,
}: {
  exam: EducatorExam;
  editMode: boolean;
  form: {
    title: string;
    shortName: string;
    description: string;
    instructions: string;
    category: string;
    subject: string;
    topic: string;
    durationMinutes: number;
    passingPercentage: number;
    accessType: AccessType;
    attemptPolicy: AttemptPolicy;
    maxAttempts: number;
  };
  updateForm: (
    field: keyof typeof form,
    value: string | number,
  ) => void;
  isPublished: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <SectionCard
      title="Exam Overview"
      description="Review the examination details and core configuration."
    >
      {editMode && !isPublished ? (
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Exam Title"
              value={form.title}
              onChange={(value) =>
                updateForm(
                  "title",
                  value,
                )
              }
            />

            <Field
              label="Short Name"
              value={form.shortName}
              onChange={(value) =>
                updateForm(
                  "shortName",
                  value,
                )
              }
            />

            <Field
              label="Category"
              value={form.category}
              onChange={(value) =>
                updateForm(
                  "category",
                  value,
                )
              }
            />

            <Field
              label="Subject"
              value={form.subject}
              onChange={(value) =>
                updateForm(
                  "subject",
                  value,
                )
              }
            />

            <Field
              label="Topic"
              value={form.topic}
              onChange={(value) =>
                updateForm(
                  "topic",
                  value,
                )
              }
            />

            <Field
              label="Duration (minutes)"
              type="number"
              value={String(
                form.durationMinutes,
              )}
              onChange={(value) =>
                updateForm(
                  "durationMinutes",
                  Number(value) || 1,
                )
              }
            />

            <Field
              label="Passing Percentage"
              type="number"
              value={String(
                form.passingPercentage,
              )}
              onChange={(value) =>
                updateForm(
                  "passingPercentage",
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(value) || 0,
                    ),
                  ),
                )
              }
            />
          </div>

          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(value) =>
              updateForm(
                "description",
                value,
              )
            }
          />

          <TextAreaField
            label="Instructions"
            value={form.instructions}
            onChange={(value) =>
              updateForm(
                "instructions",
                value,
              )
            }
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <InfoGrid
            items={[
              ["Category", exam.category],
              ["Subject", exam.subject || "—"],
              ["Topic", exam.topic || "—"],
              [
                "Duration",
                `${exam.durationMinutes} minutes`,
              ],
              [
                "Passing",
                `${exam.passingPercentage}%`,
              ],
              [
                "Question Selection",
                exam.questionSelectionMode,
              ],
              [
                "Created",
                formatDate(
                  exam.createdAt,
                ),
              ],
              [
                "Published",
                formatDate(
                  exam.publishedAt,
                ),
              ],
            ]}
          />

          {exam.description && (
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Description
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {exam.description}
              </p>
            </div>
          )}

          {exam.instructions && (
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Instructions
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {exam.instructions}
              </p>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function QuestionsSection({
  exam,
  editMode,
  isPublished,
  saving,
  onQuestionsChange,
  onSave,
  onEnterEditMode,
}: {
  exam: EducatorExam;
  editMode: boolean;
  isPublished: boolean;
  saving: boolean;
  onQuestionsChange: (
    questions: ExamQuestion[],
  ) => void;
  onSave: (
    questions?: ExamQuestion[],
  ) => void;
  onEnterEditMode: () => void;
}) {  const [questionBank, setQuestionBank] =
    useState<QuestionBankItem[]>([]);

  const [loadingQuestionBank, setLoadingQuestionBank] =
    useState(true);

  const [questionBankError, setQuestionBankError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [difficulty, setDifficulty] =
    useState<
      | "ALL"
      | "EASY"
      | "MEDIUM"
      | "HARD"
    >("ALL");

  const [selectedQuestionIds, setSelectedQuestionIds] =
    useState<string[]>([]);

  const [pickerOpen, setPickerOpen] =
    useState(false);

  const questions =
    exam.questions || [];

  const questionBankMap = useMemo(() => {
    return new Map(
      questionBank.map((question) => [
        question.id ||
          question._id ||
          "",
        question,
      ]),
    );
  }, [questionBank]);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestionBank() {
      setLoadingQuestionBank(true);
      setQuestionBankError("");

      try {
        const token = getToken();

        const response = await fetch(
          `${API_BASE_URL}/educator/questions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data =
          (await response.json()) as QuestionBankResponse;

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load the Question Bank.",
          );
        }

        if (!cancelled) {
          const activeQuestions = (
            data.questions || []
          )
            .filter(
              (question) =>
                !question.status ||
                question.status ===
                  "ACTIVE",
            )
            .map((question) => ({
              ...question,
              id:
                question.id ||
                question._id ||
                "",
            }))
            .filter(
              (question) =>
                Boolean(question.id),
            );

          setQuestionBank(
            activeQuestions,
          );
        }
      } catch (err) {
        if (!cancelled) {
          setQuestionBankError(
            err instanceof Error
              ? err.message
              : "Unable to load the Question Bank.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingQuestionBank(false);
        }
      }
    }

    void loadQuestionBank();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedExamQuestionIds =
    useMemo(() => {
      return new Set(
        questions
          .map((question) =>
            getQuestionRelationId(
              question.question,
            ),
          )
          .filter(Boolean),
      );
    }, [questions]);

  const filteredQuestionBank =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return questionBank.filter(
        (question) => {
          const matchesSearch =
            !normalizedSearch ||
            question.questionText
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            String(
              question.questionCode ||
                "",
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            String(
              question.subject ||
                "",
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            String(
              question.topic || "",
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesDifficulty =
            difficulty === "ALL" ||
            question.difficulty ===
              difficulty;

          return (
            matchesSearch &&
            matchesDifficulty
          );
        },
      );
    }, [
      difficulty,
      questionBank,
      search,
    ]);

  const selectedVisibleCount =
    filteredQuestionBank.filter(
      (question) =>
        selectedQuestionIds.includes(
          question.id,
        ),
    ).length;

  function toggleQuestionSelection(
    questionId: string,
  ) {
    if (selectedExamQuestionIds.has(
      questionId,
    )) {
      return;
    }

    setSelectedQuestionIds(
      (current) =>
        current.includes(questionId)
          ? current.filter(
              (id) =>
                id !== questionId,
            )
          : [
              ...current,
              questionId,
            ],
    );
  }

  function selectAllVisible() {
    const availableIds =
      filteredQuestionBank
        .map(
          (question) =>
            question.id,
        )
        .filter(
          (id) =>
            !selectedExamQuestionIds.has(
              id,
            ),
        );

    setSelectedQuestionIds(
      (current) => [
        ...new Set([
          ...current,
          ...availableIds,
        ]),
      ],
    );
  }

  function clearSelected() {
    setSelectedQuestionIds([]);
  }

  function addSelectedQuestions() {
    if (
      isPublished ||
      selectedQuestionIds.length === 0
    ) {
      return;
    }

    const existingIds =
      new Set(
        questions
          .map((question) =>
            getQuestionRelationId(
              question.question,
            ),
          )
          .filter(Boolean),
      );

    const questionsToAdd =
      selectedQuestionIds
        .map((questionId) =>
          questionBankMap.get(
            questionId,
          ),
        )
        .filter(
          (
            question,
          ): question is QuestionBankItem =>
            Boolean(question),
        )
        .filter(
          (question) =>
            !existingIds.has(
              question.id,
            ),
        );

    if (
      questionsToAdd.length === 0
    ) {
      setSelectedQuestionIds([]);
      return;
    }

    const nextQuestions = [
      ...questions,
      ...questionsToAdd.map(
        (
          question,
          index,
        ) => ({
          question:
            question.id,
          order:
            questions.length +
            index,
          marks:
            Math.max(
              0,
              Number(
                question.defaultMarks,
              ) || 1,
            ),
          negativeMarks:
            Math.max(
              0,
              Number(
                question.defaultNegativeMarks,
              ) || 0,
            ),
          questionText:
            question.questionText,
          questionCode:
            question.questionCode,
          questionType:
            question.questionType,
          subject:
            question.subject,
          topic:
            question.topic,
          difficulty:
            question.difficulty,
        }),
      ),
    ];

    onQuestionsChange(
      nextQuestions,
    );

    setSelectedQuestionIds([]);
    setPickerOpen(false);
  }

  function removeQuestion(
    index: number,
  ) {
    if (isPublished) {
      return;
    }

    const nextQuestions =
      questions
        .filter(
          (_, questionIndex) =>
            questionIndex !== index,
        )
        .map(
          (question, order) => ({
            ...question,
            order,
          }),
        );

    onQuestionsChange(
      nextQuestions,
    );
  }

  function moveQuestion(
    index: number,
    direction: -1 | 1,
  ) {
    if (isPublished) {
      return;
    }

    const targetIndex =
      index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >=
        questions.length
    ) {
      return;
    }

    const nextQuestions = [
      ...questions,
    ];

    const current =
      nextQuestions[index];

    nextQuestions[index] =
      nextQuestions[targetIndex];

    nextQuestions[targetIndex] =
      current;

    onQuestionsChange(
      nextQuestions.map(
        (
          question,
          order,
        ) => ({
          ...question,
          order,
        }),
      ),
    );
  }

  function updateQuestionMarks(
    index: number,
    field:
      | "marks"
      | "negativeMarks",
    value: number,
  ) {
    if (isPublished) {
      return;
    }

    const nextQuestions =
      questions.map(
        (question, questionIndex) =>
          questionIndex === index
            ? {
                ...question,
                [field]:
                  Math.max(
                    0,
                    Number(value) || 0,
                  ),
              }
            : question,
      );

    onQuestionsChange(
      nextQuestions,
    );
  }

  return (
    <SectionCard
      title="Question Builder"
      description="Select questions from your Educator Question Bank, arrange them, and configure marks before saving the exam."
    >
      {!editMode &&
        !isPublished && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-800">
              Click “Edit Exam” above to
              modify questions.
            </p>
          </div>
        )}

      {isPublished && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-800">
            This exam is published. Its
            question set is locked in this
            phase.
          </p>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">
            {questions.length}{" "}
            {questions.length === 1
              ? "question"
              : "questions"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {exam.questionSelectionMode ===
            "MANUAL"
              ? "Manual question selection"
              : exam.questionSelectionMode ===
                  "RANDOM"
                ? "Random question selection"
                : "Rule-based selection"}{" "}
            • {calculateClientTotalMarks(
              questions,
            )}{" "}
            total marks
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/educator/questions"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <FileQuestion className="h-4 w-4" />
            Question Bank
          </Link>

          {!isPublished && (
            <>
              <button
                type="button"
                onClick={() => {
                if (!editMode) {
                  onEnterEditMode();
                }

                setPickerOpen(true);
              }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {pickerOpen
                  ? "Close Picker"
                  : "Add Questions"}
              </button>

              {editMode && (
                <button
                  type="button"
                  onClick={() =>
                    onSave(questions)
                  }
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving
                    ? "Saving..."
                    : "Save Question Set"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {pickerOpen &&
        !isPublished && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search question, code, subject or topic..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none focus:border-slate-950"
                  />
                </label>

                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(
                      event.target.value as
                        | "ALL"
                        | "EASY"
                        | "MEDIUM"
                        | "HARD",
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-slate-950"
                >
                  <option value="ALL">
                    All Difficulties
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
                </select>
              </div>

              <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold text-slate-500">
                  {filteredQuestionBank.length}{" "}
                  questions shown •{" "}
                  {selectedQuestionIds.length}{" "}
                  selected
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={
                      selectAllVisible
                    }
                    disabled={
                      filteredQuestionBank.length ===
                      0
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Select Visible
                  </button>

                  <button
                    type="button"
                    onClick={
                      clearSelected
                    }
                    disabled={
                      selectedQuestionIds.length ===
                      0
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={
                      addSelectedQuestions
                    }
                    disabled={
                      selectedQuestionIds.length ===
                      0
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Selected
                  </button>
                </div>
              </div>

              {loadingQuestionBank ? (
                <div className="flex items-center justify-center rounded-xl border border-slate-200 p-8 text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Question Bank...
                </div>
              ) : questionBankError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {questionBankError}
                </div>
              ) : filteredQuestionBank.length ===
                0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                  <FileQuestion className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-2 text-sm font-black text-slate-900">
                    No matching active
                    questions
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload or create questions
                    in the Educator Question Bank
                    first.
                  </p>
                </div>
              ) : (
                <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                  {filteredQuestionBank.map(
                    (question) => {
                      const alreadyAdded =
                        selectedExamQuestionIds.has(
                          question.id,
                        );

                      const selected =
                        selectedQuestionIds.includes(
                          question.id,
                        );

                      return (
                        <button
                          key={
                            question.id
                          }
                          type="button"
                          disabled={
                            alreadyAdded
                          }
                          onClick={() =>
                            toggleQuestionSelection(
                              question.id,
                            )
                          }
                          className={`w-full rounded-xl border p-4 text-left transition ${
                            alreadyAdded
                              ? "cursor-not-allowed border-emerald-200 bg-emerald-50/60"
                              : selected
                                ? "border-slate-950 bg-slate-50"
                                : "border-slate-200 bg-white hover:border-slate-400"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                alreadyAdded ||
                                selected
                                  ? "border-slate-950 bg-slate-950 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {(alreadyAdded ||
                                selected) && (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {question.questionCode && (
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                    {
                                      question.questionCode
                                    }
                                  </span>
                                )}

                                {question.difficulty && (
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                    {
                                      question.difficulty
                                    }
                                  </span>
                                )}

                                {question.questionType && (
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                    {
                                      question.questionType
                                    }
                                  </span>
                                )}

                                {alreadyAdded && (
                                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                                    Already Added
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                                {
                                  question.questionText
                                }
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-400">
                                {question.subject && (
                                  <span>
                                    {
                                      question.subject
                                    }
                                  </span>
                                )}
                                {question.topic && (
                                  <span>
                                    •{" "}
                                    {
                                      question.topic
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              )}

              {selectedVisibleCount > 0 && (
                <p className="text-xs font-semibold text-slate-500">
                  {selectedVisibleCount} selected
                  question
                  {selectedVisibleCount ===
                  1
                    ? ""
                    : "s"} visible in the
                  current filter.
                </p>
              )}
            </div>
          </div>
        )}

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <FileQuestion className="mx-auto h-8 w-8 text-slate-300" />

          <h3 className="mt-3 text-sm font-black text-slate-900">
            No questions added
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {editMode && !isPublished
              ? "Open Add Questions to select questions from your Educator Question Bank."
              : "Add questions from the Educator Question Bank before publishing."}
          </p>

          {!editMode &&
            !isPublished && (
              <p className="mt-3 text-xs font-bold text-amber-700">
                Use “Edit Exam” above to
                start building the question set.
              </p>
            )}
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(
            (question, index) => (
              <div
                key={
                  getQuestionRelationId(
                    question.question,
                  ) ||
                  question._id ||
                  question.id ||
                  index
                }
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {question.questionCode && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                            {
                              question.questionCode
                            }
                          </span>
                        )}

                        {question.questionType && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                            {
                              question.questionType
                            }
                          </span>
                        )}

                        {question.difficulty && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                            {
                              question.difficulty
                            }
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                        {getQuestionDisplayText(
                          question,
                          questionBankMap,
                        )}
                      </p>

                      {(question.subject ||
                        question.topic) && (
                        <p className="mt-2 text-xs font-bold text-slate-400">
                          {question.subject ||
                            ""}
                          {question.topic
                            ? ` • ${question.topic}`
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Marks
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        value={
                          question.marks ??
                          1
                        }
                        disabled={
                          !editMode ||
                          isPublished
                        }
                        onChange={(event) =>
                          updateQuestionMarks(
                            index,
                            "marks",
                            Number(
                              event.target
                                .value,
                            ),
                          )
                        }
                        className="w-16 bg-transparent text-sm font-black text-slate-900 outline-none disabled:text-slate-400"
                      />
                    </label>

                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Negative
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        value={
                          question.negativeMarks ??
                          0
                        }
                        disabled={
                          !editMode ||
                          isPublished
                        }
                        onChange={(event) =>
                          updateQuestionMarks(
                            index,
                            "negativeMarks",
                            Number(
                              event.target
                                .value,
                            ),
                          )
                        }
                        className="w-16 bg-transparent text-sm font-black text-slate-900 outline-none disabled:text-slate-400"
                      />
                    </label>

                    {!isPublished && (
                      <>
                        <button
                          type="button"
                          disabled={
                            !editMode ||
                            index === 0
                          }
                          onClick={() =>
                            moveQuestion(
                              index,
                              -1,
                            )
                          }
                          title="Move up"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={
                            !editMode ||
                            index ===
                              questions.length -
                                1
                          }
                          onClick={() =>
                            moveQuestion(
                              index,
                              1,
                            )
                          }
                          title="Move down"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={
                            !editMode
                          }
                          onClick={() =>
                            removeQuestion(
                              index,
                            )
                          }
                          title="Remove question"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {editMode &&
        !isPublished && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-900">
                {questions.length} questions •{" "}
                {calculateClientTotalMarks(
                  questions,
                )}{" "}
                total marks
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Changes are ready to save.
                Saving writes the complete
                question set to the server.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onSave(questions)
              }
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Question Set
            </button>
          </div>
        )}
    </SectionCard>
  );
}

function AudienceSection({
  exam,
  batches,
  selectedBatches,
  loadingBatches,
  toggleBatch,
  isPublished,
  assignedBatchIds,
}: {
  exam: EducatorExam;
  batches: Batch[];
  selectedBatches: string[];
  loadingBatches: boolean;
  toggleBatch: (
    id: string,
  ) => void;
  isPublished: boolean;
  assignedBatchIds: string[];
}) {
  return (
    <SectionCard
      title="Audience & Sharing"
      description="Choose which students should receive this examination."
    >
      {exam.accessType === "FREE" ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <div className="flex items-start gap-3">
            <Globe2 className="mt-0.5 h-5 w-5 text-sky-600" />

            <div>
              <h3 className="text-sm font-black text-sky-900">
                Free Examination
              </h3>

              <p className="mt-1 text-sm leading-6 text-sky-800">
                This examination is available to every registered JobWay student. No batch assignment is required.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 text-violet-600" />

              <div>
                <h3 className="text-sm font-black text-violet-900">
                  Premium Examination
                </h3>

                <p className="mt-1 text-sm leading-6 text-violet-800">
                  Select one or more batches assigned to you. Only students eligible for the selected audience will be able to access this examination.
                </p>
              </div>
            </div>
          </div>

          {loadingBatches ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 p-10 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading your assigned batches...
            </div>
          ) : batches.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-bold text-amber-800">
                No active batches are assigned to you.
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Ask an administrator to assign you to a batch before publishing a Premium examination.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map((batch) => {
                const batchId =
                  getId(batch);

                const selected =
                  selectedBatches.includes(
                    batchId,
                  );

                const wasAlreadyAssigned =
                  assignedBatchIds.includes(
                    batchId,
                  );

                return (
                  <button
                    key={batchId}
                    type="button"
                    disabled={isPublished}
                    onClick={() =>
                      toggleBatch(
                        batchId,
                      )
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-slate-950 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        selected
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selected && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-900">
                        {batch.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {batch.code ||
                          "Batch"}
                        {batch.category
                          ? ` • ${batch.category}`
                          : ""}
                      </p>
                    </div>

                    {wasAlreadyAssigned && (
                      <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 sm:inline-flex">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-500">
                Selected batches
              </span>

              <span className="text-sm font-black text-slate-950">
                {selectedBatches.length}
              </span>
            </div>
          </div>
        </>
      )}
    </SectionCard>
  );
}

function AccessSection({
  exam,
  editMode,
  form,
  updateForm,
  isPublished,
}: {
  exam: EducatorExam;
  editMode: boolean;
  form: {
    accessType: AccessType;
    attemptPolicy: AttemptPolicy;
    maxAttempts: number;
  };
  updateForm: (
    field:
      | "accessType"
      | "attemptPolicy"
      | "maxAttempts",
    value: string | number,
  ) => void;
  isPublished: boolean;
}) {
  return (
    <SectionCard
      title="Access & Attempts"
      description="Control who can access the exam and how many attempts are allowed."
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <ChoiceCard
            selected={
              form.accessType ===
              "FREE"
            }
            disabled={
              !editMode ||
              isPublished
            }
            title="Free"
            description="Available to registered JobWay students."
            onClick={() =>
              updateForm(
                "accessType",
                "FREE",
              )
            }
          />

          <ChoiceCard
            selected={
              form.accessType ===
              "PREMIUM"
            }
            disabled={
              !editMode ||
              isPublished
            }
            title="Premium"
            description="Requires the configured premium access and audience rules."
            onClick={() =>
              updateForm(
                "accessType",
                "PREMIUM",
              )
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ChoiceCard
            selected={
              form.attemptPolicy ===
              "SINGLE_ATTEMPT"
            }
            disabled={
              !editMode ||
              isPublished
            }
            title="Single Attempt"
            description="Student gets one attempt."
            onClick={() =>
              updateForm(
                "attemptPolicy",
                "SINGLE_ATTEMPT",
              )
            }
          />

          <ChoiceCard
            selected={
              form.attemptPolicy ===
              "MULTIPLE_ATTEMPTS"
            }
            disabled={
              !editMode ||
              isPublished
            }
            title="Multiple Attempts"
            description="Allow more than one attempt."
            onClick={() =>
              updateForm(
                "attemptPolicy",
                "MULTIPLE_ATTEMPTS",
              )
            }
          />
        </div>

        {form.attemptPolicy ===
          "MULTIPLE_ATTEMPTS" && (
          <Field
            label="Maximum Attempts"
            type="number"
            value={String(
              form.maxAttempts,
            )}
            disabled={
              !editMode ||
              isPublished
            }
            onChange={(value) =>
              updateForm(
                "maxAttempts",
                Math.max(
                  1,
                  Number(value) || 1,
                ),
              )
            }
          />
        )}

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-500">
            Current configuration
          </p>

          <p className="mt-2 text-sm font-black text-slate-900">
            {exam.accessType} •{" "}
            {exam.attemptPolicy}
            {exam.attemptPolicy ===
            "MULTIPLE_ATTEMPTS"
              ? ` • ${exam.maxAttempts} attempts`
              : ""}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

function ProctoringSection({
  exam,
}: {
  exam: EducatorExam;
}) {
  const settings =
    exam.proctoring || {};

  const items = [
    [
      "Camera",
      settings.requireCamera,
    ],
    [
      "Microphone",
      settings.requireMicrophone,
    ],
    [
      "Fullscreen",
      settings.requireFullscreen,
    ],
    [
      "Monitor Fullscreen",
      settings.monitorFullscreen,
    ],
    [
      "Monitor Visibility",
      settings.monitorVisibility,
    ],
    [
      "Monitor Window Blur",
      settings.monitorBlur,
    ],
    [
      "Monitor Context Menu",
      settings.monitorContextMenu,
    ],
    [
      "Save Violation Logs",
      settings.saveViolationLogs,
    ],
  ] as const;

  return (
    <SectionCard
      title="Proctoring"
      description="Review the browser and hardware monitoring configuration for this examination."
    >
      <div
        className={`rounded-2xl p-5 ${
          settings.enabled
            ? "border border-emerald-200 bg-emerald-50"
            : "border border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck
            className={`mt-0.5 h-5 w-5 ${
              settings.enabled
                ? "text-emerald-600"
                : "text-slate-500"
            }`}
          />

          <div>
            <h3 className="text-sm font-black text-slate-900">
              {settings.enabled
                ? "Proctoring Enabled"
                : "Proctoring Disabled"}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              {settings.enabled
                ? `${settings.maxStrikes || 2} maximum strikes • ${settings.terminationCountdownSeconds || 7} second termination countdown`
                : "Students will not be subject to the configured proctoring checks."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map(
          ([label, enabled]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <span className="text-sm font-bold text-slate-700">
                {label}
              </span>

              {enabled ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  On
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400">
                  Off
                </span>
              )}
            </div>
          ),
        )}
      </div>
    </SectionCard>
  );
}

function ChoiceCard({
  selected,
  disabled,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-slate-950 bg-slate-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
            selected
              ? "border-slate-950"
              : "border-slate-300"
          }`}
        >
          {selected && (
            <div className="h-2.5 w-2.5 rounded-full bg-slate-950" />
          )}
        </div>

        <div>
          <p className="text-sm font-black text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-lg font-black tracking-tight text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="pt-5">
        {children}
      </div>
    </section>
  );
}

function InfoGrid({
  items,
}: {
  items: Array<
    [string, string | number]
  >;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(
        ([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-slate-50 p-4"
          >
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
              {label}
            </p>

            <p className="mt-1.5 text-sm font-bold text-slate-900">
              {value}
            </p>
          </div>
        ),
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-950 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <textarea
        value={value}
        rows={5}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:border-slate-950"
      />
    </label>
  );
}