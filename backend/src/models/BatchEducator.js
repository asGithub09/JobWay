const mongoose = require("mongoose");

const batchEducatorSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },

    educator: {
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
 * An educator should have only one assignment
 * record for the same batch.
 */
batchEducatorSchema.index(
  {
    batch: 1,
    educator: 1,
  },
  {
    unique: true,
  },
);

/*
 * Useful for finding all educators assigned
 * to a particular batch.
 */
batchEducatorSchema.index({
  batch: 1,
  status: 1,
});

/*
 * Useful for finding all batches assigned
 * to a particular educator.
 */
batchEducatorSchema.index({
  educator: 1,
  status: 1,
});

module.exports =
  mongoose.models.BatchEducator ||
  mongoose.model(
    "BatchEducator",
    batchEducatorSchema,
  );