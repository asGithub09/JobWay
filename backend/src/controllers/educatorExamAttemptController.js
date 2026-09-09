const mongoose = require("mongoose");
const EducatorExam = require("../models/EducatorExam");
const EducatorQuestion = require("../models/EducatorQuestion");
const EducatorExamAttempt = require("../models/EducatorExamAttempt");
const {
  getStudentActiveBatch,
} = require("../services/batchAccessService");

/*
 * ============================================================
 * EDUCATOR EMS — STUDENT EXAM ATTEMPTS
 * ============================================================
 *
 * Server-authoritative attempt engine.
 *
 * Responsibilities:
 * - Published exam validation
 * - FREE / PREMIUM access separation
 * - Single-attempt enforcement
 * - Server-side timing
 * - Safe question delivery
 * - Attempt creation
 * - Resume protection
 * - Batch entitlement verification
 *
 * Correct answers and explanations are NEVER returned to
 * the student during the active exam.
 * ============================================================
 */

const ACTIVE_ATTEMPT_STATUSES = ["IN_PROGRESS"];

const TERMINAL_ATTEMPT_STATUSES = [
  "SUBMITTED",
  "EXPIRED",
  "TERMINATED",
  "LOCKED",
];

/* ============================================================
 * HELPERS
 * ============================================================ */

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function getStudentId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    null
  );
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "";
}

function getUserAgent(req) {
  return String(req.headers["user-agent"] || "").slice(
    0,
    2000,
  );
}

/*
 * Never send these fields to the browser while an exam is active.
 */
function serializeQuestion(question, examQuestion) {
  const questionObject =
    typeof question.toObject === "function"
      ? question.toObject()
      : question;

  return {
    id: questionObject._id,

    questionText: questionObject.questionText,

    questionType: questionObject.questionType,

    options: Array.isArray(questionObject.options)
      ? questionObject.options.map((option) => ({
          key: option.key,
          text: option.text,
        }))
      : [],

    subject: questionObject.subject || "",

    topic: questionObject.topic || "",

    subtopic: questionObject.subtopic || "",

    difficulty: questionObject.difficulty || "",

    order: examQuestion?.order ?? 0,

    marks: examQuestion?.marks ?? 1,

    negativeMarks: examQuestion?.negativeMarks ?? 0,
  };
}

function serializeAttempt(attempt) {
  return {
    id: attempt._id,

    exam: attempt.exam,

    status: attempt.status,

    reentryLocked: Boolean(attempt.reentryLocked),

    startedAt: attempt.startedAt,

    expiresAt: attempt.expiresAt,

    submittedAt: attempt.submittedAt,

    terminatedAt: attempt.terminatedAt,

    totalQuestions: attempt.totalQuestions,

    answers: Array.isArray(attempt.answers)
      ? attempt.answers.map((answer) => ({
          question: answer.question,
          selectedAnswers: answer.selectedAnswers || [],
          markedForReview: Boolean(answer.markedForReview),
          answeredAt: answer.answeredAt,
        }))
      : [],

    proctoringEnabled: Boolean(
      attempt.proctoringEnabled,
    ),

    cameraVerified: Boolean(attempt.cameraVerified),

    microphoneVerified: Boolean(
      attempt.microphoneVerified,
    ),

    fullscreenVerified: Boolean(
      attempt.fullscreenVerified,
    ),

    strikeCount: attempt.strikeCount || 0,

    accessType: attempt.accessType,

    entitlementVerified: Boolean(
      attempt.entitlementVerified,
    ),
  };
}

/*
 * ============================================================
 * PREMIUM ACCESS
 * ============================================================
 *
 * FREE:
 *   Authenticated JobWay users may start.
 *
 * PREMIUM:
 *   The student must have an active batch that is explicitly
 *   targeted by the exam.
 *
 * Authoritative access chain:
 *
 * Student
 *   -> Active BatchMember
 *   -> Active Batch
 *   -> Exam targetBatches
 *
 * Never trust a frontend `isPremium` flag.
 * ============================================================
 */

