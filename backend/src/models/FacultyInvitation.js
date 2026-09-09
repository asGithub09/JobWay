const mongoose = require("mongoose");

const facultyInvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      },

    status: {
      type: String,
      enum: ["pending", "accepted", "revoked", "expired"],
      default: "pending",
      index: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

facultyInvitationSchema.index({
  email: 1,
  status: 1,
});

facultyInvitationSchema.index({
  expiresAt: 1,
});

module.exports = mongoose.model(
  "FacultyInvitation",
  facultyInvitationSchema,
);
