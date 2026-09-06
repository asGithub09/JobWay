const express = require("express");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  getBatchStudents,
  searchStudents,
  addStudentsToBatch,
  removeStudentFromBatch,
  getBatchStudentCount,
} = require("../controllers/batchMemberController");

const router = express.Router();

/*
 * All batch-student management operations
 * are admin-only.
 */
router.use(
  authenticateToken,
  authorizeAdmin,
);

/*
 * Get students belonging to a batch.
 *
 * GET /api/batch-members/batch/:batchId/students
 */
router.get(
  "/batch/:batchId/students",
  getBatchStudents,
);

/*
 * Search students who are available to add.
 *
 * GET /api/batch-members/batch/:batchId/available-students
 */
router.get(
  "/batch/:batchId/available-students",
  searchStudents,
);

/*
 * Get student count.
 *
 * GET /api/batch-members/batch/:batchId/count
 */
router.get(
  "/batch/:batchId/count",
  getBatchStudentCount,
);

/*
 * Add one or multiple students.
 *
 * POST /api/batch-members/batch/:batchId/students
 */
router.post(
  "/batch/:batchId/students",
  addStudentsToBatch,
);

/*
 * Remove a student from a batch.
 *
 * DELETE
 * /api/batch-members/batch/:batchId/students/:studentId
 */
router.delete(
  "/batch/:batchId/students/:studentId",
  removeStudentFromBatch,
);

module.exports = router;