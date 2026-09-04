const mongoose = require("mongoose");

const courseDraftLessonSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      description: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },

      content: {
        type: String,
        default: "",
      },

      keyPoints: {
        type: [String],
        default: [],
      },

      bullets: {
        type: [String],
        default: [],
      },

      sourceSection: {
        type: String,
        default: "",
        trim: true,
      },

      order: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      _id: true,
    },
  );

const courseDraftModuleSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      description: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },

      order: {
        type: Number,
        default: 0,
        min: 0,
      },

      lessons: {
        type: [courseDraftLessonSchema],
        default: [],
      },
    },
    {
      _id: true,
    },
  );

const courseDraftQuestionSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        required: true,
        trim: true,
      },

      options: {
        type: [String],
        default: [],
      },

      type: {
        type: String,
        enum: [
          "mcq",
          "short-answer",
          "long-answer",
          "project",
          "general",
        ],
        default: "general",
      },

      sourceSection: {
        type: String,
        default: "",
        trim: true,
      },

      order: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      _id: true,
    },
  );

const courseDraftPracticeSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      type: {
        type: String,
        enum: [
          "mcq",
          "short-answer",
          "long-answer",
          "project",
          "general",
        ],
        required: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },

      questions: {
        type: [courseDraftQuestionSchema],
        default: [],
      },

      order: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      _id: true,
    },
  );

const courseDraftSchema =
  new mongoose.Schema(
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true,
      },

      material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseMaterial",
        required: true,
        index: true,
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      description: {
        type: String,
        default: "",
        trim: true,
        maxlength: 3000,
      },

      sourceFileName: {
        type: String,
        default: "",
        trim: true,
        maxlength: 255,
      },

      status: {
        type: String,
        enum: [
          "DRAFT",
          "READY_FOR_REVIEW",
          "APPROVED",
          "PUBLISHED",
          "FAILED",
        ],
        default: "DRAFT",
        index: true,
      },

      generationMode: {
        type: String,
        enum: [
          "rule-based",
          "manual",
        ],
        default: "rule-based",
      },

      detectionMode: {
        type: String,
        default: "",
        trim: true,
      },

      summary: {
        unitCount: {
          type: Number,
          default: 0,
          min: 0,
        },

        sectionCount: {
          type: Number,
          default: 0,
          min: 0,
        },

        questionCount: {
          type: Number,
          default: 0,
          min: 0,
        },

        bulletCount: {
          type: Number,
          default: 0,
          min: 0,
        },

        mcqCount: {
          type: Number,
          default: 0,
          min: 0,
        },
      },

      modules: {
        type: [courseDraftModuleSchema],
        default: [],
      },

      practice: {
        type: [courseDraftPracticeSchema],
        default: [],
      },

      sourceSections: {
        type: [
          {
            title: {
              type: String,
              required: true,
              trim: true,
            },

            sourceTitle: {
              type: String,
              default: "",
              trim: true,
            },

            type: {
              type: String,
              default: "heading",
              trim: true,
            },

            confidence: {
              type: Number,
              default: 0,
              min: 0,
              max: 100,
            },

            isPractice: {
              type: Boolean,
              default: false,
            },

            isProject: {
              type: Boolean,
              default: false,
            },

            practiceType: {
              type: String,
              default: "",
              trim: true,
            },

            text: {
              type: String,
              default: "",
            },

            order: {
              type: Number,
              default: 0,
              min: 0,
            },
          },
        ],
        default: [],
      },

      errorMessage: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      timestamps: true,
    },
  );

courseDraftSchema.index({
  course: 1,
  createdAt: -1,
});

courseDraftSchema.index({
  material: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "CourseDraft",
  courseDraftSchema,
);