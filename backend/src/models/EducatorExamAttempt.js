const mongoose = require("mongoose");

/*
 * ============================================================
 * EDUCATOR EXAM ATTEMPT
 * ============================================================
 *
 * Authoritative server-side record for a student's attempt
 * at an Educator EMS exam.
 *
 * This model is intentionally separate from the existing
 * TestAttempt model.
 *
 * It is designed for:
 *
 * - Single-attempt enforcement
 * - Server-side timing
 * - Free/Premium entitlement checks
 * - Batch context
 * - Answer persistence
 * - Auto submission
 * - Proctoring
 * - Two-strike termination
 * - Violation history
 * - Result calculation
 * - Re-entry locking
 * - Future analytics
 * ============================================================
 */

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EducatorQuestion",
      required: true,
    },

    selectedAnswers: {
      type: [String],
      default: [],
    },

    markedForReview: {
      type: Boolean,
      default: false,
    },

    answeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const violationSchema = new mongoose.Schema(
  {
    strike: {
      type: Number,
      required: true,
      min: 1,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    eventType: {
      type: String,
      enum: [
        "FULLSCREEN_EXIT",
        "VISIBILITY_CHANGE",
        "WINDOW_BLUR",
        "CONTEXT_MENU",
        "OTHER",
      ],
      default: "OTHER",
    },

    occurredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const educatorExamAttemptSchema =
  new mongoose.Schema(
    {
      /*
       * ========================================================
       * OWNERSHIP / CONTEXT
       * ========================================================
       */

      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EducatorExam",
        required: true,
        index: true,
      },

      /*
       * Batch is recorded at attempt time.
       *
       * This is important because a student's batch membership
       * may change later.
       */
      batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        default: null,
        index: true,
      },

      /*
       * ========================================================
       * ATTEMPT STATE
       * ========================================================
       */

      status: {
        type: String,
        enum: [
          "IN_PROGRESS",
          "SUBMITTED",
          "EXPIRED",
          "TERMINATED",
          "LOCKED",
        ],
        default: "IN_PROGRESS",
        index: true,
      },

      /*
       * Once true, the student cannot re-enter this attempt.
       */
      reentryLocked: {
        type: Boolean,
        default: false,
        index: true,
      },

      /*
       * ========================================================
       * TIMING
       * ========================================================
       *
       * Server timestamps are authoritative.
       */

      startedAt: {
        type: Date,
        default: Date.now,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },

      submittedAt: {
        type: Date,
        default: null,
      },

      terminatedAt: {
        type: Date,
        default: null,
      },

      /*
       * ========================================================
       * QUESTIONS / ANSWERS
       * ========================================================
       */

      questions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "EducatorQuestion",
        },
      ],

      answers: {
        type: [answerSchema],
        default: [],
      },

      totalQuestions: {
        type: Number,
        default: 0,
        min: 0,
      },

      /*
       * ========================================================
       * PROCTORING
       * ========================================================
       */

      proctoringEnabled: {
        type: Boolean,
        default: false,
      },

      cameraVerified: {
        type: Boolean,
        default: false,
      },

      microphoneVerified: {
        type: Boolean,
        default: false,
      },

      fullscreenVerified: {
        type: Boolean,
        default: false,
      },

      /*
       * Current strike count.
       *
       * Strike 1 = warning.
       * Strike 2 = termination under the default policy.
       */
      strikeCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      violations: {
        type: [violationSchema],
        default: [],
      },

      terminationReason: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
      },

      /*
       * ========================================================
       * RESULTS
       * ========================================================
       */

      attemptedQuestions: {
        type: Number,
        default: 0,
        min: 0,
      },

      correctAnswers: {
        type: Number,
        default: 0,
        min: 0,
      },

      incorrectAnswers: {
        type: Number,
        default: 0,
        min: 0,
      },

      unansweredQuestions: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalMarks: {
        type: Number,
        default: 0,
        min: 0,
      },

      obtainedMarks: {
        type: Number,
        default: 0,
      },

      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      passed: {
        type: Boolean,
        default: false,
      },

      /*
       * ========================================================
       * ACCESS SNAPSHOT
       * ========================================================
       *
       * Records what access the student had when the attempt
       * began. This avoids changing historical attempt meaning
       * if entitlement changes later.
       */

      accessType: {
        type: String,
        enum: ["FREE", "PREMIUM"],
        default: "FREE",
      },

      entitlementVerified: {
        type: Boolean,
        default: false,
      },

      /*
       * ========================================================
       * AUDIT
       * ========================================================
       */

      ipAddress: {
        type: String,
        default: "",
        trim: true,
      },

      userAgent: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },
    },
    {
      timestamps: true,
    },
  );

/*
 * ============================================================
 * SINGLE-ATTEMPT PROTECTION
 * ============================================================
 *
 * The service layer will enforce whether a student can start
 * another attempt.
 *
 * This index gives us a fast lookup for the policy.
 */
educatorExamAttemptSchema.index({
  student: 1,
  exam: 1,
  createdAt: -1,
});

educatorExamAttemptSchema.index({
  student: 1,
  exam: 1,
  status: 1,
});

/*
 * Batch-specific history lookup.
 */
educatorExamAttemptSchema.index({
  student: 1,
  batch: 1,
  createdAt: -1,
});

/*
 * Expiration processing.
 */
educatorExamAttemptSchema.index({
  status: 1,
  expiresAt: 1,
});

/*
 * Result analytics.
 */
educatorExamAttemptSchema.index({
  exam: 1,
  status: 1,
  percentage: -1,
});

module.exports =
  mongoose.models.EducatorExamAttempt ||
  mongoose.model(
    "EducatorExamAttempt",
    educatorExamAttemptSchema,
  );