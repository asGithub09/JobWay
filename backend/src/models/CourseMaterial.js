const mongoose = require("mongoose");

const courseMaterialSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },

    storageProvider: {
      type: String,
      enum: ["local", "cloudinary", "s3", "supabase"],
      default: "local",
    },

    storageKey: {
      type: String,
      default: "",
      trim: true,
    },

    storageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "UPLOADED",
        "PROCESSING",
        "READY",
        "FAILED",
      ],
      default: "UPLOADED",
      index: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    pageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    characterCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    wordCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    errorMessage: {
      type: String,
      default: "",
      trim: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

courseMaterialSchema.index({ course: 1, createdAt: -1 });

module.exports = mongoose.model(
  "CourseMaterial",
  courseMaterialSchema,
);