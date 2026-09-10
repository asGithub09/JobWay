const BatchEducator = require("../models/BatchEducator");
const BatchTestSeries = require("../models/BatchTestSeries");
const MockTest = require("../models/MockTest");

function getEducatorId(req) {
  return (
    req.user?.userId ||
    req.user?._id ||
    req.user?.id
  );
}

/*
 * GET /api/educator/mocks/available
 *
 * Returns published MockTests that belong to TestSeries
 * assigned to batches where the authenticated educator
 * has an active BatchEducator assignment.
 *
 * This is a read-only selector endpoint.
 *
 * It does NOT:
 * - create MockTests
 * - update MockTests
 * - delete MockTests
 * - change TestSeries
 * - change BatchTestSeries
 * - change educator permissions
 */
async function getAvailableEducatorMocks(req, res) {
  try {
    const educatorId = getEducatorId(req);

    if (!educatorId) {
      return res.status(401).json({
        success: false,
        message: "Unable to identify educator.",
      });
    }

    const batchAssignments = await BatchEducator.find({
      educator: educatorId,
      status: "active",
    })
      .populate({
        path: "batch",
        select: "_id name code status",
      })
      .lean();

    const batchIds = batchAssignments
      .filter(
        (assignment) =>
          assignment.batch &&
          assignment.batch.status !== "archived",
      )
      .map((assignment) => assignment.batch._id);

    if (!batchIds.length) {
      return res.status(200).json({
        success: true,
        mocks: [],
        total: 0,
      });
    }

    const seriesAssignments = await BatchTestSeries.find({
      batch: { $in: batchIds },
      status: "active",
    })
      .select("batch testSeries assignedAt")
      .lean();

    const testSeriesIds = [
      ...new Set(
        seriesAssignments
          .map((assignment) =>
            String(assignment.testSeries || ""),
          )
          .filter(Boolean),
      ),
    ];

    if (!testSeriesIds.length) {
      return res.status(200).json({
        success: true,
        mocks: [],
        total: 0,
      });
    }

    const mocks = await MockTest.find({
      testSeries: { $in: testSeriesIds },
      isPublished: true,
    })
      .select(
        "_id title slug durationMinutes totalQuestions isPublished sortOrder",
      )
      .sort({
        sortOrder: 1,
        title: 1,
      })
      .lean();

    const uniqueMocks = [];
    const seen = new Set();

    for (const mock of mocks) {
      const id = String(mock._id);

      if (seen.has(id)) {
        continue;
      }

      seen.add(id);

      uniqueMocks.push({
        id: mock._id,
        title: mock.title,
        slug: mock.slug,
        durationMinutes: mock.durationMinutes,
        totalQuestions: mock.totalQuestions,
        isPublished: mock.isPublished,
      });
    }

    return res.status(200).json({
      success: true,
      mocks: uniqueMocks,
      total: uniqueMocks.length,
    });
  } catch (error) {
    console.error(
      "Get educator available mocks error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch available Mock Tests.",
    });
  }
}

module.exports = {
  getAvailableEducatorMocks,
};
