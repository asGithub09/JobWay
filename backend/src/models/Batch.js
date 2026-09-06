const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseCategory",
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "archived",
      ],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

batchSchema.index({
  name: 1,
});

batchSchema.index({
  code: 1,
});

batchSchema.index({
  status: 1,
  createdAt: -1,
});

module.exports =
  mongoose.model(
    "Batch",
    batchSchema,
  );