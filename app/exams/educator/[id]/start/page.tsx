"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flag,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  startEducatorExam,
  saveEducatorExamAnswer,
  submitEducatorExam,
  type EducatorExamAttemptQuestion,
  type EducatorExamAttempt,
  type EducatorExamResult,
} from "@/lib/api";

export default function EducatorExamStartPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const examId = params?.id;

  const [attempt, setAttempt] =
    useState<EducatorExamAttempt | null>(null);

  const [questions, setQuestions] =
    useState<EducatorExamAttemptQuestion[]>([]);

  const [examTitle, setExamTitle] =
    useState("");

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<string, string[]>>({});

  const [markedForReview, setMarkedForReview] =
    useState<Record<string, boolean>>({});

  const [remainingSeconds, setRemainingSeconds] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [started, setStarted] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [result, setResult] =
    useState<EducatorExamResult | null>(null);

  const [submitError, setSubmitError] =
    useState("");

  useEffect(() => {
    if (!examId) {
      setError("Invalid exam.");
      setLoading(false);
      return;
    }

    let active = true;

    const start = async () => {
      try {
        setStarting(true);

        const response =
          await startEducatorExam(examId);

        if (!active) {
          return;
        }

        setAttempt(response.attempt);
        setQuestions(response.questions || []);
        setExamTitle(response.exam.title || "Examination");
        setStarted(true);

        const savedAnswers: Record<string, string[]> = {};
        const savedReview: Record<string, boolean> = {};

        for (const answer of response.attempt.answers || []) {
          savedAnswers[String(answer.question)] =
            answer.selectedAnswers || [];

          savedReview[String(answer.question)] =
            Boolean(answer.markedForReview);
        }

        setSelectedAnswers(savedAnswers);
        setMarkedForReview(savedReview);

        setRemainingSeconds(
          Math.max(
            0,
            Math.floor(
              (new Date(response.attempt.expiresAt).getTime() -
                Date.now()) /
                1000,
            ),
          ),
        );
      } catch (err) {
        console.error(
          "Start educator exam error:",
          err,
        );

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to start the examination.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setStarting(false);
        }
      }
    };

    start();

    return () => {
      active = false;
    };
  }, [examId]);

  useEffect(() => {
    if (!started || !attempt?.expiresAt) {
      return;
    }

    const updateTimer = () => {
      const seconds = Math.max(
        0,
        Math.floor(
          (new Date(attempt.expiresAt).getTime() -
            Date.now()) /
            1000,
        ),
      );

      setRemainingSeconds(seconds);
    };

    updateTimer();

    const interval = window.setInterval(
      updateTimer,
      1000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [started, attempt?.expiresAt]);

  useEffect(() => {
    if (
      !started ||
      submitted ||
      remainingSeconds !== 0 ||
      submitting
    ) {
      return;
    }

    void handleSubmit(true);
  }, [
    started,
    submitted,
    remainingSeconds,
    submitting,
  ]);

  const currentQuestion =
    questions[currentIndex] || null;

  const currentQuestionId =
    currentQuestion
      ? String(currentQuestion.id)
      : "";

  const currentSelection =
    selectedAnswers[currentQuestionId] || [];

  const answeredCount = useMemo(
    () =>
      questions.filter(
        (question) =>
          (selectedAnswers[String(question.id)] || [])
            .length > 0,
      ).length,
    [questions, selectedAnswers],
  );

  const reviewCount = useMemo(
    () =>
      questions.filter(
        (question) =>
          markedForReview[String(question.id)],
      ).length,
    [questions, markedForReview],
  );

  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(
      0,
      seconds,
    );

    const hours = Math.floor(
      safeSeconds / 3600,
    );

    const minutes = Math.floor(
      (safeSeconds % 3600) / 60,
    );

    const secs = safeSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(
        minutes,
      ).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0",
      )}`;
    }

    return `${String(minutes).padStart(
      2,
      "0",
    )}:${String(secs).padStart(2, "0")}`;
  };

  const persistAnswer = async (
    questionId: string,
    answers: string[],
    review: boolean,
  ) => {
    if (!attempt?.id || submitted) {
      return;
    }

    try {
      setSaving(true);

      const response =
        await saveEducatorExamAnswer(
          attempt.id,
          {
            questionId,
            selectedAnswers: answers,
            markedForReview: review,
          },
        );

      if (response.attempt) {
        setAttempt(response.attempt);
      }
    } catch (err) {
      console.error(
        "Save educator exam answer error:",
        err,
      );

      setSubmitError(
        err instanceof Error
          ? err.message
          : "Unable to save your answer.",
      );
    } finally {
      setSaving(false);
    }
  };

  const selectOption = (optionKey: string) => {
    if (!currentQuestion || submitted) {
      return;
    }

    const nextAnswers = [optionKey];

    setSelectedAnswers((current) => ({
      ...current,
      [currentQuestionId]: nextAnswers,
    }));

    void persistAnswer(
      currentQuestionId,
      nextAnswers,
      Boolean(markedForReview[currentQuestionId]),
    );
  };

  const toggleReview = () => {
    if (!currentQuestion || submitted) {
      return;
    }

    const nextReview =
      !markedForReview[currentQuestionId];

    setMarkedForReview((current) => ({
      ...current,
      [currentQuestionId]: nextReview,
    }));

    void persistAnswer(
      currentQuestionId,
      selectedAnswers[currentQuestionId] || [],
      nextReview,
    );
  };

  const handleSubmit = async (
    automatic = false,
  ) => {
    if (!attempt?.id || submitting || submitted) {
      return;
    }

    try {
      setSubmitError("");
      setSubmitting(true);

      const response =
        await submitEducatorExam(attempt.id);

      setAttempt(response.attempt);
      setResult(response.result);
      setSubmitted(true);

      if (automatic) {
        setRemainingSeconds(0);
      }
    } catch (err) {
      console.error(
        "Submit educator exam error:",
        err,
      );

      setSubmitError(
        err instanceof Error
          ? err.message
          : "Unable to submit the examination.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || starting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
            <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-950">
            Secure exam environment
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Preparing your examination attempt.
          </p>
        </div>
      </main>
    );
  }

  if (error || !started || !attempt || questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Unable to start exam
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error ||
              "This exam could not be started because its question set is unavailable."}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const timerExpired =
    remainingSeconds !== null &&
    remainingSeconds <= 0;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950">
              {examTitle}
            </p>

            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Question {currentIndex + 1} of{" "}
              {questions.length}
            </p>
          </div>

          <div
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black ${
              timerExpired
                ? "bg-rose-50 text-rose-600"
                : "bg-violet-50 text-violet-700"
            }`}
          >
            <Clock3 className="h-4 w-4" />
            {formatTime(
              remainingSeconds ?? 0,
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <section className="min-w-0">
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                      Question {currentIndex + 1}
                    </span>

                    <p className="mt-1 text-xs font-bold text-slate-400">
                      {currentQuestion.questionType}
                      {" • "}
                      {currentQuestion.marks} mark
                      {currentQuestion.marks === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleReview}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition ${
                      markedForReview[
                        currentQuestionId
                      ]
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {markedForReview[
                      currentQuestionId
                    ]
                      ? "Marked"
                      : "Mark for review"}
                  </button>
                </div>
              </div>

              <div className="px-5 py-7 sm:px-7 sm:py-9">
                <h1 className="text-lg font-black leading-8 text-slate-950 sm:text-xl">
                  {currentQuestion.questionText}
                </h1>

                <div className="mt-7 space-y-3">
                  {currentQuestion.options.map(
                    (option, optionIndex) => {
                      const selected =
                        currentSelection.includes(
                          option.key,
                        );

                      return (
                        <button
                          key={`${option.key}-${optionIndex}`}
                          type="button"
                          onClick={() =>
                            selectOption(
                              option.key,
                            )
                          }
                          className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-violet-500 bg-violet-50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                              selected
                                ? "bg-violet-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {option.key}
                          </span>

                          <span className="pt-1 text-sm font-bold leading-6 text-slate-700">
                            {option.text}
                          </span>

                          {selected ? (
                            <CheckCircle2 className="ml-auto mt-1 h-5 w-5 shrink-0 text-violet-600" />
                          ) : null}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <button
                  type="button"
                  disabled={currentIndex === 0 || submitted}
                  onClick={() =>
                    setCurrentIndex(
                      (current) =>
                        Math.max(
                          0,
                          current - 1,
                        ),
                    )
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    currentIndex ===
                    questions.length - 1
                  }
                  onClick={() =>
                    setCurrentIndex(
                      (current) =>
                        Math.min(
                          questions.length - 1,
                          current + 1,
                        ),
                    )
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />

              <p className="text-xs font-bold leading-5 text-slate-600">
                Your exam timer is controlled by the server.
                Do not refresh or close the examination
                unnecessarily.
              </p>
            </div>
          </section>

          <aside className="h-fit rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Exam Progress
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <ProgressStat
                  label="Answered"
                  value={answeredCount}
                />

                <ProgressStat
                  label="Review"
                  value={reviewCount}
                />

                <ProgressStat
                  label="Remaining"
                  value={
                    questions.length -
                    answeredCount
                  }
                />

                <ProgressStat
                  label="Total"
                  value={questions.length}
                />
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Questions
              </p>

              <div className="mt-3 grid grid-cols-5 gap-2">
                {questions.map(
                  (question, index) => {
                    const id = String(
                      question.id,
                    );

                    const answered =
                      (
                        selectedAnswers[id] || []
                      ).length > 0;

                    const review =
                      Boolean(
                        markedForReview[id],
                      );

                    const active =
                      index === currentIndex;

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          setCurrentIndex(index)
                        }
                        className={`relative flex h-10 items-center justify-center rounded-xl text-xs font-black transition ${
                          active
                            ? "bg-violet-600 text-white ring-2 ring-violet-200"
                            : answered
                              ? "bg-emerald-100 text-emerald-700"
                              : review
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {index + 1}

                        {review ? (
                          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                        ) : null}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={
                submitting ||
                submitted ||
                !attempt
              }
              onClick={() => {
                void handleSubmit(false);
              }}
              className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : submitted ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submitted
                </>
              ) : (
                "Submit Exam"
              )}
            </button>

            {saving && !submitting && !submitted ? (
              <p className="mt-3 text-center text-[10px] font-bold text-slate-400">
                Saving answer...
              </p>
            ) : null}

            {submitError ? (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-center text-[10px] font-bold leading-4 text-red-600">
                {submitError}
              </p>
            ) : null}

            {submitted && result ? (
              <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-violet-600" />
                  <p className="text-sm font-black text-slate-900">
                    Exam Submitted
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <ProgressStat
                    label="Score"
                    value={result.obtainedMarks}
                  />
                  <ProgressStat
                    label="Percentage"
                    value={Number(result.percentage.toFixed(1))}
                  />
                  <ProgressStat
                    label="Correct"
                    value={result.correctAnswers}
                  />
                  <ProgressStat
                    label="Incorrect"
                    value={result.incorrectAnswers}
                  />
                </div>

                <div className="mt-3 rounded-xl bg-white px-3 py-2 text-center">
                  <p
                    className={`text-xs font-black ${
                      result.passed
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.passed
                      ? "PASS"
                      : "FAIL"}
                  </p>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProgressStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}