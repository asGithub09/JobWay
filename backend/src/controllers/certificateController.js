const {
  issueCourseCertificate,
  getStudentCertificates,
  getCertificateById,
} = require("../services/certificateService");

/**
 * Issue a certificate for a completed course.
 *
 * POST /api/student/certificates/:courseId
 */
async function issueCertificate(req, res) {
  try {
    const studentId = req.user?.userId;
    const { courseId } = req.params;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const certificate = await issueCourseCertificate(
      studentId,
      courseId
    );

    return res.status(201).json({
      success: true,
      message: "Certificate issued successfully",
      certificate,
    });
  } catch (error) {
    console.error("Issue certificate error:", error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message || "Failed to issue certificate",
    });
  }
}

/**
 * Get all certificates belonging to the logged-in student.
 *
 * GET /api/student/certificates
 */
async function getMyCertificates(req, res) {
  try {
    const studentId = req.user?.userId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const certificates =
      await getStudentCertificates(studentId);

    return res.status(200).json({
      success: true,
      certificates,
      total: certificates.length,
    });
  } catch (error) {
    console.error("Get student certificates error:", error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message || "Failed to fetch certificates",
    });
  }
}

/**
 * Get one certificate belonging to the logged-in student.
 *
 * GET /api/student/certificates/:certificateId
 */
async function getMyCertificate(req, res) {
  try {
    const studentId = req.user?.userId;
    const { certificateId } = req.params;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID is required",
      });
    }

    const certificate = await getCertificateById(
      studentId,
      certificateId
    );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    return res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("Get student certificate error:", error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message || "Failed to fetch certificate",
    });
  }
}

module.exports = {
  issueCertificate,
  getMyCertificates,
  getMyCertificate,
};