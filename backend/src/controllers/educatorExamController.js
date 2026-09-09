const mongoose = require("mongoose");

const EducatorExam = require("../models/EducatorExam");
const EducatorQuestion = require("../models/EducatorQuestion");
const BatchEducator = require("../models/BatchEducator");

/*
 * ============================================================
 * EDUCATOR EXAM CONTROLLER
 * ============================================================
 *
 * Educator EMS exam management controller.
 *
 * Responsibilities:
 * - Educator-owned exam CRUD
 * - Draft management
 * - Question Bank integration
 * - Question ownership validation
 * - Question duplication protection
 * - Server-side marks calculation
 * - Access type management
 * - Attempt policy management
 * - Proctoring configuration storage
 * - Publish validation
 *
 * Important security rules:
 * - Only the educator who created an exam may manage it.
 * - Only questions owned by that educator may be attached.
 * - Only ACTIVE questions may be attached/published.
 * - Correct answers are never returned by this controller.
 * - Published exams cannot be edited in this phase.
 *
 * Existing Admin Exam / MockTest controllers are intentionally
 * kept separate from this EMS controller.
 * ============================================================
 */

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const ACCESS_TYPES = new Set(["FREE", "PREMIUM"]);

const ATTEMPT_POLICIES = new Set([
  "SINGLE_ATTEMPT",
  "MULTIPLE_ATTEMPTS",
]);

const QUESTION_SELECTION_MODES = new Set([
  "MANUAL",
  "RANDOM",
  "RULE_BASED",
]);

const EXAM_STATUSES = new Set([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

const ACTIVE_QUESTION_STATUS = "ACTIVE";

/*
 * ============================================================
 * BASIC HELPERS
 * ============================================================
 */

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(title, excludeId = null) {
  const baseSlug =
    createSlug(title) || `exam-${Date.now()}`;

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const filter = {
      slug,
    };

    if (excludeId) {
      filter._id = {
        $ne: excludeId,
      };
    }

    const existing =
      await EducatorExam.findOne(filter)
        .select("_id")
        .lean();

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

function isValidObjectId(value) {
  return mongoose.isValidObjectId(value);
}

function normalizeNonNegativeNumber(
  value,
  defaultValue = 0,
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return defaultValue;
  }

  return Math.max(0, number);
}

function normalizePositiveInteger(
  value,
  defaultValue = 1,
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return defaultValue;
  }

  return Math.max(1, Math.floor(number));
}

function normalizePercentage(
  value,
  defaultValue = 40,
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return defaultValue;
  }

  return Math.min(
    100,
    Math.max(0, number),
  );
}

async function validateEducatorTargetBatches(
  educatorId,
  targetBatches,
) {
  if (
    targetBatches === undefined ||
    targetBatches === null
  ) {
    return {
      valid: true,
      batchIds: undefined,
    };
  }

  if (!Array.isArray(targetBatches)) {
    return {
      valid: false,
      status: 400,
      message:
        "Target batches must be provided as an array.",
    };
  }

  const uniqueBatchIds = [
    ...new Set(
      targetBatches.map((id) =>
        String(id || "").trim(),
      ),
    ),
  ].filter(Boolean);

  const invalidBatchId =
    uniqueBatchIds.find(
      (id) => !isValidObjectId(id),
    );

  if (invalidBatchId) {
    return {
      valid: false,
      status: 400,
      message:
        "One or more target batch IDs are invalid.",
    };
  }

  if (uniqueBatchIds.length === 0) {
    return {
      valid: true,
      batchIds: [],
    };
  }

  const assignments =
    await BatchEducator.find({
      educator: educatorId,
      batch: {
        $in: uniqueBatchIds,
      },
      status: "active",
    })
      .select("batch")
      .lean();

  const assignedBatchIds = new Set(
    assignments.map((assignment) =>
      String(assignment.batch),
    ),
  );

  const unauthorizedBatchIds =
    uniqueBatchIds.filter(
      (batchId) =>
        !assignedBatchIds.has(batchId),
    );

  if (unauthorizedBatchIds.length > 0) {
    return {
      valid: false,
      status: 403,
      message:
        "You can only use batches assigned to you.",
    };
  }

  return {
    valid: true,
    batchIds: uniqueBatchIds,
  };
}
function getEducatorId(req) {
  return req.user?.userId;
}

