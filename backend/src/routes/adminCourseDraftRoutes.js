const express = require("express");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  getDrafts,
  getDraft,
  updateDraft,
  saveDraftAsCourse,
  deleteDraft,
} = require("../controllers/educatorCourseDraftController");

const router = express.Router();

router.use(
  authenticateToken,
  authorizeAdmin
);

router.get(
  "/",
  getDrafts
);

router.get(
  "/:id",
  getDraft
);

router.patch(
  "/:id",
  updateDraft
);

router.post(
  "/:id/save",
  saveDraftAsCourse
);

router.delete(
  "/:id",
  deleteDraft
);

module.exports = router;
