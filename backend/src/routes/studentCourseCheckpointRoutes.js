const express = require("express");

const {
  getMyCheckpoint,
  submitMyCheckpoint,
} = require("../controllers/studentCourseCheckpointController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

/**
 * GET
 * /api/student/course-checkpoints/:courseId/:learningItemId
 *
 * Load the authenticated student's Course Mock Checkpoint.
 */
router.get(
  "/:courseId/:learningItemId",
  getMyCheckpoint,
);

/**
 * POST
 * /api/student/course-checkpoints/:courseId/:learningItemId/submit
 *
 * Submit the authenticated student's checkpoint.
 */
router.post(
  "/:courseId/:learningItemId/submit",
  submitMyCheckpoint,
);

module.exports = router;
