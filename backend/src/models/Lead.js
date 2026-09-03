const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{10}$/,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    goal: {
      type: String,
      required: true,
      enum: ["government", "private"],
    },

    interests: {
      type: [String],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0,
        message: "At least one interest is required",
      },
    },

    source: {
      type: String,
      default: "homepage-exam-selector",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "interested",
        "converted",
        "not-interested",
      ],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);