"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";

import {
  createCourseCategory,
  deleteCourseCategory,
  getAdminCourseCategories,
  updateCourseCategory,
  type CourseCategory,
} from "@/lib/api";

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  isActive: boolean;
  displayOrder: string;
};

const EMPTY_FORM: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  image: "",
  isActive: true,
  displayOrder: "0",
};

export default function AdminCourseCategoriesPage() {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CourseCategory | null>(null);

  const [form, setForm] =
    useState<CategoryFormState>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [actionCategoryId, setActionCategoryId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadCategories(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await getAdminCourseCategories();

      setCategories(response.categories);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load course categories.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name
          .toLowerCase()
          .includes(query) ||
        category.slug
          .toLowerCase()
          .includes(query) ||
        category.description
          .toLowerCase()
          .includes(query)
      );
    });
  }, [categories, search]);

  const activeCount = categories.filter(
    (category) => category.isActive,
  ).length;

  const inactiveCount =
    categories.length - activeCount;

  function updateField<K extends keyof CategoryFormState>(
    field: K,
    value: CategoryFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateForm() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEditForm(category: CourseCategory) {
    setEditingCategory(category);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      image: category.image,
      isActive: category.isActive,
      displayOrder: String(category.displayOrder),
    });

    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setNotice("");

    const name = form.name.trim();
    const slug = form.slug.trim();
    const description = form.description.trim();
    const icon = form.icon.trim();
    const image = form.image.trim();
    const displayOrder = Number(form.displayOrder);

    if (name.length < 2) {
      setError(
        "Category name must contain at least 2 characters.",
      );
      return;
    }

    if (
      form.displayOrder.trim() &&
      (!Number.isFinite(displayOrder) ||
        displayOrder < 0)
    ) {
      setError(
        "Display order must be a valid non-negative number.",
      );
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        const response =
          await updateCourseCategory(
            editingCategory.id,
            {
              name,
              slug: slug || undefined,
              description,
              icon,
              image,
              isActive: form.isActive,
              displayOrder: Number.isFinite(
                displayOrder,
              )
                ? displayOrder
                : 0,
            },
          );

        setCategories((current) =>
          current.map((category) =>
            category.id === editingCategory.id
              ? response.category
              : category,
          ),
        );

        setNotice(
          "Course category updated successfully.",
        );
      } else {
        const response =
          await createCourseCategory({
            name,
            slug: slug || undefined,
            description,
            icon,
            image,
            isActive: form.isActive,
            displayOrder: Number.isFinite(
              displayOrder,
            )
              ? displayOrder
              : 0,
          });

        setCategories((current) => [
          ...current,
          response.category,
        ]);

        setNotice(
          "Course category created successfully.",
        );
      }

      setFormOpen(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save course category.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(category: CourseCategory) {
    try {
      setActionCategoryId(category.id);
      setError("");
      setNotice("");

      const response =
        await updateCourseCategory(
          category.id,
          {
            isActive: !category.isActive,
          },
        );

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? response.category
            : item,
        ),
      );

      setNotice(
        response.category.isActive
          ? `${category.name} activated successfully.`
          : `${category.name} deactivated successfully.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update category status.",
      );
    } finally {
      setActionCategoryId(null);
    }
  }

  async function handleDelete(category: CourseCategory) {
    const confirmed = window.confirm(
      `Delete "${category.name}"?\n\nMake sure no courses are using this category before deleting it.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionCategoryId(category.id);
      setError("");
      setNotice("");

      const response =
        await deleteCourseCategory(category.id);

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id,
        ),
      );

      setNotice(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete course category.",
      );
    } finally {
      setActionCategoryId(null);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}

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
                  <GripVertical className="h-3.5 w-3.5" />
                  Learning Management
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Course Categories
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Manage the categories used to organize
                  JobWay courses and help students discover
                  the right preparation programs.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(124,58,237,0.28)]"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* NOTICE */}

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

        {/* STATS */}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Categories"
            value={categories.length}
            helper="All category records"
          />

          <StatCard
            label="Active"
            value={activeCount}
            helper="Available in course selector"
          />

          <StatCard
            label="Inactive"
            value={inactiveCount}
            helper="Hidden from new courses"
          />
        </section>

        {/* TOOLBAR */}

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
                placeholder="Search categories..."
                className={inputClass}
                style={{
                  paddingLeft: "2.75rem",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => loadCategories(true)}
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

        {/* CATEGORY LIST */}

        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-950">
                All Categories
              </h2>

              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-700">
                {filteredCategories.length}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Categories are used by the Admin Course
              Manager.
            </p>
          </div>

          {loading ? (
            <CategoryListSkeleton />
          ) : filteredCategories.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600">
                <GripVertical className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                {categories.length === 0
                  ? "No categories yet"
                  : "No categories found"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {categories.length === 0
                  ? "Create your first course category to organize your learning products."
                  : "Try a different search term."}
              </p>

              {categories.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  <Plus className="h-4 w-4" />
                  Create First Category
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCategories.map((category) => {
                const actionLoading =
                  actionCategoryId === category.id;

                return (
                  <article
                    key={category.id}
                    className="p-5 transition hover:bg-violet-50/20 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      {/* ICON */}

                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 text-xl font-black text-violet-700">
                        {category.icon || category.name.charAt(0)}
                      </div>

                      {/* DETAILS */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black tracking-tight text-slate-950">
                            {category.name}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black ${
                              category.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          /{category.slug}
                        </p>

                        {category.description && (
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            {category.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
                          <span>
                            Display Order:{" "}
                            {category.displayOrder}
                          </span>

                          <span>
                            Slug: {category.slug}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(category)
                          }
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggle(category)
                          }
                          disabled={actionLoading}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            category.isActive
                              ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {actionLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : category.isActive ? (
                            <ToggleRight className="h-3.5 w-3.5" />
                          ) : (
                            <ToggleLeft className="h-3.5 w-3.5" />
                          )}

                          {category.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(category)
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

      {/* CREATE / EDIT MODAL */}

      {formOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto my-6 max-w-3xl overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                  Course Taxonomy
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {editingCategory
                    ? "Edit Category"
                    : "Create Category"}
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
              <div className="space-y-6 p-5 sm:p-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Category Name"
                    required
                  >
                    <input
                      value={form.name}
                      onChange={(event) =>
                        updateField(
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. SSC"
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
                      placeholder="ssc"
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                      Leave empty to generate from the
                      category name.
                    </p>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Description">
                      <textarea
                        value={form.description}
                        onChange={(event) =>
                          updateField(
                            "description",
                            event.target.value,
                          )
                        }
                        rows={4}
                        placeholder="Describe the examinations or courses in this category..."
                        className={`${inputClass} resize-none py-3`}
                      />
                    </Field>
                  </div>

                  <Field label="Icon">
                    <input
                      value={form.icon}
                      onChange={(event) =>
                        updateField(
                          "icon",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. S or 📚"
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                      Optional. You can use a short
                      letter, emoji or icon identifier.
                    </p>
                  </Field>

                  <Field label="Display Order">
                    <input
                      type="number"
                      min="0"
                      value={form.displayOrder}
                      onChange={(event) =>
                        updateField(
                          "displayOrder",
                          event.target.value,
                        )
                      }
                      placeholder="0"
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                      Lower numbers appear first.
                    </p>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Image URL">
                      <input
                        value={form.image}
                        onChange={(event) =>
                          updateField(
                            "image",
                            event.target.value,
                          )
                        }
                        placeholder="https://..."
                        className={inputClass}
                      />

                      <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                        Optional. We can add managed image
                        uploads later.
                      </p>
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                        form.isActive
                          ? "border-violet-200 bg-violet-50/70"
                          : "border-slate-200 bg-slate-50/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) =>
                          updateField(
                            "isActive",
                            event.target.checked,
                          )
                        }
                        className="sr-only"
                      />

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          form.isActive
                            ? "bg-violet-600 text-white"
                            : "bg-white text-slate-400"
                        }`}
                      >
                        {form.isActive ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-800">
                          Active Category
                        </p>

                        <p className="mt-1 text-[10px] font-semibold leading-5 text-slate-400">
                          Active categories appear in the
                          Admin Course Manager selector.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
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
                    : editingCategory
                      ? "Save Changes"
                      : "Create Category"}
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
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_15px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]">
      <div className="relative">
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

function CategoryListSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex animate-pulse flex-col gap-5 p-5 sm:p-6 lg:flex-row"
        >
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-100" />

          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 rounded bg-slate-100" />
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
          </div>

          <div className="flex gap-2">
            <div className="h-10 w-20 rounded-xl bg-slate-100" />
            <div className="h-10 w-28 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100";