async function verifyPremiumEntitlement({
  studentId,
  exam,
}) {
  /*
   * PREMIUM educator exams are batch-entitled.
   *
   * getStudentActiveBatch() is the authoritative source for
   * the student's current active batch.
   */
  const activeBatch =
    await getStudentActiveBatch(studentId);

  if (!activeBatch?.batch?._id) {
    return {
      allowed: false,
      batch: null,
    };
  }

  const targetBatches = Array.isArray(
    exam?.targetBatches,
  )
    ? exam.targetBatches
    : [];

  const activeBatchId =
    String(activeBatch.batch._id);

  const entitled = targetBatches.some(
    (targetBatchId) =>
      String(targetBatchId) === activeBatchId,
  );

  if (!entitled) {
    return {
      allowed: false,
      batch: null,
    };
  }

  return {
    allowed: true,
    batch: activeBatch.batch,
  };
}

/*
 * ============================================================
 * GET EXAM QUESTIONS SAFELY
 * ============================================================
 */

async function loadExamQuestions(exam) {
  const examQuestions = Array.isArray(exam.questions)
    ? [...exam.questions].sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      )
    : [];

  if (examQuestions.length === 0) {
    return [];
  }

  const questionIds = examQuestions.map(
    (item) => item.question,
  );

  const questions =
    await EducatorQuestion.find({
      _id: { $in: questionIds },
      createdBy: exam.createdBy,
      status: "ACTIVE",
    })
      .select(
        "_id questionText questionType options subject topic subtopic difficulty",
      )
      .lean();

  const questionMap = new Map(
    questions.map((question) => [
      String(question._id),
      question,
    ]),
  );

  return examQuestions
    .map((examQuestion) => {
      const question = questionMap.get(
        String(examQuestion.question),
      );

      if (!question) {
        return null;
      }

      return {
        question,
        examQuestion,
      };
    })
    .filter(Boolean);
}

/*
 * ============================================================
 * START EXAM
 * ============================================================
 */

