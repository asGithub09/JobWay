const express = require("express");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  issueCertificate,
  getMyCertificates,
  getMyCertificate,
} = require("../controllers/certificateController");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getMyCertificates);

router.post("/:courseId", issueCertificate);

router.get("/:certificateId", getMyCertificate);

module.exports = router;