const express = require("express");

const {
  buildCourseDraft,
  getCourseDraft,
  getCourseDrafts,
  updateCourseDraft,
  approveCourseDraft,
  publishCourseDraft,
} = require("../controllers/courseFactoryController");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * ============================================================
 * BUILD COURSE DRAFT
 * ============================================================
 *
 * Build a Course Factory draft from uploaded source material.
 */
router.post(
  "/build",
  authenticateToken,
  authorizeAdmin,
  buildCourseDraft,
);

/*
 * ============================================================
 * GET ALL COURSE DRAFTS
 * ============================================================
 *
 * Optional:
 * GET /api/course-factory/drafts?courseId=COURSE_ID
 */
router.get(
  "/drafts",
  authenticateToken,
  authorizeAdmin,
  getCourseDrafts,
);

/*
 * ============================================================
 * GET ONE COURSE DRAFT
 * ============================================================
 */
router.get(
  "/drafts/:id",
  authenticateToken,
  authorizeAdmin,
  getCourseDraft,
);

/*
 * ============================================================
 * UPDATE COURSE DRAFT
 * ============================================================
 *
 * Used by the Admin Review Studio.
 */
router.patch(
  "/drafts/:id",
  authenticateToken,
  authorizeAdmin,
  updateCourseDraft,
);

/*
 * ============================================================
 * APPROVE COURSE DRAFT
 * ============================================================
 *
 * READY_FOR_REVIEW → APPROVED
 *
 * Approval does not publish the course.
 */
router.post(
  "/drafts/:id/approve",
  authenticateToken,
  authorizeAdmin,
  approveCourseDraft,
);

/*
 * ============================================================
 * PUBLISH COURSE DRAFT
 * ============================================================
 *
 * APPROVED → PUBLISHED
 *
 * Copies the reviewed curriculum into the actual Course
 * and makes the Course publicly available.
 */
router.post(
  "/drafts/:id/publish",
  authenticateToken,
  authorizeAdmin,
  publishCourseDraft,
);

module.exports = router;