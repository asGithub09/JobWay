const mongoose = require("mongoose");

const batchCourseSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * A course should only have one relationship
 * with a particular batch.
 */
batchCourseSchema.index(
  { batch: 1, course: 1 },
  { unique: true },
);

batchCourseSchema.index({
  batch: 1,
  status: 1,
});

batchCourseSchema.index({
  course: 1,
  status: 1,
});

module.exports = mongoose.model(
  "BatchCourse",
  batchCourseSchema,
);
