const express = require("express");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  getBatchTestSeries,
  getAvailableTestSeries,
  addTestSeriesToBatch,
  removeTestSeriesFromBatch,
} = require("../controllers/batchTestSeriesController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN — BATCH TEST SERIES
|--------------------------------------------------------------------------
|
| All routes in this file are restricted to administrators.
|
*/

/*
 * GET ASSIGNED TEST SERIES
 *
 * GET /api/batch-test-series/batch/:batchId
 */
router.get(
  "/batch/:batchId",
  authenticateToken,
  authorizeAdmin,
  getBatchTestSeries,
);

/*
 * GET AVAILABLE TEST SERIES
 *
 * GET /api/batch-test-series/batch/:batchId/available
 */
router.get(
  "/batch/:batchId/available",
  authenticateToken,
  authorizeAdmin,
  getAvailableTestSeries,
);

/*
 * ASSIGN TEST SERIES TO BATCH
 *
 * POST /api/batch-test-series/batch/:batchId/test-series
 *
 * Body:
 * {
 *   "testSeriesIds": ["...", "..."]
 * }
 */
router.post(
  "/batch/:batchId/test-series",
  authenticateToken,
  authorizeAdmin,
  addTestSeriesToBatch,
);

/*
 * REMOVE TEST SERIES FROM BATCH
 *
 * DELETE /api/batch-test-series/batch/:batchId/test-series/:testSeriesId
 */
router.delete(
  "/batch/:batchId/test-series/:testSeriesId",
  authenticateToken,
  authorizeAdmin,
  removeTestSeriesFromBatch,
);

module.exports = router;