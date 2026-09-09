const express = require("express");

const {
  getMyEducatorExams,
} = require("../controllers/studentEducatorExamController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * All student educator-exam routes require authentication.
 */
router.use(authenticateToken);

/*
 * GET /api/student/educator-exams
 */
router.get(
  "/",
  getMyEducatorExams,
);

module.exports = router;