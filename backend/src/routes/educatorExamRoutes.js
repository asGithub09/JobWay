const express = require("express");

const {
  authenticateToken,
  authorizeEducator,
} = require("../middleware/authMiddleware");

const {
  getExams,
  getExam,
  createExam,
  updateExam,
  publishExam,
  deleteExam,
} = require("../controllers/educatorExamController");

const router = express.Router();

/*
 * ============================================================
 * EDUCATOR EMS — EXAMS
 * ============================================================
 *
 * New Educator-only examination management API.
 *
 * Existing Admin Exam routes are intentionally untouched.
 *
 * Base:
 * /api/educator/exams
 *
 * All routes require:
 * - authenticated user
 * - educator role
 * ============================================================
 */

router.use(
  authenticateToken,
  authorizeEducator,
);

/*
 * ============================================================
 * EXAM LIST
 * ============================================================
 *
 * GET
 * /api/educator/exams
 *
 * Optional:
 *
 * ?status=DRAFT
 * ?status=PUBLISHED
 * ?status=ARCHIVED
 *
 * ?accessType=FREE
 * ?accessType=PREMIUM
 */
router.get(
  "/",
  getExams,
);

/*
 * ============================================================
 * GET ONE EXAM
 * ============================================================
 *
 * GET
 * /api/educator/exams/:id
 */
router.get(
  "/:id",
  getExam,
);

/*
 * ============================================================
 * CREATE EXAM
 * ============================================================
 *
 * POST
 * /api/educator/exams
 *
 * Always starts as DRAFT.
 */
router.post(
  "/",
  createExam,
);

/*
 * ============================================================
 * UPDATE EXAM
 * ============================================================
 *
 * PATCH
 * /api/educator/exams/:id
 *
 * Used by:
 * - Exam Settings
 * - Question Builder
 * - Batch targeting
 * - Proctoring settings
 */
router.patch(
  "/:id",
  updateExam,
);

/*
 * ============================================================
 * PUBLISH EXAM
 * ============================================================
 *
 * POST
 * /api/educator/exams/:id/publish
 *
 * Server validates the exam before publishing.
 */
router.post(
  "/:id/publish",
  publishExam,
);

/*
 * ============================================================
 * DELETE DRAFT EXAM
 * ============================================================
 *
 * DELETE
 * /api/educator/exams/:id
 *
 * Published exams are protected.
 */
router.delete(
  "/:id",
  deleteExam,
);

module.exports = router;