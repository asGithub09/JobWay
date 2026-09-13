const mongoose = require("mongoose");

const skillArenaCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 140,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    icon: {
      type: String,
      default: "sparkles",
      trim: true,
      maxlength: 80,
    },

    logoUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    logoPublicId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    accent: {
      type: String,
      default: "blue",
      trim: true,
      maxlength: 40,
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

skillArenaCategorySchema.index({
  isActive: 1,
  displayOrder: 1,
});

module.exports =
  mongoose.models.SkillArenaCategory ||
  mongoose.model("SkillArenaCategory", skillArenaCategorySchema);

