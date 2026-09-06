const express = require("express");

const {
  getBatchCourses,
  getAvailableBatchCourses,
  addCoursesToBatch,
  removeCourseFromBatch,
} = require("../controllers/batchCourseController");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeAdmin);

router.get(
  "/batch/:batchId/courses",
  getBatchCourses,
);

router.get(
  "/batch/:batchId/available-courses",
  getAvailableBatchCourses,
);

router.post(
  "/batch/:batchId/courses",
  addCoursesToBatch,
);

router.delete(
  "/batch/:batchId/courses/:courseId",
  removeCourseFromBatch,
);

module.exports = router;