async function startExam(req, res) {
  try {
    const studentId = getStudentId(req);
    const { examId } = req.params;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const exam = await EducatorExam.findById(
      examId,
    ).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    /*
     * Only published exams can be attempted.
     */
    if (exam.status !== "PUBLISHED") {
      return res.status(403).json({
        success: false,
        message: "This exam is not available.",
      });
    }

    /*
     * ========================================================
     * SINGLE ATTEMPT ENFORCEMENT
     * ========================================================
     */

    const previousAttempt =
      await EducatorExamAttempt.findOne({
        student: studentId,
        exam: exam._id,
      })
        .sort({ createdAt: -1 })
        .lean();

    /*
     * ========================================================
     * ACCESS CONTROL
     * ========================================================
     *
     * Verify premium entitlement before allowing a student
     * to resume an existing premium attempt as well.
     * ========================================================
     */

    let entitlementVerified = false;
    let entitledBatchId = null;

    if (exam.accessType === "PREMIUM") {
      const premiumEntitlement =
        await verifyPremiumEntitlement({
          studentId,
          exam,
        });

      entitlementVerified =
        Boolean(premiumEntitlement?.allowed);

      entitledBatchId =
        premiumEntitlement?.batch?._id || null;

      if (!entitlementVerified) {
        return res.status(403).json({
          success: false,
          code: "PREMIUM_ACCESS_REQUIRED",
          message:
            "Premium access is required to attempt this exam.",
        });
      }
    } else if (exam.accessType === "FREE") {
      /*
       * Registration/authentication is enough for FREE exams.
       */
      entitlementVerified = true;
    } else {
      return res.status(500).json({
        success: false,
        message:
          "Exam access configuration is invalid.",
      });
    }

    if (previousAttempt) {
      /*
       * Existing active attempt can be resumed only if it is
       * not locked.
       */
      if (
        ACTIVE_ATTEMPT_STATUSES.includes(
          previousAttempt.status,
        ) &&
        !previousAttempt.reentryLocked
      ) {
        const now = new Date();

        /*
         * Server-side expiry check.
         */
        if (
          previousAttempt.expiresAt &&
          previousAttempt.expiresAt <= now
        ) {
          await EducatorExamAttempt.updateOne(
            { _id: previousAttempt._id },
            {
              $set: {
                status: "EXPIRED",
                submittedAt: now,
              },
            },
          );

          return res.status(409).json({
            success: false,
            code: "ATTEMPT_EXPIRED",
            message:
              "Your previous exam attempt has expired.",
          });
        }

        const resumeQuestionIds =
          Array.isArray(previousAttempt.questions)
            ? previousAttempt.questions.map(
                (examQuestion) =>
                  String(
                    examQuestion.question ||
                      examQuestion,
                  ),
              )
            : [];

        const resumeQuestions =
          await EducatorQuestion.find({
            _id: { $in: resumeQuestionIds },
            createdBy: exam.createdBy,
            status: "ACTIVE",
          })
            .select(
              "_id questionText questionType options subject topic subtopic difficulty",
            )
            .lean();

        const resumeQuestionMap = new Map(
          resumeQuestions.map((question) => [
            String(question._id),
            question,
          ]),
        );

        const serializedResumeQuestions =
          (previousAttempt.questions || [])
            .map((examQuestion) => {
              const questionId = String(
                examQuestion.question ||
                  examQuestion,
              );

              const question =
                resumeQuestionMap.get(questionId);

              if (!question) {
                return null;
              }

              return serializeQuestion(
                question,
                examQuestion,
              );
            })
            .filter(Boolean);

        /*
         * The attempt already contains its authoritative
         * batch snapshot. The entitlement is revalidated above
         * before this response is returned.
         */
        return res.status(200).json({
          success: true,
          resumed: true,
          attempt: serializeAttempt(previousAttempt),
          exam: {
            id: String(exam._id),
            title: exam.title,
            shortName: exam.shortName || "",
            description: exam.description || "",
            instructions: exam.instructions || "",
            category: exam.category || "",
            subject: exam.subject || "",
            topic: exam.topic || "",
            durationMinutes: exam.durationMinutes,
            totalMarks: exam.totalMarks,
            passingPercentage:
              exam.passingPercentage,
            accessType: exam.accessType,
            attemptPolicy: exam.attemptPolicy,
            proctoring: exam.proctoring || {},
          },
          questions: serializedResumeQuestions,
          message: "Existing exam attempt resumed.",
        });
      }

      /*
       * Any terminal or locked attempt prevents a new
       * attempt under SINGLE_ATTEMPT policy.
       */
      if (
        TERMINAL_ATTEMPT_STATUSES.includes(
          previousAttempt.status,
        ) ||
        previousAttempt.reentryLocked
      ) {
        return res.status(409).json({
          success: false,
          code: "ATTEMPT_LOCKED",
          message:
            "You have already used your attempt for this exam.",
          attempt: serializeAttempt(previousAttempt),
        });
      }
    }

    /*
     * ========================================================
     * QUESTIONS
     * ========================================================
     */

    const examQuestions =
      await loadExamQuestions(exam);

    if (
      examQuestions.length === 0 ||
      examQuestions.length !== exam.questions.length
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This exam is not ready because one or more questions are unavailable.",
      });
    }

    /*
     * ========================================================
     * SERVER AUTHORITATIVE TIMING
     * ========================================================
     */

    const startedAt = new Date();

    const durationMinutes = Math.max(
      1,
      Number(exam.durationMinutes) || 1,
    );

    const expiresAt = new Date(
      startedAt.getTime() +
        durationMinutes * 60 * 1000,
    );

    /*
     * ========================================================
     * CREATE ATTEMPT
     * ========================================================
     */

    const attempt =
      await EducatorExamAttempt.create({
        student: studentId,

        exam: exam._id,

        /*
         * Snapshot the authoritative batch entitlement
         * used to authorize this premium attempt.
         *
         * FREE exams do not require a batch entitlement.
         */
        batch: entitledBatchId,

        status: "IN_PROGRESS",

        reentryLocked: false,

        startedAt,

        expiresAt,

        questions: examQuestions.map(
          ({ question }) => question._id,
        ),

        answers: [],

        totalQuestions:
          examQuestions.length,

        proctoringEnabled:
          Boolean(exam.proctoring?.enabled),

        cameraVerified: false,

        microphoneVerified: false,

        fullscreenVerified: false,

        strikeCount: 0,

        violations: [],

        terminationReason: "",

        accessType: exam.accessType,

        entitlementVerified,

        ipAddress: getClientIp(req),

        userAgent: getUserAgent(req),
      });

    /*
     * Safe student-facing question payload.
     */
    const safeQuestions = examQuestions.map(
      ({ question, examQuestion }) =>
        serializeQuestion(
          question,
          examQuestion,
        ),
    );

    return res.status(201).json({
      success: true,

      resumed: false,

      attempt: serializeAttempt(attempt),

      exam: {
        id: exam._id,

        title: exam.title,

        shortName: exam.shortName || "",

        description: exam.description || "",

        instructions: exam.instructions || "",

        category: exam.category,

        subject: exam.subject || "",

        topic: exam.topic || "",

        durationMinutes:
          exam.durationMinutes,

        totalMarks:
          exam.totalMarks,

        passingPercentage:
          exam.passingPercentage,

        accessType:
          exam.accessType,

        attemptPolicy:
          exam.attemptPolicy,

        proctoring: {
          enabled:
            Boolean(exam.proctoring?.enabled),

          requireCamera:
            Boolean(
              exam.proctoring?.requireCamera,
            ),

          requireMicrophone:
            Boolean(
              exam.proctoring?.requireMicrophone,
            ),

          requireFullscreen:
            Boolean(
              exam.proctoring?.requireFullscreen,
            ),

          monitorFullscreen:
            Boolean(
              exam.proctoring?.monitorFullscreen,
            ),

          monitorVisibility:
            Boolean(
              exam.proctoring?.monitorVisibility,
            ),

          monitorBlur:
            Boolean(
              exam.proctoring?.monitorBlur,
            ),

          monitorContextMenu:
            Boolean(
              exam.proctoring?.monitorContextMenu,
            ),

          maxStrikes:
            Number(
              exam.proctoring?.maxStrikes || 2,
            ),

          terminationCountdownSeconds:
            Number(
              exam.proctoring
                ?.terminationCountdownSeconds ||
                7,
            ),
        },
      },

      questions: safeQuestions,
    });
  } catch (error) {
    console.error(
      "Educator EMS start exam error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to start the exam.",
    });
  }
}

