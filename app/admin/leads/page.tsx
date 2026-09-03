"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowDownUp,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Mail,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";

import {
  getLeads,
  updateLeadStatus,
  type Lead,
  type LeadGoal,
  type LeadInterest,
  type LeadStatus,
} from "@/lib/api";

const INTEREST_OPTIONS: {
  value: LeadInterest;
  label: string;
}[] = [
  {
    value: "free-courses",
    label: "Free Courses",
  },
  {
    value: "job-ready-courses",
    label: "Job Ready Courses",
  },
  {
    value: "mock-tests",
    label: "Mock Tests & Practice",
  },
  {
    value: "job-updates",
    label: "Job & Exam Updates",
  },
];

const STATUS_OPTIONS: {
  value: LeadStatus;
  label: string;
}[] = [
  {
    value: "new",
    label: "New",
  },
  {
    value: "contacted",
    label: "Contacted",
  },
  {
    value: "interested",
    label: "Interested",
  },
  {
    value: "converted",
    label: "Converted",
  },
  {
    value: "not-interested",
    label: "Not Interested",
  },
];

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function getRelativeDate(date: string) {
  const value = new Date(date).getTime();

  if (!Number.isFinite(value)) {
    return "";
  }

  const difference = Date.now() - value;
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return "";
}

function getStatusClasses(status: LeadStatus) {
  switch (status) {
    case "converted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "interested":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "contacted":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "not-interested":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "new":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function getStatusDot(status: LeadStatus) {
  switch (status) {
    case "converted":
      return "bg-emerald-500";

    case "interested":
      return "bg-violet-500";

    case "contacted":
      return "bg-blue-500";

    case "not-interested":
      return "bg-rose-500";

    case "new":
    default:
      return "bg-amber-500";
  }
}

function getInterestLabel(interest: string) {
  return (
    INTEREST_OPTIONS.find((item) => item.value === interest)?.label ||
    interest
  );
}

function getLeadId(lead: Lead) {
  return String(lead.id || lead._id);
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [goal, setGoal] = useState<LeadGoal | "">("");
  const [interest, setInterest] = useState<LeadInterest | "">("");
  const [status, setStatus] = useState<LeadStatus | "">("");

  const [stats, setStats] = useState({
    total: 0,
    government: 0,
    private: 0,
    freeCourses: 0,
    jobReadyCourses: 0,
    mockTests: 0,
    jobUpdates: 0,
  });

  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  const loadLeads = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getLeads({
        search: search.trim() || undefined,
        goal: goal || undefined,
        interest: interest || undefined,
        status: status || undefined,
      });

      setLeads(response.leads || []);

      setStats(
        response.stats || {
          total: 0,
          government: 0,
          private: 0,
          freeCourses: 0,
          jobReadyCourses: 0,
          mockTests: 0,
          jobUpdates: 0,
        },
      );
    } catch (loadError) {
      console.error("Load leads error:", loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load leads.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads;
  }, [leads]);

  const dashboardMetrics = useMemo(() => {
    const total = leads.length;

    const newLeads = leads.filter(
      (lead) => lead.status === "new",
    ).length;

    const contacted = leads.filter(
      (lead) => lead.status === "contacted",
    ).length;

    const interested = leads.filter(
      (lead) => lead.status === "interested",
    ).length;

    const converted = leads.filter(
      (lead) => lead.status === "converted",
    ).length;

    const notInterested = leads.filter(
      (lead) => lead.status === "not-interested",
    ).length;

    const conversionRate =
      total > 0 ? Math.round((converted / total) * 100) : 0;

    const engagementRate =
      total > 0
        ? Math.round(((contacted + interested + converted) / total) * 100)
        : 0;

    const governmentPercentage =
      stats.total > 0
        ? Math.round((stats.government / stats.total) * 100)
        : 0;

    const privatePercentage =
      stats.total > 0
        ? Math.round((stats.private / stats.total) * 100)
        : 0;

    return {
      total,
      newLeads,
      contacted,
      interested,
      converted,
      notInterested,
      conversionRate,
      engagementRate,
      governmentPercentage,
      privatePercentage,
    };
  }, [leads, stats]);

  const interestAnalytics = useMemo(() => {
    const items = [
      {
        label: "Mock Tests",
        value: stats.mockTests,
        percentage:
          stats.total > 0
            ? Math.round((stats.mockTests / stats.total) * 100)
            : 0,
      },
      {
        label: "Job Ready",
        value: stats.jobReadyCourses,
        percentage:
          stats.total > 0
            ? Math.round((stats.jobReadyCourses / stats.total) * 100)
            : 0,
      },
      {
        label: "Job Updates",
        value: stats.jobUpdates,
        percentage:
          stats.total > 0
            ? Math.round((stats.jobUpdates / stats.total) * 100)
            : 0,
      },
      {
        label: "Free Courses",
        value: stats.freeCourses,
        percentage:
          stats.total > 0
            ? Math.round((stats.freeCourses / stats.total) * 100)
            : 0,
      },
    ];

    return items.sort((a, b) => b.value - a.value);
  }, [stats]);

  const recentActivity = useMemo(() => {
    return [...leads]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [leads]);

  const handleStatusChange = async (
    leadId: string,
    nextStatus: LeadStatus,
  ) => {
    try {
      setUpdatingLeadId(leadId);
      setError("");

      const response = await updateLeadStatus(
        leadId,
        nextStatus,
      );

      setLeads((current) =>
        current.map((lead) =>
          getLeadId(lead) === leadId
            ? {
                ...lead,
                status:
                  response.lead?.status || nextStatus,
              }
            : lead,
        ),
      );
    } catch (statusError) {
      console.error(
        "Update lead status error:",
        statusError,
      );

      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update lead status.",
      );
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setGoal("");
    setInterest("");
    setStatus("");
  };

  const hasFilters =
    Boolean(search) ||
    Boolean(goal) ||
    Boolean(interest) ||
    Boolean(status);

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* ===================================================== */}
        {/* TOP HEADER                                            */}
        {/* ===================================================== */}

        <header className="mb-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-violet-700 shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                JobWay Intelligence
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
                <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[42px]">
                  Lead Command Center
                </h1>

                <span className="mb-1 hidden h-2 w-2 rounded-full bg-emerald-500 sm:block" />
                <span className="mb-0.5 text-xs font-bold text-emerald-600">
                  Live CRM
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                Analyze acquisition, understand candidate intent,
                and move high-value JobWay leads toward conversion.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur sm:block">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Current view
                </p>
                <p className="mt-0.5 text-sm font-black text-slate-800">
                  {filteredLeads.length} active lead
                  {filteredLeads.length === 1 ? "" : "s"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadLeads(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================== */}
        {/* ERROR                                                 */}
        {/* ===================================================== */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm">
            <div>
              <p className="font-black">Something needs attention</p>
              <p className="mt-0.5">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-full p-1 transition hover:bg-rose-100"
              aria-label="Close error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ===================================================== */}
        {/* KPI STRIP                                             */}
        {/* ===================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Leads"
            value={stats.total}
            icon={<Users className="h-5 w-5" />}
            accent="violet"
            helper="All captured candidates"
          />

          <MetricCard
            label="Government"
            value={stats.government}
            icon={<Building2 className="h-5 w-5" />}
            accent="indigo"
            helper={`${dashboardMetrics.governmentPercentage}% of total`}
          />

          <MetricCard
            label="Private"
            value={stats.private}
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            accent="fuchsia"
            helper={`${dashboardMetrics.privatePercentage}% of total`}
          />

          <MetricCard
            label="Mock Test Interest"
            value={stats.mockTests}
            icon={<Target className="h-5 w-5" />}
            accent="emerald"
            helper="Practice-driven demand"
          />
        </section>

        {/* ===================================================== */}
        {/* ANALYTICAL OVERVIEW                                   */}
        {/* ===================================================== */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          {/* Lead pipeline */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Activity className="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <h2 className="text-base font-black text-slate-950">
                      Lead Pipeline
                    </h2>
                    <p className="text-xs font-semibold text-slate-400">
                      Current lead lifecycle distribution
                    </p>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
                <TrendingUp className="h-3.5 w-3.5" />
                {dashboardMetrics.engagementRate}% engaged
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-5">
                <PipelineItem
                  label="New"
                  value={dashboardMetrics.newLeads}
                  percentage={getPercentage(
                    dashboardMetrics.newLeads,
                    dashboardMetrics.total,
                  )}
                  dot="bg-amber-500"
                />

                <PipelineItem
                  label="Contacted"
                  value={dashboardMetrics.contacted}
                  percentage={getPercentage(
                    dashboardMetrics.contacted,
                    dashboardMetrics.total,
                  )}
                  dot="bg-blue-500"
                />

                <PipelineItem
                  label="Interested"
                  value={dashboardMetrics.interested}
                  percentage={getPercentage(
                    dashboardMetrics.interested,
                    dashboardMetrics.total,
                  )}
                  dot="bg-violet-500"
                />

                <PipelineItem
                  label="Converted"
                  value={dashboardMetrics.converted}
                  percentage={getPercentage(
                    dashboardMetrics.converted,
                    dashboardMetrics.total,
                  )}
                  dot="bg-emerald-500"
                />

                <PipelineItem
                  label="Dropped"
                  value={dashboardMetrics.notInterested}
                  percentage={getPercentage(
                    dashboardMetrics.notInterested,
                    dashboardMetrics.total,
                  )}
                  dot="bg-rose-500"
                />
              </div>

              <div className="mt-7">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Conversion efficiency
                  </span>

                  <span className="text-sm font-black text-slate-900">
                    {dashboardMetrics.conversionRate}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 transition-all duration-700"
                    style={{
                      width: `${dashboardMetrics.conversionRate}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>
                    {dashboardMetrics.converted} converted
                  </span>
                  <span>{stats.total} total leads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Goal distribution */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BarChart3 className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="text-base font-black text-slate-950">
                      Candidate Intent
                    </h2>
                    <p className="text-xs font-semibold text-slate-400">
                      Career goal distribution
                    </p>
                  </div>
                </div>
              </div>

              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-500">
                ALL
              </span>
            </div>

            <div className="mt-7 flex items-center gap-6">
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#7c3aed_0deg,#7c3aed_245deg,#d946ef_245deg,#d946ef_360deg)]">
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-2xl font-black tracking-tight text-slate-950">
                    {dashboardMetrics.governmentPercentage}%
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Government
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-5">
                <GoalRow
                  label="Government Job"
                  value={stats.government}
                  percentage={
                    dashboardMetrics.governmentPercentage
                  }
                  dot="bg-violet-600"
                />

                <GoalRow
                  label="Private Job"
                  value={stats.private}
                  percentage={dashboardMetrics.privatePercentage}
                  dot="bg-fuchsia-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* INTEREST INTELLIGENCE                                 */}
        {/* ===================================================== */}

        <section className="mt-5 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600">
                  <Zap className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-950">
                    Interest Intelligence
                  </h2>
                  <p className="text-xs font-semibold text-slate-400">
                    What candidates are asking JobWay for
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              Audience signals
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {interestAnalytics.map((item, index) => (
              <InterestCard
                key={item.label}
                label={item.label}
                value={item.value}
                percentage={item.percentage}
                rank={index + 1}
              />
            ))}
          </div>
        </section>

        {/* ===================================================== */}
        {/* FILTERS                                               */}
        {/* ===================================================== */}

        <section className="mt-5 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Filter className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-base font-black text-slate-950">
                  Lead Explorer
                </h2>
                <p className="text-xs font-semibold text-slate-400">
                  Find and segment your audience
                </p>
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 self-start rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-black text-violet-700 transition hover:bg-violet-100 sm:self-auto"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>

          <div className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadLeads(true);
                  }
                }}
                placeholder="Search name, email or phone..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <FilterSelect
              value={goal}
              onChange={(value) =>
                setGoal(value as LeadGoal | "")
              }
              options={[
                { value: "", label: "All Goals" },
                {
                  value: "government",
                  label: "Government Job",
                },
                {
                  value: "private",
                  label: "Private Job",
                },
              ]}
            />

            <FilterSelect
              value={interest}
              onChange={(value) =>
                setInterest(value as LeadInterest | "")
              }
              options={[
                { value: "", label: "All Interests" },
                ...INTEREST_OPTIONS,
              ]}
            />

            <FilterSelect
              value={status}
              onChange={(value) =>
                setStatus(value as LeadStatus | "")
              }
              options={[
                { value: "", label: "All Statuses" },
                ...STATUS_OPTIONS,
              ]}
            />

            <button
              type="button"
              onClick={() => loadLeads(true)}
              disabled={refreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(124,58,237,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              Apply
            </button>
          </div>
        </section>

        {/* ===================================================== */}
        {/* LEADS TABLE + ACTIVITY                                */}
        {/* ===================================================== */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_330px]">
          {/* Table */}
          <div className="min-w-0 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-950">
                    Captured Leads
                  </h2>

                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-700">
                    {filteredLeads.length}
                  </span>
                </div>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Candidate records from the JobWay acquisition funnel
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400">
                <ArrowDownUp className="h-3.5 w-3.5" />
                Newest first
              </div>
            </div>

            {loading ? (
              <LeadTableSkeleton />
            ) : filteredLeads.length === 0 ? (
              <EmptyState
                hasFilters={hasFilters}
                onClear={clearFilters}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                      <TableHeading>Lead</TableHeading>
                      <TableHeading>Goal</TableHeading>
                      <TableHeading>Interests</TableHeading>
                      <TableHeading>Source</TableHeading>
                      <TableHeading>Created</TableHeading>
                      <TableHeading>Status</TableHeading>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeads.map((lead) => {
                      const leadId = getLeadId(lead);
                      const updating =
                        updatingLeadId === leadId;

                      const relative = getRelativeDate(
                        lead.createdAt,
                      );

                      return (
                        <tr
                          key={leadId}
                          className="group border-b border-slate-100 transition duration-200 hover:bg-violet-50/30"
                        >
                          {/* Lead */}
                          <td className="px-5 py-5 align-top">
                            <div className="flex min-w-[260px] items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-sm font-black text-violet-700">
                                {getInitials(lead.name)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-black text-slate-900">
                                  {lead.name}
                                </p>

                                <a
                                  href={`mailto:${lead.email}`}
                                  className="mt-1 flex max-w-[260px] items-center gap-1.5 truncate text-xs font-semibold text-slate-500 transition hover:text-violet-700"
                                >
                                  <Mail className="h-3.5 w-3.5 shrink-0" />
                                  {lead.email}
                                </a>

                                <a
                                  href={`tel:${lead.phone}`}
                                  className="mt-1 block text-xs font-semibold text-slate-500 transition hover:text-violet-700"
                                >
                                  +91 {lead.phone}
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Goal */}
                          <td className="px-5 py-5 align-top">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black ${
                                lead.goal === "government"
                                  ? "border-violet-200 bg-violet-50 text-violet-700"
                                  : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  lead.goal === "government"
                                    ? "bg-violet-500"
                                    : "bg-fuchsia-500"
                                }`}
                              />

                              {lead.goal === "government"
                                ? "Government"
                                : "Private"}
                            </span>
                          </td>

                          {/* Interests */}
                          <td className="px-5 py-5 align-top">
                            <div className="flex max-w-[310px] flex-wrap gap-1.5">
                              {lead.interests.map((item) => (
                                <span
                                  key={item}
                                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-600"
                                >
                                  {getInterestLabel(item)}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Source */}
                          <td className="px-5 py-5 align-top">
                            <div className="inline-flex max-w-[170px] items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />

                              <span className="truncate text-[11px] font-bold text-slate-500">
                                {lead.source ||
                                  "homepage-exam-selector"}
                              </span>
                            </div>
                          </td>

                          {/* Created */}
                          <td className="whitespace-nowrap px-5 py-5 align-top">
                            <p className="text-xs font-bold text-slate-600">
                              {formatDate(lead.createdAt)}
                            </p>

                            {relative && (
                              <p className="mt-1 text-[10px] font-bold text-slate-400">
                                {relative}
                              </p>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-5 align-top">
                            <div className="relative inline-block">
                              <span
                                className={`pointer-events-none absolute left-3 top-1/2 z-10 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${getStatusDot(
                                  lead.status,
                                )}`}
                              />

                              {updating && (
                                <RefreshCw className="pointer-events-none absolute right-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-violet-600" />
                              )}

                              <select
                                value={lead.status}
                                disabled={updating}
                                onChange={(event) =>
                                  handleStatusChange(
                                    leadId,
                                    event.target
                                      .value as LeadStatus,
                                  )
                                }
                                className={`h-9 min-w-[145px] appearance-none rounded-full border pl-6 pr-8 text-[11px] font-black outline-none transition focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60 ${getStatusClasses(
                                  lead.status,
                                )}`}
                              >
                                {STATUS_OPTIONS.map(
                                  (item) => (
                                    <option
                                      key={item.value}
                                      value={item.value}
                                    >
                                      {item.label}
                                    </option>
                                  ),
                                )}
                              </select>

                              {!updating && (
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-50" />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <aside className="rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Clock3 className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-950">
                    Recent Activity
                  </h2>
                  <p className="text-xs font-semibold text-slate-400">
                    Latest captured leads
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="flex animate-pulse gap-3"
                    >
                      <div className="h-9 w-9 rounded-xl bg-slate-100" />
                      <div className="flex-1">
                        <div className="h-3 w-24 rounded bg-slate-100" />
                        <div className="mt-2 h-2.5 w-32 rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock3 className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-3 text-sm font-black text-slate-700">
                    No recent activity
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentActivity.map((lead) => (
                    <div
                      key={getLeadId(lead)}
                      className="group flex gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
                    >
                      <div className="relative">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-[10px] font-black text-violet-700">
                          {getInitials(lead.name)}
                        </div>

                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${getStatusDot(
                            lead.status,
                          )}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black text-slate-800">
                          {lead.name}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
                          {lead.goal === "government"
                            ? "Government Job"
                            : "Private Job"}
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                          {getRelativeDate(lead.createdAt) ||
                            formatDate(lead.createdAt)}
                        </p>
                      </div>

                      <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-violet-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>

        {/* ===================================================== */}
        {/* FOOTER INSIGHT BAR                                    */}
        {/* ===================================================== */}

        <section className="mt-5 overflow-hidden rounded-[28px] border border-violet-200/70 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 shadow-[0_18px_60px_rgba(124,58,237,0.06)]">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-violet-600">
                  CRM Insight
                </p>

                <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
                  {dashboardMetrics.newLeads > 0
                    ? `${dashboardMetrics.newLeads} new lead${
                        dashboardMetrics.newLeads === 1
                          ? ""
                          : "s"
                      } currently need attention.`
                    : dashboardMetrics.converted > 0
                      ? `${dashboardMetrics.converted} lead${
                          dashboardMetrics.converted === 1
                            ? ""
                            : "s"
                        } have reached conversion.`
                      : "Your lead pipeline is ready for the next acquisition cycle."}
                </p>
              </div>
            </div>

            <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white bg-white/80 px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              {dashboardMetrics.converted} converted
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================= */
/* COMPONENTS                                                    */
/* ============================================================= */

function MetricCard({
  label,
  value,
  icon,
  accent,
  helper,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  accent: "violet" | "indigo" | "fuchsia" | "emerald";
  helper: string;
}) {
  const accentClasses = {
    violet: {
      icon: "bg-violet-50 text-violet-600",
      glow: "from-violet-500/10",
    },
    indigo: {
      icon: "bg-indigo-50 text-indigo-600",
      glow: "from-indigo-500/10",
    },
    fuchsia: {
      icon: "bg-fuchsia-50 text-fuchsia-600",
      glow: "from-fuchsia-500/10",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      glow: "from-emerald-500/10",
    },
  };

  const current = accentClasses[accent];

  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_15px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${current.glow} to-transparent blur-2xl`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
            {value.toLocaleString("en-IN")}
          </p>

          <div className="mt-2 flex items-center gap-1.5">
            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400">
              {helper}
            </span>
          </div>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${current.icon} transition duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function PipelineItem({
  label,
  value,
  percentage,
  dot,
}: {
  label: string;
  value: number;
  percentage: number;
  dot: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-white">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold text-slate-400">
        {percentage}% of leads
      </p>
    </div>
  );
}

function GoalRow({
  label,
  value,
  percentage,
  dot,
}: {
  label: string;
  value: number;
  percentage: number;
  dot: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          <span className="text-xs font-black text-slate-700">
            {label}
          </span>
        </div>

        <span className="text-xs font-black text-slate-900">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${dot} transition-all duration-700`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function InterestCard({
  label,
  value,
  percentage,
  rank,
}: {
  label: string;
  value: number;
  percentage: number;
  rank: number;
}) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-violet-100 hover:bg-white hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[10px] font-black text-violet-600 shadow-sm">
          #{rank}
        </span>

        <span className="text-[10px] font-black text-slate-400">
          {percentage}%
        </span>
      </div>

      <p className="mt-4 truncate text-xs font-black text-slate-700">
        {label}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="text-2xl font-black tracking-tight text-slate-950">
          {value}
        </span>

        <div className="mb-1 h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700"
            style={{
              width: `${Math.min(100, percentage)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function TableHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
      {children}
    </th>
  );
}

function LeadTableSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex min-w-[1000px] animate-pulse items-center gap-8 border-b border-slate-100 px-5 py-5"
        >
          <div className="flex w-[260px] items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100" />

            <div className="flex-1">
              <div className="h-3 w-28 rounded bg-slate-100" />
              <div className="mt-2 h-2.5 w-40 rounded bg-slate-100" />
              <div className="mt-2 h-2.5 w-24 rounded bg-slate-100" />
            </div>
          </div>

          <div className="h-7 w-24 rounded-full bg-slate-100" />

          <div className="h-7 w-40 rounded-lg bg-slate-100" />

          <div className="h-7 w-32 rounded-xl bg-slate-100" />

          <div className="h-7 w-28 rounded bg-slate-100" />

          <div className="h-9 w-32 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600">
        <Users className="h-7 w-7" />

        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-violet-500" />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-900">
        No leads found
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "The current filters do not match any lead. Try broadening your search."
          : "New leads captured through the JobWay funnel will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function getPercentage(
  value: number,
  total: number,
) {
  if (!total) return 0;

  return Math.round((value / total) * 100);
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "JW";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}