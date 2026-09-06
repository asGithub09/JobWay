const TestSeries = require("../models/TestSeries");

const {
  getStudentAccessibleTestSeries,
  studentCanAccessTestSeries,
} = require("../services/batchAccessService");

/*
 * ============================================================
 * STUDENT TEST SERIES CONTROLLER
 * ============================================================
 *
 * Student test-series access is controlled through:
 *
 * Student
 *   ?
 * Active BatchMember
 *   ?
 * Active Batch
 *   ?
 * Active BatchTestSeries
 *   ?
 * Published Test Series
 *
 * This controller does not modify the existing public
 * exam/test-series endpoints.
 */

/**
 * GET /api/student/test-series
 *
 * Return all published test series assigned to the
 * student's currently active batch.
 */
async function getMyTestSeries(req, res) {
  try {
    const studentId = req.user?.userId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result =
      await getStudentAccessibleTestSeries(studentId);

    return res.status(200).json({
      success: true,

      batch: result.batch
        ? {
            _id: result.batch._id,
            name: result.batch.name,
            code: result.batch.code || "",
            status: result.batch.status,
          }
        : null,

      testSeries: result.testSeries,

      total: result.testSeries.length,
    });
  } catch (error) {
    console.error(
      "Get student test series error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load your test series",
    });
  }
}

/**
 * GET /api/student/test-series/:slug
 *
 * Return a single published test series only when the
 * authenticated student has access through the active batch.
 */
async function getMyTestSeriesBySlug(req, res) {
  try {
    const studentId = req.user?.userId;

    const slug = String(
      req.params.slug || "",
    )
      .trim()
      .toLowerCase();

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Test series slug is required",
      });
    }

    const testSeries = await TestSeries.findOne({
      slug,
      isPublished: true,
    })
      .populate(
        "exam",
        "name slug category",
      )
      .lean();

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message: "Test series not found",
      });
    }

    const access =
      await studentCanAccessTestSeries(
        studentId,
        testSeries._id,
      );

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this test series",
        reason: access.reason,
      });
    }

    return res.status(200).json({
      success: true,

      batch: access.batch
        ? {
            _id: access.batch._id,
            name: access.batch.name,
            code: access.batch.code || "",
            status: access.batch.status,
          }
        : null,

      testSeries,
    });
  } catch (error) {
    console.error(
      "Get student test series by slug error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load this test series",
    });
  }
}

module.exports = {
  getMyTestSeries,
  getMyTestSeriesBySlug,
};
