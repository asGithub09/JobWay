const express = require("express");

const {
  getMyCourseProgress,
  updateMyCurrentLesson,
  completeMyLesson,
} = require("../controllers/studentCourseProgressController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   AUTHENTICATION
   ========================================================= */

router.use(authenticateToken);

/* =========================================================
   STUDENT COURSE PROGRESS
   ========================================================= */

/**
 * GET
 * /api/student/course-progress/:courseId
 *
 * Get the authenticated student's progress
 * for a particular course.
 */
router.get(
  "/:courseId",
  getMyCourseProgress,
);

/**
 * POST
 * /api/student/course-progress/:courseId/complete
 *
 * Complete a lesson.
 */
router.post(
  "/:courseId/complete",
  completeMyLesson,
);

/**
 * PATCH
 * /api/student/course-progress/:courseId/current
 *
 * Save the student's current lesson.
 */
router.patch(
  "/:courseId/current",
  updateMyCurrentLesson,
);

module.exports = router;