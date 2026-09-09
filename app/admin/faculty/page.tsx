"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Check,
  Clock3,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  addEducatorsToBatch,
  createFacultyInvitation,
  getBatches,
  getBatchEducators,
  listFacultyInvitations,
  removeEducatorFromBatch,
  revokeFacultyInvitation,
  searchBatchEducators,
  type Batch,
  type BatchEducator,
  type BatchEducatorSearchResult,
  type FacultyInvitation,
} from "@/lib/api";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

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

function statusClasses(
  status: FacultyInvitation["status"],
): string {
  switch (status) {
    case "accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "expired":
      return "border-slate-200 bg-slate-100 text-slate-600";

    case "revoked":
      return "border-rose-200 bg-rose-50 text-rose-700";

    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function statusLabel(
  status: FacultyInvitation["status"],
): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AdminFacultyPage() {
  const [invitations, setInvitations] =
    useState<FacultyInvitation[]>([]);

  const [batches, setBatches] =
    useState<Batch[]>([]);

  const [selectedBatchId, setSelectedBatchId] =
    useState("");

  const [educators, setEducators] =
    useState<BatchEducator[]>([]);

  const [availableEducators, setAvailableEducators] =
    useState<BatchEducatorSearchResult[]>([]);

  const [invitationLoading, setInvitationLoading] =
    useState(true);

  const [batchLoading, setBatchLoading] =
    useState(true);

  const [educatorLoading, setEducatorLoading] =
    useState(false);

  const [availableLoading, setAvailableLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  const [revokingId, setRevokingId] =
    useState<string | null>(null);

  const [showInviteForm, setShowInviteForm] =
    useState(false);

  const [inviteName, setInviteName] =
    useState("");

  const [inviteEmail, setInviteEmail] =
    useState("");

  const [educatorSearch, setEducatorSearch] =
    useState("");

  const [selectedEducators, setSelectedEducators] =
    useState<string[]>([]);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadInvitations =
    useCallback(async () => {
      setInvitationLoading(true);

      try {
        const response =
          await listFacultyInvitations();

        setInvitations(
          response.invitations || [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load faculty invitations.",
        );
      } finally {
        setInvitationLoading(false);
      }
    }, []);

  const loadBatches =
    useCallback(async () => {
      setBatchLoading(true);

      try {
        const response =
          await getBatches({
            status: "active",
          });

        const nextBatches =
          response.batches || [];

        setBatches(nextBatches);

        if (
          !selectedBatchId &&
          nextBatches.length > 0
        ) {
          setSelectedBatchId(
            nextBatches[0]._id,
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load batches.",
        );
      } finally {
        setBatchLoading(false);
      }
    }, [selectedBatchId]);

  const loadEducators =
    useCallback(async () => {
      if (!selectedBatchId) {
        setEducators([]);
        return;
      }

      setEducatorLoading(true);

      try {
        const response =
          await getBatchEducators(
            selectedBatchId,
          );

        setEducators(
          response.educators || [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load batch educators.",
        );
      } finally {
        setEducatorLoading(false);
      }
    }, [selectedBatchId]);

  const loadAvailableEducators =
    useCallback(async () => {
      if (!selectedBatchId) {
        setAvailableEducators([]);
        return;
      }

      setAvailableLoading(true);

      try {
        const response =
          await searchBatchEducators(
            selectedBatchId,
            educatorSearch,
          );

        setAvailableEducators(
          response.educators || [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to search educators.",
        );
      } finally {
        setAvailableLoading(false);
      }
    }, [
      selectedBatchId,
      educatorSearch,
    ]);

  useEffect(() => {
    void loadInvitations();
    void loadBatches();
  }, [
    loadInvitations,
    loadBatches,
  ]);

  useEffect(() => {
    void loadEducators();
  }, [loadEducators]);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadAvailableEducators();
      }, 250);

    return () =>
      window.clearTimeout(timer);
  }, [loadAvailableEducators]);

  const statistics =
    useMemo(() => {
      return {
        total: invitations.length,
        pending: invitations.filter(
          (item) => item.status === "pending",
        ).length,
        accepted: invitations.filter(
          (item) => item.status === "accepted",
        ).length,
        expired: invitations.filter(
          (item) => item.status === "expired",
        ).length,
        revoked: invitations.filter(
          (item) => item.status === "revoked",
        ).length,
      };
    }, [invitations]);

  async function handleInvite(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!inviteEmail.trim()) {
      setError("Faculty email is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await createFacultyInvitation({
          email: inviteEmail.trim(),
          name: inviteName.trim(),
        });

      setSuccess(
        response.message ||
          "Faculty invitation sent successfully.",
      );

      setInviteName("");
      setInviteEmail("");
      setShowInviteForm(false);

      await loadInvitations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send faculty invitation.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke(
    invitationId: string,
  ) {
    setRevokingId(invitationId);
    setError("");
    setSuccess("");

    try {
      const response =
        await revokeFacultyInvitation(
          invitationId,
        );

      setSuccess(
        response.message ||
          "Invitation revoked successfully.",
      );

      await loadInvitations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to revoke invitation.",
      );
    } finally {
      setRevokingId(null);
    }
  }

  function toggleEducator(
    educatorId: string,
  ) {
    setSelectedEducators((current) =>
      current.includes(educatorId)
        ? current.filter(
            (id) => id !== educatorId,
          )
        : [...current, educatorId],
    );
  }

  async function handleAddEducators() {
    if (
      !selectedBatchId ||
      selectedEducators.length === 0
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await addEducatorsToBatch(
          selectedBatchId,
          selectedEducators,
        );

      setSuccess(
        response.message ||
          "Educators assigned successfully.",
      );

      setSelectedEducators([]);

      await loadEducators();
      await loadAvailableEducators();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to assign educators.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveEducator(
    educatorId: string,
  ) {
    if (!selectedBatchId) return;

    setRemovingId(educatorId);
    setError("");
    setSuccess("");

    try {
      const response =
        await removeEducatorFromBatch(
          selectedBatchId,
          educatorId,
        );

      setSuccess(
        response.message ||
          "Educator removed from batch.",
      );

      await loadEducators();
      await loadAvailableEducators();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove educator.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  const selectedBatch =
    batches.find(
      (batch) =>
        batch._id === selectedBatchId,
    ) || null;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        <div className="mb-8 overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/60 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-violet-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Faculty Management
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Faculty & Educators
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Invite educators and manage their
                batch assignments from one Admin workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowInviteForm((value) => !value);
                setError("");
                setSuccess("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
            >
              <UserPlus className="h-4 w-4" />
              Invite Faculty
            </button>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? (
              <X className="h-4 w-4 shrink-0" />
            ) : (
              <Check className="h-4 w-4 shrink-0" />
            )}

            <span className="flex-1">
              {error || success}
            </span>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
              }}
              className="rounded-lg p-1 hover:bg-black/5"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Total Invitations",
              value: statistics.total,
              icon: Mail,
            },
            {
              label: "Pending",
              value: statistics.pending,
              icon: Clock3,
            },
            {
              label: "Accepted",
              value: statistics.accepted,
              icon: Check,
            },
            {
              label: "Expired",
              value: statistics.expired,
              icon: Clock3,
            },
            {
              label: "Revoked",
              value: statistics.revoked,
              icon: X,
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>

                <p className="text-2xl font-black text-slate-950">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </section>

        {showInviteForm && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-black text-slate-950">
                Invite a New Faculty Member
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                The educator will receive an invitation
                email with the secure onboarding link.
              </p>
            </div>

            <form
              onSubmit={handleInvite}
              className="grid gap-4 md:grid-cols-[1fr_1.3fr_auto]"
            >
              <input
                value={inviteName}
                onChange={(event) =>
                  setInviteName(event.target.value)
                }
                placeholder="Faculty name"
                maxLength={120}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />

              <input
                value={inviteEmail}
                onChange={(event) =>
                  setInviteEmail(event.target.value)
                }
                type="email"
                placeholder="faculty@example.com"
                required
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Send Invitation
              </button>
            </form>
          </section>
        )}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Faculty Invitations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track the educator onboarding lifecycle.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadInvitations()}
              disabled={invitationLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  invitationLoading
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {invitationLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-10 text-center">
              <Mail className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-bold text-slate-700">
                No faculty invitations yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Use “Invite Faculty” to onboard your first educator.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">
                      Faculty
                    </th>
                    <th className="px-6 py-4">
                      Status
                    </th>
                    <th className="px-6 py-4">
                      Created
                    </th>
                    <th className="px-6 py-4">
                      Expires
                    </th>
                    <th className="px-6 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invitations.map((invitation) => (
                    <tr
                      key={invitation.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {invitation.name || "Faculty"}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {invitation.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses(
                            invitation.status,
                          )}`}
                        >
                          {statusLabel(
                            invitation.status,
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(
                          invitation.createdAt,
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(
                          invitation.expiresAt,
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {invitation.status ===
                          "pending" && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleRevoke(
                                invitation.id,
                              )
                            }
                            disabled={
                              revokingId ===
                              invitation.id
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                          >
                            {revokingId ===
                            invitation.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Revoke
                          </button>
                        )}

                        {invitation.status !==
                          "pending" && (
                          <span className="text-xs font-semibold text-slate-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Batch Faculty Assignments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Assign educators to batches using the existing
                  BatchEducator relationship.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-600" />

                <select
                  value={selectedBatchId}
                  onChange={(event) => {
                    setSelectedBatchId(
                      event.target.value,
                    );
                    setSelectedEducators([]);
                  }}
                  disabled={batchLoading}
                  className="min-w-[240px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400"
                >
                  {batches.length === 0 && (
                    <option value="">
                      No active batches
                    </option>
                  )}

                  {batches.map((batch) => (
                    <option
                      key={batch._id}
                      value={batch._id}
                    >
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedBatch && (
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="font-black text-slate-900">
                  {selectedBatch.name}
                </span>

                <span className="text-slate-500">
                  Code: {selectedBatch.code}
                </span>

                <span className="text-slate-500">
                  Assigned educators: {educators.length}
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-0 lg:grid-cols-2">

            <div className="border-b border-slate-100 p-6 lg:border-b-0 lg:border-r">
              <h3 className="mb-4 font-black text-slate-900">
                Assigned Educators
              </h3>

              {educatorLoading ? (
                <div className="flex min-h-32 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                </div>
              ) : educators.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <Users className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    No educators assigned to this batch.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {educators.map((assignment) => (
                    <div
                      key={assignment.assignmentId}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700">
                        {(
                          assignment.educator.name ||
                          "E"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {assignment.educator.name ||
                            "Educator"}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {assignment.educator.email}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          void handleRemoveEducator(
                            assignment.educator._id,
                          )
                        }
                        disabled={
                          removingId ===
                          assignment.educator._id
                        }
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        aria-label="Remove educator"
                      >
                        {removingId ===
                        assignment.educator._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-black text-slate-900">
                  Add Educators
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    void handleAddEducators()
                  }
                  disabled={
                    saving ||
                    selectedEducators.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Assign Selected
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={educatorSearch}
                  onChange={(event) =>
                    setEducatorSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search educator by name or email..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {availableLoading ? (
                <div className="flex min-h-32 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                </div>
              ) : availableEducators.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <Search className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    No available educators found.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Accepted educator accounts will appear here.
                  </p>
                </div>
              ) : (
                <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {availableEducators.map(
                    (educator) => {
                      const selected =
                        selectedEducators.includes(
                          educator._id,
                        );

                      return (
                        <button
                          type="button"
                          key={educator._id}
                          onClick={() =>
                            toggleEducator(
                              educator._id,
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-violet-300 bg-violet-50"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                              selected
                                ? "bg-violet-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {selected ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              educator.name
                                .charAt(0)
                                .toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {educator.name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {educator.email}
                            </p>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