/*
 * ============================================================
 * ANSWER VALIDATION / SCORING HELPERS
 * ============================================================
 */

function normalizeAnswers(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .map((answer) => String(answer).trim())
        .filter(Boolean),
    ),
  ];
}

function sameAnswerSet(
  selectedAnswers,
  correctAnswers,
) {
  const selected =
    normalizeAnswers(selectedAnswers);

  const correct =
    normalizeAnswers(correctAnswers);

  if (selected.length !== correct.length) {
    return false;
  }

  const correctSet = new Set(correct);

  return selected.every((answer) =>
    correctSet.has(answer),
  );
}

function getExamQuestionMap(exam) {
  const map = new Map();

  for (const examQuestion of exam.questions || []) {
    if (!examQuestion?.question) {
      continue;
    }

    map.set(
      String(examQuestion.question),
      examQuestion,
    );
  }

  return map;
}

async function calculateAttemptResult(
  attempt,
  exam,
) {
  const examQuestionMap =
    getExamQuestionMap(exam);

  const questionIds = Array.isArray(
    attempt.questions,
  )
    ? attempt.questions
    : [];

  const questions =
    await EducatorQuestion.find({
      _id: { $in: questionIds },
      createdBy: exam.createdBy,
      status: "ACTIVE",
    })
      .select("+correctAnswers _id")
      .lean();

  const questionMap = new Map(
    questions.map((question) => [
      String(question._id),
      question,
    ]),
  );

  let attemptedQuestions = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unansweredQuestions = 0;
  let totalMarks = 0;
  let obtainedMarks = 0;

  const savedAnswers = Array.isArray(
    attempt.answers,
  )
    ? attempt.answers
    : [];

  for (const questionId of questionIds) {
    const id = String(questionId);

    const examQuestion =
      examQuestionMap.get(id);

    const question =
      questionMap.get(id);

    if (!examQuestion || !question) {
      continue;
    }

    const marks = Math.max(
      0,
      Number(examQuestion.marks) || 0,
    );

    const negativeMarks = Math.max(
      0,
      Number(examQuestion.negativeMarks) || 0,
    );

    totalMarks += marks;

    const answer = savedAnswers.find(
      (item) =>
        String(item.question) === id,
    );

    const selectedAnswers =
      normalizeAnswers(
        answer?.selectedAnswers,
      );

    if (selectedAnswers.length === 0) {
      unansweredQuestions += 1;
      continue;
    }

    attemptedQuestions += 1;

    const isCorrect = sameAnswerSet(
      selectedAnswers,
      question.correctAnswers,
    );

    if (isCorrect) {
      correctAnswers += 1;
      obtainedMarks += marks;
    } else {
      incorrectAnswers += 1;
      obtainedMarks -= negativeMarks;
    }
  }

  if (totalMarks <= 0) {
    totalMarks = Math.max(
      0,
      Number(exam.totalMarks) || 0,
    );
  }

  const percentage =
    totalMarks > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (obtainedMarks / totalMarks) * 100,
          ),
        )
      : 0;

  const passingPercentage = Math.max(
    0,
    Math.min(
      100,
      Number(exam.passingPercentage) || 0,
    ),
  );

  return {
    attemptedQuestions,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    totalMarks,
    obtainedMarks,
    percentage,
    passed: percentage >= passingPercentage,
  };
}