function sanitizeString(value, defaultValue = "") {
  if (
    value === undefined ||
    value === null
  ) {
    return defaultValue;
  }

  return String(value).trim();
}

/*
 * ============================================================
 * QUESTION HELPERS
 * ============================================================
 */

/**
 * Extract a question ID safely from an incoming question item.
 *
 * Supported input:
 * {
 *   question: "mongoObjectId"
 * }
 *
 * Also supports populated question objects:
 * {
 *   question: {
 *     _id: "mongoObjectId"
 *   }
 * }
 *
 * This makes the backend resilient if the frontend later receives
 * populated question relationships.
 */
function extractQuestionId(item) {
  if (!item) {
    return "";
  }

  const question = item.question;

  if (
    typeof question === "string" ||
    typeof question === "number"
  ) {
    return String(question).trim();
  }

  if (
    question &&
    typeof question === "object"
  ) {
    if (question._id) {
      return String(question._id).trim();
    }

    if (question.id) {
      return String(question.id).trim();
    }
  }

  if (item.questionId) {
    return String(item.questionId).trim();
  }

  return "";
}

/**
 * Validate all question references against the logged-in educator.
 *
 * This is the authoritative Question Bank ownership check.
 */
async function validateEducatorQuestions(
  questions,
  educatorId,
) {
  if (!Array.isArray(questions)) {
    return {
      valid: false,
      status: 400,
      message:
        "Questions must be provided as an array.",
    };
  }

  const questionIds = questions.map(
    extractQuestionId,
  );

  /*
   * Every question entry must contain a valid
   * MongoDB ObjectId.
   */
  for (const questionId of questionIds) {
    if (!questionId) {
      return {
        valid: false,
        status: 400,
        message:
          "Every exam question must reference a valid question.",
      };
    }

    if (!isValidObjectId(questionId)) {
      return {
        valid: false,
        status: 400,
        message:
          "One or more selected questions have an invalid ID.",
      };
    }
  }

  /*
   * Prevent the same question from being added
   * more than once to the same exam.
   */
  const uniqueQuestionIds = [
    ...new Set(questionIds),
  ];

  if (
    uniqueQuestionIds.length !==
    questionIds.length
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Duplicate questions cannot be added to the same exam.",
    };
  }

  /*
   * Empty question array is valid for a draft.
   * Publishing logic separately requires at least
   * one question.
   */
  if (uniqueQuestionIds.length === 0) {
    return {
      valid: true,
      questions: [],
      questionIds: [],
    };
  }

  /*
   * CRITICAL SECURITY CHECK:
   *
   * A question must:
   * 1. Exist
   * 2. Belong to this educator
   * 3. Be ACTIVE
   *
   * This prevents an educator from attaching another
   * educator's questions by manually modifying the request.
   */
  const ownedQuestions =
    await EducatorQuestion.find({
      _id: {
        $in: uniqueQuestionIds,
      },
      createdBy: educatorId,
      status: ACTIVE_QUESTION_STATUS,
    })
      .select(
        "_id questionCode questionText questionType options subject topic subtopic difficulty defaultMarks defaultNegativeMarks status",
      )
      .lean();

  const ownedQuestionIds = new Set(
    ownedQuestions.map(
      (question) =>
        String(question._id),
    ),
  );

  const invalidQuestionId =
    uniqueQuestionIds.find(
      (questionId) =>
        !ownedQuestionIds.has(
          questionId,
        ),
    );

  if (invalidQuestionId) {
    return {
      valid: false,
      status: 403,
      message:
        "One or more selected questions are not available to this educator.",
    };
  }

  return {
    valid: true,
    questions: ownedQuestions,
    questionIds,
  };
}

/**
 * Normalize questions before saving them into an exam.
 *
 * Important:
 * - The server controls order.
 * - Marks are never trusted directly from the client.
 * - Negative marks cannot be negative.
 */
