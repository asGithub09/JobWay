const {
  getCheckpoint,
  submitCheckpoint,
} = require("../services/studentCourseCheckpointService");

function getStudentId(req) {
  return (
    req.user?.userId ||
    req.user?.id ||
    req.user?._id ||
    null
  );
}

/**
 * GET
 * /api/student/course-checkpoints/:courseId/:learningItemId
 */
async function getMyCheckpoint(req, res) {
  try {
    const studentId = getStudentId(req);

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await getCheckpoint(
      studentId,
      req.params.courseId,
      req.params.learningItemId,
    );

    return res.status(200).json({
      success: true,
      checkpoint: result,
    });
  } catch (error) {
    console.error(
      "Get student course checkpoint error:",
      error,
    );

    return res.status(
      error.statusCode || 500,
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to load course checkpoint.",
      code:
        error.code ||
        "CHECKPOINT_ERROR",
    });
  }
}

/**
 * POST
 * /api/student/course-checkpoints/:courseId/:learningItemId/submit
 */
async function submitMyCheckpoint(req, res) {
  try {
    const studentId = getStudentId(req);

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const answers =
      req.body?.answers;

    const result =
      await submitCheckpoint(
        studentId,
        req.params.courseId,
        req.params.learningItemId,
        answers,
      );

    return res.status(200).json({
      success: true,
      message:
        "Mock Checkpoint submitted successfully.",
      result: result.attempt,
    });
  } catch (error) {
    console.error(
      "Submit student course checkpoint error:",
      error,
    );

    return res.status(
      error.statusCode || 500,
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to submit course checkpoint.",
      code:
        error.code ||
        "CHECKPOINT_SUBMIT_ERROR",
    });
  }
}

module.exports = {
  getMyCheckpoint,
  submitMyCheckpoint,
};