/*
 * ============================================================
 * SAVE ANSWER
 * ============================================================
 */

async function saveAnswer(req, res) {
  try {
    const studentId = getStudentId(req);
    const { attemptId } = req.params;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID.",
      });
    }

    const {
      questionId,
      selectedAnswers,
      markedForReview,
    } = req.body || {};

    if (!isValidObjectId(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    if (
      selectedAnswers !== undefined &&
      !Array.isArray(selectedAnswers)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "selectedAnswers must be an array.",
      });
    }

    const normalizedAnswers =
      normalizeAnswers(selectedAnswers);

    const attempt =
      await EducatorExamAttempt.findOne({
        _id: attemptId,
        student: studentId,
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found.",
      });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return res.status(409).json({
        success: false,
        code: "ATTEMPT_NOT_ACTIVE",
        message:
          "This exam attempt is no longer active.",
      });
    }

    if (attempt.reentryLocked) {
      return res.status(409).json({
        success: false,
        code: "ATTEMPT_LOCKED",
        message:
          "This exam attempt is locked.",
      });
    }

    const now = new Date();

    if (
      attempt.expiresAt &&
      attempt.expiresAt <= now
    ) {
      return res.status(409).json({
        success: false,
        code: "ATTEMPT_EXPIRED",
        message:
          "Your exam time has expired.",
      });
    }

    const belongsToAttempt =
      (attempt.questions || []).some(
        (question) =>
          String(question) ===
          String(questionId),
      );

    if (!belongsToAttempt) {
      return res.status(403).json({
        success: false,
        message:
          "This question does not belong to your exam attempt.",
      });
    }

    const exam =
      await EducatorExam.findById(
        attempt.exam,
      ).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    const question =
      await EducatorQuestion.findOne({
        _id: questionId,
        createdBy: exam.createdBy,
        status: "ACTIVE",
      })
        .select("_id options")
        .lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    const allowedOptionKeys = new Set(
      (question.options || [])
        .map((option) => String(option.key))
        .filter(Boolean),
    );

    const invalidAnswer =
      normalizedAnswers.find(
        (answer) =>
          !allowedOptionKeys.has(answer),
      );

    if (invalidAnswer) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected options are invalid.",
      });
    }

    const existingAnswerIndex =
      (attempt.answers || []).findIndex(
        (answer) =>
          String(answer.question) ===
          String(questionId),
      );

    const answerPayload = {
      question: questionId,

      selectedAnswers: normalizedAnswers,

      markedForReview:
        typeof markedForReview === "boolean"
          ? markedForReview
          : false,

      answeredAt:
        normalizedAnswers.length > 0
          ? now
          : null,
    };

    if (existingAnswerIndex >= 0) {
      attempt.answers[
        existingAnswerIndex
      ] = answerPayload;
    } else {
      attempt.answers.push(
        answerPayload,
      );
    }

    await attempt.save();

    return res.status(200).json({
      success: true,
      attempt: serializeAttempt(attempt),
    });
  } catch (error) {
    console.error(
      "Educator EMS save answer error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to save answer.",
    });
  }
}

