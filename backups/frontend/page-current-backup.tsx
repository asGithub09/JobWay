"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Layers3,
  Loader2,
  Lock,
  Menu,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import StudentPortalShell from "@/components/student-portal/StudentPortalShell";
import {
  getMyCourse,
  type Course,
  type GetMyCourseResponse,
} from "@/lib/api";

type CourseLesson = {
  title?: string;
  description?: string;
  content?: string;
  keyPoints?: string[];
  bullets?: string[];
  sourceSection?: string;
  order?: number;
};

type CourseModule = {
  title?: string;
  description?: string;
  order?: number;
  lessons?: CourseLesson[];
};

type CoursePracticeQuestion = {
  type?: string;
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  sourceSection?: string;
  order?: number;
};

type CoursePractice = {
  title?: string;
  type?: string;
  description?: string;
  questions?: CoursePracticeQuestion[];
  order?: number;
};

type CourseCurriculum = {
  modules?: CourseModule[];
  practice?: CoursePractice[];
  sourceFileName?: string;
  generationMode?: string;
  detectionMode?: string;
};

type ExtendedCourse = Course & {
  curriculum?: CourseCurriculum;
};

type SelectedLesson = {
  moduleIndex: number;
  lessonIndex: number;
  lesson: CourseLesson;
};

function getCourseCurriculum(course: Course): CourseCurriculum {
  return (course as ExtendedCourse).curriculum || {};
}

