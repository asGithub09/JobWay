const mongoose = require("mongoose");

const BatchMember = require("../models/BatchMember");
const BatchCourse = require("../models/BatchCourse");

/*
 * ============================================================
 * BATCH ACCESS SERVICE
 * ============================================================
 *
 * Centralized server-side access control for student content.
 *
 * Access chain:
 *
 * Student
 *   ↓
 * Active BatchMember
 *   ↓
 * Active Batch
 *   ↓
 * Active BatchCourse
 *   ↓
 * Published Course
 *
 * This service does NOT modify User, Batch or Course.
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
 * Get the student's current active batch.
 *
 * The application rule is one active batch per student.
 *
 * Archived batches are ignored even if an old membership
 * accidentally remains active.
 */
async function getStudentActiveBatch(studentId) {
  const studentObjectId = toObjectId(studentId);

  if (!studentObjectId) {
    return null;
  }

  const membership = await BatchMember.findOne({
    student: studentObjectId,
    status: "active",
  })
    .populate({
      path: "batch",
      match: {
        status: {
          $ne: "archived",
        },
      },
    })
    .lean();

  if (!membership || !membership.batch) {
    return null;
  }

  return {
    membership,
    batch: membership.batch,
  };
}

/**
 * Check whether a student can access a particular course.
 *
 * Returns detailed access information instead of only true/false
 * so controllers can reuse the batch information.
 */
async function studentCanAccessCourse(studentId, courseId) {
  const studentObjectId = toObjectId(studentId);
  const courseObjectId = toObjectId(courseId);

  if (!studentObjectId || !courseObjectId) {
    return {
      allowed: false,
      reason: "invalid_id",
      batch: null,
      membership: null,
      assignment: null,
    };
  }

  const activeBatch = await getStudentActiveBatch(studentObjectId);

  if (!activeBatch) {
    return {
      allowed: false,
      reason: "no_active_batch",
      batch: null,
      membership: null,
      assignment: null,
    };
  }

  const assignment = await BatchCourse.findOne({
    batch: activeBatch.batch._id,
    course: courseObjectId,
    status: "active",
  }).lean();

  if (!assignment) {
    return {
      allowed: false,
      reason: "course_not_assigned",
      batch: activeBatch.batch,
      membership: activeBatch.membership,
      assignment: null,
    };
  }

  return {
    allowed: true,
    reason: "batch_access",
    batch: activeBatch.batch,
    membership: activeBatch.membership,
    assignment,
  };
}

/**
 * Get all courses accessible to a student through the
 * student's current active batch.
 *
 * Only published courses are returned.
 */
async function getStudentAccessibleCourses(studentId) {
  const activeBatch = await getStudentActiveBatch(studentId);

  if (!activeBatch) {
    return {
      batch: null,
      membership: null,
      courses: [],
    };
  }

  const assignments = await BatchCourse.find({
    batch: activeBatch.batch._id,
    status: "active",
  })
    .populate({
      path: "course",
      match: {
        isPublished: true,
      },
    })
    .sort({
      assignedAt: -1,
    })
    .lean();

  const courses = assignments
    .filter((assignment) => assignment.course)
    .map((assignment) => ({
      assignmentId: assignment._id,
      assignedAt: assignment.assignedAt,
      course: assignment.course,
    }));

  return {
    batch: activeBatch.batch,
    membership: activeBatch.membership,
    courses,
  };
}

module.exports = {
  getStudentActiveBatch,
  studentCanAccessCourse,
  getStudentAccessibleCourses,
};