const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: "Landing Page Advertisement",
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    cloudinaryPublicId: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    ctaText: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "Get Enrolled",
    },

    displayDelay: {
      type: Number,
      min: 0,
      max: 60,
      default: 5,
    },

    placement: {
      type: String,
      enum: ["landing-page"],
      default: "landing-page",
    },

    leadSource: {
      type: String,
      trim: true,
      default: "landing-ad",
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "Advertisement",
  advertisementSchema,
);
