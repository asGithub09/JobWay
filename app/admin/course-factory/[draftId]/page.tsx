"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  Layers3,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  getCourseDraft,
  updateCourseDraft,
  approveCourseDraft,
  publishCourseDraft,
  type CourseDraft,
  type CourseDraftLesson,
  type CourseDraftModule,
  type CourseDraftPractice,
  type CourseDraftQuestion,
  type CourseDraftSourceSection,
} from "@/lib/api";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(value?: string) {
  if (!value) return "â€”";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "â€”";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status?: string) {
  switch (status) {
    case "READY_FOR_REVIEW":
      return "Ready for Review";
    case "APPROVED":
      return "Approved";
    case "PUBLISHED":
      return "Published";
    case "FAILED":
      return "Failed";
    case "DRAFT":
      return "Draft";
    default:
      return status || "Unknown";
  }
}

function statusClasses(status?: string) {
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

function getPracticeTypeLabel(type?: string) {
  switch (type) {
    case "mcq":
      return "Multiple Choice Questions";
    case "short-answer":
      return "Short Answer";
    case "long-answer":
      return "Long Answer";
    case "project":
      return "Project Work";
    default:
      return "Practice";
  }
}

function cloneDraft(draft: CourseDraft): CourseDraft {
  return JSON.parse(JSON.stringify(draft)) as CourseDraft;
}

function getLessons(module: CourseDraftModule): CourseDraftLesson[] {
  return Array.isArray(module.lessons) ? module.lessons : [];
}

function getQuestions(
  practice: CourseDraftPractice,
): CourseDraftQuestion[] {
  return Array.isArray(practice.questions)
    ? practice.questions
    : [];
}

function getTotalLessons(draft: CourseDraft) {
  if (!Array.isArray(draft.modules)) return 0;

  return draft.modules.reduce(
    (total, module) => total + getLessons(module).length,
    0,
  );
}

function getTotalQuestions(draft: CourseDraft) {
  if (!Array.isArray(draft.practice)) return 0;

  return draft.practice.reduce(
    (total, practice) => total + getQuestions(practice).length,
    0,
  );
}

/* -------------------------------------------------------------------------- */
/* Small UI components                                                        */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = "",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  const className =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400";

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={5}
          className={className}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
      )}
    </label>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
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

function SectionHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
          Course Factory
        </p>

        <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Question editor                                                            */
/* -------------------------------------------------------------------------- */

