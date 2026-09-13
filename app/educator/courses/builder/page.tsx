"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Music,
  Plus,
  Save,
  Trash2,
  Video,
  Link as LinkIcon,
  Brain,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { request } from "@/lib/api";

type ItemType =
  | "TEXT"
  | "VIDEO"
  | "AUDIO"
  | "IMAGE"
  | "RESOURCE"
  | "PRACTICE"
  | "CHECKPOINT";

type CheckpointQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type CourseItem = {
  id: string;
  title: string;
  type: ItemType;
  content: string;
  url: string;
  media?: {
    url: string;
    publicId: string;
    resourceType: string;
    fileName: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    duration?: number;
  };  questions: CheckpointQuestion[];
};

type CourseModule = {
  id: string;
  title: string;
  description: string;
  items: CourseItem[];
};

const ITEM_TYPES: ItemType[] = [
  "TEXT",
  "VIDEO",
  "AUDIO",
  "IMAGE",
  "RESOURCE",
  "PRACTICE",
  "CHECKPOINT",
];

function createItem(type: ItemType = "TEXT"): CourseItem {
  return {
    id: crypto.randomUUID(),
    title:
      type === "CHECKPOINT"
        ? "New Checkpoint"
        : `New ${type.charAt(0) + type.slice(1).toLowerCase()}`,
    type,
    content: "",
    url: "",
    questions:
      type === "CHECKPOINT"
        ? [
            {
              question: "",
              options: ["", "", "", ""],
              correctAnswer: 0,
              explanation: "",
            },
          ]
        : [],
  };
}

function createModule(index: number): CourseModule {
  return {
    id: crypto.randomUUID(),
    title: `Module ${index}`,
    description: "",
    items: [],
  };
}

function itemIcon(type: ItemType) {
  if (type === "VIDEO") return Video;
  if (type === "AUDIO") return Music;
  if (type === "IMAGE") return ImageIcon;
  if (type === "RESOURCE") return LinkIcon;
  if (type === "CHECKPOINT") return Brain;
  return FileText;
}

