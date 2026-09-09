"use client";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Edit3,
  GraduationCap,
  Languages,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";

type CourseStatus = "DRAFT" | "PUBLISHED";

interface Lesson {
  id?: string;
  title: string;
  description: string;
  content: string;
  keyPoints: string[];
  bullets: string[];
  sourceSection?: string;
  order?: number;
}

interface CourseModule {
  id?: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order?: number;
}

interface EducatorCourse {
  id: string;
  draftId?: string | null;
  title: string;
  slug: string;
  category: string;
  level: string;
  description: string;
  bannerImage: string;
  duration: string;
  language: string;
  price: number;
  discountPrice: number;
  features: string[];
  modules: CourseModule[];
  status: CourseStatus;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE_URL = "/api";

export default function EducatorCourseManagePage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const courseId =
    typeof params?.id === "string"
      ? params.id
      : "";

  const [course, setCourse] =
    useState<EducatorCourse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [expandedModules, setExpandedModules] =
    useState<Record<string, boolean>>({});

  const fetchCourse = useCallback(async () => {
    if (!courseId || !token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/educator/courses/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load course."
        );
      }

      setCourse(data.course || null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load course."
      );
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => {
    if (user?.role !== "educator") {
      return;
    }

    fetchCourse();
  }, [
    user?.role,
    fetchCourse,
  ]);

