const express = require("express");

const {
  buildCourseDraft,
  getCourseDrafts,
  getCourseDraft,
  updateCourseDraft,
  approveCourseDraft,
  publishCourseDraft,
  deleteCourseDraft,
} = require("../controllers/courseFactoryController");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * ============================================================
 * ADMIN COURSE FACTORY
 * ============================================================
 *
 * This router belongs to the existing Admin Course Factory.
 *
 * IMPORTANT:
 * - Existing Admin Course / Course Factory functionality is
 *   intentionally preserved.
 * - The new Educator Course workflow uses separate routes under
 *   /api/educator/courses and /api/educator/course-import.
 * - Do not mix educator endpoints into this router.
 *
 * COURSE DRAFT LIFECYCLE:
 *
 *   Source Material
 *        ↓
 *   BUILD
 *        ↓
 *   READY_FOR_REVIEW
 *        ↓
 *   UPDATE / REVIEW
 *        ↓
 *   APPROVED
 *        ↓
 *   PUBLISHED
 *
 * Drafts can also be deleted while they are still in a
 * non-published state.
 *
 * Future Admin Course Factory functionality can be added here
 * without changing the existing route structure.
 * ============================================================
 */

/*
 * ============================================================
 * BUILD COURSE DRAFT
 * ============================================================
 *
 * Build a Course Factory draft from uploaded source material.
 *
 * POST
 * /api/course-factory/build
 *
 * Authentication:
 * - Admin only
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
 * Optional course filter:
 *
 * GET /api/course-factory/drafts?courseId=COURSE_ID
 *
 * Authentication:
 * - Admin only
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
 *
 * GET /api/course-factory/drafts/:id
 *
 * Authentication:
 * - Admin only
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
 * Used by the existing Admin Review Studio.
 *
 * PATCH
 * /api/course-factory/drafts/:id
 *
 * Authentication:
 * - Admin only
 *
 * Typical editable data:
 * - title
 * - description
 * - modules
 * - lessons
 * - practice
 * - source sections
 * - other reviewed curriculum fields
 */
router.patch(
  "/drafts/:id",
  authenticateToken,
  authorizeAdmin,
  updateCourseDraft,
);

/*
 * ============================================================
 * DELETE COURSE DRAFT
 * ============================================================
 *
 * DELETE
 * /api/course-factory/drafts/:id
 *
 * Authentication:
 * - Admin only
 *
 * This removes an unwanted Admin Course Factory draft.
 *
 * IMPORTANT:
 * This endpoint is for the existing Admin Course Factory.
 * It does NOT delete EducatorCourse or EducatorCourseDraft
 * records.
 */
router.delete(
  "/drafts/:id",
  authenticateToken,
  authorizeAdmin,
  deleteCourseDraft,
);

/*
 * ============================================================
 * APPROVE COURSE DRAFT
 * ============================================================
 *
 * READY_FOR_REVIEW → APPROVED
 *
 * Approval does not publish the course.
 *
 * POST
 * /api/course-factory/drafts/:id/approve
 *
 * Authentication:
 * - Admin only
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
 * Copies the reviewed curriculum into the existing Course
 * and makes the Course publicly available according to the
 * existing Admin Course Factory implementation.
 *
 * POST
 * /api/course-factory/drafts/:id/publish
 *
 * Authentication:
 * - Admin only
 */
router.post(
  "/drafts/:id/publish",
  authenticateToken,
  authorizeAdmin,
  publishCourseDraft,
);

/*
 * ============================================================
 * FUTURE ADMIN COURSE FACTORY EXTENSION POINTS
 * ============================================================
 *
 * Keep future Admin-only Course Factory operations grouped
 * in this router.
 *
 * Planned capabilities can include:
 *
 * 1. Draft validation
 *    POST /drafts/:id/validate
 *
 * 2. Draft duplication
 *    POST /drafts/:id/duplicate
 *
 * 3. Draft regeneration
 *    POST /drafts/:id/regenerate
 *
 * 4. Curriculum regeneration by module/lesson
 *    POST /drafts/:id/regenerate-section
 *
 * 5. Draft preview
 *    GET /drafts/:id/preview
 *
 * 6. Publish validation
 *    GET /drafts/:id/publish-check
 *
 * 7. Publish history
 *    GET /drafts/:id/history
 *
 * 8. Course factory statistics
 *    GET /stats
 *
 * These are intentionally NOT registered yet because their
 * controller/service implementations do not exist.
 *
 * Keeping them documented here prevents the route architecture
 * from becoming fragmented later, without creating fake
 * endpoints that could break production behavior.
 * ============================================================
 */

/*
 * ============================================================
 * ROUTER EXPORT
 * ============================================================
 */
module.exports = router;