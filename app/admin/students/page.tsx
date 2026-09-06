"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Filter,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";

import {
  assignStudentToBatch,
  getBatches,
  getBatchStudents,
  getStudentBatchSummary,
  getStudents,
  removeStudentFromBatch,
unassignStudentFromBatch,
  type AdminStudent,
  type Batch,
  type BatchStudent,
  type StudentBatchSummary,
} from "@/lib/api";

type AssignmentFilter = "all" | "assigned" | "unassigned";

type ModalMode = "assign" | "change";

interface BatchStudentGroup {
  batch: StudentBatchSummary;
  students: BatchStudent[];
  loading: boolean;
  loaded: boolean;
  error: string;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSummary, setBatchSummary] = useState<StudentBatchSummary[]>([]);

  const [search, setSearch] = useState("");
  const [assignmentFilter, setAssignmentFilter] =
    useState<AssignmentFilter>("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [expandedBatchIds, setExpandedBatchIds] = useState<Set<string>>(
    new Set(),
  );

  const [batchStudents, setBatchStudents] = useState<
    Record<string, BatchStudentGroup>
  >({});

  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [selectedStudent, setSelectedStudent] =
    useState<AdminStudent | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [unassigningStudentId, setUnassigningStudentId] = useState<
    string | null
  >(null);

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [studentsResponse, batchesResponse, summaryResponse] =
        await Promise.all([
          getStudents({
            search: search.trim(),
            assignment:
              assignmentFilter === "all" ? "" : assignmentFilter,
          }),
          getBatches({
            status: "active",
          }),
          getStudentBatchSummary(),
        ]);

      setStudents(studentsResponse.students);
      setBatches(batchesResponse.batches);
      setBatchSummary(summaryResponse.batches);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load the student management workspace.",
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [assignmentFilter, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const assignedCount = useMemo(
    () => students.filter((student) => student.currentBatch).length,
    [students],
  );

  const unassignedCount = students.length - assignedCount;

  const openAssignmentModal = (
    student: AdminStudent,
    mode: ModalMode,
  ) => {
    setSelectedStudent(student);
    setModalMode(mode);
    setSelectedBatchId(student.currentBatch?._id || "");
  };

  const closeAssignmentModal = () => {
    if (savingAssignment) return;

    setModalMode(null);
    setSelectedStudent(null);
    setSelectedBatchId("");
  };

  const handleAssign = async () => {
    if (!selectedStudent || !selectedBatchId) {
      return;
    }

    try {
      setSavingAssignment(true);
      setError("");

      await assignStudentToBatch(
        selectedStudent._id,
        selectedBatchId,
      );

      closeAssignmentModal();
      await loadData(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to update the student's batch.",
        ),
      );
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleUnassign = async (student: AdminStudent) => {
    const confirmed = window.confirm(
      `Remove ${student.name} from their current batch?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setUnassigningStudentId(student._id);
      setError("");

await unassignStudentFromBatch(student._id);
      await loadData(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to remove the student's batch assignment.",
        ),
      );
    } finally {
      setUnassigningStudentId(null);
    }
  };
  const toggleBatch = async (batch: StudentBatchSummary) => {
    const next = new Set(expandedBatchIds);

    if (next.has(batch._id)) {
      next.delete(batch._id);
      setExpandedBatchIds(next);
      return;
    }

    next.add(batch._id);
    setExpandedBatchIds(next);

    if (batchStudents[batch._id]?.loaded) {
      return;
    }

    setBatchStudents((current) => ({
      ...current,
      [batch._id]: {
        batch,
        students: [],
        loading: true,
        loaded: false,
        error: "",
      },
    }));

    try {
      const response = await getBatchStudents(batch._id);

      setBatchStudents((current) => ({
        ...current,
        [batch._id]: {
          batch,
          students: response.students,
          loading: false,
          loaded: true,
          error: "",
        },
      }));
    } catch (err) {
      setBatchStudents((current) => ({
        ...current,
        [batch._id]: {
          batch,
          students: [],
          loading: false,
          loaded: false,
          error: getErrorMessage(
            err,
            "Unable to load batch students.",
          ),
        },
      }));
    }
  };

  const refreshBatchStudents = async (batch: StudentBatchSummary) => {
    setBatchStudents((current) => ({
      ...current,
      [batch._id]: {
        batch,
        students: current[batch._id]?.students || [],
        loading: true,
        loaded: false,
        error: "",
      },
    }));

    try {
      const response = await getBatchStudents(batch._id);

      setBatchStudents((current) => ({
        ...current,
        [batch._id]: {
          batch,
          students: response.students,
          loading: false,
          loaded: true,
          error: "",
        },
      }));
    } catch (err) {
      setBatchStudents((current) => ({
        ...current,
        [batch._id]: {
          batch,
          students: [],
          loading: false,
          loaded: false,
          error: getErrorMessage(
            err,
            "Unable to load batch students.",
          ),
        },
      }));
    }
  };

  const handleRemoveFromBatch = async (
    batch: StudentBatchSummary,
    student: BatchStudent,
  ) => {
    const confirmed = window.confirm(
      `Remove ${student.student.name} from ${batch.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await removeStudentFromBatch(
        batch._id,
        student.student._id,
      );

      await Promise.all([
        loadData(true),
        refreshBatchStudents(batch),
      ]);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to remove the student from this batch.",
        ),
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
              <Users className="h-3.5 w-3.5" />
              Student Management
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Students
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage registered students, batch assignments, and
              batch-wise student membership from one workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-500 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Registered Students"
            value={students.length}
            icon={Users}
            description="Students matching current filters"
          />

          <StatCard
            label="Assigned"
            value={assignedCount}
            icon={UserCheck}
            description="Currently assigned to a batch"
          />

          <StatCard
            label="Not Assigned"
            value={unassignedCount}
            icon={CircleUserRound}
            description="Ready for batch assignment"
          />

          <StatCard
            label="Active Batches"
            value={batchSummary.filter(
              (batch) => batch.status === "active",
            ).length}
            icon={Filter}
            description="Available for student assignment"
          />
        </div>

        {/* Student Directory */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Student Directory
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Every registered student appears here, whether
                  assigned to a batch or not.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-[330px]">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search name, email or mobile..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <select
                  value={assignmentFilter}
                  onChange={(event) =>
                    setAssignmentFilter(
                      event.target.value as AssignmentFilter,
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="all">All students</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Not assigned</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingState label="Loading students..." />
          ) : students.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students found"
              description={
                search || assignmentFilter !== "all"
                  ? "Try changing your search or assignment filter."
                  : "Registered students will appear here automatically."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Student
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Current Batch
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Registration
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr
                      key={student._id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.name} />

                          <div className="min-w-0">
                            <div className="truncate text-sm font-black text-slate-900">
                              {student.name}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                                  student.isEmailVerified
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {student.isEmailVerified
                                  ? "Email verified"
                                  : "Email pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {student.email}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {student.phone}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {student.currentBatch ? (
                          <div>
                            <div className="text-sm font-black text-slate-800">
                              {student.currentBatch.name}
                            </div>

                            {student.currentBatch.code && (
                              <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {student.currentBatch.code}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                        {formatDate(student.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                            student.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              student.isActive
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />
                          {student.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {student.currentBatch ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  openAssignmentModal(
                                    student,
                                    "change",
                                  )
                                }
                                disabled={!student.isActive}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Change Batch
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleUnassign(student)
                                }
                                disabled={
                                  unassigningStudentId ===
                                    student._id ||
                                  !student.isActive
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {unassigningStudentId ===
                                student._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <UserMinus className="h-3.5 w-3.5" />
                                )}
                                Remove
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                openAssignmentModal(
                                  student,
                                  "assign",
                                )
                              }
                              disabled={!student.isActive}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-black text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Assign Batch
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Batch Overview */}
        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Batch-wise Students
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Expand a batch to view and manage its currently
                assigned students.
              </p>
            </div>
          </div>

          {batchSummary.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="No batches available"
              description="Create a batch first to manage batch-wise students."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {batchSummary.map((batch) => {
                const expanded = expandedBatchIds.has(batch._id);
                const group = batchStudents[batch._id];

                return (
                  <div key={batch._id}>
                    <button
                      type="button"
                      onClick={() => toggleBatch(batch)}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        {expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black text-slate-900">
                          {batch.name}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {batch.code && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {batch.code}
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                              batch.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {batch.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-slate-900">
                          {batch.studentCount}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Students
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-6">
                        {group?.loading ? (
                          <LoadingState label="Loading batch students..." />
                        ) : group?.error ? (
                          <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <span>{group.error}</span>
                            <button
                              type="button"
                              onClick={() =>
                                refreshBatchStudents(batch)
                              }
                              className="rounded-lg bg-white px-3 py-1.5 text-xs font-black text-red-700 shadow-sm"
                            >
                              Retry
                            </button>
                          </div>
                        ) : !group?.students.length ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
                            <Users className="mx-auto h-7 w-7 text-slate-300" />
                            <p className="mt-2 text-sm font-bold text-slate-600">
                              No students assigned
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Assign students from the directory above.
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[760px]">
                                <thead>
                                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                                      Student
                                    </th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                                      Contact
                                    </th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                                      Joined
                                    </th>
                                    <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                                      Action
                                    </th>
                                  </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                  {group.students.map((member) => (
                                    <tr
                                      key={member.membershipId}
                                      className="hover:bg-slate-50/70"
                                    >
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                          <Avatar
                                            name={
                                              member.student.name
                                            }
                                            small
                                          />

                                          <div>
                                            <div className="text-xs font-black text-slate-800">
                                              {member.student.name}
                                            </div>

                                            <div className="mt-0.5 text-[10px] font-medium text-slate-400">
                                              {member.student
                                                .isEmailVerified
                                                ? "Verified"
                                                : "Email pending"}
                                            </div>
                                          </div>
                                        </div>
                                      </td>

                                      <td className="px-4 py-3">
                                        <div className="space-y-1 text-[11px] font-semibold text-slate-500">
                                          <div>
                                            {member.student.email}
                                          </div>
                                          <div>
                                            {member.student.phone}
                                          </div>
                                        </div>
                                      </td>

                                      <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                        {formatDate(
                                          member.joinedAt,
                                        )}
                                      </td>

                                      <td className="px-4 py-3 text-right">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveFromBatch(
                                              batch,
                                              member,
                                            )
                                          }
                                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black text-red-600 transition hover:bg-red-50"
                                        >
                                          <UserMinus className="h-3.5 w-3.5" />
                                          Remove
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Assignment Modal */}
      {modalMode && selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-black text-slate-950">
                    {modalMode === "assign"
                      ? "Assign Batch"
                      : "Change Batch"}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {modalMode === "assign"
                      ? "Choose the batch this student should join."
                      : "Choose a new active batch for this student."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeAssignmentModal}
                  disabled={savingAssignment}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <Avatar name={selectedStudent.name} />

                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-slate-900">
                    {selectedStudent.name}
                  </div>

                  <div className="truncate text-xs text-slate-500">
                    {selectedStudent.email}
                  </div>
                </div>
              </div>

              {selectedStudent.currentBatch && (
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    Current Batch
                  </div>

                  <div className="mt-1 text-sm font-black text-slate-800">
                    {selectedStudent.currentBatch.name}
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="student-batch"
                  className="mb-2 block text-xs font-black text-slate-700"
                >
                  {modalMode === "assign"
                    ? "Select Batch"
                    : "New Batch"}
                </label>

                <select
                  id="student-batch"
                  value={selectedBatchId}
                  onChange={(event) =>
                    setSelectedBatchId(event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Choose a batch...</option>

                  {batches.map((batch) => (
                    <option
                      key={batch._id}
                      value={batch._id}
                    >
                      {batch.name}
                      {batch.code
                        ? ` (${batch.code})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {batches.length === 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
                  No active batches are available. Create or activate
                  a batch first.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                onClick={closeAssignmentModal}
                disabled={savingAssignment}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAssign}
                disabled={
                  !selectedBatchId ||
                  savingAssignment ||
                  selectedBatchId ===
                    selectedStudent.currentBatch?._id
                }
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingAssignment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {modalMode === "assign"
                      ? "Assign Student"
                      : "Change Batch"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-slate-500">
            {label}
          </div>

          <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 text-[11px] leading-5 text-slate-400">
        {description}
      </div>
    </div>
  );
}

function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 via-fuchsia-50 to-indigo-100 font-black text-violet-700 ${
        small
          ? "h-8 w-8 text-[10px]"
          : "h-10 w-10 text-xs"
      }`}
    >
      {getInitials(name) || "S"}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm font-semibold text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
      {label}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-sm font-black text-slate-800">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}