function normalizeExamQuestions(
  questions,
) {
  return questions.map(
    (item, index) => {
      const questionId =
        extractQuestionId(item);

      return {
        question: questionId,
        order: index,
        marks: normalizeNonNegativeNumber(
          item.marks,
          1,
        ),
        negativeMarks:
          normalizeNonNegativeNumber(
            item.negativeMarks,
            0,
          ),
      };
    },
  );
}

function calculateExamTotalMarks(
  questions,
) {
  if (!Array.isArray(questions)) {
    return 0;
  }

  return questions.reduce(
    (total, item) =>
      total +
      normalizeNonNegativeNumber(
        item.marks,
        0,
      ),
    0,
  );
}

/**
 * Revalidate questions already stored on an exam.
 *
 * This is particularly important before publishing because a
 * question may have been archived after being attached to a draft.
 */
async function validateStoredExamQuestions(
  exam,
  educatorId,
) {
  if (
    !Array.isArray(exam.questions)
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Exam questions are invalid.",
    };
  }

  const questionIds =
    exam.questions.map((item) =>
      String(item.question),
    );

  if (questionIds.length === 0) {
    return {
      valid: false,
      status: 400,
      message:
        "At least one question is required before publishing.",
    };
  }

  const uniqueQuestionIds = [
    ...new Set(questionIds),
  ];

  if (
    uniqueQuestionIds.length !==
    questionIds.length
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Duplicate questions cannot exist in the exam.",
    };
  }

  for (const questionId of uniqueQuestionIds) {
    if (!isValidObjectId(questionId)) {
      return {
        valid: false,
        status: 400,
        message:
          "One or more exam questions have an invalid ID.",
      };
    }
  }

  const activeQuestions =
    await EducatorQuestion.find({
      _id: {
        $in: uniqueQuestionIds,
      },
      createdBy: educatorId,
      status: ACTIVE_QUESTION_STATUS,
    })
      .select("_id")
      .lean();

  const activeQuestionIds =
    new Set(
      activeQuestions.map(
        (question) =>
          String(question._id),
      ),
    );

  const invalidQuestionId =
    uniqueQuestionIds.find(
      (questionId) =>
        !activeQuestionIds.has(
          questionId,
        ),
    );

  if (invalidQuestionId) {
    return {
      valid: false,
      status: 403,
      message:
        "One or more questions in this exam are no longer available in the educator's active Question Bank.",
    };
  }

  return {
    valid: true,
  };
}

/*
 * ============================================================
 * SERIALIZATION
 * ============================================================
 *
 * Correct answers and explanations are intentionally NOT added
 * here. EducatorQuestion.correctAnswers and explanation are
 * select:false and are not required by the Exam Builder.
 *
 * This keeps this controller safe if exam data is later consumed
 * by other authenticated clients.
 * ============================================================
 */

function serializeExam(exam) {
  return {
    id: exam._id.toString(),

    title: exam.title,
    slug: exam.slug,
    shortName: exam.shortName,

    description: exam.description,
    instructions: exam.instructions,

    category: exam.category,
    subject: exam.subject,
    topic: exam.topic,

    durationMinutes:
      exam.durationMinutes,

    totalMarks: exam.totalMarks,

    passingPercentage:
      exam.passingPercentage,

    questionCount:
      exam.questionCount,

    questionSelectionMode:
      exam.questionSelectionMode,

    accessType:
      exam.accessType,

    attemptPolicy:
      exam.attemptPolicy,

    maxAttempts:
      exam.maxAttempts,

    proctoring:
      exam.proctoring,

    questions:
      exam.questions,

    targetBatches:
      exam.targetBatches,

    targetCourses:
      exam.targetCourses,

    status:
      exam.status,

    publishedAt:
      exam.publishedAt,

    archivedAt:
      exam.archivedAt,

    createdBy:
      exam.createdBy?.toString?.() ||
      exam.createdBy,

    updatedBy:
      exam.updatedBy?.toString?.() ||
      exam.updatedBy,

    isFeatured:
      exam.isFeatured,

    sortOrder:
      exam.sortOrder,

    attemptCount:
      exam.attemptCount,

    completionCount:
      exam.completionCount,

    createdAt:
      exam.createdAt,

    updatedAt:
      exam.updatedAt,
  };
}

