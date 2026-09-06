const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
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

    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    verificationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    courseTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    completionPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 100,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    status: {
      type: String,
      enum: ["issued", "revoked"],
      default: "issued",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

certificateSchema.index(
  { student: 1, course: 1 },
  { unique: true },
);

certificateSchema.index({
  status: 1,
  issuedAt: -1,
});

module.exports = mongoose.model(
  "Certificate",
  certificateSchema,
);