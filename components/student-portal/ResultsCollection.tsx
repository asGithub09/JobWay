"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import type { EducatorExamResultItem } from "@/lib/api";

interface ResultsCollectionProps {
  results: EducatorExamResultItem[];

  expandedId: string | null;

  onToggleExpanded: (id: string) => void;

  renderResult: (
    item: EducatorExamResultItem,
    isExpanded: boolean,
  ) => React.ReactNode;
}

type StatusFilter =
  | "ALL"
  | "SUBMITTED"
  | "PASSED"
  | "FAILED"
  | "EXPIRED"
  | "TERMINATED"
  | "LOCKED";

type SortOption =
  | "RECENT"
  | "OLDEST"
  | "HIGHEST_SCORE"
  | "LOWEST_SCORE";

const RESULTS_PER_PAGE = 10;

function getSearchText(item: EducatorExamResultItem) {
  return [
    item.exam?.title || "",
    item.exam?.subject || "",
    item.exam?.category || "",
    item.exam?.topic || "",
    item.status || "",
  ]
    .join(" ")
    .toLowerCase();
}

function getSubmittedTime(item: EducatorExamResultItem) {
  if (!item.submittedAt) return 0;

  const time = new Date(item.submittedAt).getTime();

  return Number.isNaN(time) ? 0 : time;
}

export default function ResultsCollection({
  results,
  expandedId,
  onToggleExpanded,
  renderResult,
}: ResultsCollectionProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [sortBy, setSortBy] =
    useState<SortOption>("RECENT");

  const [currentPage, setCurrentPage] = useState(1);

  /*
   * ------------------------------------------------------------
   * FILTER + SEARCH
   * ------------------------------------------------------------
   */

  const filteredResults = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return results.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        getSearchText(item).includes(normalizedSearch);

      let matchesStatus = true;

      switch (statusFilter) {
        case "SUBMITTED":
          matchesStatus = item.status === "SUBMITTED";
          break;

        case "PASSED":
          matchesStatus =
            item.status === "SUBMITTED" && item.passed === true;
          break;

        case "FAILED":
          matchesStatus =
            item.status === "SUBMITTED" && item.passed === false;
          break;

        case "EXPIRED":
          matchesStatus = item.status === "EXPIRED";
          break;

        case "TERMINATED":
          matchesStatus = item.status === "TERMINATED";
          break;

        case "LOCKED":
          matchesStatus = item.status === "LOCKED";
          break;

        case "ALL":
        default:
          matchesStatus = true;
      }

      return matchesSearch && matchesStatus;
    });
  }, [results, search, statusFilter]);

  /*
   * ------------------------------------------------------------
   * SORT
   * ------------------------------------------------------------
   */

  const sortedResults = useMemo(() => {
    const sorted = [...filteredResults];

    sorted.sort((a, b) => {
      switch (sortBy) {
        case "OLDEST":
          return (
            getSubmittedTime(a) -
            getSubmittedTime(b)
          );

        case "HIGHEST_SCORE":
          return (
            Number(b.percentage || 0) -
            Number(a.percentage || 0)
          );

        case "LOWEST_SCORE":
          return (
            Number(a.percentage || 0) -
            Number(b.percentage || 0)
          );

        case "RECENT":
        default:
          return (
            getSubmittedTime(b) -
            getSubmittedTime(a)
          );
      }
    });

    return sorted;
  }, [filteredResults, sortBy]);

  /*
   * ------------------------------------------------------------
   * PAGINATION
   * ------------------------------------------------------------
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedResults.length / RESULTS_PER_PAGE,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedResults = useMemo(() => {
    const start =
      (safeCurrentPage - 1) *
      RESULTS_PER_PAGE;

    return sortedResults.slice(
      start,
      start + RESULTS_PER_PAGE,
    );
  }, [sortedResults, safeCurrentPage]);

  /*
   * Reset pagination when filters change.
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy]);

  /*
   * ------------------------------------------------------------
   * PAGINATION HELPERS
   * ------------------------------------------------------------
   */

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];

    const start = Math.max(
      1,
      safeCurrentPage - 2,
    );

    const end = Math.min(
      totalPages,
      safeCurrentPage + 2,
    );

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [safeCurrentPage, totalPages]);

  const rangeStart =
    sortedResults.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          RESULTS_PER_PAGE +
        1;

  const rangeEnd = Math.min(
    safeCurrentPage * RESULTS_PER_PAGE,
    sortedResults.length,
  );

  /*
   * ------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------
   */

  return (
    <section>
      {/* --------------------------------------------------------
          TOOLBAR
          -------------------------------------------------------- */}

      <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search */}

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by test name, subject or category..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* Filters */}

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <span className="sr-only">
                Filter results
              </span>

              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter,
                  )
                }
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-9 text-sm font-bold text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 sm:w-44"
              >
                <option value="ALL">
                  All Results
                </option>
                <option value="SUBMITTED">
                  Completed
                </option>
                <option value="PASSED">
                  Passed
                </option>
                <option value="FAILED">
                  Failed
                </option>
                <option value="EXPIRED">
                  Expired
                </option>
                <option value="TERMINATED">
                  Terminated
                </option>
                <option value="LOCKED">
                  Locked
                </option>
              </select>
            </label>

            <label>
              <span className="sr-only">
                Sort results
              </span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as SortOption,
                  )
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 sm:w-48"
              >
                <option value="RECENT">
                  Most Recent
                </option>

                <option value="OLDEST">
                  Oldest
                </option>

                <option value="HIGHEST_SCORE">
                  Highest Score
                </option>

                <option value="LOWEST_SCORE">
                  Lowest Score
                </option>
              </select>
            </label>
          </div>
        </div>

        {/* Result count */}

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {rangeStart}–{rangeEnd} of{" "}
            {sortedResults.length} results
          </span>

          {search || statusFilter !== "ALL" ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setSortBy("RECENT");
              }}
              className="self-start text-violet-600 transition hover:text-violet-700 sm:self-auto"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {/* --------------------------------------------------------
          EMPTY FILTER RESULT
          -------------------------------------------------------- */}

      {sortedResults.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Search className="mx-auto h-9 w-9 text-slate-300" />

          <h3 className="mt-4 text-lg font-black text-slate-900">
            No matching results
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Try a different test name, subject,
            status or sorting option.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setSortBy("RECENT");
            }}
            className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* ----------------------------------------------------
              RESULTS
              ---------------------------------------------------- */}

          <div className="space-y-4">
            {paginatedResults.map((item) => (
              <div key={item.id}>
                {renderResult(
                  item,
                  expandedId === item.id,
                )}
              </div>
            ))}
          </div>

          {/* ----------------------------------------------------
              PAGINATION
              ---------------------------------------------------- */}

          {totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1),
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center justify-center gap-1.5">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={[
                      "h-10 min-w-10 rounded-xl px-3 text-sm font-black transition",
                      page === safeCurrentPage
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={
                  safeCurrentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(
                      totalPages,
                      page + 1,
                    ),
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}