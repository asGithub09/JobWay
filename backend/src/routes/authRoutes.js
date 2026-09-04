const express = require("express");

const {
  register,
  verifyEmail,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  resendVerification,
} = require("../controllers/authController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  register,
);

router.post(
  "/verify-email",
  verifyEmail,
);

router.post(
  "/login",
  login,
);

router.get(
  "/me",
  authenticateToken,
  getMe,
);

router.patch(
  "/profile",
  authenticateToken,
  updateProfile,
);

router.post(
  "/forgot-password",
  forgotPassword,
);

router.post(
  "/reset-password",
  resetPassword,
);

router.post(
  "/resend-verification",
  resendVerification,
);

module.exports = router;