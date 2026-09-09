"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const TOKEN_KEY = "jobway_token";

type AccessType = "FREE" | "PREMIUM";
type AttemptPolicy = "SINGLE_ATTEMPT" | "MULTIPLE_ATTEMPTS";

type ProctoringSettings = {
  enabled: boolean;
  requireCamera: boolean;
  requireMicrophone: boolean;
  requireFullscreen: boolean;
  monitorFullscreen: boolean;
  monitorVisibility: boolean;
  monitorBlur: boolean;
  monitorContextMenu: boolean;
  maxStrikes: number;
  saveViolationLogs: boolean;
  terminationCountdownSeconds: number;
};

const defaultProctoring: ProctoringSettings = {
  enabled: false,
  requireCamera: true,
  requireMicrophone: true,
  requireFullscreen: true,
  monitorFullscreen: true,
  monitorVisibility: true,
  monitorBlur: true,
  monitorContextMenu: true,
  maxStrikes: 2,
  saveViolationLogs: true,
  terminationCountdownSeconds: 7,
};

export default function CreateEducatorExamPage() {
  const [title, setTitle] = useState("");
  const [shortName, setShortName] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");

  const [durationMinutes, setDurationMinutes] = useState("60");
  const [passingPercentage, setPassingPercentage] = useState("40");

  const [accessType, setAccessType] = useState<AccessType>("FREE");
  const [attemptPolicy, setAttemptPolicy] =
    useState<AttemptPolicy>("SINGLE_ATTEMPT");
  const [maxAttempts, setMaxAttempts] = useState("1");

  const [proctoring, setProctoring] =
    useState<ProctoringSettings>(defaultProctoring);

  const [questionSelectionMode, setQuestionSelectionMode] =
    useState("MANUAL");

  const [selectedQuestionIds, setSelectedQuestionIds] =
    useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalMarks = useMemo(() => 0, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawQuestionIds = params.get("questionIds");

    if (!rawQuestionIds) {
      return;
    }

    const ids = rawQuestionIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length > 0) {
      setSelectedQuestionIds(
        Array.from(new Set(ids)),
      );
    }
  }, []);

  function updateProctoring(
    field: keyof ProctoringSettings,
    value: boolean | number,
  ) {
    setProctoring((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        throw new Error("Your login session has expired. Please log in again.");
      }

      if (!title.trim()) {
        throw new Error("Exam title is required.");
      }

      if (!category.trim()) {
        throw new Error("Exam category is required.");
      }

      const duration = Number(durationMinutes);
      const passing = Number(passingPercentage);

      if (!Number.isFinite(duration) || duration <= 0) {
        throw new Error("Enter a valid exam duration.");
      }

      if (
        !Number.isFinite(passing) ||
        passing < 0 ||
        passing > 100
      ) {
        throw new Error("Passing percentage must be between 0 and 100.");
      }

      const payload = {
        title: title.trim(),
        shortName: shortName.trim(),
        category: category.trim(),
        subject: subject.trim(),
        topic: topic.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        durationMinutes: duration,
        passingPercentage: passing,
        accessType,
        attemptPolicy,
        maxAttempts:
          attemptPolicy === "SINGLE_ATTEMPT"
            ? 1
            : Math.max(1, Number(maxAttempts) || 1),
        questionSelectionMode,
        questions: selectedQuestionIds.map((questionId, index) => ({
      question: questionId,
      order: index,
      marks: 1,
      negativeMarks: 0,
    })),
        proctoring,
      };

      const response = await fetch("/api/educator/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to create the exam.",
        );
      }

      setMessage("Exam draft created successfully.");

      if (data?.exam?._id) {
        window.location.href = `/educator/exams/${data.exam._id}`;
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create the exam.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Link
                href="/educator"
                className="hover:text-slate-900"
              >
                Educator Workspace
              </Link>

              <span>/</span>

              <Link
                href="/educator/exams"
                className="hover:text-slate-900"
              >
                Exams
              </Link>

              <span>/</span>

              <span className="text-slate-900">Create</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Create Exam
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Build an exam, configure access and attempts, then add
              questions from the question bank.
            </p>
          </div>

          <Link
            href="/educator/exams"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back to Exams
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  1
                </div>

                <div>
                  <h2 className="font-semibold text-slate-950">
                    Basic Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define the exam identity and academic classification.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <Field
                label="Exam Title"
                required
                value={title}
                onChange={setTitle}
                placeholder="Example: Physical Geology Mock Test 01"
              />

              <Field
                label="Short Name"
                value={shortName}
                onChange={setShortName}
                placeholder="Example: GEO-PG-01"
              />

              <Field
                label="Category"
                required
                value={category}
                onChange={setCategory}
                placeholder="Example: Competitive Exams"
              />

              <Field
                label="Subject"
                value={subject}
                onChange={setSubject}
                placeholder="Example: Geology"
              />

              <Field
                label="Topic"
                value={topic}
                onChange={setTopic}
                placeholder="Example: Physical Geology"
              />

              <Field
                label="Duration"
                value={durationMinutes}
                onChange={setDurationMinutes}
                type="number"
                min="1"
                suffix="minutes"
              />

              <Field
                label="Passing Percentage"
                value={passingPercentage}
                onChange={setPassingPercentage}
                type="number"
                min="0"
                max="100"
                suffix="%"
              />

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current Question Count
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {selectedQuestionIds.length} {selectedQuestionIds.length === 1 ? "question" : "questions"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Questions will be added in the Question Builder.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={4}
                  placeholder="Describe what this exam covers..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Student Instructions
                </label>

                <textarea
                  value={instructions}
                  onChange={(event) =>
                    setInstructions(event.target.value)
                  }
                  rows={5}
                  placeholder="Enter instructions students should read before starting the exam..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  2
                </div>

                <div>
                  <h2 className="font-semibold text-slate-950">
                    Access & Attempts
                  </h2>
                  <p className="text-xs text-slate-500">
                    Control who can access the exam and how many times.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <ChoiceCard
                title="Free Exam"
                description="Available to registered JobWay users without purchase or enrollment."
                selected={accessType === "FREE"}
                onClick={() => setAccessType("FREE")}
              />

              <ChoiceCard
                title="Premium Exam"
                description="Requires a server-side entitlement before a student can start."
                selected={accessType === "PREMIUM"}
                onClick={() => setAccessType("PREMIUM")}
              />

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Attempt Policy
                </label>

                <select
                  value={attemptPolicy}
                  onChange={(event) =>
                    setAttemptPolicy(
                      event.target.value as AttemptPolicy,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="SINGLE_ATTEMPT">
                    Single Attempt
                  </option>
                  <option value="MULTIPLE_ATTEMPTS">
                    Multiple Attempts
                  </option>
                </select>
              </div>

              {attemptPolicy === "MULTIPLE_ATTEMPTS" && (
                <Field
                  label="Maximum Attempts"
                  value={maxAttempts}
                  onChange={setMaxAttempts}
                  type="number"
                  min="1"
                />
              )}

              <div className="sm:col-span-2 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Access security
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Premium access will be checked on the server when a
                  student starts the exam. The frontend will never be
                  treated as the authority for premium access.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  3
                </div>

                <div>
                  <h2 className="font-semibold text-slate-950">
                    Proctoring
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure monitoring independently from exam access.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <ToggleRow
                label="Enable Proctoring"
                description="Enable camera, microphone, fullscreen and browser-event monitoring according to the settings below."
                checked={proctoring.enabled}
                onChange={(checked) =>
                  updateProctoring("enabled", checked)
                }
              />

              {proctoring.enabled && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <ToggleRow
                    label="Require Camera"
                    description="Student must verify camera access before starting."
                    checked={proctoring.requireCamera}
                    onChange={(checked) =>
                      updateProctoring("requireCamera", checked)
                    }
                  />

                  <ToggleRow
                    label="Require Microphone"
                    description="Student must verify microphone access before starting."
                    checked={proctoring.requireMicrophone}
                    onChange={(checked) =>
                      updateProctoring(
                        "requireMicrophone",
                        checked,
                      )
                    }
                  />

                  <ToggleRow
                    label="Require Fullscreen"
                    description="Student must enter fullscreen to begin."
                    checked={proctoring.requireFullscreen}
                    onChange={(checked) =>
                      updateProctoring(
                        "requireFullscreen",
                        checked,
                      )
                    }
                  />

                  <ToggleRow
                    label="Monitor Fullscreen"
                    description="Leaving fullscreen can trigger a violation."
                    checked={proctoring.monitorFullscreen}
                    onChange={(checked) =>
                      updateProctoring(
                        "monitorFullscreen",
                        checked,
                      )
                    }
                  />

                  <ToggleRow
                    label="Monitor Visibility"
                    description="Monitor browser visibility changes."
                    checked={proctoring.monitorVisibility}
                    onChange={(checked) =>
                      updateProctoring(
                        "monitorVisibility",
                        checked,
                      )
                    }
                  />

                  <ToggleRow
                    label="Monitor Window Blur"
                    description="Monitor when the exam window loses focus."
                    checked={proctoring.monitorBlur}
                    onChange={(checked) =>
                      updateProctoring("monitorBlur", checked)
                    }
                  />

                  <ToggleRow
                    label="Monitor Context Menu"
                    description="Monitor right-click/context-menu events."
                    checked={proctoring.monitorContextMenu}
                    onChange={(checked) =>
                      updateProctoring(
                        "monitorContextMenu",
                        checked,
                      )
                    }
                  />

                  <ToggleRow
                    label="Save Violation Logs"
                    description="Persist final violation information with the attempt."
                    checked={proctoring.saveViolationLogs}
                    onChange={(checked) =>
                      updateProctoring(
                        "saveViolationLogs",
                        checked,
                      )
                    }
                  />

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Maximum Strikes
                    </label>

                    <select
                      value={proctoring.maxStrikes}
                      onChange={(event) =>
                        updateProctoring(
                          "maxStrikes",
                          Number(event.target.value),
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value={1}>1 Strike</option>
                      <option value={2}>2 Strikes</option>
                      <option value={3}>3 Strikes</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Termination Countdown
                    </label>

                    <select
                      value={proctoring.terminationCountdownSeconds}
                      onChange={(event) =>
                        updateProctoring(
                          "terminationCountdownSeconds",
                          Number(event.target.value),
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value={5}>5 seconds</option>
                      <option value={7}>7 seconds</option>
                      <option value={10}>10 seconds</option>
                    </select>
                  </div>
                </div>
              )}

              {!proctoring.enabled && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Proctoring is currently disabled. Students will not
                  be required to complete camera, microphone or
                  fullscreen checks for this exam.
                </div>
              )}

              {proctoring.enabled && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Two-strike policy
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    The first violation will warn the student and
                    require them to resume the test and return to
                    fullscreen. The configured maximum strike count
                    controls termination on subsequent violations.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  4
                </div>

                <div>
                  <h2 className="font-semibold text-slate-950">
                    Question Setup
                  </h2>
                  <p className="text-xs text-slate-500">
                    Choose how questions will be added to this exam.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
              <ChoiceCard
                title="Manual"
                description="Select and arrange questions yourself."
                selected={questionSelectionMode === "MANUAL"}
                onClick={() => setQuestionSelectionMode("MANUAL")}
              />

              <ChoiceCard
                title="Random"
                description="Select questions automatically from the bank."
                selected={questionSelectionMode === "RANDOM"}
                onClick={() => setQuestionSelectionMode("RANDOM")}
              />

              <ChoiceCard
                title="Rule Based"
                description="Build a question set using subject, topic and difficulty rules."
                selected={questionSelectionMode === "RULE_BASED"}
                onClick={() =>
                  setQuestionSelectionMode("RULE_BASED")
                }
              />
            </div>

            <div className="border-t border-slate-200 px-5 py-4 sm:px-6">
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <p className="font-semibold text-slate-900">
                  Question Builder
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  The question bank and duplicate-question protection
                  will be connected in the next EMS step.
                </p>
              </div>
            </div>
          </section>

          {(error || message) && (
            <div
              className={`rounded-xl border p-4 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {error || message}
            </div>
          )}

          <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Ready to create the exam?
                </p>
                <p className="text-xs text-slate-500">
                  The exam will be saved as a draft.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/educator/exams"
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Creating Draft..." : "Create Exam Draft"}
                </button>
              </div>
            </div>
          </div>

          <div className="sr-only">
            Total marks currently configured: {totalMarks}
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  placeholder,
  type = "text",
  min,
  max,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        <input
          type={type}
          value={value}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${
            suffix ? "pr-24" : ""
          }`}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ChoiceCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
          : "border-slate-200 bg-white hover:border-slate-400"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected
              ? "border-slate-900 bg-slate-900"
              : "border-slate-300"
          }`}
        >
          {selected && (
            <span className="h-2 w-2 rounded-full bg-white" />
          )}
        </span>

        <span>
          <span className="block text-sm font-semibold text-slate-900">
            {title}
          </span>

          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-slate-900" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}