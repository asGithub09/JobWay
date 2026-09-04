const express = require("express");

const {
  getPublishedCourses,
  getPublishedCourse,
  getAdminCourses,
  createCourse,
  updateCourse,
  toggleCoursePublish,
  deleteCourse,
} = require("../controllers/courseController");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * PUBLIC COURSE ROUTES
 */

router.get("/", getPublishedCourses);

/*
 * ADMIN COURSE ROUTES
 *
 * These must come before /:slug.
 */

router.get(
  "/admin/all",
  authenticateToken,
  authorizeAdmin,
  getAdminCourses,
);

router.post(
  "/admin",
  authenticateToken,
  authorizeAdmin,
  createCourse,
);

router.patch(
  "/admin/:id",
  authenticateToken,
  authorizeAdmin,
  updateCourse,
);

router.patch(
  "/admin/:id/publish",
  authenticateToken,
  authorizeAdmin,
  toggleCoursePublish,
);

router.delete(
  "/admin/:id",
  authenticateToken,
  authorizeAdmin,
  deleteCourse,
);

/*
 * PUBLIC COURSE DETAIL
 *
 * Keep this after the /admin routes so
 * /admin/all is not treated as a course slug.
 */

router.get("/:slug", getPublishedCourse);

module.exports = router;