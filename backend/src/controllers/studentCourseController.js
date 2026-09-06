const Course = require("../models/Course");

const {
  getStudentAccessibleCourses,
  studentCanAccessCourse,
} = require("../services/batchAccessService");

/*
 * ============================================================
 * STUDENT COURSE CONTROLLER
 * ============================================================
 *
 * Student course access is controlled through:
 *
 * Student
 *   ↓
 * Active BatchMember
 *   ↓
 * Active Batch
 *   ↓
 * Active BatchCourse
 *   ↓
 * Published Course
 *
 * This controller does NOT modify the existing public
 * course controller or public course endpoints.
 */

/**
 * GET /api/student/courses
 *
 * Return all published courses assigned to the student's
 * currently active batch.
 */
async function getMyCourses(req, res) {
  try {
    const studentId = req.user?.userId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result =
      await getStudentAccessibleCourses(studentId);

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

      courses: result.courses,

      total: result.courses.length,
    });
  } catch (error) {
    console.error(
      "Get student courses error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load your courses",
    });
  }
}

/**
 * GET /api/student/courses/:slug
 *
 * Return a single course only when the authenticated
 * student has access through the active batch.
 */
async function getMyCourse(req, res) {
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
        message: "Course slug is required",
      });
    }

    const course = await Course.findOne({
      slug,
      isPublished: true,
    }).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const access =
      await studentCanAccessCourse(
        studentId,
        course._id,
      );

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this course",
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

      course,
    });
  } catch (error) {
    console.error(
      "Get student course error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load this course",
    });
  }
}

module.exports = {
  getMyCourses,
  getMyCourse,
};