function normalizeContent(content?: string) {
  if (!content) {
    return [];
  }

  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function isProbablyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 lg:block">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />

            <div className="mt-5 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-9 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const accessDenied =
    message.toLowerCase().includes("access") ||
    message.toLowerCase().includes("permission") ||
    message.toLowerCase().includes("batch");

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-16">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#E13032]">
            {accessDenied ? (
              <Lock className="h-7 w-7" />
            ) : (
              <BookOpen className="h-7 w-7" />
            )}
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            {accessDenied
              ? "Course access unavailable"
              : "Unable to load course"}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
            {message ||
              "We could not load this course right now. Please try again."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#c92729]"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            <Link
              href="/dashboard/courses"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              My Courses
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function ModuleNavigation({
  modules,
  selectedModuleIndex,
  selectedLessonIndex,
  openModules,
  onToggleModule,
  onSelectLesson,
}: {
  modules: CourseModule[];
  selectedModuleIndex: number;
  selectedLessonIndex: number;
  openModules: Record<number, boolean>;
  onToggleModule: (index: number) => void;
  onSelectLesson: (
    moduleIndex: number,
    lessonIndex: number,
  ) => void;
}) {
  return (
    <div className="space-y-2">
      {modules.map((module, moduleIndex) => {
        const lessons = module.lessons || [];
        const isOpen =
          openModules[moduleIndex] ??
          moduleIndex === selectedModuleIndex;

        return (
          <div
            key={`${module.title || "module"}-${moduleIndex}`}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <button
              type="button"
              onClick={() => onToggleModule(moduleIndex)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                  moduleIndex === selectedModuleIndex
                    ? "bg-red-50 text-[#E13032]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {moduleIndex + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-900">
                  {module.title ||
                    `Module ${moduleIndex + 1}`}
                </p>

                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                  {lessons.length}{" "}
                  {lessons.length === 1
                    ? "lesson"
                    : "lessons"}
                </p>
              </div>

              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen ? (
              <div className="border-t border-slate-100 px-2 py-2">
                {lessons.length > 0 ? (
                  <div className="space-y-1">
                    {lessons.map((lesson, lessonIndex) => {
                      const selected =
                        moduleIndex === selectedModuleIndex &&
                        lessonIndex === selectedLessonIndex;

                      return (
                        <button
                          key={`${lesson.title || "lesson"}-${lessonIndex}`}
                          type="button"
                          onClick={() =>
                            onSelectLesson(
                              moduleIndex,
                              lessonIndex,
                            )
                          }
                          className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                            selected
                              ? "bg-red-50 text-[#E13032]"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              selected
                                ? "bg-[#E13032] text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs font-bold leading-5 ${
                                selected
                                  ? "text-[#E13032]"
                                  : "text-slate-700"
                              }`}
                            >
                              {lesson.title ||
                                `Lesson ${lessonIndex + 1}`}
                            </p>

                            {lesson.description ? (
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                                {lesson.description}
                              </p>
                            ) : null}
                          </div>

                          {selected ? (
                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#E13032]" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-xs text-slate-400">
                    Lessons are being prepared.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function LessonContent({
  lesson,
  module,
  moduleIndex,
  lessonIndex,
}: {
  lesson: CourseLesson;
  module: CourseModule;
  moduleIndex: number;
  lessonIndex: number;
}) {
  const paragraphs = normalizeContent(lesson.content);
  const keyPoints = lesson.keyPoints || [];
  const bullets = lesson.bullets || [];

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Lesson Header */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-red-50 via-white to-orange-50 px-5 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-red-100 px-3 py-1.5 text-red-700">
            Module {moduleIndex + 1}
          </span>

          <span className="text-slate-400">/</span>

          <span className="rounded-full bg-white px-3 py-1.5 text-slate-600 shadow-sm">
            Lesson {lessonIndex + 1}
          </span>
        </div>

        <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          {lesson.title ||
            `Lesson ${lessonIndex + 1}`}
        </h1>

        {lesson.description ? (
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
            {lesson.description}
          </p>
        ) : null}

        {module.title ? (
          <div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-500">
            <Layers3 className="h-4 w-4 text-[#E13032]" />
            {module.title}
          </div>
        ) : null}
      </div>

      {/* Lesson Body */}
      <div className="px-5 py-7 sm:px-8 sm:py-9">
        {keyPoints.length > 0 ? (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#E13032]" />

              <h2 className="text-lg font-black text-slate-900">
                Key Points
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {keyPoints.map((point, index) => (
                <div
                  key={`${point}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#E13032]" />

                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {bullets.length > 0 ? (
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Important Points
            </h2>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <ul className="space-y-3">
                {bullets.map((bullet, index) => (
                  <li
                    key={`${bullet}-${index}`}
                    className="flex items-start gap-3 text-sm leading-7 text-slate-700"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E13032]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* Main Content */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#E13032]" />

            <h2 className="text-lg font-black text-slate-900">
              Lesson Content
            </h2>
          </div>

          {paragraphs.length > 0 ? (
            <div className="space-y-5">
              {paragraphs.map((paragraph, index) => {
                if (isProbablyHtml(paragraph)) {
                  return (
                    <div
                      key={index}
                      className="prose prose-slate max-w-none text-sm leading-7 sm:text-base"
                      dangerouslySetInnerHTML={{
                        __html: paragraph,
                      }}
                    />
                  );
                }

                return (
                  <p
                    key={index}
                    className="text-sm leading-8 text-slate-700 sm:text-base"
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-bold text-slate-600">
                Lesson content is being prepared.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please check back later for the complete lesson.
              </p>
            </div>
          )}
        </section>

        {lesson.sourceSection ? (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Source Section
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {lesson.sourceSection}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function PracticeSection({
  practice,
}: {
  practice: CoursePractice[];
}) {
  if (practice.length === 0) {
    return null;
  }

  const totalQuestions = practice.reduce(
    (total, section) =>
      total + (section.questions?.length || 0),
    0,
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#E13032]">
            <CheckCircle2 className="h-4 w-4" />
            Practice & Revision
          </div>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Test Your Preparation
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Practice sections prepared from your course material.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-slate-50 px-4 py-3 text-center">
          <p className="text-2xl font-black text-slate-900">
            {totalQuestions}
          </p>

          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Questions
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {practice.map((section, index) => (
          <div
            key={`${section.title || "practice"}-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-black text-slate-900">
              {section.title ||
                `Practice ${index + 1}`}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {section.description ||
                "Practice questions from this course section."}
            </p>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Questions
              </span>

              <p className="mt-1 text-xl font-black text-slate-900">
                {section.questions?.length || 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

        <p className="text-xs leading-5 text-amber-800">
          Practice interaction will be connected to the JobWay
          learning and assessment system in the next stage.
        </p>
      </div>
    </section>
  );
}

export default function ProtectedCourseLearningPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [response, setResponse] =
    useState<GetMyCourseResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedModuleIndex, setSelectedModuleIndex] =
    useState(0);

  const [selectedLessonIndex, setSelectedLessonIndex] =
    useState(0);

  const [openModules, setOpenModules] = useState<
    Record<number, boolean>
  >({
    0: true,
  });

  const [mobileNavigationOpen, setMobileNavigationOpen] =
    useState(false);

  async function loadCourse() {
    if (!slug) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getMyCourse(slug);

      if (!result?.success || !result.course) {
        throw new Error(
          "This course is not available to your account.",
        );
      }

      setResponse(result);
    } catch (err) {
      console.error("Protected course load error:", err);

      setResponse(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this course.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourse();
  }, [slug]);

  const course = response?.course || null;

  const curriculum = useMemo(
    () => (course ? getCourseCurriculum(course) : {}),
    [course],
  );

  const modules = curriculum.modules || [];
  const practice = curriculum.practice || [];

  const totalLessons = modules.reduce(
    (total, module) =>
      total + (module.lessons?.length || 0),
    0,
  );

  const selectedLesson = useMemo<SelectedLesson | null>(() => {
    const module = modules[selectedModuleIndex];

    if (!module) {
      return null;
    }

    const lessons = module.lessons || [];
    const lesson = lessons[selectedLessonIndex];

    if (!lesson) {
      return null;
    }

    return {
      moduleIndex: selectedModuleIndex,
      lessonIndex: selectedLessonIndex,
      lesson,
    };
  }, [
    modules,
    selectedModuleIndex,
    selectedLessonIndex,
  ]);

  function toggleModule(index: number) {
    setOpenModules((current) => ({
      ...current,
      [index]: !current[index],
    }));
  }

  function selectLesson(
    moduleIndex: number,
    lessonIndex: number,
  ) {
    setSelectedModuleIndex(moduleIndex);
    setSelectedLessonIndex(lessonIndex);

    setOpenModules((current) => ({
      ...current,
      [moduleIndex]: true,
    }));

    setMobileNavigationOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToPreviousLesson() {
    if (!selectedLesson) {
      return;
    }

    if (selectedLesson.lessonIndex > 0) {
      selectLesson(
        selectedLesson.moduleIndex,
        selectedLesson.lessonIndex - 1,
      );
      return;
    }

    if (selectedLesson.moduleIndex > 0) {
      const previousModule =
        modules[selectedLesson.moduleIndex - 1];

      const previousLessons =
        previousModule?.lessons || [];

      if (previousLessons.length > 0) {
        selectLesson(
          selectedLesson.moduleIndex - 1,
          previousLessons.length - 1,
        );
      }
    }
  }

  function goToNextLesson() {
    if (!selectedLesson) {
      return;
    }

    const currentModule =
      modules[selectedLesson.moduleIndex];

    const currentLessons =
      currentModule?.lessons || [];

    if (
      selectedLesson.lessonIndex <
      currentLessons.length - 1
    ) {
      selectLesson(
        selectedLesson.moduleIndex,
        selectedLesson.lessonIndex + 1,
      );
      return;
    }

    if (selectedLesson.moduleIndex < modules.length - 1) {
      const nextModule =
        modules[selectedLesson.moduleIndex + 1];

      const nextLessons = nextModule?.lessons || [];

      if (nextLessons.length > 0) {
        selectLesson(
          selectedLesson.moduleIndex + 1,
          0,
        );
      }
    }
  }

  const isFirstLesson =
    selectedLesson?.moduleIndex === 0 &&
    selectedLesson?.lessonIndex === 0;

  const isLastLesson = useMemo(() => {
    if (!selectedLesson) {
      return false;
    }

    for (
      let moduleIndex = modules.length - 1;
      moduleIndex >= 0;
      moduleIndex -= 1
    ) {
      const lessons =
        modules[moduleIndex]?.lessons || [];

      if (lessons.length > 0) {
        return (
          selectedLesson.moduleIndex === moduleIndex &&
          selectedLesson.lessonIndex ===
            lessons.length - 1
        );
      }
    }

    return false;
  }, [modules, selectedLesson]);

  if (loading) {
    return (
      <StudentPortalShell>
        <LoadingState />
      </StudentPortalShell>
    );
  }

  if (error || !course) {
    return (
      <StudentPortalShell>
        <ErrorState
          message={error}
          onRetry={() => void loadCourse()}
        />
      </StudentPortalShell>
    );
  }

  return (
    <StudentPortalShell>
      <div className="min-h-screen bg-slate-50">
        {/* =====================================================
            TOP COURSE BAR
           ===================================================== */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Link
              href="/dashboard/courses"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-red-50 hover:text-[#E13032]"
              aria-label="Back to My Courses"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-slate-900">
                {course.title}
              </p>

              <div className="mt-0.5 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <span>
                  {response?.batch?.name ||
                    "Student Learning"}
                </span>

                {response?.batch?.code ? (
                  <>
                    <span>•</span>
                    <span>{response.batch.code}</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 sm:flex">
              <ShieldCheck className="h-4 w-4" />
              Access Active
            </div>

            <button
              type="button"
              onClick={() =>
                setMobileNavigationOpen(
                  (current) => !current,
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
              aria-label={
                mobileNavigationOpen
                  ? "Close course navigation"
                  : "Open course navigation"
              }
            >
              {mobileNavigationOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>

        {/* =====================================================
            COURSE SUMMARY
           ===================================================== */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#E13032]">
                    My Course
                  </span>

                  {course.category ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {course.category}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-3 truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  {course.title}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Layers3 className="h-3.5 w-3.5 text-[#E13032]" />
                    {modules.length}{" "}
                    {modules.length === 1
                      ? "Module"
                      : "Modules"}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <PlayCircle className="h-3.5 w-3.5 text-[#E13032]" />
                    {totalLessons}{" "}
                    {totalLessons === 1
                      ? "Lesson"
                      : "Lessons"}
                  </span>

                  {course.duration ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 text-[#E13032]" />
                      {course.duration}
                    </span>
                  ) : null}

                  {course.level ? (
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-[#E13032]" />
                      {course.level}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:flex">
                <BookOpen className="h-5 w-5 text-[#E13032]" />

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Learning
                  </p>

                  <p className="text-sm font-black text-slate-800">
                    Start at your own pace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MOBILE NAVIGATION
           ===================================================== */}
        {mobileNavigationOpen ? (
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 lg:hidden">
            <div className="mx-auto max-w-[1500px]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[#E13032]">
                    Course Contents
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    {modules.length} modules
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-slate-500 shadow-sm">
                  {totalLessons} lessons
                </span>
              </div>

              <ModuleNavigation
                modules={modules}
                selectedModuleIndex={
                  selectedModuleIndex
                }
                selectedLessonIndex={
                  selectedLessonIndex
                }
                openModules={openModules}
                onToggleModule={toggleModule}
                onSelectLesson={selectLesson}
              />
            </div>
          </div>
        ) : null}

        {/* =====================================================
            MAIN LEARNING AREA
           ===================================================== */}
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
            {/* Desktop Navigation */}
            <aside className="hidden lg:block">
              <div className="sticky top-[145px] max-h-[calc(100vh-165px)] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-5 flex items-center justify-between px-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#E13032]">
                      Course Contents
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      {modules.length}{" "}
                      {modules.length === 1
                        ? "Module"
                        : "Modules"}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </div>

                {modules.length > 0 ? (
                  <ModuleNavigation
                    modules={modules}
                    selectedModuleIndex={
                      selectedModuleIndex
                    }
                    selectedLessonIndex={
                      selectedLessonIndex
                    }
                    openModules={openModules}
                    onToggleModule={toggleModule}
                    onSelectLesson={selectLesson}
                  />
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-5 text-center">
                    <BookOpen className="mx-auto h-7 w-7 text-slate-300" />

                    <p className="mt-3 text-xs font-bold text-slate-500">
                      Curriculum is being prepared.
                    </p>
                  </div>
                )}
              </div>
            </aside>

            {/* Content */}
            <div className="min-w-0 space-y-6">
              {selectedLesson ? (
                <>
                  <LessonContent
                    lesson={selectedLesson.lesson}
                    module={
                      modules[selectedLesson.moduleIndex]
                    }
                    moduleIndex={
                      selectedLesson.moduleIndex
                    }
                    lessonIndex={
                      selectedLesson.lessonIndex
                    }
                  />

                  {/* Lesson Navigation */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={goToPreviousLesson}
                        disabled={isFirstLesson}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[#E13032] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous Lesson
                      </button>

                      <div className="order-first text-center sm:order-none">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Current Lesson
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-600">
                          Module{" "}
                          {selectedLesson.moduleIndex +
                            1}{" "}
                          · Lesson{" "}
                          {selectedLesson.lessonIndex +
                            1}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={goToNextLesson}
                        disabled={isLastLesson}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[#c92729] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next Lesson
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span>
                          Lesson{" "}
                          {selectedLesson.lessonIndex +
                            1}{" "}
                          of{" "}
                          {
                            (
                              modules[
                                selectedLesson
                                  .moduleIndex
                              ]?.lessons || []
                            ).length
                          }
                        </span>

                        <span>
                          Module{" "}
                          {selectedLesson.moduleIndex +
                            1}{" "}
                          of {modules.length}
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#E13032] transition-all duration-300"
                          style={{
                            width: `${
                              (
                                ((selectedLesson.lessonIndex +
                                  1) /
                                  Math.max(
                                    (
                                      modules[
                                        selectedLesson
                                          .moduleIndex
                                      ]?.lessons || []
                                    ).length,
                                    1,
                                  )) *
                                100
                              )
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

                  <h2 className="mt-4 text-xl font-black text-slate-900">
                    No lesson selected
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Select a lesson from the course contents
                    to begin learning.
                  </p>
                </div>
              )}

              <PracticeSection practice={practice} />

              {/* Course Protection Notice */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Protected Student Learning
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    This course is available through your current
                    JobWay batch. Your access is verified by the
                    JobWay server.
                  </p>
                </div>
              </div>

              {/* Back to Courses */}
              <div className="pb-4">
                <Link
                  href="/dashboard/courses"
                  className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition-colors hover:text-[#E13032]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to My Courses
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </StudentPortalShell>
  );
}