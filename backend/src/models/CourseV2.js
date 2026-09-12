const mongoose = require("mongoose");

const mediaAssetSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: "" },
    publicId: { type: String, trim: true, default: "" },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw", ""],
      default: "",
    },
    fileName: { type: String, trim: true, default: "" },
    mimeType: { type: String, trim: true, default: "" },
    size: { type: Number, default: 0 },
  },
  { _id: false }
);

const checkpointQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (value) => value.length === 4,
        message: "Checkpoint questions must contain exactly 4 options.",
      },
    },
    correctAnswer: {
      type: Number,
      min: 0,
      max: 3,
      required: true,
    },
    explanation: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const courseItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "TEXT",
        "VIDEO",
        "AUDIO",
        "IMAGE",
        "RESOURCE",
        "PRACTICE",
        "CHECKPOINT",
      ],
      required: true,
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    content: {
      type: String,
      trim: true,
      default: "",
    },

    url: {
      type: String,
      trim: true,
      default: "",
    },

    media: {
      type: mediaAssetSchema,
      default: null,
    },

    resourceUrl: {
      type: String,
      trim: true,
      default: "",
    },

    questionIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },

    questions: {
      type: [checkpointQuestionSchema],
      default: [],
    },
  },
  { _id: true }
);

const courseModuleSchema = new mongoose.Schema(
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

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    items: {
      type: [courseItemSchema],
      default: [],
    },
  },
  { _id: true }
);

const courseV2Schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    level: {
      type: String,
      trim: true,
      default: "",
    },

    language: {
      type: String,
      trim: true,
      default: "English",
    },

    thumbnail: {
      type: mediaAssetSchema,
      default: null,
    },

    modules: {
      type: [courseModuleSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    source: {
      type: {
        type: String,
        enum: ["MANUAL", "PDF", "DOCX", "XLSX", "AI"],
        default: "MANUAL",
      },

      fileName: {
        type: String,
        trim: true,
        default: "",
      },

      mimeType: {
        type: String,
        trim: true,
        default: "",
      },

      aiProvider: {
        type: String,
        trim: true,
        default: "",
      },
    },

    isLandingPagePublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "courses_v2",
  }
);

module.exports =
  mongoose.models.CourseV2 ||
  mongoose.model("CourseV2", courseV2Schema);
