const express = require("express");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  getBatchEducators,
  searchEducators,
  addEducatorsToBatch,
  removeEducatorFromBatch,
  getMyBatches,
} = require("../controllers/batchEducatorController");

const router = express.Router();

/*
 * =========================================================
 * ADMIN BATCH-EDUCATOR MANAGEMENT
 * =========================================================
 */



/*
 * Get educators assigned to a batch.
 *
 * GET
 * /api/batch-educators/batch/:batchId/educators
 */
router.get(
  "/batch/:batchId/educators",
  authenticateToken,
  authorizeAdmin,
  getBatchEducators,
);

/*
 * Search educators available for assignment.
 *
 * GET
 * /api/batch-educators/batch/:batchId/available-educators
 */
router.get(
  "/batch/:batchId/available-educators",
  authenticateToken,
  authorizeAdmin,
  searchEducators,
);

/*
 * Assign educators to a batch.
 *
 * POST
 * /api/batch-educators/batch/:batchId/educators
 */
router.post(
  "/batch/:batchId/educators",
  authenticateToken,
  authorizeAdmin,
  addEducatorsToBatch,
);

/*
 * Remove an educator from a batch.
 *
 * DELETE
 * /api/batch-educators/batch/:batchId/educators/:educatorId
 */
router.delete(
  "/batch/:batchId/educators/:educatorId",
  authenticateToken,
  authorizeAdmin,
  removeEducatorFromBatch,
);

/*
 * =========================================================
 * EDUCATOR BATCH ACCESS
 * =========================================================
 *
 * IMPORTANT:
 * This route must remain accessible to educators.
 *
 * Therefore it cannot use the admin-only router middleware
 * above. The authorization check is performed directly
 * below.
 */

router.get(
  "/my-batches",
  authenticateToken,
  async (req, res, next) => {
    if (req.user?.role !== "educator") {
      return res.status(403).json({
        success: false,
        message:
          "Educator access required.",
      });
    }

    return getMyBatches(req, res, next);
  },
);

module.exports = router;
