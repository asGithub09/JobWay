const express = require("express");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  startExam,
  saveAnswer,
  submitExam,
  getMyResults,
  getAttemptReview,
} = require("../controllers/educatorExamAttemptController");

const router = express.Router();

/*
 * ============================================================
 * EDUCATOR EMS — STUDENT EXAM ATTEMPTS
 * ============================================================
 *
 * These routes are intentionally separate from the existing
 * MockTest / TestAttempt API.
 *
 * Authentication is required for every EMS exam attempt.
 * Access and entitlement are checked server-side.
 * ============================================================
 */

router.get(
  "/my-results",
  authenticateToken,
  getMyResults,
);
router.get(
  "/:attemptId/review",
  authenticateToken,
  getAttemptReview,
);

router.post(
  "/:examId/start",
  authenticateToken,
  startExam,
);

router.post(
  "/:attemptId/answer",
  authenticateToken,
  saveAnswer,
);

router.post(
  "/:attemptId/submit",
  authenticateToken,
  submitExam,
);

module.exports = router;