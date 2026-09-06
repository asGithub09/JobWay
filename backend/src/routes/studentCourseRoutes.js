const express = require("express");

const {
  getMyCourses,
  getMyCourse,
} = require("../controllers/studentCourseController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * All student course routes require authentication.
 */
router.use(authenticateToken);

/*
 * GET /api/student/courses
 */
router.get(
  "/",
  getMyCourses,
);

/*
 * GET /api/student/courses/:slug
 */
router.get(
  "/:slug",
  getMyCourse,
);

module.exports = router;