/*
 * ============================================================
 * SUBMIT EXAM
 * ============================================================
 */

async function submitExam(req, res) {
  try {
    const studentId = getStudentId(req);
    const { attemptId } = req.params;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID.",
      });
    }

    const attempt =
      await EducatorExamAttempt.findOne({
        _id: attemptId,
        student: studentId,
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found.",
      });
    }

    if (attempt.reentryLocked) {
      return res.status(409).json({
        success: false,
        code: "ATTEMPT_LOCKED",
        message:
          "This exam attempt has already been finalized.",
        attempt: serializeAttempt(attempt),
      });
    }

    if (
      !ACTIVE_ATTEMPT_STATUSES.includes(
        attempt.status,
      )
    ) {
      return res.status(409).json({
        success: false,
        code: "ATTEMPT_NOT_ACTIVE",
        message:
          "This exam attempt is no longer active.",
        attempt: serializeAttempt(attempt),
      });
    }

    const exam =
      await EducatorExam.findById(
        attempt.exam,
      ).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    const now = new Date();

    const isExpired = Boolean(
      attempt.expiresAt &&
        attempt.expiresAt <= now,
    );

    const result =
      await calculateAttemptResult(
        attempt,
        exam,
      );

    attempt.attemptedQuestions =
      result.attemptedQuestions;

    attempt.correctAnswers =
      result.correctAnswers;

    attempt.incorrectAnswers =
      result.incorrectAnswers;

    attempt.unansweredQuestions =
      result.unansweredQuestions;

    attempt.totalMarks =
      result.totalMarks;

    attempt.obtainedMarks =
      result.obtainedMarks;

    attempt.percentage =
      result.percentage;

    attempt.passed =
      result.passed;

    attempt.status =
      isExpired
        ? "EXPIRED"
        : "SUBMITTED";

    attempt.submittedAt = now;

    attempt.reentryLocked = true;

    await attempt.save();

    return res.status(200).json({
      success: true,

      expired: isExpired,

      message: isExpired
        ? "Exam time expired and your attempt was submitted automatically."
        : "Exam submitted successfully.",

      attempt: serializeAttempt(attempt),

      result,
    });
  } catch (error) {
    console.error(
      "Educator EMS submit exam error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to submit the exam.",
    });
  }
}

/*
 * ============================================================
 * GET MY RESULTS
 * ============================================================
 *
 * Returns finalized EMS exam attempts belonging only to the
 * authenticated student.
 *
 * Questions, correct answers and explanations are never
 * returned through this endpoint.
 * ============================================================
 */

