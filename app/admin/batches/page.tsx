"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Archive,
  CalendarDays,
  Check,
  ChevronDown,
  Edit3,
  Layers3,
  Loader2,
  Plus,
  Power,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import {
  createBatch,
  getAdminCourseCategories,
  getBatches,
  updateBatch,
  updateBatchStatus,
  type Batch,
  type BatchStatus,
  type CourseCategory,
} from "@/lib/api";

/* ============================================================
   TYPES
   ============================================================ */

type FormState = {
  name: string;
  code: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
};

/* ============================================================
   CONSTANTS
   ============================================================ */

const EMPTY_FORM: FormState = {
  name: "",
  code: "",
  category: "",
  description: "",
  startDate: "",
  endDate: "",
};

/* ============================================================
   HELPERS
   ============================================================ */

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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

function statusLabel(
  status: BatchStatus,
) {
  switch (status) {
    case "active":
      return "Active";

    case "inactive":
      return "Inactive";

    case "archived":
      return "Archived";

    default:
      return status;
  }
}

/* ============================================================
   PAGE
   ============================================================ */

export default function AdminBatchesPage() {
  const [batches, setBatches] =
    useState<Batch[]>([]);

  const [categories, setCategories] =
    useState<CourseCategory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<BatchStatus | "">("");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingBatch, setEditingBatch] =
    useState<Batch | null>(null);

  const [form, setForm] =
    useState<FormState>(
      EMPTY_FORM,
    );

  const [actionId, setActionId] =
    useState<string | null>(null);

  /* ==========================================================
     LOAD DATA
     ========================================================== */

  const loadData =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const [
          batchResponse,
          categoryResponse,
        ] = await Promise.all([
          getBatches({
            search,
            status: statusFilter,
            category: categoryFilter,
          }),

          getAdminCourseCategories(),
        ]);

        setBatches(
          batchResponse.batches || [],
        );

        setCategories(
          categoryResponse.categories || [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load batches.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      search,
      statusFilter,
      categoryFilter,
    ]);

  /* ==========================================================
     SEARCH / FILTER DEBOUNCE
     ========================================================== */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadData();
      }, 250);

    return () =>
      window.clearTimeout(timer);
  }, [loadData]);

  /* ==========================================================
     STATISTICS
     ========================================================== */

  const statistics =
    useMemo(() => {
      return {
        total: batches.length,

        active: batches.filter(
          (batch) =>
            batch.status ===
            "active",
        ).length,

        inactive: batches.filter(
          (batch) =>
            batch.status ===
            "inactive",
        ).length,

        archived: batches.filter(
          (batch) =>
            batch.status ===
            "archived",
        ).length,
      };
    }, [batches]);

  /* ==========================================================
     CREATE MODAL
     ========================================================== */

  function openCreateModal() {
    setEditingBatch(null);
    setForm({
      ...EMPTY_FORM,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  /* ==========================================================
     EDIT MODAL
     ========================================================== */

  function openEditModal(
    batch: Batch,
  ) {
    setEditingBatch(batch);

    setForm({
      name: batch.name || "",

      code: batch.code || "",

      category:
        batch.category?._id || "",

      description:
        batch.description || "",

      startDate: batch.startDate
        ? batch.startDate.slice(
            0,
            10,
          )
        : "",

      endDate: batch.endDate
        ? batch.endDate.slice(
            0,
            10,
          )
        : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  /* ==========================================================
     CLOSE MODAL
     ========================================================== */

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingBatch(null);

    setForm({
      ...EMPTY_FORM,
    });
  }

  /* ==========================================================
     FORM SUBMIT
     ========================================================== */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name =
      form.name.trim();

    if (name.length < 2) {
      setError(
        "Please enter a valid batch name.",
      );

      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate <
        form.startDate
    ) {
      setError(
        "End date cannot be before start date.",
      );

      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name,

        code:
          form.code.trim(),

        category:
          form.category || null,

        description:
          form.description.trim(),

        startDate:
          form.startDate || null,

        endDate:
          form.endDate || null,
      };

      if (editingBatch) {
        await updateBatch(
          editingBatch._id,
          payload,
        );

        setSuccess(
          "Batch updated successfully.",
        );
      } else {
        await createBatch(
          payload,
        );

        setSuccess(
          "Batch created successfully.",
        );
      }

      setShowModal(false);
      setEditingBatch(null);

      setForm({
        ...EMPTY_FORM,
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save batch.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     STATUS CHANGE
     ========================================================== */

  async function handleStatusChange(
    batch: Batch,
    nextStatus: BatchStatus,
  ) {
    setActionId(batch._id);
    setError("");
    setSuccess("");

    try {
      await updateBatchStatus(
        batch._id,
        nextStatus,
      );

      setSuccess(
        `Batch "${batch.name}" is now ${statusLabel(
          nextStatus,
        ).toLowerCase()}.`,
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update batch status.",
      );
    } finally {
      setActionId(null);
    }
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        {/* ====================================================
            HEADER
            ==================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-violet-600">
              <Layers3 className="h-4 w-4" />

              Student Management
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Batches
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create and manage custom student
              batches that can be used to
              organize students and later
              distribute courses and learning
              access.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openCreateModal
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />

            Create Batch
          </button>

        </div>

        {/* ====================================================
            ALERTS
            ==================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <X className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{success}</span>
          </div>
        )}

        {/* ====================================================
            STATISTICS
            ==================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Batches"
            value={
              statistics.total
            }
            icon={Layers3}
          />

          <StatCard
            label="Active"
            value={
              statistics.active
            }
            icon={Check}
          />

          <StatCard
            label="Inactive"
            value={
              statistics.inactive
            }
            icon={Power}
          />

          <StatCard
            label="Archived"
            value={
              statistics.archived
            }
            icon={Archive}
          />

        </div>

        {/* ====================================================
            FILTERS
            ==================================================== */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="grid gap-3 lg:grid-cols-[1fr_190px_220px_auto]">

            {/* SEARCH */}

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search batch name or code..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
              />
            </div>

            {/* STATUS */}

            <SelectField
              value={
                statusFilter
              }
              onChange={(
                value,
              ) =>
                setStatusFilter(
                  value as
                    | BatchStatus
                    | "",
                )
              }
              options={[
                {
                  value: "",
                  label:
                    "All statuses",
                },
                {
                  value:
                    "active",
                  label:
                    "Active",
                },
                {
                  value:
                    "inactive",
                  label:
                    "Inactive",
                },
                {
                  value:
                    "archived",
                  label:
                    "Archived",
                },
              ]}
            />

            {/* CATEGORY */}

            <SelectField
              value={
                categoryFilter
              }
              onChange={
                setCategoryFilter
              }
              options={[
                {
                  value: "",
                  label:
                    "All categories",
                },

                ...categories.map(
                  (
                    category,
                  ) => ({
                    value:
                      category.id,
                    label:
                      category.name,
                  }),
                ),
              ]}
            />

            {/* RESET */}

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter(
                  "",
                );
                setCategoryFilter(
                  "",
                );
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <RefreshCw className="h-4 w-4" />

              Reset
            </button>

          </div>

        </section>

        {/* ====================================================
            TABLE
            ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div>
              <h2 className="text-base font-black text-slate-950">
                Batch Directory
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-400">
                {batches.length} batch
                {batches.length ===
                1
                  ? ""
                  : "es"}{" "}
                shown
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadData()
              }
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                className={
                  loading
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />

              Refresh
            </button>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">

                <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-600" />

                <p className="mt-3 text-sm font-bold text-slate-500">
                  Loading batches...
                </p>

              </div>
            </div>
          ) : batches.length ===
            0 ? (

            /* EMPTY */

            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Layers3 className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-950">
                No batches found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first custom
                batch to start organizing
                students.
              </p>

              <button
                type="button"
                onClick={
                  openCreateModal
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />

                Create Batch
              </button>

            </div>
          ) : (

            /* TABLE CONTENT */

            <div className="overflow-x-auto">

              <table className="min-w-[1150px] w-full">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Batch
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Category
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Duration
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {batches.map(
                    (
                      batch,
                    ) => (
                      <tr
                        key={
                          batch._id
                        }
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                      >

                        {/* BATCH */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                              <Layers3 className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">

                              <div className="font-black text-slate-900">
                                {
                                  batch.name
                                }
                              </div>

                              {batch.code && (
                                <div className="mt-0.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                                  {
                                    batch.code
                                  }
                                </div>
                              )}

                            </div>

                          </div>
                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-4">

                          {batch.category ? (
                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                              {
                                batch.category
                                  .name
                              }
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">
                              All / General
                            </span>
                          )}

                        </td>

                        {/* DURATION */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">

                            <CalendarDays className="h-4 w-4 text-slate-400" />

                            <span>
                              {formatDate(
                                batch.startDate,
                              )}
                            </span>

                            <span className="text-slate-300">
                              →
                            </span>

                            <span>
                              {formatDate(
                                batch.endDate,
                              )}
                            </span>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <StatusBadge
                            status={
                              batch.status
                            }
                          />

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            {/* STUDENTS */}

                            <Link
                              href={`/admin/batches/${batch._id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-50"
                            >
                              <Users className="h-3.5 w-3.5" />

                              Students
                            </Link>

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  batch,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                            >
                              <Edit3 className="h-3.5 w-3.5" />

                              Edit
                            </button>

                            {/* DEACTIVATE */}

                            {batch.status ===
                              "active" && (
                              <button
                                type="button"
                                disabled={
                                  actionId ===
                                  batch._id
                                }
                                onClick={() =>
                                  void handleStatusChange(
                                    batch,
                                    "inactive",
                                  )
                                }
                                className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                              >
                                {actionId ===
                                batch._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  "Deactivate"
                                )}
                              </button>
                            )}

                            {/* ACTIVATE */}

                            {batch.status ===
                              "inactive" && (
                              <button
                                type="button"
                                disabled={
                                  actionId ===
                                  batch._id
                                }
                                onClick={() =>
                                  void handleStatusChange(
                                    batch,
                                    "active",
                                  )
                                }
                                className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                              >
                                {actionId ===
                                batch._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  "Activate"
                                )}
                              </button>
                            )}

                            {/* ARCHIVE */}

                            {batch.status !==
                              "archived" && (
                              <button
                                type="button"
                                disabled={
                                  actionId ===
                                  batch._id
                                }
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Archive "${batch.name}"?`,
                                    )
                                  ) {
                                    void handleStatusChange(
                                      batch,
                                      "archived",
                                    );
                                  }
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                              >
                                Archive
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    ),
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

      {/* ======================================================
          CREATE / EDIT MODAL
          ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

              <div>

                <h2 className="text-xl font-black text-slate-950">
                  {editingBatch
                    ? "Edit Batch"
                    : "Create Batch"}
                </h2>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  {editingBatch
                    ? "Update the batch information."
                    : "Create a custom batch for student organization."}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 p-6"
            >

              {/* BATCH NAME */}

              <div>

                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Batch Name
                </label>

                <input
                  required
                  value={
                    form.name
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        name: event
                          .target
                          .value,
                      }),
                    )
                  }
                  placeholder="e.g. SSC CGL 2026 Morning Batch"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  You can choose any name you want.
                </p>

              </div>

              {/* CODE / CATEGORY */}

              <div className="grid gap-5 sm:grid-cols-2">

                {/* CODE */}

                <div>

                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                    Batch Code

                    <span className="ml-1 font-medium normal-case text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    value={
                      form.code
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          code: event
                            .target
                            .value,
                        }),
                      )
                    }
                    placeholder="e.g. SSC-CGL-26-A"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold uppercase text-slate-800 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                    Category

                    <span className="ml-1 font-medium normal-case text-slate-400">
                      Optional
                    </span>
                  </label>

                  <div className="relative">

                    <select
                      value={
                        form.category
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            category:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                    >

                      <option value="">
                        No category
                      </option>

                      {categories.map(
                        (
                          category,
                        ) => (
                          <option
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {
                              category.name
                            }
                          </option>
                        ),
                      )}

                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  </div>

                </div>

              </div>

              {/* DATES */}

              <div className="grid gap-5 sm:grid-cols-2">

                {/* START DATE */}

                <div>

                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={
                      form.startDate
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          startDate:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  />

                </div>

                {/* END DATE */}

                <div>

                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={
                      form.endDate
                    }
                    min={
                      form.startDate ||
                      undefined
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          endDate:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  />

                </div>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Description

                  <span className="ml-1 font-medium normal-case text-slate-400">
                    Optional
                  </span>
                </label>

                <textarea
                  rows={4}
                  value={
                    form.description
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        description:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  placeholder="Add notes about this batch..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                />

              </div>

              {/* FORM ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingBatch
                      ? "Save Changes"
                      : "Create Batch"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

/* ============================================================
   STAT CARD
   ============================================================ */

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Layers3;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-bold text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Icon className="h-5 w-5" />
        </div>

      </div>

    </div>
  );
}

/* ============================================================
   STATUS BADGE
   ============================================================ */

function StatusBadge({
  status,
}: {
  status: BatchStatus;
}) {
  const styles =
    status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status === "inactive"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${styles}`}
    >
      {statusLabel(status)}
    </span>
  );
}

/* ============================================================
   SELECT FIELD
   ============================================================ */

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
}) {
  return (
    <div className="relative">

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
      >

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          ),
        )}

      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

    </div>
  );
}