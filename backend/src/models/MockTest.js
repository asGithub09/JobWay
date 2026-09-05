const mongoose = require("mongoose");

const mockTestSchema = new mongoose.Schema(
  {
    testSeries: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestSeries",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
      default: 60,
    },

    totalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    marksPerQuestion: {
      type: Number,
      default: 1,
      min: 0,
    },

    negativeMarking: {
      type: Number,
      default: 0,
      min: 0,
    },

    accessType: {
      type: String,
      enum: ["FREE", "PREMIUM"],
      default: "FREE",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    instructions: {
      type: [String],
      default: [],
    },

    attemptLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.MockTest ||
  mongoose.model("MockTest", mockTestSchema);