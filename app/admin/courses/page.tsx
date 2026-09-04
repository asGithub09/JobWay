"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Edit3,
  Eye,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  createCourse,
  deleteCourse,
  getAdminCourses,
  toggleCoursePublish,
   updateCourse,
  uploadCourseImage,
  type Course,
  type CourseSyllabusItem,
  type CreateCoursePayload,
} from "@/lib/api";

type FormState = {
  title: string;
  slug: string;
  category: string;
  level: string;
  description: string;
  bannerImage: string;
  duration: string;
  language: string;
  price: string;
  discountPrice: string;
  instructor: string;
  features: string;
  syllabus: CourseSyllabusItem[];
  isFeatured: boolean;
  isPublished: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  category: "",
  level: "All Levels",
  description: "",
  bannerImage: "",
  duration: "Self Paced",
  language: "English / Hindi",
  price: "0",
  discountPrice: "0",
  instructor: "",
  features: "",
  syllabus: [],
  isFeatured: false,
  isPublished: false,
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(
    null,
  );

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState("");
  const [actionCourseId, setActionCourseId] = useState<string | null>(
    null,
  );

  const [notice, setNotice] = useState("");

  async function loadCourses(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAdminCourses();

      setCourses(response.courses);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load courses.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) => {
      return (
        course.title.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.slug.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query)
      );
    });
  }, [courses, search]);

  function openCreateForm() {
    setEditingCourse(null);
    setForm(EMPTY_FORM);
    setNotice("");
    setBannerUploadError("");
    setFormOpen(true);
  }

  function openEditForm(course: Course) {
    setEditingCourse(course);

    setForm({
      title: course.title,
      slug: course.slug,
      category: course.category,
      level: course.level,
      description: course.description,
      bannerImage: course.bannerImage,
      duration: course.duration,
      language: course.language,
      price: String(course.price),
      discountPrice: String(course.discountPrice),
      instructor: course.instructor,
      features: course.features.join("\n"),
      syllabus: course.syllabus || [],
      isFeatured: course.isFeatured,
      isPublished: course.isPublished,
    });

    setNotice("");
    setBannerUploadError("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingCourse(null);
    setForm(EMPTY_FORM);
    setBannerUploadError("");
  }

  async function handleBannerUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setBannerUploadError("");

    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);

    if (!allowedTypes.has(file.type)) {
      setBannerUploadError(
        "Only JPG, PNG, and WEBP images are supported.",
      );
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setBannerUploadError(
        "Banner image must be smaller than 5 MB.",
      );
      event.target.value = "";
      return;
    }

    try {
      setUploadingBanner(true);

      const response = await uploadCourseImage(file);

      if (!response.imageUrl) {
        throw new Error(
          response.message || "Image upload failed.",
        );
      }

      updateField("bannerImage", response.imageUrl);
    } catch (error) {
      setBannerUploadError(
        error instanceof Error
          ? error.message
          : "Unable to upload banner image.",
      );
    } finally {
      setUploadingBanner(false);
      event.target.value = "";
    }
  }

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addSyllabusItem() {
    setForm((current) => ({
      ...current,
      syllabus: [
        ...current.syllabus,
        {
          title: "",
          description: "",
        },
      ],
    }));
  }

  function updateSyllabusItem(
    index: number,
    field: keyof CourseSyllabusItem,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      syllabus: current.syllabus.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  }

  function removeSyllabusItem(index: number) {
    setForm((current) => ({
      ...current,
      syllabus: current.syllabus.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setNotice("");
    setError("");

    if (form.title.trim().length < 2) {
      setError("Course title must contain at least 2 characters.");
      return;
    }

    if (!form.category.trim()) {
      setError("Course category is required.");
      return;
    }

    if (form.description.trim().length < 10) {
      setError(
        "Course description should contain at least 10 characters.",
      );
      return;
    }

    const price = Number(form.price);
    const discountPrice = Number(form.discountPrice);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid course price.");
      return;
    }

    if (
      !Number.isFinite(discountPrice) ||
      discountPrice < 0
    ) {
      setError("Enter a valid discount price.");
      return;
    }

    if (discountPrice > price && price > 0) {
      setError(
        "Discount price cannot be greater than the original price.",
      );
      return;
    }

    const features = form.features
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const syllabus = form.syllabus
      .map((item) => ({
        title: item.title.trim(),
        description: item.description.trim(),
      }))
      .filter((item) => item.title);
console.log("COURSE SAVE - bannerImage:", form.bannerImage);
    const payload: CreateCoursePayload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category.trim(),
      level: form.level.trim(),
      description: form.description.trim(),
      bannerImage: form.bannerImage.trim(),
      duration: form.duration.trim(),
      language: form.language.trim(),
      price,
      discountPrice,
      instructor: form.instructor.trim(),
      features,
      syllabus,
      isFeatured: form.isFeatured,
      isPublished: form.isPublished,
    };

    try {
      setSaving(true);

      if (editingCourse) {
        const response = await updateCourse(
          editingCourse.id,
          payload,
        );

        setCourses((current) =>
          current.map((course) =>
            course.id === editingCourse.id
              ? response.course
              : course,
          ),
        );

        setNotice("Course updated successfully.");
      } else {
        const response = await createCourse(payload);

        setCourses((current) => [
          response.course,
          ...current,
        ]);

        setNotice("Course created successfully.");
      }

      setFormOpen(false);
      setEditingCourse(null);
      setForm(EMPTY_FORM);
      setBannerUploadError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save course.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(course: Course) {
    try {
      setActionCourseId(course.id);
      setError("");
      setNotice("");

      const response = await toggleCoursePublish(course.id);

      setCourses((current) =>
        current.map((item) =>
          item.id === course.id
            ? response.course
            : item,
        ),
      );

      setNotice(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update course status.",
      );
    } finally {
      setActionCourseId(null);
    }
  }

  async function handleDelete(course: Course) {
    const confirmed = window.confirm(
      `Delete "${course.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setActionCourseId(course.id);
      setError("");
      setNotice("");

      const response = await deleteCourse(course.id);

      setCourses((current) =>
        current.filter(
          (item) => item.id !== course.id,
        ),
      );

      setNotice(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete course.",
      );
    } finally {
      setActionCourseId(null);
    }
  }

  const publishedCount = courses.filter(
    (course) => course.isPublished,
  ).length;

  const featuredCount = courses.filter(
    (course) => course.isFeatured,
  ).length;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* =====================================================
            HEADER
           ===================================================== */}

        <div className="mb-6">
          <Link
            href="/admin"
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Admin
          </Link>

          <div className="overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/60 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-violet-700">
                  <BookOpen className="h-3.5 w-3.5" />
                  Learning Management
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Course Manager
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Create, manage and publish the learning
                  programs displayed on the JobWay student
                  website.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(124,58,237,0.28)]"
              >
                <Plus className="h-4 w-4" />
                Create Course
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            NOTICE / ERROR
           ===================================================== */}

        {notice && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <X className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            STATS
           ===================================================== */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Courses"
            value={courses.length}
            helper="All course records"
            icon={<BookOpen className="h-5 w-5" />}
          />

          <StatCard
            label="Published"
            value={publishedCount}
            helper="Visible to students"
            icon={<Eye className="h-5 w-5" />}
          />

          <StatCard
            label="Drafts"
            value={courses.length - publishedCount}
            helper="Not publicly visible"
            icon={<Edit3 className="h-5 w-5" />}
          />

          <StatCard
            label="Featured"
            value={featuredCount}
            helper="Highlighted courses"
            icon={<Star className="h-5 w-5" />}
          />
        </section>

        {/* =====================================================
            TOOLBAR
           ===================================================== */}

        <section className="mb-5 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search courses..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <button
              type="button"
              onClick={() => loadCourses(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </section>

        {/* =====================================================
            COURSE LIST
           ===================================================== */}

        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-950">
                All Courses
              </h2>

              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-700">
                {filteredCourses.length}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Manage the learning products available on JobWay.
            </p>
          </div>

          {loading ? (
            <CourseListSkeleton />
          ) : filteredCourses.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600">
                <BookOpen className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                {courses.length === 0
                  ? "No courses yet"
                  : "No courses found"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {courses.length === 0
                  ? "Create your first course and it will appear here."
                  : "Try a different search term."}
              </p>

              {courses.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  <Plus className="h-4 w-4" />
                  Create First Course
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCourses.map((course) => {
                const actionLoading =
                  actionCourseId === course.id;

                return (
                  <article
                    key={course.id}
                    className="p-5 transition hover:bg-violet-50/20 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                      {/* IMAGE */}

                      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 sm:h-44 sm:w-64">
                        {course.bannerImage ? (
                          <img
                            src={course.bannerImage}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-slate-300">
                            <ImageIcon className="h-8 w-8" />

                            <span className="mt-2 text-[10px] font-black uppercase tracking-wider">
                              No Banner
                            </span>
                          </div>
                        )}

                        {course.isFeatured && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-amber-600 shadow-sm backdrop-blur">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>

                      {/* DETAILS */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black text-violet-700">
                            {course.category}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black ${
                              course.isPublished
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {course.isPublished
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>

                        <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                          {course.title}
                        </h3>

                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          /courses/{course.slug}
                        </p>

                        <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">
                          {course.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
                          <span>
                            Level: {course.level}
                          </span>

                          <span>
                            Duration: {course.duration}
                          </span>

                          <span>
                            Language: {course.language}
                          </span>

                          {course.instructor && (
                            <span>
                              Instructor: {course.instructor}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 flex-wrap gap-2 xl:w-[250px] xl:justify-end">
                        <button
                          type="button"
                          onClick={() => openEditForm(course)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handlePublish(course)
                          }
                          disabled={actionLoading}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            course.isPublished
                              ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {actionLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}

                          {course.isPublished
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(course)
                          }
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* =======================================================
          CREATE / EDIT MODAL
         ======================================================= */}

      {formOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto my-6 max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                  {editingCourse
                    ? "Edit Learning Product"
                    : "New Learning Product"}
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {editingCourse
                    ? "Edit Course"
                    : "Create Course"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              <div className="space-y-8 p-5 sm:p-7">
                {/* BASIC INFORMATION */}

                <section>
                  <SectionHeading
                    title="Basic Information"
                    description="Core information students will see."
                  />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <Field
                      label="Course Title"
                      required
                    >
                      <input
                        value={form.title}
                        onChange={(event) =>
                          updateField(
                            "title",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. SSC CGL Complete Preparation"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Slug">
                      <input
                        value={form.slug}
                        onChange={(event) =>
                          updateField(
                            "slug",
                            event.target.value,
                          )
                        }
                        placeholder="ssc-cgl-complete-preparation"
                        className={inputClass}
                      />

                      <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                        Leave empty to generate from the title.
                      </p>
                    </Field>

                    <Field
                      label="Category"
                      required
                    >
                      <input
                        value={form.category}
                        onChange={(event) =>
                          updateField(
                            "category",
                            event.target.value,
                          )
                        }
                        placeholder="SSC"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Level">
                      <input
                        value={form.level}
                        onChange={(event) =>
                          updateField(
                            "level",
                            event.target.value,
                          )
                        }
                        placeholder="All Levels"
                        className={inputClass}
                      />
                    </Field>

                    <div className="md:col-span-2">
                      <Field
                        label="Description"
                        required
                      >
                        <textarea
                          value={form.description}
                          onChange={(event) =>
                            updateField(
                              "description",
                              event.target.value,
                            )
                          }
                          rows={4}
                          placeholder="Describe what students will learn in this course..."
                          className={`${inputClass} resize-none py-3`}
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                {/* BANNER */}

                <section>
                  <SectionHeading
                    title="Course Banner"
                    description="The banner displayed on the student course card."
                  />

                  <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
                    <Field
                      label="Course Banner Image"
                    >
                      <div className="space-y-3">
                        <label
                          className={[
                            "flex cursor-pointer items-center justify-center",
                            "gap-3 rounded-2xl border-2 border-dashed",
                            "border-violet-200 bg-violet-50/40 px-5 py-6",
                            "transition hover:border-violet-400 hover:bg-violet-50",
                            uploadingBanner
                              ? "pointer-events-none opacity-60"
                              : "",
                          ].join(" ")}
                        >
                          {uploadingBanner ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                              <span className="text-sm font-bold text-violet-700">
                                Uploading banner...
                              </span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-5 w-5 text-violet-600" />
                              <span className="text-sm font-bold text-violet-700">
                                Choose Banner Image
                              </span>
                            </>
                          )}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleBannerUpload}
                            disabled={uploadingBanner}
                          />
                        </label>

                        <p className="text-[10px] font-semibold leading-5 text-slate-400">
                          JPG, PNG or WEBP · Maximum 5 MB.
                        </p>

                        {form.bannerImage && (
                          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                            <p className="min-w-0 truncate text-[10px] font-semibold text-slate-500">
                              Banner uploaded successfully
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                updateField("bannerImage", "")
                              }
                              className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black text-red-600 transition hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        )}

                        {bannerUploadError && (
                          <p className="rounded-xl bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600">
                            {bannerUploadError}
                          </p>
                        )}
                      </div>
                    </Field>

                    <div>
                      <p className="mb-2 text-xs font-black text-slate-700">
                        Preview
                      </p>

                      <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        {form.bannerImage ? (
                          <img
                            src={form.bannerImage}
                            alt="Course banner preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center text-slate-300">
                            <ImageIcon className="h-8 w-8" />

                            <span className="mt-2 text-[10px] font-black uppercase tracking-wider">
                              Banner Preview
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* COURSE DETAILS */}

                <section>
                  <SectionHeading
                    title="Course Details"
                    description="Pricing, instructor and learning format."
                  />

                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Duration">
                      <input
                        value={form.duration}
                        onChange={(event) =>
                          updateField(
                            "duration",
                            event.target.value,
                          )
                        }
                        placeholder="Self Paced"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Language">
                      <input
                        value={form.language}
                        onChange={(event) =>
                          updateField(
                            "language",
                            event.target.value,
                          )
                        }
                        placeholder="English / Hindi"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Price">
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(event) =>
                          updateField(
                            "price",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Discount Price">
                      <input
                        type="number"
                        min="0"
                        value={form.discountPrice}
                        onChange={(event) =>
                          updateField(
                            "discountPrice",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </Field>

                    <div className="sm:col-span-2 lg:col-span-4">
                      <Field label="Instructor">
                        <input
                          value={form.instructor}
                          onChange={(event) =>
                            updateField(
                              "instructor",
                              event.target.value,
                            )
                          }
                          placeholder="Instructor name"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                {/* FEATURES */}

                <section>
                  <SectionHeading
                    title="Course Features"
                    description="Add one feature per line."
                  />

                  <textarea
                    value={form.features}
                    onChange={(event) =>
                      updateField(
                        "features",
                        event.target.value,
                      )
                    }
                    rows={5}
                    placeholder={`Live Classes
Recorded Lectures
Practice Questions
Doubt Support`}
                    className={`${inputClass} mt-5 resize-none py-3`}
                  />
                </section>

                {/* SYLLABUS */}

                <section>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SectionHeading
                      title="Syllabus"
                      description="Add modules or topics for this course."
                    />

                    <button
                      type="button"
                      onClick={addSyllabusItem}
                      className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-violet-50 px-3.5 py-2.5 text-xs font-black text-violet-700 transition hover:bg-violet-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Topic
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    {form.syllabus.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center">
                        <p className="text-sm font-bold text-slate-500">
                          No syllabus topics added yet.
                        </p>

                        <button
                          type="button"
                          onClick={addSyllabusItem}
                          className="mt-3 text-xs font-black text-violet-600 hover:text-violet-800"
                        >
                          Add your first topic
                        </button>
                      </div>
                    ) : (
                      form.syllabus.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[10px] font-black uppercase tracking-wider text-violet-600">
                                Topic {index + 1}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  removeSyllabusItem(
                                    index,
                                  )
                                }
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              <input
                                value={item.title}
                                onChange={(event) =>
                                  updateSyllabusItem(
                                    index,
                                    "title",
                                    event.target.value,
                                  )
                                }
                                placeholder="Topic title"
                                className={inputClass}
                              />

                              <input
                                value={item.description}
                                onChange={(event) =>
                                  updateSyllabusItem(
                                    index,
                                    "description",
                                    event.target.value,
                                  )
                                }
                                placeholder="Short description"
                                className={inputClass}
                              />
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </section>

                {/* PUBLISH SETTINGS */}

                <section>
                  <SectionHeading
                    title="Publishing"
                    description="Control how this course appears on JobWay."
                  />

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <ToggleCard
                      title="Featured Course"
                      description="Highlight this course in featured sections."
                      checked={form.isFeatured}
                      onChange={(checked) =>
                        updateField(
                          "isFeatured",
                          checked,
                        )
                      }
                      icon={
                        <Star className="h-4 w-4" />
                      }
                    />

                    <ToggleCard
                      title="Publish Course"
                      description="Make this course visible to students."
                      checked={form.isPublished}
                      onChange={(checked) =>
                        updateField(
                          "isPublished",
                          checked,
                        )
                      }
                      icon={
                        <Eye className="h-4 w-4" />
                      }
                    />
                  </div>
                </section>
              </div>

              {/* FORM FOOTER */}

              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingCourse
                      ? "Save Changes"
                      : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* =============================================================
   SMALL COMPONENTS
   ============================================================= */

function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: number;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_15px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]">
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value.toLocaleString("en-IN")}
          </p>

          <p className="mt-2 text-[10px] font-bold text-slate-400">
            {helper}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-base font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-1 text-xs font-semibold text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onChange,
  icon,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
        checked
          ? "border-violet-200 bg-violet-50/70"
          : "border-slate-200 bg-slate-50/50 hover:bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="sr-only"
      />

      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          checked
            ? "bg-violet-600 text-white"
            : "bg-white text-slate-400"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-[10px] font-semibold leading-5 text-slate-400">
          {description}
        </p>
      </div>

      <span
        className={`mt-1 flex h-5 w-9 shrink-0 rounded-full p-0.5 transition ${
          checked
            ? "bg-violet-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
    </label>
  );
}

function CourseListSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex animate-pulse flex-col gap-5 p-5 sm:p-6 xl:flex-row"
        >
          <div className="h-40 w-full rounded-2xl bg-slate-100 sm:h-44 sm:w-64" />

          <div className="flex-1 space-y-4">
            <div className="h-6 w-32 rounded-full bg-slate-100" />
            <div className="h-6 w-2/3 rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-4/5 rounded bg-slate-100" />
            <div className="h-4 w-3/5 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100";