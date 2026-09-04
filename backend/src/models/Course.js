const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    content: {
      type: String,
      trim: true,
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
      trim: true,
      default: "",
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

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    lessons: {
      type: [lessonSchema],
      default: [],
    },
  },
  {
    _id: true,
  },
);

const practiceQuestionSchema = new mongoose.Schema(
  {
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

    question: {
      type: String,
      trim: true,
      default: "",
    },

    options: {
      type: [String],
      default: [],
    },

    answer: {
      type: String,
      trim: true,
      default: "",
    },

    explanation: {
      type: String,
      trim: true,
      default: "",
    },

    sourceSection: {
      type: String,
      trim: true,
      default: "",
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

const practiceSchema = new mongoose.Schema(
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
      default: "general",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    questions: {
      type: [practiceQuestionSchema],
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

const curriculumSchema = new mongoose.Schema(
  {
    modules: {
      type: [moduleSchema],
      default: [],
    },

    practice: {
      type: [practiceSchema],
      default: [],
    },

    sourceFileName: {
      type: String,
      trim: true,
      default: "",
    },

    generationMode: {
      type: String,
      trim: true,
      default: "",
    },

    detectionMode: {
      type: String,
      trim: true,
      default: "",
    },

    publishedFromDraft: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseDraft",
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    level: {
      type: String,
      trim: true,
      default: "All Levels",
      maxlength: 50,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    /*
     * Stores the URL of the course banner image.
     *
     * The actual image will be uploaded to an external
     * image/file storage service by the Admin Course Manager.
     */
    bannerImage: {
      type: String,
      trim: true,
      default: "",
    },

    duration: {
      type: String,
      trim: true,
      default: "Self Paced",
      maxlength: 100,
    },

    language: {
      type: String,
      trim: true,
      default: "English / Hindi",
      maxlength: 100,
    },

    price: {
      type: Number,
      min: 0,
      default: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    instructor: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    features: {
      type: [String],
      default: [],
    },

    syllabus: {
      type: [
        {
          title: {
            type: String,
            required: true,
            trim: true,
          },

          description: {
            type: String,
            trim: true,
            default: "",
          },
        },
      ],
      default: [],
    },

    /*
     * Generated and admin-reviewed curriculum.
     *
     * Course Factory publishes the reviewed draft into this
     * field. Keeping the generated curriculum separate from
     * the commercial course fields allows the Admin Course
     * Manager and Course Factory to evolve independently.
     */
    curriculum: {
      type: curriculumSchema,
      default: () => ({
        modules: [],
        practice: [],
        sourceFileName: "",
        generationMode: "",
        detectionMode: "",
        publishedFromDraft: null,
        publishedAt: null,
      }),
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    interestedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Course", courseSchema);