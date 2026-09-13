const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 5,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
  },
  {
    _id: false,
  },
);

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      default: "",
      maxlength: 20000,
    },

    expectedOutput: {
      type: String,
      required: true,
      maxlength: 20000,
    },

    isHidden: {
      type: Boolean,
      default: true,
    },

    marks: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

const skillArenaQuestionSchema = new mongoose.Schema(
  {
    questionCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 120,
      unique: true,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },

    questionType: {
      type: String,
      enum: ["MCQ", "CODING", "SQL"],
      required: true,
      default: "MCQ",
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkillArenaCategory",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },

    topic: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
      index: true,
    },

    subtopic: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM",
      index: true,
    },

    language: {
      type: String,
      default: "",
      trim: true,
      maxlength: 60,
    },

    options: {
      type: [optionSchema],
      default: [],
    },

    correctAnswer: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20,
      select: false,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20000,
      select: false,
    },

    code: {
      type: String,
      default: "",
      maxlength: 50000,
    },

    starterCode: {
      type: String,
      default: "",
      maxlength: 50000,
    },

    constraints: {
      type: String,
      default: "",
      maxlength: 10000,
    },

    testCases: {
      type: [testCaseSchema],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    sourceType: {
      type: String,
      enum: ["MANUAL", "PDF", "DOCX", "XLSX", "XLS", "IMPORT"],
      default: "MANUAL",
    },

    sourceFileName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    sourceSection: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    sourceRow: {
      type: Number,
      default: null,
      min: 1,
    },

    importBatchId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

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

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED", "REJECTED"],
      default: "ACTIVE",
      index: true,
    },

    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

skillArenaQuestionSchema.index({
  category: 1,
  subject: 1,
  topic: 1,
  difficulty: 1,
});

skillArenaQuestionSchema.index({
  status: 1,
  questionType: 1,
});

module.exports =
  mongoose.models.SkillArenaQuestion ||
  mongoose.model("SkillArenaQuestion", skillArenaQuestionSchema);
