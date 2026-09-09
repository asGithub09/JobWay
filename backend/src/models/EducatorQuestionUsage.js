const mongoose = require("mongoose");

/*
 * ============================================================
 * EDUCATOR QUESTION USAGE
 * ============================================================
 *
 * Tracks which question was delivered to which student in
 * which batch.
 *
 * PRIMARY BUSINESS RULE:
 *
 *   SAME STUDENT
 *   +
 *   SAME BATCH
 *   +
 *   SAME QUESTION
 *   =
 *   ONLY ONE USAGE RECORD
 *
 * Therefore a question already delivered to a student in a
 * particular batch cannot be selected for that student again
 * in another exam for that same batch.
 *
 * The same question CAN still be used for:
 *
 *   Student A + Batch X
 *   Student B + Batch X
 *   Student A + Batch Y
 *
 * This is exactly the behavior required by the EMS.
 * ============================================================
 */

const educatorQuestionUsageSchema =
  new mongoose.Schema(
    {
      /*
       * ========================================================
       * STUDENT
       * ========================================================
       */

      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /*
       * ========================================================
       * BATCH
       * ========================================================
       *
       * Batch is nullable because Free Exams may not belong
       * to a particular batch.
       *
       * For batch-based exams, this field MUST be populated
       * by the service layer before creating the usage record.
       */

      batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        default: null,
        index: true,
      },

      /*
       * ========================================================
       * QUESTION
       * ========================================================
       */

      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EducatorQuestion",
        required: true,
        index: true,
      },

      /*
       * Store the hash as well.
       *
       * This protects historical usage even if question data
       * is later edited.
       */
      questionHash: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      /*
       * ========================================================
       * EXAM / ATTEMPT SOURCE
       * ========================================================
       */

      exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EducatorExam",
        required: true,
        index: true,
      },

      attempt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EducatorExamAttempt",
        default: null,
        index: true,
      },

      /*
       * ========================================================
       * USAGE EVENT
       * ========================================================
       */

      deliveredAt: {
        type: Date,
        default: Date.now,
        index: true,
      },

      /*
       * Whether the question was actually shown to the
       * student, rather than merely reserved.
       */
      presented: {
        type: Boolean,
        default: true,
      },

      /*
       * Position within the exam.
       */
      examQuestionOrder: {
        type: Number,
        default: null,
        min: 0,
      },
    },
    {
      timestamps: true,
    },
  );

/*
 * ============================================================
 * CRITICAL UNIQUE CONSTRAINT
 * ============================================================
 *
 * Batch exams:
 *
 *   student + batch + question
 *
 * must be unique.
 *
 * MongoDB sparse index is used because FREE exams can have
 * no batch.
 *
 * This prevents the same student from receiving the same
 * question twice within the same batch.
 */
educatorQuestionUsageSchema.index(
  {
    student: 1,
    batch: 1,
    question: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

/*
 * Also protect against the same question hash being delivered
 * twice to the same student/batch.
 *
 * This provides an additional layer of protection if a question
 * record is ever recreated with the same normalized content.
 */
educatorQuestionUsageSchema.index(
  {
    student: 1,
    batch: 1,
    questionHash: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

educatorQuestionUsageSchema.index({
  student: 1,
  batch: 1,
  deliveredAt: -1,
});

educatorQuestionUsageSchema.index({
  exam: 1,
  deliveredAt: -1,
});

module.exports =
  mongoose.models.EducatorQuestionUsage ||
  mongoose.model(
    "EducatorQuestionUsage",
    educatorQuestionUsageSchema,
  );