  const updateCourseField = <
    K extends keyof EducatorCourse
  >(
    field: K,
    value: EducatorCourse[K]
  ) => {
    setCourse((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const updateModule = (
    moduleIndex: number,
    field: "title" | "description",
    value: string
  ) => {
    setCourse((current) => {
      if (!current) {
        return current;
      }

      const modules = [...current.modules];

      modules[moduleIndex] = {
        ...modules[moduleIndex],
        [field]: value,
      };

      return {
        ...current,
        modules,
      };
    });
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field:
      | "title"
      | "description"
      | "content",
    value: string
  ) => {
    setCourse((current) => {
      if (!current) {
        return current;
      }

      const modules = [...current.modules];

      const lessons = [
        ...modules[moduleIndex].lessons,
      ];

      lessons[lessonIndex] = {
        ...lessons[lessonIndex],
        [field]: value,
      };

      modules[moduleIndex] = {
        ...modules[moduleIndex],
        lessons,
      };

      return {
        ...current,
        modules,
      };
    });
  };

  const toggleModule = (
    moduleIndex: number
  ) => {
    setExpandedModules((current) => ({
      ...current,
      [String(moduleIndex)]:
        !current[String(moduleIndex)],
    }));
  };

  const handleSave = async () => {
    if (!course || !token) {
      return;
    }

    if (course.status === "PUBLISHED") {
      setError(
        "Published courses cannot be edited."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/educator/courses/${course.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: course.title,
            category: course.category,
            level: course.level,
            description: course.description,
            bannerImage:
              course.bannerImage,
            duration: course.duration,
            language: course.language,
            price: course.price,
            discountPrice:
              course.discountPrice,
            features: course.features,
            modules: course.modules,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to save course."
        );
      }

      setCourse(data.course || course);

      setSuccess(
        "Course changes saved successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save course."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!course || !token) {
      return;
    }

    const confirmed =
      window.confirm(
        `Publish "${course.title}"?\n\nOnce published, this course cannot be edited or deleted in the current educator workflow.`
      );

    if (!confirmed) {
      return;
    }

    setPublishing(true);
    setError("");
    setSuccess("");

    try {
      const saveResponse =
        await fetch(
          `${API_BASE_URL}/educator/courses/${course.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: course.title,
              category:
                course.category,
              level: course.level,
              description:
                course.description,
              bannerImage:
                course.bannerImage,
              duration:
                course.duration,
              language:
                course.language,
              price: course.price,
              discountPrice:
                course.discountPrice,
              features:
                course.features,
              modules:
                course.modules,
            }),
          }
        );

      const saveData =
        await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveData?.message ||
            "Failed to save course before publishing."
        );
      }

      const publishResponse =
        await fetch(
          `${API_BASE_URL}/educator/courses/${course.id}/publish`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const publishData =
        await publishResponse.json();

      if (!publishResponse.ok) {
        throw new Error(
          publishData?.message ||
            "Failed to publish course."
        );
      }

      setCourse(
        publishData.course || {
          ...course,
          status: "PUBLISHED",
          publishedAt:
            new Date().toISOString(),
        }
      );

      setSuccess(
        "Course published successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish course."
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!course || !token) {
      return;
    }

    if (course.status === "PUBLISHED") {
      setError(
        "Published courses cannot be deleted."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${course.title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/educator/courses/${course.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete course."
        );
      }

      router.push(
        "/educator/courses"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete course."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[500px] max-w-[1400px] items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#E13032]" />
            <p className="text-sm font-semibold">
              Loading course...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <section className="rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#E13032]">
              <GraduationCap className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-950">
              Course not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "The requested educator course could not be loaded."}
            </p>

            <Link
              href="/educator/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const isPublished =
    course.status === "PUBLISHED";

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6">
          <Link
            href="/educator/courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        <section className="mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-800 to-red-900 px-6 py-8 sm:px-8">
            <div className="absolute right-0 top-0 opacity-10">
              <GraduationCap className="h-56 w-56" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em]",
                    isPublished
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700",
                  ].join(" ")}
                >
                  {course.status}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                  {course.category}
                </span>
              </div>

              <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                {course.title}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
                {isPublished
                  ? "This course is published. Published courses are read-only in the current educator workflow."
                  : "Review and manage the saved course before publishing it."}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#E13032]">
                  <Edit3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Course Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Basic information used for the course listing.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Course Title
                  </label>

                  <input
                    type="text"
                    value={course.title}
                    disabled={isPublished}
                    onChange={(event) =>
                      updateCourseField(
                        "title",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Category
                  </label>

                  <input
                    type="text"
                    value={course.category}
                    disabled={isPublished}
                    onChange={(event) =>
                      updateCourseField(
                        "category",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Level
                  </label>

                  <input
                    type="text"
                    value={course.level}
                    disabled={isPublished}
                    onChange={(event) =>
                      updateCourseField(
                        "level",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Duration
                  </label>

                  <input
                    type="text"
                    value={course.duration}
                    disabled={isPublished}
                    onChange={(event) =>
                      updateCourseField(
                        "duration",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Language
                  </label>

                  <input
                    type="text"
                    value={course.language}
                    disabled={isPublished}
                    onChange={(event) =>
                      updateCourseField(
                        "language",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Description
                  </label>

                  <textarea
                    rows={5}
                    value={course.description}
                    disabled={isPublished}
                    onChange={(event) =>
                      updateCourseField(
                        "description",
                        event.target.value
                      )
                    }
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      Course Curriculum
                    </h2>

                    <p className="text-sm text-slate-500">
                      {course.modules.length} modules generated for this course.
                    </p>
                  </div>
                </div>
              </div>

              {course.modules.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                  <BookOpen className="mx-auto h-7 w-7 text-slate-400" />

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    No curriculum modules have been added yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {course.modules.map(
                    (module, moduleIndex) => {
                      const moduleKey =
                        String(moduleIndex);

                      const expanded =
                        expandedModules[
                          moduleKey
                        ] ?? true;

                      return (
                        <div
                          key={
                            module.id ||
                            moduleKey
                          }
                          className="overflow-hidden rounded-2xl border border-slate-200"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleModule(
                                moduleIndex
                              )
                            }
                            className="flex w-full items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left transition hover:bg-slate-100"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-[11px] font-black text-white">
                                  {moduleIndex + 1}
                                </span>

                                <span className="truncate text-sm font-black text-slate-950">
                                  {module.title ||
                                    `Module ${moduleIndex + 1}`}
                                </span>
                              </div>

                              <p className="mt-1 pl-9 text-xs text-slate-500">
                                {module.lessons.length} lessons
                              </p>
                            </div>

                            {expanded ? (
                              <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                            )}
                          </button>

                          {expanded && (
                            <div className="space-y-4 p-5">
                              {!isPublished && (
                                <div className="grid gap-4">
                                  <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                                      Module Title
                                    </label>

                                    <input
                                      type="text"
                                      value={
                                        module.title
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateModule(
                                          moduleIndex,
                                          "title",
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                                      Module Description
                                    </label>

                                    <textarea
                                      rows={2}
                                      value={
                                        module.description
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateModule(
                                          moduleIndex,
                                          "description",
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                                    />
                                  </div>
                                </div>
                              )}

                              {module.lessons.length ===
                              0 ? (
                                <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                                  No lessons in this module.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {module.lessons.map(
                                    (
                                      lesson,
                                      lessonIndex
                                    ) => (
                                      <div
                                        key={
                                          lesson.id ||
                                          `${moduleIndex}-${lessonIndex}`
                                        }
                                        className="rounded-2xl border border-slate-200 bg-white p-4"
                                      >
                                        <div className="mb-4 flex items-start gap-3">
                                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[11px] font-black text-[#E13032]">
                                            {lessonIndex +
                                              1}
                                          </span>

                                          <div className="min-w-0 flex-1">
                                            {!isPublished ? (
                                              <input
                                                type="text"
                                                value={
                                                  lesson.title
                                                }
                                                onChange={(
                                                  event
                                                ) =>
                                                  updateLesson(
                                                    moduleIndex,
                                                    lessonIndex,
                                                    "title",
                                                    event
                                                      .target
                                                      .value
                                                  )
                                                }
                                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-950 outline-none focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                                              />
                                            ) : (
                                              <h3 className="text-sm font-black text-slate-950">
                                                {lesson.title}
                                              </h3>
                                            )}
                                          </div>
                                        </div>

                                        {!isPublished ? (
                                          <div className="space-y-4">
                                            <div>
                                              <label className="mb-2 block text-xs font-bold text-slate-400">
                                                Lesson Description
                                              </label>

                                              <textarea
                                                rows={2}
                                                value={
                                                  lesson.description
                                                }
                                                onChange={(
                                                  event
                                                ) =>
                                                  updateLesson(
                                                    moduleIndex,
                                                    lessonIndex,
                                                    "description",
                                                    event
                                                      .target
                                                      .value
                                                  )
                                                }
                                                className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                                              />
                                            </div>

                                            <div>
                                              <label className="mb-2 block text-xs font-bold text-slate-400">
                                                Lesson Content
                                              </label>

                                              <textarea
                                                rows={7}
                                                value={
                                                  lesson.content
                                                }
                                                onChange={(
                                                  event
                                                ) =>
                                                  updateLesson(
                                                    moduleIndex,
                                                    lessonIndex,
                                                    "content",
                                                    event
                                                      .target
                                                      .value
                                                  )
                                                }
                                                className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            {lesson.description && (
                                              <p className="mb-3 text-sm leading-6 text-slate-600">
                                                {
                                                  lesson.description
                                                }
                                              </p>
                                            )}

                                            {lesson.content && (
                                              <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                                                {
                                                  lesson.content
                                                }
                                              </div>
                                            )}
                                          </>
                                        )}

                                        {lesson.keyPoints?.length >
                                          0 && (
                                          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                                            <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">
                                              Key Points
                                            </p>

                                            <ul className="mt-2 space-y-1.5">
                                              {lesson.keyPoints.map(
                                                (
                                                  point,
                                                  pointIndex
                                                ) => (
                                                  <li
                                                    key={
                                                      pointIndex
                                                    }
                                                    className="flex gap-2 text-sm leading-6 text-slate-700"
                                                  >
                                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                                    <span>
                                                      {point}
                                                    </span>
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        )}

                                        {lesson.bullets?.length >
                                          0 && (
                                          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                                            <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-700">
                                              Lesson Points
                                            </p>

                                            <ul className="mt-2 space-y-1.5">
                                              {lesson.bullets.map(
                                                (
                                                  bullet,
                                                  bulletIndex
                                                ) => (
                                                  <li
                                                    key={
                                                      bulletIndex
                                                    }
                                                    className="flex gap-2 text-sm leading-6 text-slate-700"
                                                  >
                                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                                    <span>
                                                      {bullet}
                                                    </span>
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-slate-400">
                Course Overview
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">
                      Modules
                    </span>
                  </div>

                  <span className="text-sm font-black text-slate-950">
                    {course.modules.length}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">
                      Lessons
                    </span>
                  </div>

                  <span className="text-sm font-black text-slate-950">
                    {course.modules.reduce(
                      (total, module) =>
                        total +
                        module.lessons.length,
                      0
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">
                      Duration
                    </span>
                  </div>

                  <span className="max-w-[150px] truncate text-right text-sm font-black text-slate-950">
                    {course.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">
                      Language
                    </span>
                  </div>

                  <span className="max-w-[150px] truncate text-right text-sm font-black text-slate-950">
                    {course.language}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-slate-400">
                Course Status
              </h2>

              <div
                className={[
                  "mt-4 rounded-2xl border p-4",
                  isPublished
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  {isPublished ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Clock3 className="h-5 w-5 text-amber-600" />
                  )}

                  <div>
                    <p
                      className={[
                        "text-sm font-black",
                        isPublished
                          ? "text-emerald-800"
                          : "text-amber-800",
                      ].join(" ")}
                    >
                      {isPublished
                        ? "Published"
                        : "Draft"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {isPublished
                        ? "Course is live."
                        : "Course is ready for editing or publishing."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {!isPublished && (
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-slate-400">
                  Actions
                </h2>

                <div className="mt-4 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                      saving ||
                      publishing ||
                      deleting
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}

                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={
                      saving ||
                      publishing ||
                      deleting
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {publishing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}

                    {publishing
                      ? "Publishing..."
                      : "Publish Course"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={
                      saving ||
                      publishing ||
                      deleting
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}

                    {deleting
                      ? "Deleting..."
                      : "Delete Draft"}
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-[24px] border border-blue-100 bg-blue-50/60 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Upload className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-950">
                    Course material
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    This course can be generated from educator-provided PDF, DOCX, XLSX or XLS teaching material.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}