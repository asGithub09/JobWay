const express = require("express");

const {
  authenticateToken,
  authorizeEducator,
} = require("../middleware/authMiddleware");

const {
  getAvailableEducatorMocks,
} = require("../controllers/educatorMockController");

const router = express.Router();

/*
 * GET /api/educator/mocks/available
 *
 * Read-only list of published Mock Tests available
 * through the educator's assigned batches.
 */
router.get(
  "/available",
  authenticateToken,
  authorizeEducator,
  getAvailableEducatorMocks,
);

module.exports = router;
