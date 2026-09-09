const mongoose = require("mongoose");

/*
 * ============================================================
 * EDUCATOR EXAM MODEL
 * ============================================================
 *
 * New Educator EMS exam architecture.
 *
 * This model is intentionally separate from the existing
 * Exam / MockTest system so the new Educator EMS can be
 * developed and verified without breaking the existing
 * Admin/Student examination system.
 *
 * Lifecycle:
 *
 * DRAFT
 *   ↓
 * PUBLISHED
 *   ↓
 * ARCHIVED
 *
 * Access:
 * FREE / PREMIUM
 *
 * Attempt policy and proctoring are independent settings.
 * ============================================================
 */

const educatorExamQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EducatorQuestion",
      required: true,
    },

    /*
     * Position of the question inside this particular exam.
     */
    order: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * Marks awarded for this question in this exam.
     *
     * This is stored on the exam-question relationship so
     * the same question can have different marks in different
     * exams in the future.
     */
    marks: {
      type: Number,
      default: 1,
      min: 0,
    },

    /*
     * Optional negative marking for this particular question.
     */
    negativeMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

const proctoringSchema = new mongoose.Schema(
  {
    /*
     * Master switch.
     */
    enabled: {
      type: Boolean,
      default: false,
    },

    /*
     * Pre-test hardware checks.
     */
    requireCamera: {
      type: Boolean,
      default: false,
    },

    requireMicrophone: {
      type: Boolean,
      default: false,
    },

    /*
     * Fullscreen requirement during the exam.
     */
    requireFullscreen: {
      type: Boolean,
      default: false,
    },

    /*
     * Browser-level violation detection.
     *
     * The browser cannot truly control OS-level Alt+Tab,
     * but detectable visibility/focus/fullscreen events
     * can be recorded as violations.
     */
    monitorFullscreen: {
      type: Boolean,
      default: true,
    },

    monitorVisibility: {
      type: Boolean,
      default: true,
    },

    monitorBlur: {
      type: Boolean,
      default: true,
    },

    monitorContextMenu: {
      type: Boolean,
      default: true,
    },

    /*
     * Two-strike policy.
     *
     * Strike 1:
     * warning + student must resume.
     *
     * Strike 2:
     * immediate termination.
     */
    maxStrikes: {
      type: Number,
      default: 2,
      min: 1,
      max: 10,
    },

    /*
     * Whether violation details are persisted for the
     * final attempt record.
     */
    saveViolationLogs: {
      type: Boolean,
      default: true,
    },

    /*
     * Countdown shown before automatic termination.
     */
    terminationCountdownSeconds: {
      type: Number,
      default: 7,
      min: 1,
      max: 60,
    },
  },
  {
    _id: false,
  },
);

const educatorExamSchema = new mongoose.Schema(
  {
    /*
     * ========================================================
     * BASIC INFORMATION
     * ========================================================
     */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 220,
    },

    shortName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    instructions: {
      type: String,
      default: "",
      trim: true,
      maxlength: 10000,
    },

    /*
     * Exam category / subject.
     */
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    /*
     * Optional topic classification.
     */
    topic: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    /*
     * ========================================================
     * EXAM CONFIGURATION
     * ========================================================
     */

    durationMinutes: {
      type: Number,
      required: true,
      default: 60,
      min: 1,
      max: 1440,
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    passingPercentage: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },

    questionCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Whether questions are selected manually or generated
     * from the question bank.
     */
    questionSelectionMode: {
      type: String,
      enum: [
        "MANUAL",
        "RANDOM",
        "RULE_BASED",
      ],
      default: "MANUAL",
    },

    /*
     * ========================================================
     * ACCESS
     * ========================================================
     *
     * FREE:
     *   Any authenticated registered user can start.
     *
     * PREMIUM:
     *   Requires server-side entitlement/access validation.
     *
     * Never trust a frontend isPremium flag.
     */

    accessType: {
      type: String,
      enum: ["FREE", "PREMIUM"],
      default: "FREE",
      index: true,
    },

    /*
     * ========================================================
     * ATTEMPT POLICY
     * ========================================================
     *
     * Access type and attempt policy remain independent.
     */

    attemptPolicy: {
      type: String,
      enum: [
        "SINGLE_ATTEMPT",
        "MULTIPLE_ATTEMPTS",
      ],
      default: "SINGLE_ATTEMPT",
    },

    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },

    /*
     * ========================================================
     * PROCTORING
     * ========================================================
     */

    proctoring: {
      type: proctoringSchema,
      default: () => ({}),
    },

    /*
     * ========================================================
     * QUESTION RELATIONSHIP
     * ========================================================
     */

    questions: {
      type: [educatorExamQuestionSchema],
      default: [],
    },

    /*
     * ========================================================
     * BATCH / COURSE TARGETING
     * ========================================================
     *
     * These references are intentionally generic and future-ready.
     *
     * Batch assignment can be implemented without changing the
     * exam document structure.
     */

    targetBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],

    targetCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EducatorCourse",
      },
    ],

    /*
     * ========================================================
     * STATUS / PUBLISHING
     * ========================================================
     */

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
      ],
      default: "DRAFT",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    archivedAt: {
      type: Date,
      default: null,
    },

    /*
     * ========================================================
     * CREATOR / OWNERSHIP
     * ========================================================
     */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /*
     * ========================================================
     * DISPLAY / ANALYTICS
     * ========================================================
     */

    isFeatured: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    completionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * ============================================================
 * INDEXES
 * ============================================================
 */

educatorExamSchema.index({
  createdBy: 1,
  status: 1,
  updatedAt: -1,
});

educatorExamSchema.index({
  createdBy: 1,
  accessType: 1,
  status: 1,
});

educatorExamSchema.index({
  targetBatches: 1,
  status: 1,
});

educatorExamSchema.index({
  targetCourses: 1,
  status: 1,
});

module.exports =
  mongoose.models.EducatorExam ||
  mongoose.model(
    "EducatorExam",
    educatorExamSchema,
  );