async function getMyResults(req, res) {
  try {
    const studentId = getStudentId(req);

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const attempts =
      await EducatorExamAttempt.find({
        student: studentId,
        status: {
          $in: [
            "SUBMITTED",
            "EXPIRED",
            "TERMINATED",
            "LOCKED",
          ],
        },
      })
        .sort({
          submittedAt: -1,
          createdAt: -1,
        })
        .populate({
          path: "exam",
          select:
            "_id title slug shortName category subject topic durationMinutes totalMarks passingPercentage accessType",
        })
        .populate({
          path: "batch",
          select: "_id name code status",
        })
        .lean();

    const results = attempts.map(
      (attempt) => ({
        id: String(attempt._id),

        exam: attempt.exam
          ? {
              id: String(attempt.exam._id),

              title:
                attempt.exam.title || "",

              slug:
                attempt.exam.slug || "",

              shortName:
                attempt.exam.shortName || "",

              category:
                attempt.exam.category || "",

              subject:
                attempt.exam.subject || "",

              topic:
                attempt.exam.topic || "",

              durationMinutes:
                Number(
                  attempt.exam.durationMinutes,
                ) || 0,

              totalMarks:
                Number(
                  attempt.exam.totalMarks,
                ) || 0,

              passingPercentage:
                Number(
                  attempt.exam
                    .passingPercentage,
                ) || 0,

              accessType:
                attempt.accessType ||
                attempt.exam.accessType ||
                "FREE",
            }
          : null,

        batch: attempt.batch
          ? {
              id: String(
                attempt.batch._id,
              ),

              name:
                attempt.batch.name || "",

              code:
                attempt.batch.code || "",

              status:
                attempt.batch.status || "",
            }
          : null,

        status: attempt.status,

        reentryLocked: Boolean(
          attempt.reentryLocked,
        ),

        startedAt:
          attempt.startedAt || null,

        expiresAt:
          attempt.expiresAt || null,

        submittedAt:
          attempt.submittedAt || null,

        terminatedAt:
          attempt.terminatedAt || null,

        totalQuestions:
          Number(
            attempt.totalQuestions,
          ) || 0,

        attemptedQuestions:
          Number(
            attempt.attemptedQuestions,
          ) || 0,

        correctAnswers:
          Number(
            attempt.correctAnswers,
          ) || 0,

        incorrectAnswers:
          Number(
            attempt.incorrectAnswers,
          ) || 0,

        unansweredQuestions:
          Number(
            attempt.unansweredQuestions,
          ) || 0,

        totalMarks:
          Number(
            attempt.totalMarks,
          ) || 0,

        obtainedMarks:
          Number(
            attempt.obtainedMarks,
          ) || 0,

        percentage:
          Number(
            attempt.percentage,
          ) || 0,

        passed: Boolean(
          attempt.passed,
        ),

        accessType:
          attempt.accessType || "FREE",

        entitlementVerified:
          Boolean(
            attempt.entitlementVerified,
          ),

        proctoringEnabled:
          Boolean(
            attempt.proctoringEnabled,
          ),

        strikeCount:
          Number(
            attempt.strikeCount,
          ) || 0,

        terminationReason:
          attempt.terminationReason || "",
      }),
    );

    return res.status(200).json({
      success: true,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error(
      "Educator EMS get my results error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load your exam results.",
    });
  }
}

/*
 * ============================================================
 * GET ATTEMPT REVIEW
 * ============================================================
 *
 * Returns wrong-answer review for a finalized attempt belonging
 * to the authenticated student.
 *
 * Correct answers and explanations are intentionally exposed
 * only through this authenticated, ownership-checked endpoint.
 * ============================================================
 */

async function getAttemptReview(req, res) {
  try {
    const studentId = getStudentId(req);
    const { attemptId } = req.params;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID.",
      });
    }

    const attempt =
      await EducatorExamAttempt.findOne({
        _id: attemptId,
        student: studentId,
        status: {
          $in: [
            "SUBMITTED",
            "EXPIRED",
            "TERMINATED",
            "LOCKED",
          ],
        },
      })
        .populate({
          path: "exam",
          select:
            "_id title shortName category subject topic totalMarks passingPercentage",
        })
        .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Result not found.",
      });
    }

    const questionIds = Array.isArray(
      attempt.questions,
    )
      ? attempt.questions
      : [];

    if (questionIds.length === 0) {
      return res.status(200).json({
        success: true,

        attempt: {
          id: String(attempt._id),
          status: attempt.status,
        },

        exam: attempt.exam
          ? {
              id: String(
                attempt.exam._id,
              ),

              title:
                attempt.exam.title || "",

              shortName:
                attempt.exam.shortName || "",

              category:
                attempt.exam.category || "",

              subject:
                attempt.exam.subject || "",

              topic:
                attempt.exam.topic || "",
            }
          : null,

        wrongAnswers: [],

        totalWrong: 0,
      });
    }

    const questions =
      await EducatorQuestion.find({
        _id: {
          $in: questionIds,
        },
      })
        .select(
          "_id questionCode questionText questionType options correctAnswers explanation subject topic subtopic difficulty defaultMarks defaultNegativeMarks",
        )
        .lean();

    const questionMap = new Map(
      questions.map((question) => [
        String(question._id),
        question,
      ]),
    );

    const answerMap = new Map(
      (Array.isArray(attempt.answers)
        ? attempt.answers
        : []
      ).map((answer) => [
        String(answer.question),
        answer,
      ]),
    );

    const wrongAnswers = [];

    for (const questionId of questionIds) {
      const question =
        questionMap.get(
          String(questionId),
        );

      if (!question) {
        continue;
      }

      const answer =
        answerMap.get(
          String(question._id),
        );

      const selectedAnswers =
        Array.isArray(
          answer?.selectedAnswers,
        )
          ? answer.selectedAnswers.map(
              (value) => String(value),
            )
          : [];

      const correctAnswers =
        Array.isArray(
          question.correctAnswers,
        )
          ? question.correctAnswers.map(
              (value) => String(value),
            )
          : [];

      const sameAnswers =
        selectedAnswers.length ===
          correctAnswers.length &&
        selectedAnswers.every(
          (value) =>
            correctAnswers.includes(value),
        ) &&
        correctAnswers.every(
          (value) =>
            selectedAnswers.includes(value),
        );

      if (sameAnswers) {
        continue;
      }

      const options = Array.isArray(
        question.options,
      )
        ? question.options.map(
            (option) => ({
              key: String(
                option.key || "",
              ),

              text: String(
                option.text || "",
              ),
            }),
          )
        : [];

      wrongAnswers.push({
        questionId: String(
          question._id,
        ),

        questionCode:
          question.questionCode || "",

        questionText:
          question.questionText || "",

        questionType:
          question.questionType ||
          "SINGLE_CHOICE",

        options,

        selectedAnswers,

        correctAnswers,

        explanation:
          question.explanation || "",

        subject:
          question.subject || "",

        topic:
          question.topic || "",

        subtopic:
          question.subtopic || "",

        difficulty:
          question.difficulty || "",

        marks:
          Number(
            question.defaultMarks,
          ) || 0,

        negativeMarks:
          Number(
            question.defaultNegativeMarks,
          ) || 0,
      });
    }

    return res.status(200).json({
      success: true,

      attempt: {
        id: String(attempt._id),

        status: attempt.status,

        submittedAt:
          attempt.submittedAt || null,

        totalQuestions:
          Number(
            attempt.totalQuestions,
          ) || 0,

        correctAnswers:
          Number(
            attempt.correctAnswers,
          ) || 0,

        incorrectAnswers:
          Number(
            attempt.incorrectAnswers,
          ) || 0,

        unansweredQuestions:
          Number(
            attempt.unansweredQuestions,
          ) || 0,

        obtainedMarks:
          Number(
            attempt.obtainedMarks,
          ) || 0,

        totalMarks:
          Number(
            attempt.totalMarks,
          ) || 0,

        percentage:
          Number(
            attempt.percentage,
          ) || 0,

        passed: Boolean(
          attempt.passed,
        ),
      },

      exam: attempt.exam
        ? {
            id: String(
              attempt.exam._id,
            ),

            title:
              attempt.exam.title || "",

            shortName:
              attempt.exam.shortName || "",

            category:
              attempt.exam.category || "",

            subject:
              attempt.exam.subject || "",

            topic:
              attempt.exam.topic || "",
          }
        : null,

      wrongAnswers,

      totalWrong:
        wrongAnswers.length,
    });
  } catch (error) {
    console.error(
      "Educator EMS get attempt review error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load the answer review.",
    });
  }
}

module.exports = {
  startExam,
  saveAnswer,
  submitExam,
  getMyResults,
  getAttemptReview,
};