/*
 * ============================================================
 * GET ALL EDUCATOR EXAMS
 * ============================================================
 */

async function getExams(req, res) {
  try {
    const educatorId =
      getEducatorId(req);

    const filter = {
      createdBy: educatorId,
    };

    if (req.query.status) {
      const status =
        String(
          req.query.status,
        ).toUpperCase();

      if (!EXAM_STATUSES.has(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid exam status.",
        });
      }

      filter.status = status;
    }

    if (req.query.accessType) {
      const accessType =
        String(
          req.query.accessType,
        ).toUpperCase();

      if (
        !ACCESS_TYPES.has(
          accessType,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid exam access type.",
        });
      }

      filter.accessType =
        accessType;
    }

    const exams =
      await EducatorExam.find(filter)
        .sort({
          updatedAt: -1,
        })
        .lean();

    return res.json({
      success: true,
      exams: exams.map(
        serializeExam,
      ),
    });
  } catch (error) {
    console.error(
      "Educator get exams error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load educator exams.",
    });
  }
}

/*
 * ============================================================
 * GET ONE EDUCATOR EXAM
 * ============================================================
 */

async function getExam(req, res) {
  try {
    const educatorId =
      getEducatorId(req);

    if (
      !isValidObjectId(
        req.params.id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid exam ID.",
      });
    }

    const exam =
      await EducatorExam.findOne({
        _id: req.params.id,
        createdBy: educatorId,
      }).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message:
          "Exam not found.",
      });
    }

    return res.json({
      success: true,
      exam: serializeExam(exam),
    });
  } catch (error) {
    console.error(
      "Educator get exam error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load educator exam.",
    });
  }
}

/*
 * ============================================================
 * CREATE EXAM
 * ============================================================
 */

async function createExam(req, res) {
  try {
    const educatorId =
      getEducatorId(req);

    const {
      title,
      shortName,
      description,
      instructions,
      category,
      subject,
      topic,
      durationMinutes,
      totalMarks,
      passingPercentage,
      questionSelectionMode,
      accessType,
      attemptPolicy,
      maxAttempts,
      proctoring,
      targetBatches,
      targetCourses,
      isFeatured,
      sortOrder,
    } = req.body;

    const normalizedTitle =
      sanitizeString(title);

    const normalizedCategory =
      sanitizeString(category);

    const targetBatchValidation =
      await validateEducatorTargetBatches(
        educatorId,
        targetBatches,
      );

    if (!targetBatchValidation.valid) {
      return res.status(
        targetBatchValidation.status,
      ).json({
        success: false,
        message:
          targetBatchValidation.message,
      });
    }


    if (!normalizedTitle) {
      return res.status(400).json({
        success: false,
        message:
          "Exam title is required.",
      });
    }

    if (!normalizedCategory) {
      return res.status(400).json({
        success: false,
        message:
          "Exam category is required.",
      });
    }

    const normalizedSelectionMode =
      QUESTION_SELECTION_MODES.has(
        String(
          questionSelectionMode ||
            "MANUAL",
        ).toUpperCase(),
      )
        ? String(
            questionSelectionMode ||
              "MANUAL",
          ).toUpperCase()
        : "MANUAL";

    const normalizedAccessType =
      String(
        accessType || "FREE",
      ).toUpperCase();

    if (
      !ACCESS_TYPES.has(
        normalizedAccessType,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid exam access type.",
      });
    }

    const normalizedAttemptPolicy =
      String(
        attemptPolicy ||
          "SINGLE_ATTEMPT",
      ).toUpperCase();

    if (
      !ATTEMPT_POLICIES.has(
        normalizedAttemptPolicy,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid exam attempt policy.",
      });
    }

    const normalizedMaxAttempts =
      normalizedAttemptPolicy ===
      "SINGLE_ATTEMPT"
        ? 1
        : normalizePositiveInteger(
            maxAttempts,
            1,
          );

    const slug =
      await generateUniqueSlug(
        normalizedTitle,
      );

    const exam =
      await EducatorExam.create({
        title: normalizedTitle,

        slug,

        shortName:
          sanitizeString(
            shortName,
          ),

        description:
          sanitizeString(
            description,
          ),

        instructions:
          sanitizeString(
            instructions,
          ),

        category:
          normalizedCategory,

        subject:
          sanitizeString(subject),

        topic:
          sanitizeString(topic),

        durationMinutes:
          normalizePositiveInteger(
            durationMinutes,
            60,
          ),

        totalMarks:
          normalizeNonNegativeNumber(
            totalMarks,
            0,
          ),

        passingPercentage:
          normalizePercentage(
            passingPercentage,
            40,
          ),

        questionSelectionMode:
          normalizedSelectionMode,

        accessType:
          normalizedAccessType,

        attemptPolicy:
          normalizedAttemptPolicy,

        maxAttempts:
          normalizedMaxAttempts,

        proctoring:
          proctoring &&
          typeof proctoring ===
            "object"
            ? proctoring
            : {},

        targetBatches:
          targetBatchValidation.batchIds || [],

        targetCourses:
          Array.isArray(
            targetCourses,
          )
            ? targetCourses
            : [],

        isFeatured:
          Boolean(isFeatured),

        sortOrder:
          normalizeNonNegativeNumber(
            sortOrder,
            0,
          ),

        status: "DRAFT",

        createdBy:
          educatorId,

        updatedBy:
          educatorId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Educator exam draft created successfully.",
      exam: serializeExam(exam),
    });
  } catch (error) {
    console.error(
      "Educator create exam error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create educator exam.",
    });
  }
}

