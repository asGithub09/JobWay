"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Flag,
  Loader2,
  Menu,
  RotateCcw,
  Send,
  ShieldCheck,
  TimerReset,
  X,
  XCircle,
} from "lucide-react";

import {
  getMockTestAttempt,
  saveMockTestAnswer,
  startMockTestAttempt,
  submitMockTestAttempt,
  type MockTestAttempt,
  type MockTestAttemptQuestion,
  type MockTestAttemptInfo,
  type MockTestQuestionReview,
} from "@/lib/api";

type AnswerValue = "A" | "B" | "C" | "D" | null;

type LocalAnswer = {
  selectedAnswer: AnswerValue;
  markedForReview: boolean;
};

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(
      minutes,
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

function getRemainingSeconds(expiresAt: string) {
  const difference =
    new Date(expiresAt).getTime() - Date.now();

  return Math.max(
    0,
    Math.floor(difference / 1000),
  );
}

function getOptionClass(
  selected: boolean,
  disabled: boolean,
) {
  if (selected) {
    return "border-red-500 bg-red-50 text-red-700 shadow-sm";
  }

  if (disabled) {
    return "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400";
  }

  return "border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50/40";
}

export default function MockTestStartPage() {
  const params = useParams();
  const router = useRouter();

  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : "";

  const [attempt, setAttempt] =
    useState<MockTestAttempt | null>(null);

  const [mockTest, setMockTest] =
    useState<MockTestAttemptInfo | null>(null);

  const [questions, setQuestions] =
    useState<MockTestAttemptQuestion[]>([]);

  const [answers, setAnswers] =
    useState<Record<string, LocalAnswer>>({});

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [remainingSeconds, setRemainingSeconds] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [expired, setExpired] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

  const [showExitModal, setShowExitModal] =
    useState(false);

  const [reviewFilter, setReviewFilter] =
    useState<"ALL" | "WRONG" | "CORRECT" | "UNANSWERED">("ALL");

  const currentQuestion =
    questions[currentQuestionIndex] || null;

  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id] || {
        selectedAnswer: null,
        markedForReview: false,
      }
    : {
        selectedAnswer: null,
        markedForReview: false,
      };

  /*
   * ---------------------------------------------------------
   * BUILD LOCAL ANSWER STATE
   * ---------------------------------------------------------
   */

  const buildAnswerState = useCallback(
    (serverAttempt: MockTestAttempt) => {
      const nextAnswers: Record<
        string,
        LocalAnswer
      > = {};

      (serverAttempt.answers || []).forEach(
        (answer) => {
          const selected =
            answer.selectedAnswer;

          const normalizedSelected =
            selected === "A" ||
            selected === "B" ||
            selected === "C" ||
            selected === "D"
              ? selected
              : null;

          nextAnswers[
            String(answer.question)
          ] = {
            selectedAnswer:
              normalizedSelected,
            markedForReview:
              Boolean(answer.markedForReview),
          };
        },
      );

      return nextAnswers;
    },
    [],
  );

  /*
   * ---------------------------------------------------------
   * START / RESUME ATTEMPT
   * ---------------------------------------------------------
   */

  const initializeAttempt =
    useCallback(async () => {
      if (!slug) {
        setError("Mock test could not be identified.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // If this browser already has a submitted attempt, recover it
        // before creating/resuming another attempt.
        if (typeof window !== "undefined") {
          const storedAttemptId = window.sessionStorage.getItem(
            "jobway_active_mock_attempt",
          );

          if (storedAttemptId) {
            try {
              const recovered = await getMockTestAttempt(
                storedAttemptId,
              );

              if (
                recovered?.success &&
                recovered.attempt &&
                (recovered.attempt.status === "SUBMITTED" ||
                  recovered.attempt.status === "EXPIRED")
              ) {
                setAttempt(recovered.attempt);
                setMockTest(recovered.mockTest);
                setSubmitted(true);
                setExpired(
                  recovered.attempt.status === "EXPIRED",
                );
                return;
              }
            } catch (recoveryError) {
              console.warn(
                "Previous mock test attempt could not be recovered:",
                recoveryError,
              );
            }
          }
        }

        /*
         * We first load the public mock test details
         * through the existing route indirectly by finding
         * the mock test ID from the details page data.
         *
         * Since the start endpoint requires the database ID,
         * we use the existing published mock-test API here.
         */
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5001/api";

        const response = await fetch(
          `${apiBase}/exams/mock-tests/${encodeURIComponent(
            slug,
          )}`,
        );

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message ||
              "Could not load mock test",
          );
        }

        const publishedMockTest =
          data.mockTest;

        if (!publishedMockTest?.id) {
          throw new Error(
            "Mock test information is incomplete",
          );
        }

        setStarting(true);

        const attemptResponse =
          await startMockTestAttempt(
            publishedMockTest.id,
          );

        if (
          !attemptResponse.success ||
          !attemptResponse.attempt
        ) {
          throw new Error(
            attemptResponse.message ||
              "Could not start the mock test",
          );
        }

        setAttempt(
          attemptResponse.attempt,
        );

        setMockTest(
          attemptResponse.mockTest,
        );

        setQuestions(
          attemptResponse.questions || [],
        );

        setAnswers(
          buildAnswerState(
            attemptResponse.attempt,
          ),
        );

        setRemainingSeconds(
          getRemainingSeconds(
            attemptResponse.attempt.expiresAt,
          ),
        );

        setExpired(
          attemptResponse.attempt.status === "EXPIRED",
        );
        setSubmitted(
          attemptResponse.attempt.status === "SUBMITTED",
        );

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            "jobway_active_mock_attempt",
            attemptResponse.attempt.id,
          );
        }
      } catch (requestError) {
        console.error(
          "Initialize mock test error:",
          requestError,
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not start the mock test",
        );
      } finally {
        setStarting(false);
        setLoading(false);
      }
    }, [buildAnswerState, slug]);

  useEffect(() => {
    initializeAttempt();
  }, [initializeAttempt]);

  /*
   * ---------------------------------------------------------
   * REFRESH-SAFE SUBMITTED ATTEMPT RECOVERY
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedAttemptId = window.sessionStorage.getItem(
      "jobway_active_mock_attempt",
    );

    if (!storedAttemptId) return;

    let cancelled = false;

    const recoverAttempt = async () => {
      try {
        const response = await getMockTestAttempt(storedAttemptId);

        if (
          cancelled ||
          !response?.success ||
          !response.attempt
        ) {
          return;
        }

        if (
          response.attempt.status === "SUBMITTED" ||
          response.attempt.status === "EXPIRED"
        ) {
          setAttempt(response.attempt);
          setMockTest(response.mockTest);
          setSubmitted(true);
          setExpired(
            response.attempt.status === "EXPIRED",
          );
        }
      } catch (requestError) {
        console.warn(
          "Could not recover previous mock test attempt:",
          requestError,
        );
      }
    };

    recoverAttempt();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * TIMER
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      !attempt ||
      attempt.status !== "IN_PROGRESS" ||
      submitted ||
      expired
    ) {
      return;
    }

    const updateTimer = () => {
      const seconds =
        getRemainingSeconds(
          attempt.expiresAt,
        );

      setRemainingSeconds(seconds);

      if (seconds <= 0) {
        setExpired(true);
      }
    };

    updateTimer();

    const timer = window.setInterval(
      updateTimer,
      1000,
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [
    attempt,
    expired,
    submitted,
  ]);

  /*
   * ---------------------------------------------------------
   * AUTO SUBMIT WHEN TIMER EXPIRES
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      !expired ||
      !attempt ||
      attempt.status !== "IN_PROGRESS" ||
      submitting ||
      submitted
    ) {
      return;
    }

    const submitExpiredAttempt =
      async () => {
        try {
          setSubmitting(true);

          const response =
            await submitMockTestAttempt(
              attempt.id,
            );

          if (
            response.success &&
            response.attempt
          ) {
            setAttempt(
              response.attempt,
            );
            setSubmitted(true);
          } else {
            setError(
              response.message ||
                "The test expired, but the result could not be loaded.",
            );
          }
        } catch (requestError) {
          console.error(
            "Auto submit error:",
            requestError,
          );

          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not submit the expired test.",
          );
        } finally {
          setSubmitting(false);
        }
      };

    submitExpiredAttempt();
  }, [
    attempt,
    expired,
    submitted,
    submitting,
  ]);

  /*
   * ---------------------------------------------------------
   * COUNTS
   * ---------------------------------------------------------
   */

  const answeredCount = useMemo(
    () =>
      questions.filter(
        (question) =>
          answers[question.id]
            ?.selectedAnswer,
      ).length,
    [answers, questions],
  );

  const reviewCount = useMemo(
    () =>
      questions.filter(
        (question) =>
          answers[question.id]
            ?.markedForReview,
      ).length,
    [answers, questions],
  );

  const unansweredCount =
    questions.length - answeredCount;

  /*
   * ---------------------------------------------------------
   * SAVE ANSWER
   * ---------------------------------------------------------
   */

  const persistAnswer = useCallback(
    async (
      questionId: string,
      selectedAnswer: AnswerValue,
      markedForReview: boolean,
    ) => {
      if (!attempt) {
        return;
      }

      try {
        setSaving(true);

        await saveMockTestAnswer(
          attempt.id,
          {
            questionId,
            selectedAnswer,
            markedForReview,
          },
        );
      } catch (requestError) {
        console.error(
          "Save answer error:",
          requestError,
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not save your answer.",
        );
      } finally {
        setSaving(false);
      }
    },
    [attempt],
  );

  /*
   * ---------------------------------------------------------
   * SELECT ANSWER
   * ---------------------------------------------------------
   */

  const handleSelectAnswer = async (
    selectedAnswer: AnswerValue,
  ) => {
    if (
      !currentQuestion ||
      !attempt ||
      attempt.status !== "IN_PROGRESS" ||
      expired ||
      submitted
    ) {
      return;
    }

    const questionId =
      currentQuestion.id;

    const previous =
      answers[questionId] || {
        selectedAnswer: null,
        markedForReview: false,
      };

    const next: LocalAnswer = {
      selectedAnswer,
      markedForReview:
        previous.markedForReview,
    };

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: next,
    }));

    await persistAnswer(
      questionId,
      selectedAnswer,
      next.markedForReview,
    );
  };

  /*
   * ---------------------------------------------------------
   * MARK FOR REVIEW
   * ---------------------------------------------------------
   */

  const handleToggleReview =
    async () => {
      if (
        !currentQuestion ||
        !attempt ||
        attempt.status !== "IN_PROGRESS" ||
        expired ||
        submitted
      ) {
        return;
      }

      const questionId =
        currentQuestion.id;

      const previous =
        answers[questionId] || {
          selectedAnswer: null,
          markedForReview: false,
        };

      const next: LocalAnswer = {
        selectedAnswer:
          previous.selectedAnswer,
        markedForReview:
          !previous.markedForReview,
      };

      setAnswers((previousAnswers) => ({
        ...previousAnswers,
        [questionId]: next,
      }));

      await persistAnswer(
        questionId,
        next.selectedAnswer,
        next.markedForReview,
      );
    };

  /*
   * ---------------------------------------------------------
   * CLEAR ANSWER
   * ---------------------------------------------------------
   */

  const handleClearAnswer =
    async () => {
      if (
        !currentQuestion ||
        !attempt ||
        attempt.status !== "IN_PROGRESS" ||
        expired ||
        submitted
      ) {
        return;
      }

      const questionId =
        currentQuestion.id;

      const previous =
        answers[questionId] || {
          selectedAnswer: null,
          markedForReview: false,
        };

      const next: LocalAnswer = {
        selectedAnswer: null,
        markedForReview:
          previous.markedForReview,
      };

      setAnswers((previousAnswers) => ({
        ...previousAnswers,
        [questionId]: next,
      }));

      await persistAnswer(
        questionId,
        null,
        next.markedForReview,
      );
    };

  /*
   * ---------------------------------------------------------
   * SUBMIT
   * ---------------------------------------------------------
   */

  const handleSubmit =
    async () => {
      if (
        !attempt ||
        submitting ||
        submitted
      ) {
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        const response =
          await submitMockTestAttempt(
            attempt.id,
          );

        if (
          !response.success ||
          !response.attempt
        ) {
          throw new Error(
            response.message ||
              "Could not submit the test",
          );
        }

        setAttempt(
          response.attempt,
        );

        setSubmitted(true);
        setShowSubmitModal(false);
        setExpired(false);
      } catch (requestError) {
        console.error(
          "Submit test error:",
          requestError,
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not submit the test.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  /*
   * ---------------------------------------------------------
   * EXIT
   * ---------------------------------------------------------
   */

  const handleExit = () => {
    router.push(
      `/mock-tests/${encodeURIComponent(
        slug,
      )}`,
    );
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading || starting) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>

            <h1 className="text-xl font-extrabold text-slate-950">
              Preparing your test
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Loading questions and creating your
              secure test session...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */

  if (
    error &&
    !attempt &&
    !questions.length
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-950">
              Unable to start test
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={initializeAttempt}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </button>

              <Link
                href={`/mock-tests/${encodeURIComponent(
                  slug,
                )}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Test
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * SUBMITTED / RESULT
   * ---------------------------------------------------------
   */

  if (submitted && attempt) {
    const review = (attempt.questionReview || []) as MockTestQuestionReview[];
    const correctCount = attempt.correctAnswers || 0;
    const incorrectCount = attempt.incorrectAnswers || 0;
    const unansweredResult = attempt.unansweredQuestions || 0;
    const attemptedResult = correctCount + incorrectCount;
    const accuracy = attemptedResult
      ? Math.round((correctCount / attemptedResult) * 100)
      : 0;

    const performance =
      attempt.percentage >= 80
        ? {
            label: "Excellent Performance",
            text: "Outstanding work. You have demonstrated strong command of this test.",
            icon: "🏆",
          }
        : attempt.percentage >= 60
          ? {
              label: "Good Performance",
              text: "Great effort. Review the missed questions and aim even higher next time.",
              icon: "🎯",
            }
          : attempt.percentage >= 40
            ? {
                label: "Keep Improving",
                text: "You are making progress. Review the detailed explanations and strengthen weak areas.",
                icon: "📈",
              }
            : {
                label: "More Practice Needed",
                text: "Don't give up. Review every explanation and reattempt the test after more practice.",
                icon: "💪",
              };

    const filteredReview = review.filter((item) => {
      if (reviewFilter === "WRONG") {
        return !item.isCorrect && item.selectedAnswer !== null;
      }
      if (reviewFilter === "CORRECT") return item.isCorrect;
      if (reviewFilter === "UNANSWERED") {
        return item.selectedAnswer === null;
      }
      return true;
    });

    return (
      <main className="min-h-screen bg-slate-50">
        <div className="relative overflow-hidden border-b border-slate-200 bg-slate-950">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Link
                  href={`/mock-tests/${encodeURIComponent(slug)}`}
                  className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Mock Test
                </Link>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Test Submitted Successfully
                </div>

                <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {mockTest?.title || "Mock Test Result"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                  {performance.text}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-5 text-center shadow-2xl backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
                    Score
                  </p>
                  <p className="mt-1 text-4xl font-black text-white">
                    {attempt.score}
                  </p>
                  <p className="mt-1 text-xs font-bold text-white/60">
                    {attempt.percentage}%
                  </p>
                </div>
                <div className="hidden h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/10 text-4xl shadow-2xl backdrop-blur-xl sm:flex">
                  {performance.icon}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ResultMetric icon={<CheckCircle2 className="h-5 w-5" />} label="Correct" value={correctCount} caption="Correct answers" tone="emerald" />
            <ResultMetric icon={<XCircle className="h-5 w-5" />} label="Incorrect" value={incorrectCount} caption="Needs review" tone="rose" />
            <ResultMetric icon={<TimerReset className="h-5 w-5" />} label="Unanswered" value={unansweredResult} caption="Not attempted" tone="amber" />
            <ResultMetric icon={<BookOpen className="h-5 w-5" />} label="Total" value={attempt.totalQuestions} caption="Questions" tone="violet" />
            <ResultMetric icon={<ShieldCheck className="h-5 w-5" />} label="Accuracy" value={`${accuracy}%`} caption="Of attempted" tone="blue" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="min-w-0">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">
                      Answer Review
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-slate-950">
                      Review your performance
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Analyse every question, answer and explanation.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                    <p className="text-xs font-semibold text-slate-400">Showing</p>
                    <p className="text-lg font-black text-slate-950">
                      {filteredReview.length}{" "}
                      <span className="text-sm font-semibold text-slate-400">questions</span>
                    </p>
                  </div>
                </div>

                {review.length > 0 ? (
                  <>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <ReviewFilterButton active={reviewFilter === "ALL"} label="All" count={review.length} onClick={() => setReviewFilter("ALL")} />
                      <ReviewFilterButton active={reviewFilter === "WRONG"} label="Wrong" count={incorrectCount} onClick={() => setReviewFilter("WRONG")} />
                      <ReviewFilterButton active={reviewFilter === "CORRECT"} label="Correct" count={correctCount} onClick={() => setReviewFilter("CORRECT")} />
                      <ReviewFilterButton active={reviewFilter === "UNANSWERED"} label="Unanswered" count={unansweredResult} onClick={() => setReviewFilter("UNANSWERED")} />
                    </div>

                    <div className="mt-6 space-y-5">
                      {filteredReview.length > 0 ? (
                        filteredReview.map((item, index) => (
                          <QuestionReviewCard
                            key={`${item.question}-${item.order}-${index}`}
                            item={item}
                            number={item.order || index + 1}
                          />
                        ))
                      ) : (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                          </div>
                          <h3 className="mt-4 text-lg font-black text-slate-950">
                            Nothing to show here
                          </h3>
                          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                            There are no questions matching this review filter.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <BookOpen className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-black text-slate-950">
                      Answer review unavailable
                    </h3>
                    <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-500">
                      Your score was evaluated successfully, but detailed question review was not included in this attempt response.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-5">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-gradient-to-br from-red-600 to-violet-700 p-6 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/60">
                    Performance
                  </p>
                  <h3 className="mt-2 text-xl font-black">{performance.label}</h3>
                  <div className="mt-6 flex items-center justify-center">
                    <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-[10px] border-white/15 bg-white/10">
                      <span className="text-4xl font-black">{attempt.percentage}%</span>
                      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
                        Overall
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-3">
                    <ProgressRow label="Correct" value={correctCount} total={Math.max(attempt.totalQuestions, 1)} tone="bg-emerald-500" />
                    <ProgressRow label="Incorrect" value={incorrectCount} total={Math.max(attempt.totalQuestions, 1)} tone="bg-rose-500" />
                    <ProgressRow label="Unanswered" value={unansweredResult} total={Math.max(attempt.totalQuestions, 1)} tone="bg-amber-500" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Next Step
                </p>
                <h3 className="mt-2 text-lg font-black text-slate-950">
                  Keep building your score
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review your mistakes, strengthen weak topics and try the test again.
                </p>

                <div className="mt-5 space-y-2">
                  <Link
                    href={`/mock-tests/${encodeURIComponent(slug)}/start`}
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.sessionStorage.removeItem("jobway_active_mock_attempt");
                      }
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reattempt Test
                  </Link>
                  <Link
                    href={`/mock-tests/${encodeURIComponent(slug)}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Mock Test
                  </Link>
                  <Link
                    href="/exams"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Browse More Exams
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-blue-950">Detailed evaluation</p>
                    <p className="mt-1 text-xs leading-5 text-blue-800/70">
                      Your result and answer review are generated from the submitted server-side attempt.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN TEST UI
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(
                  !sidebarOpen,
                )
              }
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden"
              aria-label="Toggle question navigator"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20 sm:flex">
              <BookOpen className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-950 sm:text-base">
                {mockTest?.title ||
                  "Mock Test"}
              </p>

              <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Secure Test Session
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 sm:px-4 ${
                remainingSeconds <= 60
                  ? "border-red-200 bg-red-50 text-red-700"
                  : remainingSeconds <= 300
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-slate-50 text-slate-800"
              }`}
            >
              <Clock3 className="h-4 w-4" />

              <div className="text-right">
                <p className="hidden text-[10px] font-bold uppercase tracking-wider opacity-60 sm:block">
                  Time Left
                </p>

                <p className="font-mono text-sm font-black sm:text-base">
                  {formatTime(
                    remainingSeconds,
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowSubmitModal(true)
              }
              disabled={
                submitting ||
                expired
              }
              className="hidden items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
            >
              <Send className="h-4 w-4" />
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* ERROR BANNER */}
      {error && (
        <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6">
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <p className="flex-1">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close question navigator"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}

      <div className="mx-auto flex max-w-[1600px]">
        {/* QUESTION NAVIGATOR */}
        <aside
          className={`fixed inset-y-16 left-0 z-30 w-80 transform border-r border-slate-200 bg-white p-5 shadow-xl transition-transform lg:sticky lg:top-16 lg:z-20 lg:block lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:shadow-none ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Question Navigator
                  </p>

                  <p className="mt-1 text-lg font-black text-slate-950">
                    {answeredCount} /{" "}
                    {questions.length}
                  </p>

                  <p className="text-xs text-slate-500">
                    questions answered
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-sm font-black text-red-600">
                  {questions.length
                    ? Math.round(
                        (answeredCount /
                          questions.length) *
                          100,
                      )
                    : 0}
                  %
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600 transition-all"
                  style={{
                    width: `${
                      questions.length
                        ? (answeredCount /
                            questions.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-slate-100 py-4">
              <MiniStat
                label="Answered"
                value={answeredCount}
              />

              <MiniStat
                label="Review"
                value={reviewCount}
              />

              <MiniStat
                label="Unanswered"
                value={unansweredCount}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map(
                  (
                    question,
                    index,
                  ) => {
                    const localAnswer =
                      answers[
                        question.id
                      ];

                    const isAnswered =
                      Boolean(
                        localAnswer
                          ?.selectedAnswer,
                      );

                    const isReview =
                      Boolean(
                        localAnswer
                          ?.markedForReview,
                      );

                    const isCurrent =
                      index ===
                      currentQuestionIndex;

                    return (
                      <button
                        key={
                          question.id
                        }
                        type="button"
                        onClick={() => {
                          setCurrentQuestionIndex(
                            index,
                          );
                          setSidebarOpen(
                            false,
                          );
                        }}
                        className={`relative flex h-11 items-center justify-center rounded-xl border text-xs font-extrabold transition ${
                          isCurrent
                            ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/20"
                            : isReview
                              ? "border-amber-300 bg-amber-50 text-amber-700"
                              : isAnswered
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50"
                        }`}
                      >
                        {index + 1}

                        {isReview && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white">
                            <Flag className="h-2.5 w-2.5 fill-current" />
                          </span>
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="space-y-2 text-xs text-slate-500">
                <Legend
                  className="bg-emerald-50 border-emerald-200"
                  label="Answered"
                />

                <Legend
                  className="bg-amber-50 border-amber-200"
                  label="Marked for review"
                />

                <Legend
                  className="bg-white border-slate-200"
                  label="Not answered"
                />

                <Legend
                  className="bg-red-600 border-red-600"
                  label="Current question"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN QUESTION AREA */}
        <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {currentQuestion && (
            <div className="mx-auto max-w-5xl">
              {/* QUESTION HEADER */}
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-black text-red-600">
                    {currentQuestionIndex +
                      1}
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-slate-950">
                      Question{" "}
                      {currentQuestionIndex +
                        1}{" "}
                      of{" "}
                      {questions.length}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {currentQuestion.subject && (
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                          {
                            currentQuestion.subject
                          }
                        </span>
                      )}

                      {currentQuestion.difficulty && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                          {
                            currentQuestion.difficulty
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {saving && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleToggleReview
                    }
                    disabled={
                      expired ||
                      submitted ||
                      saving
                    }
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
                      currentAnswer.markedForReview
                        ? "border-amber-300 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    <Flag
                      className={`h-4 w-4 ${
                        currentAnswer.markedForReview
                          ? "fill-current"
                          : ""
                      }`}
                    />

                    {currentAnswer.markedForReview
                      ? "Review Marked"
                      : "Mark for Review"}
                  </button>
                </div>
              </div>

              {/* QUESTION CARD */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="p-5 sm:p-8">
                  <div className="mb-8">
                    <p className="text-base font-bold leading-8 text-slate-900 sm:text-lg sm:leading-9">
                      {currentQuestion.questionText}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentQuestion.options.map(
                      (option) => {
                        const selected =
                          currentAnswer.selectedAnswer ===
                          option.key;

                        return (
                          <button
                            key={
                              option.key
                            }
                            type="button"
                            disabled={
                              expired ||
                              submitted ||
                              saving
                            }
                            onClick={() =>
                              handleSelectAnswer(
                                option.key as AnswerValue,
                              )
                            }
                            className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition sm:p-5 ${getOptionClass(
                              selected,
                              Boolean(
                                expired ||
                                  submitted,
                              ),
                            )}`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition ${
                                selected
                                  ? "border-red-600 bg-red-600 text-white"
                                  : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-red-300 group-hover:text-red-600"
                              }`}
                            >
                              {
                                option.key
                              }
                            </span>

                            <span className="flex-1 pt-1 text-sm font-semibold leading-6 sm:text-base">
                              {
                                option.text
                              }
                            </span>

                            {selected && (
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={
                        handleClearAnswer
                      }
                      disabled={
                        !currentAnswer.selectedAnswer ||
                        expired ||
                        submitted ||
                        saving
                      }
                      className="text-xs font-bold text-slate-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Clear Answer
                    </button>
                  </div>
                </div>

                {/* NAVIGATION */}
                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <button
                    type="button"
                    disabled={
                      currentQuestionIndex ===
                        0 ||
                      expired ||
                      submitted
                    }
                    onClick={() =>
                      setCurrentQuestionIndex(
                        (index) =>
                          Math.max(
                            0,
                            index - 1,
                          ),
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {currentQuestionIndex <
                    questions.length - 1 ? (
                      <button
                        type="button"
                        disabled={
                          expired ||
                          submitted
                        }
                        onClick={() =>
                          setCurrentQuestionIndex(
                            (index) =>
                              Math.min(
                                questions.length -
                                  1,
                                index + 1,
                              ),
                          )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                      >
                        Next Question
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          submitting ||
                          expired
                        }
                        onClick={() =>
                          setShowSubmitModal(
                            true,
                          )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                      >
                        <Send className="h-4 w-4" />
                        Submit Test
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* MOBILE SUBMIT */}
              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(true)
                }
                disabled={
                  submitting ||
                  expired
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
              >
                <Send className="h-4 w-4" />
                Submit Test
              </button>

              {/* TEST INFO */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoCard
                  label="Marks / Question"
                  value={`${mockTest?.marksPerQuestion ?? 0}`}
                />

                <InfoCard
                  label="Negative Marking"
                  value={`${mockTest?.negativeMarking ?? 0}`}
                />

                <InfoCard
                  label="Questions"
                  value={`${questions.length}`}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* SUBMIT MODAL */}
      {showSubmitModal && (
        <ModalOverlay>
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                  <Send className="h-5 w-5 text-red-600" />
                </div>

                <h2 className="text-xl font-black text-slate-950">
                  Submit Test?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Once submitted, you will not be able
                  to change your answers.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(
                    false,
                  )
                }
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <ModalStat
                label="Answered"
                value={answeredCount}
              />

              <ModalStat
                label="Review"
                value={reviewCount}
              />

              <ModalStat
                label="Unanswered"
                value={unansweredCount}
              />
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(
                    false,
                  )
                }
                disabled={submitting}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Continue Test
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Now
                  </>
                )}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* EXIT MODAL */}
      {showExitModal && (
        <ModalOverlay>
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              Leave Test?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your current attempt will remain active until
              the server-side timer expires. You can return
              to it later.
            </p>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowExitModal(
                    false,
                  )
                }
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
              >
                Stay
              </button>

              <button
                type="button"
                onClick={handleExit}
                className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
              >
                Leave Test
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| SMALL UI COMPONENTS
|--------------------------------------------------------------------------
*/

function ResultMetric({
  icon,
  label,
  value,
  caption,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  caption: string;
  tone: "emerald" | "rose" | "amber" | "violet" | "blue";
}) {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
        {icon}
      </div>
      <p className="mt-4 text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-0.5 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{caption}</p>
    </div>
  );
}

function ReviewFilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
        active
          ? "bg-slate-950 text-white shadow-md"
          : "border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-400"}`}>
        {count}
      </span>
    </button>
  );
}

function QuestionReviewCard({
  item,
  number,
}: {
  item: MockTestQuestionReview;
  number: number;
}) {
  const unanswered = item.selectedAnswer === null;
  const statusLabel = unanswered ? "Unanswered" : item.isCorrect ? "Correct" : "Incorrect";

  return (
    <article className={`overflow-hidden rounded-3xl border ${
      unanswered ? "border-amber-200" : item.isCorrect ? "border-emerald-200" : "border-rose-200"
    } bg-white`}>
      <div className={`flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
        unanswered ? "border-amber-100 bg-amber-50/60" : item.isCorrect ? "border-emerald-100 bg-emerald-50/60" : "border-rose-100 bg-rose-50/60"
      }`}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-700 shadow-sm">
            Q{number}
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Question {number}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {item.subject && (
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-violet-700">{item.subject}</span>
              )}
              {item.difficulty && (
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500">{item.difficulty}</span>
              )}
            </div>
          </div>
        </div>

        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${
          unanswered ? "bg-amber-100 text-amber-700" : item.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        }`}>
          {unanswered ? <TimerReset className="h-3.5 w-3.5" /> : item.isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          {statusLabel}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <p className="text-sm font-bold leading-7 text-slate-900 sm:text-base">{item.questionText}</p>

        <div className="mt-5 grid gap-2.5">
          {item.options.map((option) => {
            const isCorrect = option.key === item.correctAnswer;
            const isSelected = option.key === item.selectedAnswer;

            const optionClass = isCorrect
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : isSelected
                ? "border-rose-300 bg-rose-50 text-rose-800"
                : "border-slate-200 bg-white text-slate-600";

            return (
              <div key={option.key} className={`flex items-start gap-3 rounded-2xl border p-3.5 ${optionClass}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                  isCorrect ? "bg-emerald-600 text-white" : isSelected ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {option.key}
                </span>

                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm font-semibold leading-6">{option.text}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {isCorrect && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                        Correct answer
                      </span>
                    )}
                    {isSelected && (
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                        Your answer
                      </span>
                    )}
                  </div>
                </div>

                {isCorrect ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                ) : isSelected ? (
                  <XCircle className="mt-1 h-5 w-5 shrink-0 text-rose-600" />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
            Correct: {item.correctAnswer}
          </span>
          <span className={`rounded-xl px-3 py-2 ${unanswered ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
            Your answer: {item.selectedAnswer || "Not answered"}
          </span>
        </div>

        {item.explanation && (
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-blue-600">Explanation</p>
            <p className="mt-1.5 text-sm leading-6 text-blue-950/80">{item.explanation}</p>
          </div>
        )}
      </div>
    </article>
  );
}

function ProgressRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const percentage = Math.min(100, Math.round((value / Math.max(total, 1)) * 100));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-600">{label}</span>
        <span className="font-black text-slate-950">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-3 text-center">
      <p className="text-base font-black text-slate-950">
        {value}
      </p>

      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function Legend({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded border ${className}`}
      />

      <span>{label}</span>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function ResultCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-2xl font-black text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ModalStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">
      <p className="text-lg font-black text-slate-950">
        {value}
      </p>

      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ModalOverlay({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      {children}
    </div>
  );
}