export default function V2CourseBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [language, setLanguage] = useState("English");

  const [modules, setModules] = useState<CourseModule[]>([
    createModule(1),
  ]);

  const [openModules, setOpenModules] = useState<
    Record<string, boolean>
  >({});

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [importingPdf, setImportingPdf] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [courseId, setCourseId] = useState("");
  const [uploadingVideoItemId, setUploadingVideoItemId] = useState<string | null>(null);

  useEffect(() => {
    const draftId = searchParams.get("id");

    if (!draftId || !token) {
      return;
    }

    let cancelled = false;

    const loadDraft = async () => {
      try {
        setError("");
        setMessage("");

        const data = await request<{
          success?: boolean;
          course?: {
            _id?: string;
            title?: string;
            description?: string;
            category?: string;
            level?: string;
            language?: string;
            modules?: Array<{
              _id?: string;
              title?: string;
              description?: string;
              order?: number;
              items?: Array<{
                _id?: string;
                title?: string;
                type?: ItemType;
                content?: string;
                url?: string;
                media?: {
                  url?: string;
                  publicId?: string;
                  resourceType?: string;
                  fileName?: string;
                  mimeType?: string;
                  size?: number;
                  width?: number;
                  height?: number;
                  duration?: number;
                };
                order?: number;
                questions?: Array<{
                  question?: string;
                  options?: string[];
                  correctAnswer?: number;
                  explanation?: string;
                }>;
              }>;
            }>;
          };
        }>(`/courses-v2/${encodeURIComponent(draftId)}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) {
          return;
        }

        const course = data.course;

        if (!course) {
          throw new Error("Saved course could not be loaded.");
        }

        setCourseId(course._id || draftId);
        setTitle(course.title || "");
        setDescription(course.description || "");
        setCategory(course.category || "");
        setLevel(course.level || "Beginner");
        setLanguage(course.language || "English");

        const loadedModules: CourseModule[] =
          (course.modules || []).map((module, moduleIndex) => ({
            id: module._id || crypto.randomUUID(),
            title: module.title || `Module ${moduleIndex + 1}`,
            description: module.description || "",
            items: (module.items || []).map((item) => ({
              id: item._id || crypto.randomUUID(),
              title: item.title || "",
              type: item.type || "TEXT",
              content: item.content || "",
              url: item.url || "",
              media: item.media
                ? {
                    url: item.media.url || "",
                    publicId: item.media.publicId || "",
                    resourceType:
                      item.media.resourceType || "",
                    fileName:
                      item.media.fileName || "",
                    mimeType:
                      item.media.mimeType || "",
                    size: Number(item.media.size || 0),
                    width: item.media.width,
                    height: item.media.height,
                    duration: item.media.duration,
                  }
                : undefined,
              questions:
                item.type === "CHECKPOINT"
                  ? (item.questions || []).map((question) => ({
                      question: question.question || "",
                      options: [
                        question.options?.[0] || "",
                        question.options?.[1] || "",
                        question.options?.[2] || "",
                        question.options?.[3] || "",
                      ],
                      correctAnswer:
                        typeof question.correctAnswer === "number"
                          ? question.correctAnswer
                          : 0,
                      explanation: question.explanation || "",
                    }))
                  : [],
            })),
          }));

        setModules(
          loadedModules.length > 0
            ? loadedModules
            : [createModule(1)]
        );

        setOpenModules(
          Object.fromEntries(
            loadedModules.map((module) => [module.id, true])
          )
        );

        setMessage("Draft loaded successfully.");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load the saved draft."
        );
      }
    };

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, [searchParams, token]);

  const importPdf = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setMessage("");
      return;
    }

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setImportingPdf(true);
      setError("");
      setMessage("Uploading PDF and generating course with Gemini...");

      const formData = new FormData();
      formData.append("file", file);

      const data = await request<{
        success?: boolean;
        message?: string;
        course?: {
          _id?: string;
          title?: string;
          description?: string;
          category?: string;
          level?: string;
          language?: string;
          modules?: Array<{
            _id?: string;
            title?: string;
            description?: string;
            order?: number;
            items?: Array<{
              _id?: string;
              title?: string;
              type?: ItemType;
              content?: string;
              url?: string;
              resourceUrl?: string;
              questions?: Array<{
                question?: string;
                options?: string[];
                correctAnswer?: number;
                explanation?: string;
              }>;
            }>;
          }>;
        };
      }>("/courses-v2/ai/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const course = data.course;

      if (!course) {
        throw new Error(
          data.message ||
            "Gemini did not return a generated course."
        );
      }

      setCourseId(course._id || "");
      setTitle(course.title || "");
      setDescription(course.description || "");
      setCategory(course.category || "");
      setLevel(course.level || "Beginner");
      setLanguage(course.language || "English");

      const importedModules: CourseModule[] =
        (course.modules || []).map(
          (module, moduleIndex) => ({
            id:
              module._id ||
              crypto.randomUUID(),
            title:
              module.title ||
              `Module ${moduleIndex + 1}`,
            description:
              module.description || "",
            items:
              (module.items || []).map(
                (item) => ({
                  id:
                    item._id ||
                    crypto.randomUUID(),
                  title:
                    item.title || "",
                  type:
                    item.type || "TEXT",
                  content:
                    item.content || "",
                  url:
                    item.url ||
                    item.resourceUrl ||
                    "",
                  questions:
                    item.type === "CHECKPOINT"
                      ? (item.questions || []).map(
                          (question) => ({
                            question:
                              question.question ||
                              "",
                            options: [
                              question.options?.[0] ||
                                "",
                              question.options?.[1] ||
                                "",
                              question.options?.[2] ||
                                "",
                              question.options?.[3] ||
                                "",
                            ],
                            correctAnswer:
                              typeof question.correctAnswer ===
                              "number"
                                ? question.correctAnswer
                                : 0,
                            explanation:
                              question.explanation ||
                              "",
                          })
                        )
                      : [],
                })
              ),
          })
        );

      setModules(
        importedModules.length > 0
          ? importedModules
          : [createModule(1)]
      );

      setOpenModules(
        Object.fromEntries(
          importedModules.map(
            (module) => [module.id, true]
          )
        )
      );

      setMessage(
        "PDF imported successfully. Gemini generated the course draft. Please review the content before publishing."
      );
    } catch (err) {
      setMessage("");
      setError(
        err instanceof Error
          ? err.message
          : "Unable to import the PDF."
      );
    } finally {
      setImportingPdf(false);
    }
  };

  const updateModule = (
    moduleId: string,
    field: "title" | "description",
    value: string
  ) => {
    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? { ...module, [field]: value }
          : module
      )
    );
  };

  const addModule = () => {
    setModules((current) => [
      ...current,
      createModule(current.length + 1),
    ]);
  };

  const removeModule = (moduleId: string) => {
    setModules((current) =>
      current.filter((module) => module.id !== moduleId)
    );
  };

  const addItem = (
    moduleId: string,
    type: ItemType
  ) => {
    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              items: [...module.items, createItem(type)],
            }
          : module
      )
    );
  };

  const removeItem = (
    moduleId: string,
    itemId: string
  ) => {
    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              items: module.items.filter(
                (item) => item.id !== itemId
              ),
            }
          : module
      )
    );
  };

  const updateItem = (
    moduleId: string,
    itemId: string,
    patch: Partial<CourseItem>
  ) => {
    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              items: module.items.map((item) =>
                item.id === itemId
                  ? { ...item, ...patch }
                  : item
              ),
            }
          : module
      )
    );
  };

  const updateQuestion = (
    moduleId: string,
    itemId: string,
    questionIndex: number,
    patch: Partial<CheckpointQuestion>
  ) => {
    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              items: module.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      questions: item.questions.map(
                        (question, index) =>
                          index === questionIndex
                            ? {
                                ...question,
                                ...patch,
                              }
                            : question
                      ),
                    }
                  : item
              ),
            }
          : module
      )
    );
  };

  const addQuestion = (
    moduleId: string,
    itemId: string
  ) => {
    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              items: module.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      questions: [
                        ...item.questions,
                        {
                          question: "",
                          options: ["", "", "", ""],
                          correctAnswer: 0,
                          explanation: "",
                        },
                      ],
                    }
                  : item
              ),
            }
          : module
      )
    );
  };

  const removeQuestion = (
    moduleId: string,
    itemId: string,
    questionIndex: number
  ) => {
    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              items: module.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      questions: item.questions.filter(
                        (_, index) =>
                          index !== questionIndex
                      ),
                    }
                  : item
              ),
            }
          : module
      )
    );
  };

  const uploadVideo = async (
    moduleId: string,
    itemId: string,
    file: File
  ) => {
    if (!token) {
      router.push("/login");
      return;
    }

    setUploadingVideoItemId(itemId);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "VIDEO");

      const data = await request<{
        success?: boolean;
        message?: string;
        url?: string;
        publicId?: string;
        file?: {
          originalName?: string;
          mimeType?: string;
          fileSize?: number;
          resourceType?: string;
          width?: number;
          height?: number;
          duration?: number;
        };
      }>("/courses-v2/media/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!data.url || !data.publicId) {
        throw new Error(
          data.message ||
            "Video upload did not return a valid media URL."
        );
      }

      updateItem(moduleId, itemId, {
        url: data.url,
        media: {
          url: data.url,
          publicId: data.publicId,
          resourceType:
            data.file?.resourceType || "video",
          fileName:
            data.file?.originalName || file.name,
          mimeType:
            data.file?.mimeType || file.type,
          size:
            Number(data.file?.fileSize || file.size),
          width: data.file?.width,
          height: data.file?.height,
          duration: data.file?.duration,
        },
      });

      setMessage(
        `${data.file?.originalName || file.name} uploaded successfully.`
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload video."
      );
    } finally {
      setUploadingVideoItemId(null);
    }
  };
  const buildPayload = () => ({
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    level,
    language,
    modules: modules.map((module, moduleIndex) => ({
      title: module.title.trim(),
      description: module.description.trim(),
      order: moduleIndex + 1,
      items: module.items.map((item, itemIndex) => ({
        title: item.title.trim(),
        type: item.type,
        content: item.content,
        url: item.url,
        order: itemIndex + 1,
        questions:
          item.type === "CHECKPOINT"
            ? item.questions.map((question) => ({
                question: question.question.trim(),
                options: question.options.map(
                  (option) => option.trim()
                ),
                correctAnswer: question.correctAnswer,
                explanation:
                  question.explanation.trim(),
              }))
            : [],
      })),
    })),
  });

  const saveDraft = async (
    shouldPublish = false
  ) => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setError("Course title is required.");
      return;
    }

    setError("");
    setMessage("");

    if (shouldPublish) {
      setPublishing(true);
    } else {
      setSaving(true);
    }

    try {
      const payload = buildPayload();

      let data: {
        success?: boolean;
        message?: string;
        course?: {
          _id?: string;
        };
      };

      if (!courseId) {
        data = await request("/courses-v2", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        data = await request(
          `/courses-v2/${encodeURIComponent(courseId)}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }

      const savedCourse = data.course;

      if (savedCourse?._id) {
        setCourseId(savedCourse._id);
      }

      if (shouldPublish) {
        const publishId =
          savedCourse?._id || courseId;

        if (!publishId) {
          throw new Error(
            "Course was saved but no course ID was returned."
          );
        }

        const publishData = await request<{
          success?: boolean;
          message?: string;
          assignedBatchCount?: number;
          course?: {
            _id?: string;
          };
        }>(
          `/courses-v2/${encodeURIComponent(publishId)}/publish`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessage(
          `Course published successfully. Assigned to ${
            publishData?.assignedBatchCount ?? 0
          } active batch(es).`
        );
      } else {
        setMessage("V2 course draft saved successfully.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules((current) => ({
      ...current,
      [moduleId]: !current[moduleId],
    }));
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/educator/courses")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <BookOpen className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-red-600">
                  V2_BUILDER
                </p>
                <h1 className="text-3xl font-black tracking-tight text-slate-950">
                  Course Builder
                </h1>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => saveDraft(false)}
              disabled={saving || publishing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={() => saveDraft(true)}
              disabled={saving || publishing}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E13032] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-100 hover:bg-[#c92729] disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {publishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Course Details
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              Basic information
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Course Title *
              </span>
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Complete HTML Fundamentals"
                className={inputClass}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Category *
              </span>
              <input
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                placeholder="e.g. Web Development"
                className={inputClass}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Level
              </span>
              <select
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value)
                }
                className={inputClass}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>All Levels</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Language
              </span>
              <input
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value)
                }
                className={inputClass}
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Description *
              </span>
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={5}
                maxLength={2000}
                placeholder="Describe what students will learn..."
                className={inputClass}
              />
              <span className="mt-1 block text-right text-xs text-slate-400">
                {description.length}/2000
              </span>
            </label>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Curriculum
              </p>
              <h2 className="text-2xl font-black text-slate-950">
                Learning Journey
              </h2>
            </div>

            <label
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 ${
                importingPdf ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={importPdf}
                disabled={importingPdf}
              />
              {importingPdf ? "Importing PDF..." : "Import PDF"}
            </label>
            <button
              type="button"
              onClick={addModule}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Module
            </button>
          </div>

          {modules.map((module, moduleIndex) => {
            const isOpen =
              openModules[module.id] ??
              moduleIndex === 0;

            return (
              <article
                key={module.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
                    {moduleIndex + 1}
                  </div>

                  <input
                    value={module.title}
                    onChange={(event) =>
                      updateModule(
                        module.id,
                        "title",
                        event.target.value
                      )
                    }
                    className="min-w-0 flex-1 border-0 bg-transparent text-lg font-black text-slate-950 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      toggleModule(module.id)
                    }
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeModule(module.id)
                    }
                    disabled={modules.length === 1}
                    className="rounded-xl p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Delete module"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {isOpen && (
                  <div className="space-y-5 p-5">
                    <textarea
                      value={module.description}
                      onChange={(event) =>
                        updateModule(
                          module.id,
                          "description",
                          event.target.value
                        )
                      }
                      rows={2}
                      placeholder="Module description (optional)"
                      className={inputClass}
                    />

                    <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-3">
                      {ITEM_TYPES.map((type) => {
                        const Icon = itemIcon(type);

                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              addItem(module.id, type)
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {type}
                          </button>
                        );
                      })}
                    </div>

                    {module.items.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center">
                        <FileText className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          No learning items yet.
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Choose an item type above to start.
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {module.items.map(
                        (item, itemIndex) => {
                          const Icon = itemIcon(
                            item.type
                          );

                          return (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-slate-200 bg-white p-5"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                  <Icon className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                      {itemIndex + 1}
                                    </span>
                                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-600">
                                      {item.type}
                                    </span>
                                  </div>

                                  <input
                                    value={item.title}
                                    onChange={(event) =>
                                      updateItem(
                                        module.id,
                                        item.id,
                                        {
                                          title:
                                            event.target
                                              .value,
                                        }
                                      )
                                    }
                                    placeholder="Learning item title"
                                    className={`${inputClass} mb-3`}
                                  />

                                  {item.type ===
                                    "TEXT" ||
                                  item.type ===
                                    "PRACTICE" ? (
                                    <textarea
                                      value={
                                        item.content
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateItem(
                                          module.id,
                                          item.id,
                                          {
                                            content:
                                              event
                                                .target
                                                .value,
                                          }
                                        )
                                      }
                                      rows={5}
                                      placeholder={
                                        item.type ===
                                        "PRACTICE"
                                          ? "Practice instructions or notes..."
                                          : "Write the lesson content..."
                                      }
                                      className={
                                        inputClass
                                      }
                                    />
                                  ) : item.type ===
                                    "CHECKPOINT" ? (
                                    <div className="space-y-5">
                                      {item.questions.map(
                                        (
                                          question,
                                          questionIndex
                                        ) => (
                                          <div
                                            key={
                                              questionIndex
                                            }
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                          >
                                            <div className="mb-3 flex items-center justify-between">
                                              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                                                Question{" "}
                                                {questionIndex +
                                                  1}
                                              </span>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeQuestion(
                                                    module.id,
                                                    item.id,
                                                    questionIndex
                                                  )
                                                }
                                                disabled={
                                                  item
                                                    .questions
                                                    .length ===
                                                  1
                                                }
                                                className="text-xs font-bold text-red-500 disabled:opacity-30"
                                              >
                                                Remove
                                              </button>
                                            </div>

                                            <input
                                              value={
                                                question.question
                                              }
                                              onChange={(
                                                event
                                              ) =>
                                                updateQuestion(
                                                  module.id,
                                                  item.id,
                                                  questionIndex,
                                                  {
                                                    question:
                                                      event
                                                        .target
                                                        .value,
                                                  }
                                                )
                                              }
                                              placeholder="Question"
                                              className={`${inputClass} mb-3`}
                                            />

                                            <div className="grid gap-3 sm:grid-cols-2">
                                              {question.options.map(
                                                (
                                                  option,
                                                  optionIndex
                                                ) => (
                                                  <div
                                                    key={
                                                      optionIndex
                                                    }
                                                    className="flex items-center gap-2"
                                                  >
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        updateQuestion(
                                                          module.id,
                                                          item.id,
                                                          questionIndex,
                                                          {
                                                            correctAnswer:
                                                              optionIndex,
                                                          }
                                                        )
                                                      }
                                                      className={[
                                                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black",
                                                        question.correctAnswer ===
                                                        optionIndex
                                                          ? "bg-emerald-600 text-white"
                                                          : "bg-white text-slate-500 border border-slate-200",
                                                      ].join(
                                                        " "
                                                      )}
                                                      title="Set correct answer"
                                                    >
                                                      {String.fromCharCode(
                                                        65 +
                                                          optionIndex
                                                      )}
                                                    </button>

                                                    <input
                                                      value={
                                                        option
                                                      }
                                                      onChange={(
                                                        event
                                                      ) => {
                                                        const options =
                                                          [
                                                            ...question.options,
                                                          ];

                                                        options[
                                                          optionIndex
                                                        ] =
                                                          event
                                                            .target
                                                            .value;

                                                        updateQuestion(
                                                          module.id,
                                                          item.id,
                                                          questionIndex,
                                                          {
                                                            options,
                                                          }
                                                        );
                                                      }}
                                                      placeholder={`Option ${String.fromCharCode(
                                                        65 +
                                                          optionIndex
                                                      )}`}
                                                      className={
                                                        inputClass
                                                      }
                                                    />
                                                  </div>
                                                )
                                              )}
                                            </div>

                                            <textarea
                                              value={
                                                question.explanation
                                              }
                                              onChange={(
                                                event
                                              ) =>
                                                updateQuestion(
                                                  module.id,
                                                  item.id,
                                                  questionIndex,
                                                  {
                                                    explanation:
                                                      event
                                                        .target
                                                        .value,
                                                  }
                                                )
                                              }
                                              rows={2}
                                              placeholder="Explanation (optional)"
                                              className={`${inputClass} mt-3`}
                                            />
                                          </div>
                                        )
                                      )}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          addQuestion(
                                            module.id,
                                            item.id
                                          )
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                                      >
                                        <Plus className="h-4 w-4" />
                                        Add Question
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <textarea
                                        value={
                                          item.content
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateItem(
                                            module.id,
                                            item.id,
                                            {
                                              content:
                                                event
                                                  .target
                                                  .value,
                                            }
                                          )
                                        }
                                        rows={3}
                                        placeholder="Description or supporting content (optional)"
                                        className={
                                          inputClass
                                        }
                                      />

                                      {item.type === "VIDEO" ? (
  <div className="mt-3 space-y-3">
    <div className="flex flex-wrap items-center gap-3">
      <label
        className={`inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 ${
          uploadingVideoItemId === item.id
            ? "pointer-events-none opacity-60"
            : ""
        }`}
      >
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
          className="hidden"
          disabled={uploadingVideoItemId === item.id}
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void uploadVideo(
                module.id,
                item.id,
                file
              );
            }

            event.target.value = "";
          }}
        />

        {uploadingVideoItemId === item.id
          ? "Uploading Video..."
          : "Upload Video"}
      </label>

      {item.media?.url ? (
        <span className="text-xs font-bold text-emerald-600">
          ✓ Video uploaded
        </span>
      ) : null}
    </div>

    <input
      value={item.url}
      onChange={(event) =>
        updateItem(
          module.id,
          item.id,
          {
            url: event.target.value,
            media: undefined,
          }
        )
      }
      placeholder="Video URL (optional)"
      className={inputClass}
    />

    {item.media?.url ? (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
        <video
          controls
          preload="metadata"
          className="aspect-video w-full"
          src={item.media.url}
        >
          Your browser does not support video playback.
        </video>
      </div>
    ) : null}
  </div>
) : (
  <input
    value={item.url}
    onChange={(event) =>
      updateItem(
        module.id,
        item.id,
        {
          url: event.target.value,
        }
      )
    }
    placeholder={
      item.type === "RESOURCE"
        ? "Resource URL"
        : "Media URL"
    }
    className={`${inputClass} mt-3`}
  />
)}
                                    </>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeItem(
                                      module.id,
                                      item.id
                                    )
                                  }
                                  className="rounded-xl p-2 text-red-500 hover:bg-red-50"
                                  title="Delete learning item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}











