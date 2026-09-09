const express = require("express");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  createFacultyInvitation,
  validateFacultyInvitation,
  acceptFacultyInvitation,
  revokeFacultyInvitation,
  listFacultyInvitations,
} = require("../controllers/facultyController");

const router = express.Router();

/*
 * Public invitation onboarding routes.
 * These must remain accessible before an educator has an account.
 */
router.get(
  "/invitations/validate/:token",
  validateFacultyInvitation,
);

router.post(
  "/invitations/accept/:token",
  acceptFacultyInvitation,
);

/*
 * Admin-only faculty invitation management.
 */
router.use(authenticateToken, authorizeAdmin);

router.post(
  "/invitations",
  createFacultyInvitation,
);

router.get(
  "/invitations",
  listFacultyInvitations,
);

router.patch(
  "/invitations/:id/revoke",
  revokeFacultyInvitation,
);

module.exports = router;