/*
 * ============================================================
 * UPDATE EXAM
 * ============================================================
 *
 * This endpoint is the main bridge between:
 *
 * Question Bank
 *      ↓
 * Exam Builder
 *      ↓
 * Educator Exam
 *
 * The frontend may send question IDs, but the backend always
 * validates ownership and ACTIVE status before saving.
 * ============================================================
 */

async function updateExam(req, res) {
  try {
    const educatorId =
      getEducatorId(req);

    if (
      !isValidObjectId(
        req.params.id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid exam ID.",
      });
    }

    const exam =
      await EducatorExam.findOne({
        _id: req.params.id,
        createdBy: educatorId,
      });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message:
          "Exam not found.",
      });
    }

    /*
     * Published exams are immutable in the current EMS phase.
     *
     * Later, if versioning is introduced, this rule can be
     * replaced with an explicit exam-version workflow.
     */
    if (
      exam.status ===
      "PUBLISHED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Published exams cannot be edited in this phase.",
      });
    }

    if (
      exam.status ===
      "ARCHIVED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Archived exams cannot be edited.",
      });
    }

    /*
     * --------------------------------------------------------
     * QUESTION BANK INTEGRATION
     * --------------------------------------------------------
     */

    if (
      req.body.questions !==
      undefined
    ) {
      const questionValidation =
        await validateEducatorQuestions(
          req.body.questions,
          educatorId,
        );

      if (
        !questionValidation.valid
      ) {
        return res.status(
          questionValidation.status,
        ).json({
          success: false,
          message:
            questionValidation.message,
        });
      }

      exam.questions =
        normalizeExamQuestions(
          req.body.questions,
        );
    }

    /*
     * --------------------------------------------------------
     * ALLOWED FIELDS
     * --------------------------------------------------------
     */

    const allowedFields = [
      "title",
      "shortName",
      "description",
      "instructions",
      "category",
      "subject",
      "topic",
      "durationMinutes",
      "totalMarks",
      "passingPercentage",
      "questionSelectionMode",
      "accessType",
      "attemptPolicy",
      "maxAttempts",
      "proctoring",
      "targetBatches",
      "targetCourses",
      "isFeatured",
      "sortOrder",
      "questionCount",
    ];

    /*
     * Questions are handled separately above so that they
     * cannot bypass Question Bank validation.
     */
    for (const field of allowedFields) {
      if (
        req.body[field] ===
        undefined
      ) {
        continue;
      }

      exam[field] =
        req.body[field];
    }

    /*
     * --------------------------------------------------------
     * NORMALIZE CORE EXAM SETTINGS
     * --------------------------------------------------------
     */

    if (
      req.body.title !==
      undefined
    ) {
      const normalizedTitle =
        sanitizeString(
          req.body.title,
        );

      if (!normalizedTitle) {
        return res.status(400).json({
          success: false,
          message:
            "Exam title is required.",
        });
      }

      exam.title =
        normalizedTitle;

      exam.slug =
        await generateUniqueSlug(
          normalizedTitle,
          exam._id,
        );
    }

    if (
      req.body.category !==
      undefined
    ) {
      const normalizedCategory =
        sanitizeString(
          req.body.category,
        );

      if (!normalizedCategory) {
        return res.status(400).json({
          success: false,
          message:
            "Exam category is required.",
        });
      }

      exam.category =
        normalizedCategory;
    }

    if (
      req.body.shortName !==
      undefined
    ) {
      exam.shortName =
        sanitizeString(
          req.body.shortName,
        );
    }

    if (
      req.body.description !==
      undefined
    ) {
      exam.description =
        sanitizeString(
          req.body.description,
        );
    }

    if (
      req.body.instructions !==
      undefined
    ) {
      exam.instructions =
        sanitizeString(
          req.body.instructions,
        );
    }

    if (
      req.body.subject !==
      undefined
    ) {
      exam.subject =
        sanitizeString(
          req.body.subject,
        );
    }

    if (
      req.body.topic !==
      undefined
    ) {
      exam.topic =
        sanitizeString(
          req.body.topic,
        );
    }

    if (
      req.body.durationMinutes !==
      undefined
    ) {
      exam.durationMinutes =
        normalizePositiveInteger(
          req.body.durationMinutes,
          60,
        );
    }

    if (
      req.body.passingPercentage !==
      undefined
    ) {
      exam.passingPercentage =
        normalizePercentage(
          req.body
            .passingPercentage,
          40,
        );
    }

    /*
     * Access type must always be FREE or PREMIUM.
     */
    if (
      req.body.accessType !==
      undefined
    ) {
      const accessType =
        String(
          req.body.accessType,
        ).toUpperCase();

      if (
        !ACCESS_TYPES.has(
          accessType,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid exam access type.",
        });
      }

      exam.accessType =
        accessType;
    }

    /*
     * Attempt policy is independent of access type.
     */
    if (
      req.body.attemptPolicy !==
      undefined
    ) {
      const attemptPolicy =
        String(
          req.body.attemptPolicy,
        ).toUpperCase();

      if (
        !ATTEMPT_POLICIES.has(
          attemptPolicy,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid exam attempt policy.",
        });
      }

      exam.attemptPolicy =
        attemptPolicy;
    }

    /*
     * Single-attempt exams always have exactly one attempt.
     */
    if (
      exam.attemptPolicy ===
      "SINGLE_ATTEMPT"
    ) {
      exam.maxAttempts = 1;
    } else {
      exam.maxAttempts =
        normalizePositiveInteger(
          exam.maxAttempts,
          1,
        );
    }

    /*
     * Validate question selection mode.
     */
    if (
      exam.questionSelectionMode
    ) {
      const selectionMode =
        String(
          exam.questionSelectionMode,
        ).toUpperCase();

      if (
        !QUESTION_SELECTION_MODES.has(
          selectionMode,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid question selection mode.",
        });
      }

      exam.questionSelectionMode =
        selectionMode;
    } else {
      exam.questionSelectionMode =
        "MANUAL";
    }

    /*
     * --------------------------------------------------------
     * TARGET ARRAYS
     * --------------------------------------------------------
     *
     * These are normalized as arrays here.
     *
     * Actual student entitlement/access checks belong to the
     * future student exam-attempt/access layer and must never
     * rely on frontend flags.
    if (
      req.body.targetBatches !==
      undefined
    ) {
      const targetBatchValidation =
        await validateEducatorTargetBatches(
          educatorId,
          req.body.targetBatches,
        );

      if (!targetBatchValidation.valid) {
        return res.status(
          targetBatchValidation.status,
        ).json({
          success: false,
          message:
            targetBatchValidation.message,
        });
      }

      exam.targetBatches =
        targetBatchValidation.batchIds;
    }

    if (
      req.body.targetCourses !==
      undefined
    ) {
      if (
        !Array.isArray(
          req.body.targetCourses,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Target courses must be provided as an array.",
        });
      }

      exam.targetCourses =
        req.body.targetCourses;
    }

    /*
     * --------------------------------------------------------
     * PROCTORING
     * --------------------------------------------------------
     *
     * Proctoring remains independent from FREE/PREMIUM access
     * and SINGLE/MULTIPLE attempt policy.
     */
    if (
      req.body.proctoring !==
      undefined
    ) {
      if (
        !req.body.proctoring ||
        typeof req.body.proctoring !==
          "object" ||
        Array.isArray(
          req.body.proctoring,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Proctoring settings must be provided as an object.",
        });
      }

      exam.proctoring =
        req.body.proctoring;
    }

    /*
     * --------------------------------------------------------
     * SERVER-SIDE QUESTION TOTALS
     * --------------------------------------------------------
     *
     * The client cannot decide the final question count or
     * total marks when questions are present.
     */
    if (
      Array.isArray(
        exam.questions,
      )
    ) {
      exam.questionCount =
        exam.questions.length;

      exam.totalMarks =
        calculateExamTotalMarks(
          exam.questions,
        );
    }

    /*
     * If there are no questions, keep the count authoritative.
     */
    if (
      !Array.isArray(
        exam.questions,
      )
    ) {
      exam.questions = [];
      exam.questionCount = 0;
      exam.totalMarks = 0;
    }

    /*
     * Client-provided questionCount/totalMarks are intentionally
     * overridden by the server.
     */
    exam.questionCount =
      exam.questions.length;

    exam.totalMarks =
      calculateExamTotalMarks(
        exam.questions,
      );

    exam.updatedBy =
      educatorId;

    await exam.save();

    return res.json({
      success: true,
      message:
        "Educator exam saved successfully.",
      exam: serializeExam(exam),
    });
  } catch (error) {
    console.error(
      "Educator update exam error:",
      error,
    );

    /*
     * Convert MongoDB cast errors into a useful client error
     * instead of returning a generic 500.
     */
    if (
      error?.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "One or more submitted IDs are invalid.",
      });
    }

    /*
     * Mongoose validation errors should also be returned as
     * a client-side validation response.
     */
    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Exam validation failed.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update educator exam.",
    });
  }
}

