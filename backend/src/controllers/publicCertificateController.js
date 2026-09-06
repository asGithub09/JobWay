const Certificate = require("../models/Certificate");

/**
 * Publicly verify a JobWay certificate.
 *
 * GET /api/certificates/verify/:verificationId
 *
 * Only non-sensitive certificate information is returned.
 * Student email, phone, password and account information
 * are never exposed.
 */
async function verifyCertificate(req, res) {
  try {
    const { verificationId } = req.params;

    if (!verificationId) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Verification ID is required",
      });
    }

    const normalizedVerificationId =
      String(verificationId).trim().toUpperCase();

    if (!normalizedVerificationId) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Verification ID is required",
      });
    }

    const certificate =
      await Certificate.findOne({
        verificationId: normalizedVerificationId,
        status: "issued",
      })
        .select(
          [
            "_id",
            "certificateNumber",
            "verificationId",
            "studentName",
            "courseTitle",
            "completionPercentage",
            "issuedAt",
            "status",
          ].join(" "),
        )
        .lean();

    if (!certificate) {
      return res.status(404).json({
        success: true,
        valid: false,
        message:
          "Certificate not found or is no longer valid",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      certificate: {
        id: certificate._id,
        certificateNumber:
          certificate.certificateNumber,
        verificationId:
          certificate.verificationId,
        studentName:
          certificate.studentName,
        courseTitle:
          certificate.courseTitle,
        completionPercentage:
          certificate.completionPercentage,
        issuedAt:
          certificate.issuedAt,
        status:
          certificate.status,
      },
    });
  } catch (error) {
    console.error(
      "Public certificate verification error:",
      error,
    );

    return res.status(500).json({
      success: false,
      valid: false,
      message:
        "Unable to verify certificate at this time",
    });
  }
}

module.exports = {
  verifyCertificate,
};