const express = require("express");

const {
  createLead,
  getLeads,
  updateLeadStatus,
} = require("../controllers/leadController");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public: capture a new lead
router.post("/", createLead);

// Admin only: get leads
router.get(
  "/",
  authenticateToken,
  authorizeAdmin,
  getLeads
);

// Admin only: update lead status
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeAdmin,
  updateLeadStatus
);

module.exports = router;