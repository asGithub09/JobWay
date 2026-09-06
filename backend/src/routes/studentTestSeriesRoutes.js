const express = require("express");

const {
  getMyTestSeries,
  getMyTestSeriesBySlug,
} = require("../controllers/studentTestSeriesController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * All student test-series routes require authentication.
 */
router.use(authenticateToken);

/*
 * GET /api/student/test-series
 */
router.get(
  "/",
  getMyTestSeries,
);

/*
 * GET /api/student/test-series/:slug
 */
router.get(
  "/:slug",
  getMyTestSeriesBySlug,
);

module.exports = router;
