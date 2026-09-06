"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  addCoursesToBatch,
  addStudentsToBatch,
  getBatch,
  getBatchCourses,
  getBatchStudents,
  removeCourseFromBatch,
  removeStudentFromBatch,
  searchBatchCourses,
  searchBatchStudents,
  type Batch,
  type BatchCourse,
  type BatchCourseSearchResult,
  type BatchStudent,
  type BatchStudentSearchResult,
} from "@/lib/api";

/* ============================================================
   HELPERS
   ============================================================ */

function formatDate(
  value: string | null | undefined,
): string {
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
  status: Batch["status"],
): string {
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

export default function BatchStudentsPage() {
  const params = useParams<{
    batchId: string;
  }>();

  const batchId =
    params.batchId;

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */

  const [batch, setBatch] =
    useState<Batch | null>(null);

  const [students, setStudents] =
    useState<BatchStudent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [availableStudents, setAvailableStudents] =
    useState<
      BatchStudentSearchResult[]
    >([]);

  const [availableSearch, setAvailableSearch] =
    useState("");

  const [selectedStudents, setSelectedStudents] =
    useState<string[]>([]);

  const [loadingAvailable, setLoadingAvailable] =
    useState(false);

  const [adding, setAdding] =
    useState(false);

  const [removingId, setRemovingId] =
    useState<string | null>(null);
  const [courses, setCourses] =
    useState<BatchCourse[]>([]);

  const [showAddCourseModal, setShowAddCourseModal] =
    useState(false);

  const [availableCourses, setAvailableCourses] =
    useState<BatchCourseSearchResult[]>([]);

  const [courseSearch, setCourseSearch] =
    useState("");

  const [selectedCourses, setSelectedCourses] =
    useState<string[]>([]);

  const [loadingCourses, setLoadingCourses] =
    useState(false);

  const [loadingAvailableCourses, setLoadingAvailableCourses] =
    useState(false);

  const [addingCourses, setAddingCourses] =
    useState(false);

  const [removingCourseId, setRemovingCourseId] =
    useState<string | null>(null);
  /* ----------------------------------------------------------
     LOAD BATCH
     ---------------------------------------------------------- */

  const loadBatch =
    useCallback(
      async () => {
        if (!batchId) {
          return;
        }

        const response =
          await getBatch(
            batchId,
          );

        setBatch(
          response.batch,
        );
      },
      [batchId],
    );

  /* ----------------------------------------------------------
     LOAD ASSIGNED STUDENTS
     ---------------------------------------------------------- */

  const loadStudents =
    useCallback(
      async () => {
        if (!batchId) {
          return;
        }

        const response =
          await getBatchStudents(
            batchId,
            search,
          );

        setStudents(
          response.students || [],
        );
      },
      [
        batchId,
        search,
      ],
    );
  /* ----------------------------------------------------------
     LOAD ASSIGNED COURSES
     ---------------------------------------------------------- */

  const loadCourses =
    useCallback(
      async () => {
        if (!batchId) {
          return;
        }

        setLoadingCourses(true);

        try {
          const response =
            await getBatchCourses(
              batchId,
            );

          setCourses(
            response.courses || [],
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load courses.",
          );
        } finally {
          setLoadingCourses(false);
        }
      },
      [batchId],
    );
  /* ----------------------------------------------------------
     INITIAL LOAD
     ---------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [
  batchResponse,
  studentResponse,
  courseResponse,
] = await Promise.all([
  getBatch(batchId),
  getBatchStudents(
    batchId,
    search,
  ),
  getBatchCourses(batchId),
]);

        if (cancelled) {
          return;
        }

        setBatch(
          batchResponse.batch,
        );

        setStudents(
          studentResponse.students ||
            [],
        );
        setCourses(
  courseResponse.courses ||
    [],
);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load batch.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (batchId) {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [batchId]);

  /* ----------------------------------------------------------
     SEARCH ASSIGNED STUDENTS
     ---------------------------------------------------------- */

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          void loadStudents().catch(
            (err) => {
              setError(
                err instanceof Error
                  ? err.message
                  : "Unable to search students.",
              );
            },
          );
        },
        300,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [
    search,
    loadStudents,
    loading,
  ]);

  /* ----------------------------------------------------------
     LOAD AVAILABLE STUDENTS
     ---------------------------------------------------------- */

  const loadAvailableStudents =
    useCallback(
      async (
        query: string,
      ) => {
        if (!batchId) {
          return;
        }

        setLoadingAvailable(
          true,
        );

        try {
          const response =
            await searchBatchStudents(
              batchId,
              query,
            );

          setAvailableStudents(
            response.students || [],
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to search students.",
          );
        } finally {
          setLoadingAvailable(
            false,
          );
        }
      },
      [batchId],
    );

  /* ----------------------------------------------------------
     SEARCH AVAILABLE STUDENTS
     ---------------------------------------------------------- */

  useEffect(() => {
    if (!showAddModal) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          void loadAvailableStudents(
            availableSearch,
          );
        },
        300,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [
    showAddModal,
    availableSearch,
    loadAvailableStudents,
  ]);

  /* ----------------------------------------------------------
     OPEN ADD MODAL
     ---------------------------------------------------------- */

  async function openAddModal() {
    setError("");
    setSuccess("");

    setAvailableSearch(
      "",
    );

    setSelectedStudents(
      [],
    );

    setAvailableStudents(
      [],
    );

    setShowAddModal(
      true,
    );

    await loadAvailableStudents(
      "",
    );
  }

  /* ----------------------------------------------------------
     CLOSE ADD MODAL
     ---------------------------------------------------------- */

  function closeAddModal() {
    if (adding) {
      return;
    }

    setShowAddModal(
      false,
    );

    setAvailableSearch(
      "",
    );

    setAvailableStudents(
      [],
    );

    setSelectedStudents(
      [],
    );
  }

  /* ----------------------------------------------------------
     SELECT / DESELECT
     ---------------------------------------------------------- */

  function toggleStudent(
    studentId: string,
  ) {
    setSelectedStudents(
      (current) => {
        if (
          current.includes(
            studentId,
          )
        ) {
          return current.filter(
            (id) =>
              id !== studentId,
          );
        }

        return [
          ...current,
          studentId,
        ];
      },
    );
  }

  function selectAllVisible() {
    const visibleIds =
      availableStudents.map(
        (student) =>
          student._id,
      );

    setSelectedStudents(
      (current) => [
        ...new Set([
          ...current,
          ...visibleIds,
        ]),
      ],
    );
  }

  function clearSelection() {
    setSelectedStudents(
      [],
    );
  }

  /* ----------------------------------------------------------
     ADD STUDENTS
     ---------------------------------------------------------- */

  async function handleAddStudents(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      selectedStudents.length ===
      0
    ) {
      setError(
        "Please select at least one student.",
      );

      return;
    }

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await addStudentsToBatch(
          batchId,
          selectedStudents,
        );

      setSuccess(
        response.message ||
          "Students added successfully.",
      );

      setShowAddModal(
        false,
      );

      setSelectedStudents(
        [],
      );

      setAvailableStudents(
        [],
      );

      await loadStudents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add students.",
      );
    } finally {
      setAdding(false);
    }
  }

  /* ----------------------------------------------------------
     REMOVE STUDENT
     ---------------------------------------------------------- */

  async function handleRemoveStudent(
    membership: BatchStudent,
  ) {
    const student =
      membership.student;

    const confirmed =
      window.confirm(
        `Remove ${student.name} from "${batch?.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    setRemovingId(
      membership.membershipId,
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await removeStudentFromBatch(
          batchId,
          student._id,
        );

      setSuccess(
        response.message ||
          "Student removed successfully.",
      );

      await loadStudents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove student.",
      );
    } finally {
      setRemovingId(
        null,
      );
    }
  }
  /* ----------------------------------------------------------
     LOAD AVAILABLE COURSES
     ---------------------------------------------------------- */

  const loadAvailableCourses =
    useCallback(
      async (
        query: string,
      ) => {
        if (!batchId) {
          return;
        }

        setLoadingAvailableCourses(
          true,
        );

        try {
          const response =
            await searchBatchCourses(
              batchId,
              query,
            );

          setAvailableCourses(
            response.courses || [],
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to search courses.",
          );
        } finally {
          setLoadingAvailableCourses(
            false,
          );
        }
      },
      [batchId],
    );

  /* ----------------------------------------------------------
     OPEN COURSE MODAL
     ---------------------------------------------------------- */

  async function openAddCourseModal() {
    setError("");
    setSuccess("");

    setCourseSearch("");
    setSelectedCourses([]);
    setAvailableCourses([]);
    setShowAddCourseModal(true);

    await loadAvailableCourses("");
  }

  /* ----------------------------------------------------------
     CLOSE COURSE MODAL
     ---------------------------------------------------------- */

  function closeAddCourseModal() {
    if (addingCourses) {
      return;
    }

    setShowAddCourseModal(false);
    setCourseSearch("");
    setSelectedCourses([]);
    setAvailableCourses([]);
  }

  /* ----------------------------------------------------------
     SEARCH AVAILABLE COURSES
     ---------------------------------------------------------- */

  useEffect(() => {
    if (!showAddCourseModal) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          void loadAvailableCourses(
            courseSearch,
          );
        },
        300,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [
    showAddCourseModal,
    courseSearch,
    loadAvailableCourses,
  ]);

  /* ----------------------------------------------------------
     SELECT / DESELECT COURSES
     ---------------------------------------------------------- */

  function toggleCourse(
    courseId: string,
  ) {
    setSelectedCourses(
      (current) => {
        if (
          current.includes(
            courseId,
          )
        ) {
          return current.filter(
            (id) =>
              id !== courseId,
          );
        }

        return [
          ...current,
          courseId,
        ];
      },
    );
  }

  function selectAllVisibleCourses() {
    const visibleIds =
      availableCourses.map(
        (course) =>
          course._id,
      );

    setSelectedCourses(
      (current) => [
        ...new Set([
          ...current,
          ...visibleIds,
        ]),
      ],
    );
  }

  function clearCourseSelection() {
    setSelectedCourses([]);
  }

  /* ----------------------------------------------------------
     ADD COURSES
     ---------------------------------------------------------- */

  async function handleAddCourses(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      selectedCourses.length ===
      0
    ) {
      setError(
        "Please select at least one course.",
      );

      return;
    }

    setAddingCourses(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await addCoursesToBatch(
          batchId,
          selectedCourses,
        );

      setSuccess(
        response.message ||
          "Courses added successfully.",
      );

      setShowAddCourseModal(false);
      setSelectedCourses([]);
      setAvailableCourses([]);

      await loadCourses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add courses.",
      );
    } finally {
      setAddingCourses(false);
    }
  }

  /* ----------------------------------------------------------
     REMOVE COURSE
     ---------------------------------------------------------- */

  async function handleRemoveCourse(
    membership: BatchCourse,
  ) {
    const course =
      membership.course;

    const confirmed =
      window.confirm(
        `Remove "${course.title}" from "${batch?.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    setRemovingCourseId(
      membership.membershipId,
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await removeCourseFromBatch(
          batchId,
          course.id,
        );

      setSuccess(
        response.message ||
          "Course removed successfully.",
      );

      await loadCourses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove course.",
      );
    } finally {
      setRemovingCourseId(null);
    }
  }
  /* ----------------------------------------------------------
     DERIVED DATA
     ---------------------------------------------------------- */

  const activeStudentCount =
    students.filter(
      (membership) =>
        membership.status ===
        "active",
    ).length;

  const activeCourseCount =
    courses.filter(
      (membership) =>
        membership.status ===
        "active",
    ).length;

  const selectedVisibleCourseCount =
    useMemo(
      () =>
        availableCourses.filter(
          (course) =>
            selectedCourses.includes(
              course._id,
            ),
        ).length,
      [
        availableCourses,
        selectedCourses,
      ],
    );

  const selectedVisibleCount =
    useMemo(
      () =>
        availableStudents.filter(
          (student) =>
            selectedStudents.includes(
              student._id,
            ),
        ).length,
      [
        availableStudents,
        selectedStudents,
      ],
    );

  /* ----------------------------------------------------------
     LOADING
     ---------------------------------------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-[1400px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-violet-600" />

            <p className="mt-4 text-sm font-bold text-slate-500">
              Loading batch...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ----------------------------------------------------------
     BATCH NOT FOUND
     ---------------------------------------------------------- */

  if (!batch) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href="/admin/batches"
            className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 transition hover:text-violet-700"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Batches
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <h1 className="text-xl font-black text-red-900">
              Batch not found
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error ||
                "The requested batch could not be found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ----------------------------------------------------------
     MAIN UI
     ---------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* ====================================================
            HEADER
            ==================================================== */}

        <div className="mb-6">
          <Link
            href="/admin/batches"
            className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-violet-600 transition hover:text-violet-700"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Batches
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-violet-600">
                <Users className="h-4 w-4" />

                Batch Overview
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {batch.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">

                {batch.code && (
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-600">
                    {batch.code}
                  </span>
                )}

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                    batch.status ===
                    "active"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : batch.status ===
                          "inactive"
                        ? "border-amber-100 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                >
                  {statusLabel(
                    batch.status,
                  )}
                </span>

                {batch.category && (
                  <span className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                    {batch.category.name}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void openAddModal()
              }
              disabled={
                batch.status ===
                "archived"
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />

              Add Students
            </button>
          </div>
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
            BATCH STATS
            ==================================================== */}

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <InfoCard
            label="Students"
            value={String(
              activeStudentCount,
            )}
            icon={Users}
          />

          <InfoCard
            label="Courses"
            value={String(
              activeCourseCount,
            )}
            icon={BookOpen}
          />

          <InfoCard
            label="Start Date"
            value={formatDate(
              batch.startDate,
            )}
            icon={CheckCircle2}
          />

          <InfoCard
            label="End Date"
            value={formatDate(
              batch.endDate,
            )}
            icon={CheckCircle2}
          />

        </div>


        {/* ====================================================
            STUDENT DIRECTORY
            ==================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-black text-slate-950">
                Students
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-400">
                {activeStudentCount} active{" "}
                {activeStudentCount === 1
                  ? "student"
                  : "students"}{" "}
                assigned to this batch.
              </p>

            </div>

            <div className="relative w-full sm:w-[320px]">

              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search students..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
              />

            </div>

          </div>


          {students.length === 0 ? (

            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Users className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-950">
                {search
                  ? "No students found"
                  : "No students assigned"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                  ? "Try another name, email or phone number."
                  : "Add students to this batch to start managing their access."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() =>
                    void openAddModal()
                  }
                  disabled={
                    batch.status ===
                    "archived"
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add First Students
                </button>
              )}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-[900px] w-full">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/80">

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Student
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Contact
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Joined
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {students.map(
                    (
                      membership,
                    ) => {

                      const student =
                        membership.student;

                      return (
                        <tr
                          key={
                            membership.membershipId
                          }
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700">
                                {student.name
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">

                                <div className="font-black text-slate-900">
                                  {student.name}
                                </div>

                                <div className="mt-0.5 text-xs text-slate-400">
                                  {student.isEmailVerified
                                    ? "Verified account"
                                    : "Email not verified"}
                                </div>

                              </div>

                            </div>

                          </td>


                          <td className="px-5 py-4">

                            <div className="space-y-1">

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


                          <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                            {formatDate(
                              membership.joinedAt,
                            )}
                          </td>


                          <td className="px-5 py-4">

                            <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                              Active
                            </span>

                          </td>


                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              disabled={
                                removingId ===
                                membership.membershipId
                              }
                              onClick={() =>
                                void handleRemoveStudent(
                                  membership,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              {removingId ===
                              membership.membershipId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}

                              Remove

                            </button>

                          </td>

                        </tr>
                      );
                    },
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* ====================================================
            COURSE DIRECTORY
            ==================================================== */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="text-lg font-black text-slate-950">
                    Courses
                  </h2>

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {activeCourseCount} active{" "}
                    {activeCourseCount === 1
                      ? "course"
                      : "courses"}{" "}
                    assigned to this batch.
                  </p>

                </div>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                void openAddCourseModal()
              }
              disabled={
                batch.status ===
                "archived"
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Plus className="h-4 w-4" />

              Add Courses

            </button>

          </div>


          {loadingCourses ? (

            <div className="flex min-h-[280px] items-center justify-center">

              <div className="text-center">

                <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-600" />

                <p className="mt-3 text-sm font-bold text-slate-500">
                  Loading courses...
                </p>

              </div>

            </div>

          ) : courses.length === 0 ? (

            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <BookOpen className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-950">
                No courses assigned
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Assign courses to this batch to give its students access to the appropriate learning content.
              </p>

              <button
                type="button"
                onClick={() =>
                  void openAddCourseModal()
                }
                disabled={
                  batch.status ===
                  "archived"
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Plus className="h-4 w-4" />

                Add First Courses

              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-[950px] w-full">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/80">

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Course
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Category
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Level
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Assigned
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {courses.map(
                    (
                      membership,
                    ) => {

                      const course =
                        membership.course;

                      return (
                        <tr
                          key={
                            membership.membershipId
                          }
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-50 text-violet-600">

                                {course.bannerImage ? (
                                  <img
                                    src={
                                      course.bannerImage
                                    }
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="h-5 w-5" />
                                )}

                              </div>

                              <div className="min-w-0">

                                <div className="font-black text-slate-900">
                                  {course.title}
                                </div>

                                <div className="mt-1 text-xs font-medium text-slate-400">
                                  {course.slug}
                                </div>

                              </div>

                            </div>

                          </td>


                          <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                            {course.category ||
                              "General"}
                          </td>


                          <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                            {course.level ||
                              "All levels"}
                          </td>


                          <td className="px-5 py-4">

                            <div className="flex flex-wrap gap-2">

                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${
                                  course.isPublished
                                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                    : "border-amber-100 bg-amber-50 text-amber-700"
                                }`}
                              >
                                {course.isPublished
                                  ? "Published"
                                  : "Unpublished"}
                              </span>

                              <span className="inline-flex rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">
                                Active
                              </span>

                            </div>

                          </td>


                          <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                            {formatDate(
                              membership.assignedAt,
                            )}
                          </td>


                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              disabled={
                                removingCourseId ===
                                membership.membershipId
                              }
                              onClick={() =>
                                void handleRemoveCourse(
                                  membership,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              {removingCourseId ===
                              membership.membershipId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}

                              Remove

                            </button>

                          </td>

                        </tr>
                      );
                    },
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      {/* ======================================================
          ADD COURSES MODAL
          ====================================================== */}

      {showAddCourseModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">

          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Add Courses
                  </h2>

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Select courses to assign to{" "}
                    <span className="font-bold text-slate-600">
                      {batch.name}
                    </span>
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={closeAddCourseModal}
                disabled={addingCourses}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={handleAddCourses}
              className="flex min-h-0 flex-1 flex-col"
            >

              {/* SEARCH */}

              <div className="border-b border-slate-100 p-5">

                <div className="relative">

                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    autoFocus
                    value={courseSearch}
                    onChange={(event) =>
                      setCourseSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search courses..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  />

                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">

                  <p className="text-xs font-bold text-slate-400">
                    {availableCourses.length}{" "}
                    available
                  </p>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={
                        selectAllVisibleCourses
                      }
                      disabled={
                        availableCourses.length ===
                        0
                      }
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-violet-600 transition hover:bg-violet-50 disabled:opacity-40"
                    >
                      Select visible
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearCourseSelection
                      }
                      disabled={
                        selectedCourses.length ===
                        0
                      }
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      Clear
                    </button>

                  </div>

                </div>

              </div>

              {/* COURSE LIST */}

              <div className="min-h-0 flex-1 overflow-y-auto">

                {loadingAvailableCourses ? (

                  <div className="flex min-h-[300px] items-center justify-center">

                    <div className="text-center">

                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-600" />

                      <p className="mt-3 text-sm font-bold text-slate-500">
                        Finding courses...
                      </p>

                    </div>

                  </div>

                ) : availableCourses.length === 0 ? (

                  <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <BookOpen className="h-6 w-6" />
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-800">
                      No courses available
                    </h3>

                    <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                      Try another search. Courses already assigned to this batch are excluded.
                    </p>

                  </div>

                ) : (

                  <div className="divide-y divide-slate-100">

                    {availableCourses.map(
                      (course) => {

                        const selected =
                          selectedCourses.includes(
                            course._id,
                          );

                        return (
                          <button
                            key={
                              course._id
                            }
                            type="button"
                            onClick={() =>
                              toggleCourse(
                                course._id,
                              )
                            }
                            className={`flex w-full items-center gap-4 px-5 py-4 text-left transition ${
                              selected
                                ? "bg-violet-50/70"
                                : "hover:bg-slate-50"
                            }`}
                          >

                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                                selected
                                  ? "border-violet-600 bg-violet-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {selected && (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </div>

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-50 text-violet-600">

                              {course.bannerImage ? (
                                <img
                                  src={
                                    course.bannerImage
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <BookOpen className="h-5 w-5" />
                              )}

                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="truncate font-black text-slate-900">
                                {course.title}
                              </div>

                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-400">

                                <span>
                                  {course.category ||
                                    "General"}
                                </span>

                                <span>
                                  {course.level ||
                                    "All levels"}
                                </span>

                              </div>

                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${
                                course.isPublished
                                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                  : "border-amber-100 bg-amber-50 text-amber-700"
                              }`}
                            >
                              {course.isPublished
                                ? "Published"
                                : "Unpublished"}
                            </span>

                          </button>
                        );
                      },
                    )}

                  </div>

                )}

              </div>

              {/* FOOTER */}

              <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4">

                <div className="mb-3 flex items-center justify-between text-xs">

                  <span className="font-bold text-slate-500">
                    Selected
                  </span>

                  <span className="font-black text-violet-700">
                    {selectedCourses.length}
                  </span>

                </div>

                {selectedVisibleCourseCount <
                    selectedCourses.length &&
                  selectedCourses.length >
                    0 && (
                    <p className="mb-3 text-[11px] font-semibold text-slate-400">
                      {selectedCourses.length -
                        selectedVisibleCourseCount}{" "}
                      selected course
                      {selectedCourses.length -
                        selectedVisibleCourseCount ===
                      1
                        ? ""
                        : "s"}{" "}
                      hidden by the current search.
                    </p>
                  )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeAddCourseModal
                    }
                    disabled={
                      addingCourses
                    }
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      addingCourses ||
                      selectedCourses.length ===
                        0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {addingCourses ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}

                    {addingCourses
                      ? "Adding..."
                      : `Add ${
                          selectedCourses.length
                        } Course${
                          selectedCourses.length ===
                          1
                            ? ""
                            : "s"
                        }`}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================================
          ADD STUDENTS MODAL
          ====================================================== */}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">

          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-black text-slate-950">
                  Add Students
                </h2>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Select students to add to{" "}
                  <span className="font-bold text-slate-600">
                    {batch.name}
                  </span>
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeAddModal
                }
                disabled={adding}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={
                handleAddStudents
              }
              className="flex min-h-0 flex-1 flex-col"
            >

              {/* SEARCH */}

              <div className="border-b border-slate-100 p-5">

                <div className="relative">

                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    autoFocus
                    value={
                      availableSearch
                    }
                    onChange={(
                      event,
                    ) =>
                      setAvailableSearch(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Search by name, email or phone..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  />

                </div>

                <div className="mt-3 flex items-center justify-between">

                  <p className="text-xs font-bold text-slate-400">
                    {availableStudents.length}{" "}
                    available
                  </p>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={
                        selectAllVisible
                      }
                      disabled={
                        availableStudents.length ===
                        0
                      }
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-violet-600 transition hover:bg-violet-50 disabled:opacity-40"
                    >
                      Select visible
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearSelection
                      }
                      disabled={
                        selectedStudents.length ===
                        0
                      }
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      Clear
                    </button>

                  </div>

                </div>

              </div>

              {/* STUDENT LIST */}

              <div className="min-h-0 flex-1 overflow-y-auto">

                {loadingAvailable ? (

                  <div className="flex min-h-[280px] items-center justify-center">

                    <div className="text-center">

                      <Loader2 className="mx-auto h-7 w-7 animate-spin text-violet-600" />

                      <p className="mt-3 text-sm font-bold text-slate-500">
                        Finding students...
                      </p>

                    </div>

                  </div>

                ) : availableStudents.length ===
                  0 ? (

                  <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

                    <Users className="h-9 w-9 text-slate-300" />

                    <h3 className="mt-4 text-base font-black text-slate-800">
                      No students available
                    </h3>

                    <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                      Try another search. Active
                      students already assigned to
                      this batch are excluded.
                    </p>

                  </div>

                ) : (

                  <div className="divide-y divide-slate-100">

                    {availableStudents.map(
                      (
                        student,
                      ) => {
                        const selected =
                          selectedStudents.includes(
                            student._id,
                          );

                        return (
                          <button
                            key={
                              student._id
                            }
                            type="button"
                            onClick={() =>
                              toggleStudent(
                                student._id,
                              )
                            }
                            className={`flex w-full items-center gap-4 px-5 py-4 text-left transition ${
                              selected
                                ? "bg-violet-50/70"
                                : "hover:bg-slate-50"
                            }`}
                          >

                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                                selected
                                  ? "border-violet-600 bg-violet-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {selected && (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </div>

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-600">
                              {student.name
                                .charAt(
                                  0,
                                )
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="font-black text-slate-900">
                                {student.name}
                              </div>

                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-400">

                                <span>
                                  {student.email}
                                </span>

                                <span>
                                  {student.phone}
                                </span>

                              </div>

                            </div>

                          </button>
                        );
                      },
                    )}

                  </div>
                )}

              </div>

              {/* FOOTER */}

              <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4">

                <div className="mb-3 flex items-center justify-between text-xs">

                  <span className="font-bold text-slate-500">
                    Selected
                  </span>

                  <span className="font-black text-violet-700">
                    {selectedStudents.length}
                  </span>

                </div>

                {selectedVisibleCount <
                    selectedStudents.length &&
                  selectedStudents.length >
                    0 && (
                    <p className="mb-3 text-[11px] font-semibold text-slate-400">
                      {selectedStudents.length -
                        selectedVisibleCount}{" "}
                      selected student
                      {selectedStudents.length -
                        selectedVisibleCount ===
                      1
                        ? ""
                        : "s"}{" "}
                      hidden by the current search.
                    </p>
                  )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeAddModal
                    }
                    disabled={adding}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      adding ||
                      selectedStudents.length ===
                        0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}

                    {adding
                      ? "Adding..."
                      : `Add ${
                          selectedStudents.length
                        } Student${
                          selectedStudents.length ===
                          1
                            ? ""
                            : "s"
                        }`}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>
      )}

          </div>
    </main>
  );
}

/* ============================================================
   INFO CARD
   ============================================================ */

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-bold text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
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


