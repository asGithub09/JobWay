const express = require("express");

const {
  verifyCertificate,
} = require("../controllers/publicCertificateController");

const router = express.Router();

/**
 * Public certificate verification.
 *
 * No authentication is required.
 */
router.get(
  "/verify/:verificationId",
  verifyCertificate,
);

module.exports = router;