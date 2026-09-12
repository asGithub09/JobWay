const mongoose = require("mongoose");

/*
 * ============================================================
 * STUDENT COURSE MOCK CHECKPOINT ATTEMPT
 * ============================================================
 *
 * This is intentionally separate from:
 *
 * - TestAttempt
 * - MockTest
 * - TestSeries
 * - BatchTestSeries
 * - EducatorExamAttempt
 *
 * A Course Mock Checkpoint belongs directly to the published
 * Course Learning Journey and contains a snapshot of exactly
 * 10 MCQs embedded in the Course document.
 */

const checkpointQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [
        {
          key: {
            type: String,
            required: true,
            uppercase: true,
            enum: ["A", "B", "C", "D"],
          },

          text: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      required: true,
      validate: {
        validator: function (value) {
          if (!Array.isArray(value) || value.length !== 4) {
            return false;
          }

          const keys = value.map((option) =>
            String(option.key || "").toUpperCase(),
          );

          return (
            keys.length === 4 &&
            ["A", "B", "C", "D"].every((key) =>
              keys.includes(key),
            )
          );
        },
        message:
          "Each checkpoint question must contain options A, B, C and D.",
      },
    },

    correctAnswer: {
      type: String,
      required: true,
      uppercase: true,
      enum: ["A", "B", "C", "D"],
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  },
);

const checkpointAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    selectedAnswer: {
      type: String,
      default: null,
      uppercase: true,
      enum: ["A", "B", "C", "D", null],
    },
  },
  {
    _id: false,
  },
);

const studentCourseCheckpointAttemptSchema =
  new mongoose.Schema(
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true,
      },

      batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        default: null,
        index: true,
      },

      moduleIndex: {
        type: Number,
        required: true,
        min: 0,
      },

      learningItem: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: ["IN_PROGRESS", "SUBMITTED"],
        default: "IN_PROGRESS",
        index: true,
      },

      questions: {
        type: [checkpointQuestionSchema],
        required: true,
        validate: {
          validator: function (value) {
            return (
              Array.isArray(value) &&
              value.length >= 1
            );
          },
          message:
            "A Course Mock Checkpoint must contain at least 1 question.",
        },
      },

      answers: {
        type: [checkpointAnswerSchema],
        default: [],
      },

      totalQuestions: {
        type: Number,
        default: 0,
        min: 0,
      },

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

      score: {
        type: Number,
        default: 0,
        min: 0,
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

      startedAt: {
        type: Date,
        default: Date.now,
      },

      submittedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    },
  );

studentCourseCheckpointAttemptSchema.index({
  student: 1,
  course: 1,
  learningItem: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.StudentCourseCheckpointAttempt ||
  mongoose.model(
    "StudentCourseCheckpointAttempt",
    studentCourseCheckpointAttemptSchema,
  );
