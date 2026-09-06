const mongoose = require("mongoose");

const Batch = require("../models/Batch");
const BatchTestSeries = require("../models/BatchTestSeries");
const TestSeries = require("../models/TestSeries");
const User = require("../models/User");

/* =========================================================
   HELPERS
   ========================================================= */

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

/* =========================================================
   GET ASSIGNED TEST SERIES
   GET /api/batch-test-series/batch/:batchId
   ========================================================= */

async function getBatchTestSeries(req, res) {
  try {
    const { batchId } = req.params;

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    const batch = await Batch.findById(batchId).lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const assignments = await BatchTestSeries.find({
      batch: batchId,
      status: "active",
    })
      .populate({
        path: "testSeries",
        select:
          "title slug description accessType price discountPrice isPublished sortOrder exam createdAt updatedAt",
        populate: {
          path: "exam",
          select: "name slug shortName",
        },
      })
      .sort({
        assignedAt: -1,
      })
      .lean();

    const testSeries = assignments
      .filter((assignment) => assignment.testSeries)
      .map((assignment) => ({
        assignmentId: assignment._id,
        assignedAt: assignment.assignedAt,
        assignedBy: assignment.assignedBy,
        testSeries: assignment.testSeries,
      }));

    return res.status(200).json({
      success: true,
      batch,
      testSeries,
      total: testSeries.length,
    });
  } catch (error) {
    console.error(
      "Get batch test series error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load batch test series",
    });
  }
}

/* =========================================================
   GET AVAILABLE TEST SERIES
   GET /api/batch-test-series/batch/:batchId/available
   ========================================================= */

async function getAvailableTestSeries(req, res) {
  try {
    const { batchId } = req.params;
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    const batch = await Batch.findById(batchId).lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const assigned = await BatchTestSeries.find({
      batch: batchId,
    })
      .select("testSeries")
      .lean();

    const assignedIds = assigned.map(
      (item) => item.testSeries,
    );

    const query = {
      isPublished: true,
      ...(assignedIds.length > 0
        ? {
            _id: {
              $nin: assignedIds,
            },
          }
        : {}),
    };

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          slug: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const testSeries = await TestSeries.find(query)
      .populate(
        "exam",
        "name slug shortName",
      )
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      testSeries,
      total: testSeries.length,
    });
  } catch (error) {
    console.error(
      "Get available test series error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load available test series",
    });
  }
}

/* =========================================================
   ASSIGN TEST SERIES
   POST /api/batch-test-series/batch/:batchId/test-series
   ========================================================= */

async function addTestSeriesToBatch(req, res) {
  try {
    const { batchId } = req.params;

    const testSeriesIds = Array.isArray(
      req.body?.testSeriesIds,
    )
      ? req.body.testSeriesIds
      : [];

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    if (
      testSeriesIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one test series is required",
      });
    }

    if (testSeriesIds.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          "You can assign a maximum of 100 test series at once",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    if (batch.status === "archived") {
      return res.status(400).json({
        success: false,
        message:
          "Archived batches cannot receive test series",
      });
    }

    const normalizedIds = [
      ...new Set(
        testSeriesIds.map((id) =>
          String(id),
        ),
      ),
    ];

    const invalidId = normalizedIds.find(
      (id) => !isValidObjectId(id),
    );

    if (invalidId) {
      return res.status(400).json({
        success: false,
        message:
          "One or more test series IDs are invalid",
      });
    }

    const seriesList =
      await TestSeries.find({
        _id: {
          $in: normalizedIds,
        },
      });

    const foundIds = new Set(
      seriesList.map((series) =>
        series._id.toString(),
      ),
    );

    const missingIds =
      normalizedIds.filter(
        (id) => !foundIds.has(id),
      );

    if (missingIds.length > 0) {
      return res.status(404).json({
        success: false,
        message:
          "One or more test series were not found",
      });
    }

    const unpublishedSeries =
      seriesList.filter(
        (series) =>
          !series.isPublished,
      );

    if (unpublishedSeries.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Only published test series can be assigned to a batch",
      });
    }

    const existingAssignments =
      await BatchTestSeries.find({
        batch: batchId,
        testSeries: {
          $in: normalizedIds,
        },
      }).select(
        "testSeries status",
      );

    const existingMap =
      new Map(
        existingAssignments.map(
          (assignment) => [
            assignment.testSeries.toString(),
            assignment,
          ],
        ),
      );

    const added = [];
    const reactivated = [];
    const skipped = [];

    for (const seriesId of normalizedIds) {
      const existing =
        existingMap.get(seriesId);

      if (existing) {
        if (
          existing.status ===
          "inactive"
        ) {
          existing.status = "active";
          existing.assignedAt =
            new Date();
          existing.assignedBy =
            req.user?.userId || null;

          await existing.save();

          reactivated.push(
            seriesId,
          );
        } else {
          skipped.push(seriesId);
        }

        continue;
      }

      const assignment =
        await BatchTestSeries.create({
          batch: batchId,
          testSeries: seriesId,
          status: "active",
          assignedAt: new Date(),
          assignedBy:
            req.user?.userId || null,
        });

      added.push(
        assignment.testSeries.toString(),
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Test series assignment completed",
      added,
      reactivated,
      skipped,
      totalAdded:
        added.length +
        reactivated.length,
    });
  } catch (error) {
    console.error(
      "Add test series to batch error:",
      error,
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "One or more test series are already assigned to this batch",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to assign test series to batch",
    });
  }
}

/* =========================================================
   REMOVE TEST SERIES
   DELETE /api/batch-test-series/batch/:batchId/test-series/:testSeriesId
   ========================================================= */

async function removeTestSeriesFromBatch(
  req,
  res,
) {
  try {
    const {
      batchId,
      testSeriesId,
    } = req.params;

    if (
      !isValidObjectId(batchId) ||
      !isValidObjectId(testSeriesId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid batch or test series ID",
      });
    }

    const assignment =
      await BatchTestSeries.findOne({
        batch: batchId,
        testSeries: testSeriesId,
        status: "active",
      });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Test series is not assigned to this batch",
      });
    }

    /*
     * Keep the assignment record and mark it
     * inactive instead of deleting it.
     *
     * This preserves assignment history.
     */
    assignment.status = "inactive";

    await assignment.save();

    return res.status(200).json({
      success: true,
      message:
        "Test series removed from batch",
    });
  } catch (error) {
    console.error(
      "Remove test series from batch error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove test series from batch",
    });
  }
}

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
  getBatchTestSeries,
  getAvailableTestSeries,
  addTestSeriesToBatch,
  removeTestSeriesFromBatch,
};