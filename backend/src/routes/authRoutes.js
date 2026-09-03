const express = require("express");

const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  resendVerification,
} = require("../controllers/authController");

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