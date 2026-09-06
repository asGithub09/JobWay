const express = require("express");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  createBatch,
  getBatches,
  getBatch,
  updateBatch,
  updateBatchStatus,
} = require("../controllers/batchController");

const router = express.Router();

/*
 * Every batch operation is admin-only.
 */
router.use(
  authenticateToken,
  authorizeAdmin,
);

router.get(
  "/",
  getBatches,
);

router.get(
  "/:id",
  getBatch,
);

router.post(
  "/",
  createBatch,
);

router.patch(
  "/:id",
  updateBatch,
);

router.patch(
  "/:id/status",
  updateBatchStatus,
);

module.exports = router;