"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  GripVertical,
  ImageIcon,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";

import {
  createSkillArenaCategory,
  deleteSkillArenaCategory,
  getSkillArenaCategories,
  updateSkillArenaCategory,
  uploadSkillArenaCategoryLogo,
  removeSkillArenaCategoryLogo,
  type SkillArenaCategory,
} from "@/lib/api";

type SkillFormState = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  accent: string;
  displayOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: SkillFormState = {
  name: "",
  slug: "",
  description: "",
  icon: "sparkles",
  accent: "blue",
  displayOrder: "0",
  isActive: true,
};

const ACCENTS = [
  { value: "blue", label: "Blue" },
  { value: "violet", label: "Violet" },
  { value: "emerald", label: "Emerald" },
  { value: "cyan", label: "Cyan" },
  { value: "amber", label: "Amber" },
  { value: "rose", label: "Rose" },
  { value: "indigo", label: "Indigo" },
  { value: "orange", label: "Orange" },
];

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100";

export default function SkillArenaSkillsPage() {
  const [categories, setCategories] = useState<SkillArenaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<SkillArenaCategory | null>(null);
  const [form, setForm] = useState<SkillFormState>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [logoUploadingId, setLogoUploadingId] = useState<string | null>(null);
  const [logoRemovingId, setLogoRemovingId] = useState<string | null>(null);

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

      const response = await getSkillArenaCategories();
      setCategories(response.categories || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Skill Arena skills.",
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

    return categories.filter((category) =>
      [
        category.name,
        category.slug,
        category.description,
        category.accent,
      ].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [categories, search]);

  const activeCount = categories.filter(
    (category) => category.isActive,
  ).length;

  const inactiveCount = categories.length - activeCount;

  function updateField<K extends keyof SkillFormState>(
    field: K,
    value: SkillFormState[K],
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

  function openEditForm(category: SkillArenaCategory) {
    setEditingCategory(category);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "sparkles",
      accent: category.accent || "blue",
      displayOrder: String(category.displayOrder ?? 0),
      isActive: category.isActive,
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

  function slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setNotice("");

    const name = form.name.trim();
    const slug = (form.slug.trim() || slugify(name)).toLowerCase();
    const description = form.description.trim();
    const icon = form.icon.trim() || "sparkles";
    const accent = form.accent.trim() || "blue";
    const displayOrder = Number(form.displayOrder);

    if (name.length < 2) {
      setError("Skill name must contain at least 2 characters.");
      return;
    }

    if (!slug) {
      setError("A valid skill slug is required.");
      return;
    }

    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      setError("Display order must be a valid non-negative number.");
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        const response = await updateSkillArenaCategory(
          editingCategory.id,
          {
            name,
            slug,
            description,
            icon,
            accent,
            displayOrder,
            isActive: form.isActive,
          },
        );

        setCategories((current) =>
          current.map((category) =>
            category.id === editingCategory.id
              ? response.category
              : category,
          ),
        );

        setNotice("Skill updated successfully.");
      } else {
        const response = await createSkillArenaCategory({
          name,
          slug,
          description,
          icon,
          accent,
          displayOrder,
          isActive: form.isActive,
        });

        setCategories((current) =>
          [...current, response.category].sort(
            (a, b) =>
              a.displayOrder - b.displayOrder ||
              a.name.localeCompare(b.name),
          ),
        );

        setNotice("Skill created successfully.");
      }

      setFormOpen(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save Skill Arena skill.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(
    category: SkillArenaCategory,
    file: File,
  ) {
    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (
      !allowedTypes.has(file.type) ||
      !["jpg", "jpeg", "png", "webp"].includes(extension || "")
    ) {
      setError("Only JPG, PNG and WEBP images are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Skill logo must be 5 MB or smaller.");
      return;
    }

    try {
      setLogoUploadingId(category.id);
      setError("");
      setNotice("");

      const response = await uploadSkillArenaCategoryLogo(
        category.id,
        file,
      );

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? response.category
            : item,
        ),
      );

      setNotice(`${category.name} logo uploaded successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload skill logo.",
      );
    } finally {
      setLogoUploadingId(null);
    }
  }

  async function handleLogoRemove(
    category: SkillArenaCategory,
  ) {
    const confirmed = window.confirm(
      `Remove the logo from "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      setLogoRemovingId(category.id);
      setError("");
      setNotice("");

      const response =
        await removeSkillArenaCategoryLogo(category.id);

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? response.category
            : item,
        ),
      );

      setNotice(`${category.name} logo removed successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove skill logo.",
      );
    } finally {
      setLogoRemovingId(null);
    }
  }
  async function handleToggle(category: SkillArenaCategory) {
    try {
      setActionId(category.id);
      setError("");
      setNotice("");

      const response = await updateSkillArenaCategory(category.id, {
        isActive: !category.isActive,
      });

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id ? response.category : item,
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
          : "Unable to update skill status.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(category: SkillArenaCategory) {
    const confirmed = window.confirm(
      `Delete "${category.name}"?\n\nOnly delete a skill when it is no longer needed. The backend will prevent deletion when active Skill Arena questions use it.`,
    );

    if (!confirmed) return;

    try {
      setActionId(category.id);
      setError("");
      setNotice("");

      const response = await deleteSkillArenaCategory(category.id);

      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );

      setNotice(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete Skill Arena skill.",
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6">
          <Link
            href="/admin/skill-arena"
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Skill Arena
          </Link>

          <div className="overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/60 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-violet-700">
                  <Layers3 className="h-3.5 w-3.5" />
                  Skill Arena Taxonomy
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Skills Manager
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Manage the skill categories that power Skill Arena discovery,
                  challenges, questions and student skill measurement.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(124,58,237,0.28)]"
              >
                <Plus className="h-4 w-4" />
                Add Skill
              </button>
            </div>
          </div>
        </div>

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

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Skills"
            value={categories.length}
            helper="All Skill Arena categories"
          />
          <StatCard
            label="Active"
            value={activeCount}
            helper="Available for Skill Arena"
          />
          <StatCard
            label="Inactive"
            value={inactiveCount}
            helper="Hidden from active selection"
          />
        </section>

        <section className="mb-5 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search skills..."
                className={inputClass}
                style={{ paddingLeft: "2.75rem" }}
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

        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-950">
                All Skills
              </h2>

              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-700">
                {filteredCategories.length}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              These categories are the canonical Skill Arena taxonomy.
            </p>
          </div>

          {loading ? (
            <SkillListSkeleton />
          ) : filteredCategories.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600">
                <Sparkles className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                {categories.length === 0
                  ? "No skills yet"
                  : "No skills found"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {categories.length === 0
                  ? "Create the first Skill Arena category to start organizing challenges."
                  : "Try a different search term."}
              </p>

              {categories.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  <Plus className="h-4 w-4" />
                  Create First Skill
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCategories.map((category) => {
                const actionLoading = actionId === category.id;

                return (
                  <article
                    key={category.id}
                    className="p-5 transition hover:bg-violet-50/20 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 text-xl font-black text-violet-700">
                        {category.logoUrl ? (
                          <img
                            src={category.logoUrl}
                            alt={`${category.name} logo`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          category.icon ||
                          category.name.charAt(0)
                        )}
                      </div>

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
                            {category.isActive ? "Active" : "Inactive"}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase text-slate-500">
                            {category.accent || "blue"}
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
                            Display Order: {category.displayOrder}
                          </span>
                          <span>Slug: {category.slug}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <input
                          id={`skill-logo-${category.id}`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={
                            actionLoading ||
                            logoUploadingId === category.id ||
                            logoRemovingId === category.id
                          }
                          onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (file) {
                              void handleLogoUpload(category, file);
                            }

                            event.currentTarget.value = "";
                          }}
                        />

                        <label
                          htmlFor={`skill-logo-${category.id}`}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-black transition ${
                            actionLoading ||
                            logoUploadingId === category.id ||
                            logoRemovingId === category.id
                              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                              : "cursor-pointer border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                          }`}
                        >
                          {logoUploadingId === category.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ImageIcon className="h-3.5 w-3.5" />
                          )}
                          {logoUploadingId === category.id
                            ? "Uploading..."
                            : category.logoUrl
                              ? "Change Logo"
                              : "Upload Logo"}
                        </label>

                        {category.logoUrl && (
                          <button
                            type="button"
                            onClick={() => void handleLogoRemove(category)}
                            disabled={
                              actionLoading ||
                              logoUploadingId === category.id ||
                              logoRemovingId === category.id
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {logoRemovingId === category.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                            {logoRemovingId === category.id
                              ? "Removing..."
                              : "Remove Logo"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditForm(category)}
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggle(category)}
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
                          onClick={() => handleDelete(category)}
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

      {formOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto my-6 max-w-3xl overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                  Skill Arena Taxonomy
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {editingCategory ? "Edit Skill" : "Create Skill"}
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

            <form onSubmit={handleSubmit}>
              <div className="space-y-6 p-5 sm:p-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Skill Name" required>
                    <input
                      value={form.name}
                      onChange={(event) => {
                        updateField("name", event.target.value);
                        if (!editingCategory && !form.slug) {
                          updateField(
                            "slug",
                            slugify(event.target.value),
                          );
                        }
                      }}
                      placeholder="e.g. Web Development"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Slug" required>
                    <input
                      value={form.slug}
                      onChange={(event) =>
                        updateField("slug", event.target.value)
                      }
                      placeholder="web-development"
                      className={inputClass}
                    />
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
                        placeholder="Describe the skill and what students can practise..."
                        className={`${inputClass} h-auto resize-none py-3`}
                      />
                    </Field>
                  </div>

                  <Field label="Icon">
                    <input
                      value={form.icon}
                      onChange={(event) =>
                        updateField("icon", event.target.value)
                      }
                      placeholder="e.g. code-2"
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                      Short icon identifier or emoji.
                    </p>
                  </Field>

                  <Field label="Accent">
                    <select
                      value={form.accent}
                      onChange={(event) =>
                        updateField("accent", event.target.value)
                      }
                      className={inputClass}
                    >
                      {ACCENTS.map((accent) => (
                        <option
                          key={accent.value}
                          value={accent.value}
                        >
                          {accent.label}
                        </option>
                      ))}
                    </select>
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
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                      Lower numbers appear first.
                    </p>
                  </Field>

                  <div className="flex items-end">
                    <label
                      className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
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

                      <div>
                        <p className="text-xs font-black text-slate-800">
                          Active Skill
                        </p>
                        <p className="mt-1 text-[10px] font-semibold leading-5 text-slate-400">
                          Active skills can be selected for Skill Arena
                          challenges.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

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
                      : "Create Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

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

function SkillListSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex animate-pulse flex-col gap-5 p-5 sm:p-6 lg:flex-row"
        >
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-100" />

          <div className="flex-1 space-y-3">
            <div className="h-5 w-48 rounded bg-slate-100" />
            <div className="h-3 w-32 rounded bg-slate-100" />
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

