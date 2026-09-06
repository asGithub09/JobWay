const mongoose = require("mongoose");

const batchTestSeriesSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },

    testSeries: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestSeries",
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
 * A test series can only be assigned once to a batch.
 */
batchTestSeriesSchema.index(
  { batch: 1, testSeries: 1 },
  { unique: true },
);

/*
 * Useful for checking all active test-series
 * assigned to a particular batch.
 */
batchTestSeriesSchema.index({
  batch: 1,
  status: 1,
});

/*
 * Useful for checking which batches have
 * access to a particular test series.
 */
batchTestSeriesSchema.index({
  testSeries: 1,
  status: 1,
});

module.exports =
  mongoose.models.BatchTestSeries ||
  mongoose.model(
    "BatchTestSeries",
    batchTestSeriesSchema,
  );