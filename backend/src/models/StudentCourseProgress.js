const mongoose = require("mongoose");

const completedLessonSchema = new mongoose.Schema(
  {
    moduleIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    lessonIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const completedModuleSchema = new mongoose.Schema(
  {
    moduleIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const studentCourseProgressSchema = new mongoose.Schema(
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

    completedLessons: {
      type: [completedLessonSchema],
      default: [],
    },

    completedModules: {
      type: [completedModuleSchema],
      default: [],
    },

    currentModuleIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentLessonIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

studentCourseProgressSchema.index(
  {
    student: 1,
    course: 1,
  },
  {
    unique: true,
  },
);

studentCourseProgressSchema.index({
  student: 1,
  lastAccessedAt: -1,
});

module.exports = mongoose.model(
  "StudentCourseProgress",
  studentCourseProgressSchema,
);