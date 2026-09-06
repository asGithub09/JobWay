const crypto = require("crypto");
const mongoose = require("mongoose");

const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const User = require("../models/User");

const {
  studentCanAccessCourse,
} = require("./batchAccessService");

const {
  getCourseProgress,
} = require("./studentCourseProgressService");

/**
 * ============================================================
 * CERTIFICATE SERVICE
 * ============================================================
 *
 * Certificate eligibility is determined on the server.
 *
 * Student
 *   ↓
 * Active Batch
 *   ↓
 * Batch Course Access
 *   ↓
 * Published Course
 *   ↓
 * Course Progress
 *   ↓
 * 100% Complete
 *   ↓
 * Certificate
 *
 * Certificates are permanent records.
 * Repeated issuance requests return the existing certificate.
 */

/**
 * Normalize a value into a MongoDB ObjectId.
 */
function toObjectId(value) {
  if (!value) {
    return null;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
}

/**
 * Generate a human-readable certificate number.
 *
 * Example:
 * JW-CERT-2026-A1B2C3D4
 */
function createCertificateNumber() {
  const year = new Date().getFullYear();

  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `JW-CERT-${year}-${randomPart}`;
}

/**
 * Generate a public verification identifier.
 *
 * Example:
 * JW-8F4K2M7Q...
 */
function createVerificationId() {
  return `JW-${crypto
    .randomBytes(12)
    .toString("hex")
    .toUpperCase()}`;
}

/**
 * Load one student's issued certificate.
 *
 * The student ID is included in the query so one student
 * cannot retrieve another student's certificate.
 */
async function getCertificateById(
  studentId,
  certificateId,
) {
  const studentObjectId = toObjectId(studentId);
  const certificateObjectId = toObjectId(certificateId);

  if (!studentObjectId || !certificateObjectId) {
    return null;
  }

  return Certificate.findOne({
    _id: certificateObjectId,
    student: studentObjectId,
    status: "issued",
  })
    .populate(
      "course",
      "title slug bannerImage instructor",
    )
    .lean();
}

/**
 * Get all certificates issued to a student.
 */
async function getStudentCertificates(studentId) {
  const studentObjectId = toObjectId(studentId);

  if (!studentObjectId) {
    return [];
  }

  return Certificate.find({
    student: studentObjectId,
    status: "issued",
  })
    .sort({
      issuedAt: -1,
    })
    .populate(
      "course",
      "title slug bannerImage instructor",
    )
    .lean();
}

/**
 * Create a certificate after verifying eligibility.
 *
 * This function:
 * - validates the student
 * - validates the course
 * - verifies batch access
 * - verifies course completion
 * - prevents duplicates
 * - stores a snapshot of student/course names
 */
async function issueCourseCertificate(
  studentId,
  courseId,
) {
  const studentObjectId = toObjectId(studentId);
  const courseObjectId = toObjectId(courseId);

  if (!studentObjectId || !courseObjectId) {
    const error = new Error(
      "Invalid student or course ID.",
    );

    error.code = "INVALID_ID";
    error.statusCode = 400;

    throw error;
  }

  /**
   * ----------------------------------------------------------
   * 1. Verify the student account
   * ----------------------------------------------------------
   */
  const student = await User.findOne({
    _id: studentObjectId,
    role: "student",
    isActive: true,
  })
    .select("_id name email")
    .lean();

  if (!student) {
    const error = new Error(
      "Active student account not found.",
    );

    error.code = "STUDENT_NOT_FOUND";
    error.statusCode = 404;

    throw error;
  }

  /**
   * ----------------------------------------------------------
   * 2. Verify the course exists and is published
   * ----------------------------------------------------------
   */
  const course = await Course.findOne({
    _id: courseObjectId,
    isPublished: true,
  }).lean();

  if (!course) {
    const error = new Error(
      "Published course not found.",
    );

    error.code = "COURSE_NOT_FOUND";
    error.statusCode = 404;

    throw error;
  }

  /**
   * ----------------------------------------------------------
   * 3. Verify current batch access
   * ----------------------------------------------------------
   *
   * Batch access remains the authority for protected
   * student course access.
   */
  const access = await studentCanAccessCourse(
    studentObjectId,
    courseObjectId,
  );

  if (!access.allowed) {
    const error = new Error(
      "You do not have access to this course.",
    );

    error.code = "COURSE_ACCESS_DENIED";
    error.statusCode = 403;

    throw error;
  }

  /**
   * ----------------------------------------------------------
   * 4. Check whether a certificate already exists
   * ----------------------------------------------------------
   *
   * Do this before expensive progress processing where
   * possible. The database unique index remains the final
   * protection against duplicates.
   */
  const existingCertificate =
    await Certificate.findOne({
      student: studentObjectId,
      course: courseObjectId,
      status: "issued",
    })
      .populate(
        "course",
        "title slug bannerImage instructor",
      )
      .lean();

  if (existingCertificate) {
    return {
      created: false,
      certificate: existingCertificate,
    };
  }

  /**
   * ----------------------------------------------------------
   * 5. Verify actual course completion
   * ----------------------------------------------------------
   *
   * getCourseProgress() uses the existing course-progress
   * engine. We deliberately do not duplicate its lesson
   * calculations here.
   */
  const progress = await getCourseProgress(
    studentObjectId,
    courseObjectId,
  );

  if (!progress) {
    const error = new Error(
      "Course progress could not be found.",
    );

    error.code = "PROGRESS_NOT_FOUND";
    error.statusCode = 400;

    throw error;
  }

  const progressPercent =
    Number(progress.progressPercent) || 0;

  const isCourseCompleted =
    progressPercent >= 100 ||
    progress.isCompleted === true ||
    Boolean(progress.completedAt);

  if (!isCourseCompleted) {
    const error = new Error(
      `Complete the course before requesting a certificate. Current progress: ${progressPercent}%.`,
    );

    error.code = "COURSE_NOT_COMPLETED";
    error.statusCode = 400;

    throw error;
  }

  /**
   * ----------------------------------------------------------
   * 6. Create certificate
   * ----------------------------------------------------------
   *
   * studentName and courseTitle are snapshots. This means
   * historical certificates don't unexpectedly change if
   * the student's profile or course title changes later.
   */
  try {
    const certificate = await Certificate.create({
      student: studentObjectId,
      course: courseObjectId,

      certificateNumber:
        createCertificateNumber(),

      verificationId:
        createVerificationId(),

      studentName: student.name,

      courseTitle: course.title,

      completionPercentage: 100,

      issuedAt: new Date(),

      status: "issued",
    });

    /**
     * Return a populated representation to the caller.
     */
    const populatedCertificate =
      await Certificate.findById(certificate._id)
        .populate(
          "course",
          "title slug bannerImage instructor",
        )
        .lean();

    return {
      created: true,
      certificate: populatedCertificate,
    };
  } catch (error) {
    /**
     * --------------------------------------------------------
     * Handle concurrent issuance safely.
     * --------------------------------------------------------
     *
     * The Certificate model has a unique compound index on:
     *
     * student + course
     *
     * If two requests arrive at nearly the same time, MongoDB
     * may reject one with duplicate-key error 11000.
     *
     * Instead of returning a misleading server error, retrieve
     * and return the certificate that won the race.
     */
    if (error?.code === 11000) {
      const concurrentCertificate =
        await Certificate.findOne({
          student: studentObjectId,
          course: courseObjectId,
          status: "issued",
        })
          .populate(
            "course",
            "title slug bannerImage instructor",
          )
          .lean();

      if (concurrentCertificate) {
        return {
          created: false,
          certificate: concurrentCertificate,
        };
      }
    }

    throw error;
  }
}

module.exports = {
  issueCourseCertificate,
  getStudentCertificates,
  getCertificateById,
};