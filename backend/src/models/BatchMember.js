const mongoose = require("mongoose");

const batchMemberSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    joinedBy: {
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
 * A student can only have one membership
 * record inside the same batch.
 */
batchMemberSchema.index(
  {
    batch: 1,
    student: 1,
  },
  {
    unique: true,
  },
);

/*
 * Useful for listing a student's batches.
 */
batchMemberSchema.index({
  student: 1,
  status: 1,
});

module.exports =
  mongoose.model(
    "BatchMember",
    batchMemberSchema,
  );