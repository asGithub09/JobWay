const mongoose = require("mongoose");

const BatchMember = require("../models/BatchMember");
const BatchCourse = require("../models/BatchCourse");
const BatchTestSeries = require("../models/BatchTestSeries");

/*
 * ============================================================
 * BATCH ACCESS SERVICE
 * ============================================================
 *
 * Centralized server-side access control for student content.
 *
 * Course access chain:
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
 * Test-Series access chain:
 *
 * Student
 *   ↓
 * Active BatchMember
 *   ↓
 * Active Batch
 *   ↓
 * Active BatchTestSeries
 *   ↓
 * Test Series
 *
 * Mock-Test access chain:
 *
 * Student
 *   ↓
 * Active BatchMember
 *   ↓
 * Active Batch
 *   ↓
 * Active BatchTestSeries
 *   ↓
 * Parent TestSeries
 *   ↓
 * MockTest
 *
 * This service does NOT modify User, Batch, Course,
 * TestSeries or MockTest.
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

/**
 * ============================================================
 * TEST SERIES ACCESS
 * ============================================================
 */

/**
 * Check whether a student can access a particular test series
 * through their current active batch.
 *
 * Access is granted when:
 *
 * Student
 *   ↓
 * Active BatchMember
 *   ↓
 * Active Batch
 *   ↓
 * Active BatchTestSeries
 *   ↓
 * TestSeries
 */
async function studentCanAccessTestSeries(studentId, testSeriesId) {
  const studentObjectId = toObjectId(studentId);
  const testSeriesObjectId = toObjectId(testSeriesId);

  if (!studentObjectId || !testSeriesObjectId) {
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

  const assignment = await BatchTestSeries.findOne({
    batch: activeBatch.batch._id,
    testSeries: testSeriesObjectId,
    status: "active",
  }).lean();

  if (!assignment) {
    return {
      allowed: false,
      reason: "test_series_not_assigned",
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
 * Get all test series accessible to a student through the
 * student's current active batch.
 *
 * Only published test series are returned.
 */
async function getStudentAccessibleTestSeries(studentId) {
  const activeBatch = await getStudentActiveBatch(studentId);

  if (!activeBatch) {
    return {
      batch: null,
      membership: null,
      testSeries: [],
    };
  }

  const assignments = await BatchTestSeries.find({
    batch: activeBatch.batch._id,
    status: "active",
  })
    .populate({
      path: "testSeries",
      match: {
        isPublished: true,
      },
      populate: {
        path: "exam",
        select: "name slug shortName",
      },
    })
    .sort({
      assignedAt: -1,
    })
    .lean();

  const testSeries = assignments
    .filter((assignment) => assignment.testSeries)
    .map((assignment) => ({
      assignmentId: assignment._id,
      assignedAt: assignment.assignedAt,
      testSeries: assignment.testSeries,
    }));

  return {
    batch: activeBatch.batch,
    membership: activeBatch.membership,
    testSeries,
  };
}

/**
 * ============================================================
 * MOCK TEST ACCESS
 * ============================================================
 */

/**
 * Check whether a student can access a particular mock test.
 *
 * Mock tests inherit batch access from their parent Test Series.
 *
 * The mockTest argument can be:
 *
 * - a populated MockTest document/object containing testSeries
 * - a lean MockTest object containing testSeries
 *
 * This avoids adding another database lookup inside the access
 * service when the controller already has the MockTest document.
 */
async function studentCanAccessMockTest(studentId, mockTest) {
  if (!mockTest) {
    return {
      allowed: false,
      reason: "invalid_mock_test",
      batch: null,
      membership: null,
      assignment: null,
    };
  }

  const testSeriesId =
    mockTest.testSeries?._id ||
    mockTest.testSeries?.id ||
    mockTest.testSeries;

  const testSeriesObjectId = toObjectId(testSeriesId);

  if (!testSeriesObjectId) {
    return {
      allowed: false,
      reason: "invalid_test_series",
      batch: null,
      membership: null,
      assignment: null,
    };
  }

  return studentCanAccessTestSeries(
    studentId,
    testSeriesObjectId,
  );
}

module.exports = {
  getStudentActiveBatch,

  studentCanAccessCourse,
  getStudentAccessibleCourses,

  studentCanAccessTestSeries,
  getStudentAccessibleTestSeries,

  studentCanAccessMockTest,
};