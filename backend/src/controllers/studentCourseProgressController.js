const {
  getCourseProgress,
  updateCurrentLesson,
  completeLesson,
} = require("../services/studentCourseProgressService");

/*
 * ============================================================
 * STUDENT COURSE PROGRESS CONTROLLER
 * ============================================================
 *
 * All access and progression rules are handled by the
 * studentCourseProgressService.
 *
 * This controller is intentionally thin:
 *
 * Request
 *   ↓
 * Controller
 *   ↓
 * Progress Service
 *   ↓
 * Batch Access Service
 *   ↓
 * MongoDB
 */

/**
 * GET
 * /api/student/course-progress/:courseId
 *
 * Return the student's persistent progress for a course.
 */
async function getMyCourseProgress(req, res) {
  try {
    const studentId = req.user?.userId;
    const courseId = req.params.courseId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const result = await getCourseProgress(
      studentId,
      courseId,
    );

    return res.status(200).json({
      success: true,
      batch: result.batch,
      progress: result.progress,
    });
  } catch (error) {
    console.error(
      "Get student course progress error:",
      error,
    );

    return res.status(
      error.statusCode || 500,
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to load course progress",
      code: error.code || "PROGRESS_ERROR",
    });
  }
}

/**
 * PATCH
 * /api/student/course-progress/:courseId/current
 *
 * Persist the lesson currently being viewed.
 */
async function updateMyCurrentLesson(req, res) {
  try {
    const studentId = req.user?.userId;
    const courseId = req.params.courseId;

    const {
      moduleIndex,
      lessonIndex,
    } = req.body || {};

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const result =
      await updateCurrentLesson(
        studentId,
        courseId,
        moduleIndex,
        lessonIndex,
      );

    return res.status(200).json({
      success: true,
      message: "Current lesson updated",
      progress: result.progress,
    });
  } catch (error) {
    console.error(
      "Update student current lesson error:",
      error,
    );

    return res.status(
      error.statusCode || 500,
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to update current lesson",
      code: error.code || "PROGRESS_ERROR",
    });
  }
}

/**
 * POST
 * /api/student/course-progress/:courseId/complete
 *
 * Complete one lesson.
 */
async function completeMyLesson(req, res) {
  try {
    const studentId = req.user?.userId;
    const courseId = req.params.courseId;

    const {
      moduleIndex,
      lessonIndex,
    } = req.body || {};

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const result =
      await completeLesson(
        studentId,
        courseId,
        moduleIndex,
        lessonIndex,
      );

    return res.status(200).json({
      success: true,
      message: result.alreadyCompleted
        ? "Lesson was already completed"
        : "Lesson completed successfully",
      completed: result.completed,
      alreadyCompleted:
        result.alreadyCompleted,
      progress: result.progress,
    });
  } catch (error) {
    console.error(
      "Complete student lesson error:",
      error,
    );

    return res.status(
      error.statusCode || 500,
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to complete lesson",
      code: error.code || "PROGRESS_ERROR",
    });
  }
}

module.exports = {
  getMyCourseProgress,
  updateMyCurrentLesson,
  completeMyLesson,
};