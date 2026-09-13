const mongoose = require("mongoose");

const challengeQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkillArenaQuestion",
      required: true,
    },

    order: {
      type: Number,
      required: true,
      min: 0,
    },

    marks: {
      type: Number,
      default: 1,
      min: 0,
    },

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

const skillArenaChallengeSchema = new mongoose.Schema(
  {
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
      maxlength: 240,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
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

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM",
    },

    durationMinutes: {
      type: Number,
      default: 10,
      min: 1,
      max: 180,
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardKey: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    questions: {
      type: [challengeQuestionSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
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
  },
  {
    timestamps: true,
  },
);

skillArenaChallengeSchema.index({
  category: 1,
  subject: 1,
  status: 1,
});

module.exports =
  mongoose.models.SkillArenaChallenge ||
  mongoose.model("SkillArenaChallenge", skillArenaChallengeSchema);