function QuestionEditor({
  question,
  index,
  onChange,
  onDelete,
}: {
  question: CourseDraftQuestion;
  index: number;
  onChange: (next: CourseDraftQuestion) => void;
  onDelete: () => void;
}) {
  const options = Array.isArray(question.options)
    ? question.options
    : [];

  const updateOption = (optionIndex: number, value: string) => {
    const nextOptions = [...options];
    nextOptions[optionIndex] = value;

    onChange({
      ...question,
      options: nextOptions,
    });
  };

  const addOption = () => {
    onChange({
      ...question,
      options: [...options, ""],
    });
  };

  const removeOption = (optionIndex: number) => {
    onChange({
      ...question,
      options: options.filter(
        (_, currentIndex) => currentIndex !== optionIndex,
      ),
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-extrabold text-white">
            {index + 1}
          </div>

          <span className="text-sm font-extrabold text-slate-900">
            Question {index + 1}
          </span>
        </div>

        <IconButton
          label="Delete question"
          onClick={onDelete}
          danger
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="space-y-4">
        <Field
          label="Question"
          value={question.question || ""}
          onChange={(value) =>
            onChange({
              ...question,
              question: value,
            })
          }
          multiline
          placeholder="Enter question"
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Options
            </span>

            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-950"
            >
              <Plus className="h-3.5 w-3.5" />
              Add option
            </button>
          </div>

          <div className="space-y-2">
            {options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="flex items-center gap-2"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-500">
                  {String.fromCharCode(65 + optionIndex)}
                </span>

                <input
                  value={option}
                  onChange={(event) =>
                    updateOption(
                      optionIndex,
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder={`Option ${optionIndex + 1}`}
                />

                <IconButton
                  label="Delete option"
                  onClick={() =>
                    removeOption(optionIndex)
                  }
                  danger
                >
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
            ))}
          </div>
        </div>

        <Field
          label="Answer"
          value={question.answer || ""}
          onChange={(value) =>
            onChange({
              ...question,
              answer: value,
            })
          }
          placeholder="Enter answer"
        />

        <Field
          label="Explanation"
          value={question.explanation || ""}
          onChange={(value) =>
            onChange({
              ...question,
              explanation: value,
            })
          }
          multiline
          placeholder="Optional explanation"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Practice editor                                                            */
/* -------------------------------------------------------------------------- */

function PracticeEditor({
  practice,
  index,
  onChange,
  onDelete,
}: {
  practice: CourseDraftPractice;
  index: number;
  onChange: (next: CourseDraftPractice) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(true);

  const questions = getQuestions(practice);

  const updateQuestion = (
    questionIndex: number,
    question: CourseDraftQuestion,
  ) => {
    const nextQuestions = [...questions];
    nextQuestions[questionIndex] = question;

    onChange({
      ...practice,
      questions: nextQuestions,
    });
  };

  const addQuestion = () => {
    onChange({
      ...practice,
      questions: [
        ...questions,
        {
          question: "",
          type: practice.type || "general",
          options:
            practice.type === "mcq"
              ? ["", "", "", ""]
              : [],
          answer: "",
          explanation: "",
          sourceSection: "",
          order: questions.length,
        },
      ],
    });
  };

  const deleteQuestion = (questionIndex: number) => {
    onChange({
      ...practice,
      questions: questions.filter(
        (_, currentIndex) =>
          currentIndex !== questionIndex,
      ),
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          {open ? (
            <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-950">
              {practice.title ||
                `${getPracticeTypeLabel(
                  practice.type,
                )} ${index + 1}`}
            </p>

            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              {getPracticeTypeLabel(practice.type)} Â·{" "}
              {questions.length} questions
            </p>
          </div>
        </button>

        <IconButton
          label="Delete practice section"
          onClick={onDelete}
          danger
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>

      {open && (
        <div className="space-y-5 p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field
              label="Practice Title"
              value={practice.title || ""}
              onChange={(value) =>
                onChange({
                  ...practice,
                  title: value,
                })
              }
            />

            <Field
              label="Type"
              value={getPracticeTypeLabel(
                practice.type,
              )}
              onChange={() => undefined}
              disabled
            />
          </div>

          <Field
            label="Description"
            value={practice.description || ""}
            onChange={(value) =>
              onChange({
                ...practice,
                description: value,
              })
            }
            multiline
            placeholder="Optional practice description"
          />

          <div className="space-y-4">
            {questions.map((question, questionIndex) => (
              <QuestionEditor
                key={`question-${questionIndex}`}
                question={question}
                index={questionIndex}
                onChange={(next) =>
                  updateQuestion(questionIndex, next)
                }
                onDelete={() =>
                  deleteQuestion(questionIndex)
                }
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-400 hover:bg-white hover:text-slate-950"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Lesson editor                                                              */
/* -------------------------------------------------------------------------- */

function LessonEditor({
  lesson,
  index,
  onChange,
  onDelete,
}: {
  lesson: CourseDraftLesson;
  index: number;
  onChange: (next: CourseDraftLesson) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-extrabold text-slate-500">
            {index + 1}
          </div>

          <span className="text-sm font-extrabold text-slate-900">
            Lesson {index + 1}
          </span>
        </div>

        <IconButton
          label="Delete lesson"
          onClick={onDelete}
          danger
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="space-y-4">
        <Field
          label="Lesson Title"
          value={lesson.title || ""}
          onChange={(value) =>
            onChange({
              ...lesson,
              title: value,
            })
          }
        />

        <Field
          label="Description"
          value={lesson.description || ""}
          onChange={(value) =>
            onChange({
              ...lesson,
              description: value,
            })
          }
          multiline
        />

        <Field
          label="Lesson Content"
          value={lesson.content || ""}
          onChange={(value) =>
            onChange({
              ...lesson,
              content: value,
            })
          }
          multiline
          placeholder="Lesson content"
        />

        <Field
          label="Key Points"
          value={
            Array.isArray(lesson.keyPoints)
              ? lesson.keyPoints.join("\n")
              : ""
          }
          onChange={(value) =>
            onChange({
              ...lesson,
              keyPoints: value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
          multiline
          placeholder="One key point per line"
        />

        <Field
          label="Bullets"
          value={
            Array.isArray(lesson.bullets)
              ? lesson.bullets.join("\n")
              : ""
          }
          onChange={(value) =>
            onChange({
              ...lesson,
              bullets: value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
          multiline
          placeholder="One bullet per line"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Module editor                                                              */
/* -------------------------------------------------------------------------- */

function ModuleEditor({
  module,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  module: CourseDraftModule;
  index: number;
  total: number;
  onChange: (next: CourseDraftModule) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(true);

  const lessons = getLessons(module);

  const updateLesson = (
    lessonIndex: number,
    lesson: CourseDraftLesson,
  ) => {
    const nextLessons = [...lessons];
    nextLessons[lessonIndex] = {
      ...lesson,
      order: lessonIndex,
    };

    onChange({
      ...module,
      lessons: nextLessons,
    });
  };

  const addLesson = () => {
    onChange({
      ...module,
      lessons: [
        ...lessons,
        {
          title: `New Lesson ${lessons.length + 1}`,
          description: "",
          content: "",
          keyPoints: [],
          bullets: [],
          sourceSection: "",
          order: lessons.length,
        },
      ],
    });
  };

  const deleteLesson = (lessonIndex: number) => {
    onChange({
      ...module,
      lessons: lessons
        .filter(
          (_, currentIndex) =>
            currentIndex !== lessonIndex,
        )
        .map((lesson, currentIndex) => ({
          ...lesson,
          order: currentIndex,
        })),
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          {open ? (
            <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
          )}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-extrabold text-white">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-950">
              {module.title ||
                `Module ${index + 1}`}
            </p>

            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              {lessons.length}{" "}
              {lessons.length === 1
                ? "lesson"
                : "lessons"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <IconButton
            label="Move module up"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </IconButton>

          <IconButton
            label="Move module down"
            onClick={onMoveDown}
            disabled={index === total - 1}
          >
            <ArrowDown className="h-4 w-4" />
          </IconButton>

          <IconButton
            label="Delete module"
            onClick={onDelete}
            danger
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {open && (
        <div className="space-y-5 p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field
              label="Module Title"
              value={module.title || ""}
              onChange={(value) =>
                onChange({
                  ...module,
                  title: value,
                })
              }
            />

            <div className="flex items-end">
              <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                  Lessons
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {lessons.length}
                </p>
              </div>
            </div>
          </div>

          <Field
            label="Module Description"
            value={module.description || ""}
            onChange={(value) =>
              onChange({
                ...module,
                description: value,
              })
            }
            multiline
          />

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold text-slate-900">
                  Lessons
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Edit or remove generated lessons.
                </p>
              </div>

              <button
                type="button"
                onClick={addLesson}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add Lesson
              </button>
            </div>

            <div className="space-y-4">
              {lessons.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No lessons in this module.
                </div>
              ) : (
                lessons.map((lesson, lessonIndex) => (
                  <LessonEditor
                    key={`lesson-${lessonIndex}`}
                    lesson={lesson}
                    index={lessonIndex}
                    onChange={(next) =>
                      updateLesson(
                        lessonIndex,
                        next,
                      )
                    }
                    onDelete={() =>
                      deleteLesson(lessonIndex)
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Source sections                                                            */
/* -------------------------------------------------------------------------- */

function SourceSectionEditor({
  section,
  index,
  onChange,
}: {
  section: CourseDraftSourceSection;
  index: number;
  onChange: (
    next: CourseDraftSourceSection,
  ) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500">
          {index + 1}
        </div>

        <p className="text-sm font-extrabold text-slate-900">
          Source Section {index + 1}
        </p>
      </div>

      <div className="space-y-4">
        <Field
          label="Section Title"
          value={section.title || ""}
          onChange={(value) =>
            onChange({
              ...section,
              title: value,
            })
          }
        />

        <Field
          label="Source Text"
          value={section.text || ""}
          onChange={(value) =>
            onChange({
              ...section,
              text: value,
            })
          }
          multiline
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

export default function CourseFactoryDraftPage() {
  const params = useParams<{
    draftId: string;
  }>();

  const draftId = params?.draftId;

  const [draft, setDraft] =
    useState<CourseDraft | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saveError, setSaveError] =
    useState("");

  const [approving, setApproving] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  const [workflowError, setWorkflowError] =
    useState("");

  const [workflowSuccess, setWorkflowSuccess] =
    useState("");

  async function loadDraft() {
    if (!draftId) {
      setError("Draft ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await getCourseDraft(draftId);

      if (response?.success === false) {
        throw new Error(
          response.message ||
            "Unable to load course draft.",
        );
      }

      if (!response?.draft) {
        throw new Error(
          "Course draft was not found.",
        );
      }

      setDraft(cloneDraft(response.draft));
    } catch (err) {
      console.error(
        "Course Factory draft error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load course draft.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDraft();
  }, [draftId]);

  const moduleCount =
    draft && Array.isArray(draft.modules)
      ? draft.modules.length
      : 0;

  const lessonCount = draft
    ? getTotalLessons(draft)
    : 0;

  const practiceCount = draft
    ? getTotalQuestions(draft)
    : 0;

  const practiceTypes = useMemo(() => {
    if (
      !draft ||
      !Array.isArray(draft.practice)
    ) {
      return [];
    }

    return draft.practice.map(
      (practice, index) => ({
        key: `${practice.type}-${index}`,
        type: practice.type,
        count: getQuestions(practice).length,
      }),
    );
  }, [draft]);

  /* ---------------------------------------------------------------------- */
  /* Draft updates                                                          */
  /* ---------------------------------------------------------------------- */

  function updateDraft(
    changes: Partial<CourseDraft>,
  ) {
    setDraft((current) =>
      current
        ? {
            ...current,
            ...changes,
          }
        : current,
    );

    setSaved(false);
    setSaveError("");
  }

  function updateModule(
    index: number,
    next: CourseDraftModule,
  ) {
    if (!draft) return;

    const modules = Array.isArray(draft.modules)
      ? [...draft.modules]
      : [];

    modules[index] = {
      ...next,
      order: index,
    };

    updateDraft({ modules });
  }

  function deleteModule(index: number) {
    if (!draft) return;

    const modules = (
      Array.isArray(draft.modules)
        ? draft.modules
        : []
    )
      .filter(
        (_, currentIndex) =>
          currentIndex !== index,
      )
      .map((module, currentIndex) => ({
        ...module,
        order: currentIndex,
      }));

    updateDraft({ modules });
  }

  function moveModule(
    index: number,
    direction: "up" | "down",
  ) {
    if (!draft) return;

    const modules = Array.isArray(draft.modules)
      ? [...draft.modules]
      : [];

    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= modules.length
    ) {
      return;
    }

    [
      modules[index],
      modules[targetIndex],
    ] = [
      modules[targetIndex],
      modules[index],
    ];

    updateDraft({
      modules: modules.map(
        (module, currentIndex) => ({
          ...module,
          order: currentIndex,
        }),
      ),
    });
  }

  function addModule() {
    if (!draft) return;

    const modules = Array.isArray(draft.modules)
      ? [...draft.modules]
      : [];

    modules.push({
      title: `New Module ${modules.length + 1}`,
      description: "",
      order: modules.length,
      lessons: [],
    });

    updateDraft({ modules });
  }

  function updatePractice(
    index: number,
    next: CourseDraftPractice,
  ) {
    if (!draft) return;

    const practice = Array.isArray(draft.practice)
      ? [...draft.practice]
      : [];

    practice[index] = {
      ...next,
      order: index,
    };

    updateDraft({ practice });
  }

  function deletePractice(index: number) {
    if (!draft) return;

    const practice = (
      Array.isArray(draft.practice)
        ? draft.practice
        : []
    )
      .filter(
        (_, currentIndex) =>
          currentIndex !== index,
      )
      .map((item, currentIndex) => ({
        ...item,
        order: currentIndex,
      }));

    updateDraft({ practice });
  }

  function addPractice() {
    if (!draft) return;

    const practice = Array.isArray(draft.practice)
      ? [...draft.practice]
      : [];

    practice.push({
      title: `New Practice Section ${
        practice.length + 1
      }`,
      type: "general",
      description: "",
      questions: [],
      order: practice.length,
    });

    updateDraft({ practice });
  }

  /* ---------------------------------------------------------------------- */
  /* Save                                                                    */
  /* ---------------------------------------------------------------------- */

  async function handleSave() {
    if (!draft || !draftId) return;

    if (draft.status === "PUBLISHED") {
      setSaveError(
        "Published drafts cannot be edited.",
      );
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setSaveError("");

      const response =
        await updateCourseDraft(
          draftId,
          {
            title: draft.title,
            description: draft.description,
            modules: draft.modules || [],
            practice: draft.practice || [],
            sourceSections:
              draft.sourceSections || [],
          },
        );

      if (response?.success === false) {
        throw new Error(
          response.message ||
            "Unable to save changes.",
        );
      }

      if (response?.draft) {
        setDraft(cloneDraft(response.draft));
      }

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      console.error(
        "Course Factory save error:",
        err,
      );

      setSaveError(
        err instanceof Error
          ? err.message
          : "Unable to save changes.",
      );
    } finally {
      setSaving(false);
    }
  }


  async function handleApprove() {
    if (!draft || !draftId) return;

    if (draft.status !== "READY_FOR_REVIEW") {
      setWorkflowError(
        "Only drafts that are ready for review can be approved.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Approve this course draft?\n\nMake sure you have reviewed the course content before approving it.",
    );

    if (!confirmed) return;

    try {
      setApproving(true);
      setWorkflowError("");
      setWorkflowSuccess("");

      const response = await approveCourseDraft(draftId);

      if (response?.success === false) {
        throw new Error(
          response.message ||
            "Unable to approve this course draft.",
        );
      }

      if (response?.draft) {
        setDraft(cloneDraft(response.draft));
      }

      setWorkflowSuccess(
        "Course draft approved successfully.",
      );
    } catch (err) {
      console.error(
        "Approve course draft error:",
        err,
      );

      setWorkflowError(
        err instanceof Error
          ? err.message
          : "Unable to approve this course draft.",
      );
    } finally {
      setApproving(false);
    }
  }

  async function handlePublish() {
    if (!draft || !draftId) return;

    if (draft.status !== "APPROVED") {
      setWorkflowError(
        "Only approved drafts can be published.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Publish this course?\n\nThe course will become publicly available to students, and this draft will be locked.",
    );

    if (!confirmed) return;

    try {
      setPublishing(true);
      setWorkflowError("");
      setWorkflowSuccess("");

      const response = await publishCourseDraft(draftId);

      if (response?.success === false) {
        throw new Error(
          response.message ||
            "Unable to publish this course.",
        );
      }

      if (response?.draft) {
        setDraft(cloneDraft(response.draft));
      }

      setWorkflowSuccess(
        "Course published successfully.",
      );
    } catch (err) {
      console.error(
        "Publish course error:",
        err,
      );

      setWorkflowError(
        err instanceof Error
          ? err.message
          : "Unable to publish this course.",
      );
    } finally {
      setPublishing(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Loading/error states                                                    */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading generated course draft...
          </div>
        </div>
      </main>
    );
  }

  if (error || !draft) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h1 className="mt-4 text-xl font-extrabold text-slate-950">
              Unable to load draft
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "The requested course draft could not be found."}
            </p>

            <Link
              href="/admin/course-factory"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course Factory
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const modules = Array.isArray(draft.modules)
    ? draft.modules
    : [];

  const practice = Array.isArray(draft.practice)
    ? draft.practice
    : [];

  const sourceSections = Array.isArray(
    draft.sourceSections,
  )
    ? draft.sourceSections
    : [];

  const isPublished =
    draft.status === "PUBLISHED";

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* TOP BAR */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/course-factory"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Course Factory
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${statusClasses(
                draft.status,
              )}`}
            >
              {draft.status ===
                "READY_FOR_REVIEW" && (
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              )}

              {statusLabel(draft.status)}
            </span>

            {!isPublished && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving
                  ? "Saving..."
                  : saved
                    ? "Saved"
                    : "Save Changes"}
              </button>
            )}
          </div>
        </div>

        {/* SAVE ERROR */}
        {saveError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-extrabold">
                Unable to save changes
              </p>

              <p className="mt-1">
                {saveError}
              </p>
            </div>
          </div>
        )}

        {/* HERO / COURSE DETAILS */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.15em] text-orange-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Course Factory Review Studio
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                  {draft.title ||
                    "Untitled Course"}
                </h1>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Source:{" "}
                  {draft.sourceFileName ||
                    "Source material"}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Field
                  label="Course Title"
                  value={draft.title || ""}
                  onChange={(value) =>
                    updateDraft({
                      title: value,
                    })
                  }
                  disabled={isPublished}
                />

                <Field
                  label="Description"
                  value={draft.description || ""}
                  onChange={(value) =>
                    updateDraft({
                      description: value,
                    })
                  }
                  multiline
                  disabled={isPublished}
                />
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {draft.sourceFileName ||
                    "Source material"}
                </span>

                <span>
                  Mode:{" "}
                  {draft.generationMode ||
                    "rule-based"}
                </span>

                <span>
                  Detection:{" "}
                  {draft.detectionMode || "â€”"}
                </span>

                <span>
                  Created:{" "}
                  {formatDate(
                    draft.createdAt,
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            icon={
              <Layers3 className="h-5 w-5" />
            }
            label="Modules"
            value={moduleCount}
          />

          <SummaryCard
            icon={
              <BookOpen className="h-5 w-5" />
            }
            label="Lessons"
            value={lessonCount}
          />

          <SummaryCard
            icon={
              <FileText className="h-5 w-5" />
            }
            label="Practice"
            value={practiceCount}
          />

          <SummaryCard
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
            label="Source Sections"
            value={
              draft.summary?.sectionCount ??
              sourceSections.length
            }
          />

          <SummaryCard
            icon={
              <Clock3 className="h-5 w-5" />
            }
            label="MCQs"
            value={
              draft.summary?.mcqCount ?? 0
            }
          />
        </section>

        {/* MODULES */}
        <section className="mt-10">
          <SectionHeader
            title="Modules & Lessons"
            description="Edit the automatically generated curriculum before publishing."
          >
            {!isPublished && (
              <button
                type="button"
                onClick={addModule}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add Module
              </button>
            )}
          </SectionHeader>

          {modules.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Layers3 className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-bold text-slate-500">
                No modules generated.
              </p>

              {!isPublished && (
                <button
                  type="button"
                  onClick={addModule}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Create First Module
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => (
                <ModuleEditor
                  key={`module-${index}`}
                  module={module}
                  index={index}
                  total={modules.length}
                  onChange={(next) =>
                    updateModule(index, next)
                  }
                  onDelete={() =>
                    deleteModule(index)
                  }
                  onMoveUp={() =>
                    moveModule(index, "up")
                  }
                  onMoveDown={() =>
                    moveModule(index, "down")
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* PRACTICE */}
        <section className="mt-10">
          <SectionHeader
            title="Questions & Practice"
            description="Review and edit questions extracted from the source material."
          >
            {!isPublished && (
              <button
                type="button"
                onClick={addPractice}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add Practice
              </button>
            )}
          </SectionHeader>

          {practiceTypes.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {practiceTypes.map((item) => (
                <span
                  key={item.key}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600"
                >
                  {getPracticeTypeLabel(
                    item.type,
                  )}{" "}
                  Â· {item.count}
                </span>
              ))}
            </div>
          )}

          {practice.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-bold text-slate-500">
                No practice sections generated.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {practice.map(
                (item, index) => (
                  <PracticeEditor
                    key={`practice-${index}`}
                    practice={item}
                    index={index}
                    onChange={(next) =>
                      updatePractice(
                        index,
                        next,
                      )
                    }
                    onDelete={() =>
                      deletePractice(index)
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>

        {/* SOURCE SECTIONS */}
        <section className="mt-10">
          <SectionHeader
            title="Source Sections"
            description="Original detected sections retained for traceability."
          />

          {sourceSections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No source sections available.
            </div>
          ) : (
            <div className="space-y-4">
              {sourceSections.map(
                (section, index) => (
                  <SourceSectionEditor
                    key={`source-section-${index}`}
                    section={section}
                    index={index}
                    onChange={(next) => {
                      const nextSections =
                        [...sourceSections];

                      nextSections[index] =
                        next;

                      updateDraft({
                        sourceSections:
                          nextSections,
                      });
                    }}
                  />
                ),
              )}
            </div>
          )}
        </section>

        {/* REVIEW WORKFLOW */}
        {!isPublished && (
          <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6 sm:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    Review Workflow
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                    {statusLabel(draft.status)}
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    Save your changes, approve the reviewed
                    curriculum, and publish the course when it
                    is ready for students.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || approving || publishing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saved ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}

                    {saving
                      ? "Saving Changes..."
                      : saved
                        ? "Changes Saved"
                        : "Save Course Draft"}
                  </button>

                  {draft.status === "READY_FOR_REVIEW" && (
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={
                        approving ||
                        saving ||
                        publishing
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {approving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Approve Course
                        </>
                      )}
                    </button>
                  )}

                  {draft.status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={
                        publishing ||
                        saving ||
                        approving
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {publishing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Publish Course
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {(workflowError || workflowSuccess) && (
                <div className="mt-5">
                  {workflowError && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{workflowError}</span>
                    </div>
                  )}

                  {workflowSuccess && !workflowError && (
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{workflowSuccess}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div
                  className={`rounded-xl border px-4 py-3 ${
                    draft.status === "READY_FOR_REVIEW"
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                    Step 1
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    Review & Save
                  </p>
                </div>

                <div
                  className={`rounded-xl border px-4 py-3 ${
                    draft.status === "APPROVED"
                      ? "border-blue-200 bg-blue-50"
                      : draft.status === "PUBLISHED"
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                    Step 2
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    Approve Course
                  </p>
                </div>

                <div
                  className={`rounded-xl border px-4 py-3 ${
                    draft.status === "PUBLISHED"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                    Step 3
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    Publish Course
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {isPublished && (
          <section className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />

              <div>
                <p className="text-sm font-extrabold text-green-900">
                  This course is published
                </p>

                <p className="mt-1 text-sm text-green-700">
                  The published course is now live for
                  students. This draft is locked and cannot
                  be edited from the Review Studio.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <div className="mt-8 pb-8">
          <Link
            href="/admin/course-factory"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Draft Review Center
          </Link>
        </div>
      </div>
    </main>
  );
}