/*
 * ============================================================
 * PUBLISH EXAM
 * ============================================================
 *
 * Publishing is a separate server-side operation.
 *
 * Before publishing we verify:
 * - ownership
 * - title
 * - category
 * - at least one question
 * - all questions still belong to educator
 * - all questions are ACTIVE
 * - no duplicate question
 * - server-side totals
 *
 * This prevents a draft from becoming a published exam with
 * stale/deleted/unauthorized question references.
 * ============================================================
 */

async function publishExam(req, res) {
  try {
    const educatorId =
      getEducatorId(req);

    if (
      !isValidObjectId(
        req.params.id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid exam ID.",
      });
    }

    const exam =
      await EducatorExam.findOne({
        _id: req.params.id,
        createdBy: educatorId,
      });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message:
          "Exam not found.",
      });
    }

    if (
      exam.status ===
      "PUBLISHED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Exam is already published.",
      });
    }

    if (
      exam.status ===
      "ARCHIVED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Archived exams cannot be published.",
      });
    }

    if (
      !exam.title ||
      !String(
        exam.title,
      ).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam title is required.",
      });
    }

    if (
      !exam.category ||
      !String(
        exam.category,
      ).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam category is required.",
      });
    }

    /*
     * A published exam must contain at least one question.
     */
    if (
      !Array.isArray(
        exam.questions,
      ) ||
      exam.questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one question is required before publishing.",
      });
    }

    /*
     * Revalidate every question immediately before publishing.
     */
    const questionValidation =
      await validateStoredExamQuestions(
        exam,
        educatorId,
      );

    if (
      !questionValidation.valid
    ) {
      return res.status(
        questionValidation.status,
      ).json({
        success: false,
        message:
          questionValidation.message,
      });
    }

    /*
     * Server-side totals.
     */
    exam.questions =
      exam.questions.map(
        (item, index) => ({
          question:
            item.question,
          order: index,
          marks:
            normalizeNonNegativeNumber(
              item.marks,
              1,
            ),
          negativeMarks:
            normalizeNonNegativeNumber(
              item.negativeMarks,
              0,
            ),
        }),
      );

    exam.questionCount =
      exam.questions.length;

    exam.totalMarks =
      calculateExamTotalMarks(
        exam.questions,
      );

    /*
     * Attempt policy remains independent of access type.
     */
    if (
      exam.attemptPolicy ===
      "SINGLE_ATTEMPT"
    ) {
      exam.maxAttempts = 1;
    } else {
      exam.maxAttempts =
        normalizePositiveInteger(
          exam.maxAttempts,
          1,
        );
    }

    /*
     * Access type must remain explicitly FREE or PREMIUM.
     */
    if (
      !ACCESS_TYPES.has(
        exam.accessType,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam access type must be FREE or PREMIUM.",
      });
    }

    /*
     * Revalidate target batches immediately before publishing.
     * This prevents stale or unauthorized batch references from
     * reaching a published exam.
     */
    const targetBatchValidation =
      await validateEducatorTargetBatches(
        educatorId,
        exam.targetBatches,
      );

    if (!targetBatchValidation.valid) {
      return res.status(
        targetBatchValidation.status,
      ).json({
        success: false,
        message:
          targetBatchValidation.message,
      });
    }

    exam.targetBatches =
      targetBatchValidation.batchIds || [];

    /*
     * Proctoring is intentionally independent from access type
     * and attempt policy.
     */
    if (
      !exam.proctoring ||
      typeof exam.proctoring !==
        "object"
    ) {
      exam.proctoring = {};
    }

    exam.status =
      "PUBLISHED";

    exam.publishedAt =
      new Date();

    exam.updatedBy =
      educatorId;

    await exam.save();

    return res.json({
      success: true,
      message:
        "Educator exam published successfully.",
      exam: serializeExam(exam),
    });
  } catch (error) {
    console.error(
      "Educator publish exam error:",
      error,
    );

    if (
      error?.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "One or more exam references are invalid.",
      });
    }

    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Exam validation failed.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to publish educator exam.",
    });
  }
}

