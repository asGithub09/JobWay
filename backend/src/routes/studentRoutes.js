const express = require("express");

const {
  getStudents,
  getBatchSummary,
  assignStudentToBatch,
  unassignStudentFromBatch,
} = require("../controllers/studentController");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeAdmin);

router.get("/", getStudents);

router.get("/batch-summary", getBatchSummary);

router.patch("/:studentId/batch", assignStudentToBatch);

router.delete("/:studentId/batch", unassignStudentFromBatch);

module.exports = router;