/*
 * ============================================================
 * DELETE EXAM
 * ============================================================
 *
 * Drafts may be deleted.
 * Published/archived exams are protected.
 *
 * Later, once student attempts exist, historical exam records
 * should generally be archived rather than physically deleted.
 * ============================================================
 */

async function deleteExam(req, res) {
  try {
    const educatorId =
      getEducatorId(req);

    if (
      !isValidObjectId(
        req.params.id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid exam ID.",
      });
    }

    const exam =
      await EducatorExam.findOne({
        _id: req.params.id,
        createdBy: educatorId,
      });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message:
          "Exam not found.",
      });
    }

    if (
      exam.status ===
      "PUBLISHED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Published exams cannot be deleted.",
      });
    }

    if (
      exam.status ===
      "ARCHIVED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Archived exams cannot be deleted.",
      });
    }

    /*
     * Only drafts are physically deleted in the current phase.
     */
    await EducatorExam.findByIdAndDelete(
      exam._id,
    );

    return res.json({
      success: true,
      message:
        "Educator exam deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Educator delete exam error:",
      error,
    );

    if (
      error?.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid exam ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete educator exam.",
    });
  }
}

/*
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {
  getExams,
  getExam,
  createExam,
  updateExam,
  publishExam,
  deleteExam,
};
