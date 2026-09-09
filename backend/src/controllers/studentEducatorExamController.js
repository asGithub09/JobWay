const EducatorExam = require("../models/EducatorExam");

const {
  getStudentActiveBatch,
} = require("../services/batchAccessService");

/*
 * ============================================================
 * STUDENT EDUCATOR EMS — EXAM DISCOVERY
 * ============================================================
 *
 * Only published educator exams assigned to the student's
 * current active batch are returned.
 *
 * IMPORTANT:
 * - This endpoint returns metadata only.
 * - Questions are NEVER returned here.
 * - Correct answers are NEVER returned here.
 * - Explanations are NEVER returned here.
 * - Premium entitlement is checked when the attempt starts.
 */

/**
 * GET /api/student/educator-exams
 */
async function getMyEducatorExams(req, res) {
  try {
    const studentId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId ||
      null;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const activeBatch =
      await getStudentActiveBatch(studentId);

    const examVisibilityQuery = {
      status: "PUBLISHED",
      $or: [
        {
          accessType: "FREE",
          targetBatches: {
            $size: 0,
          },
        },
        ...(activeBatch
          ? [
              {
                targetBatches: activeBatch.batch._id,
              },
            ]
          : []),
      ],
    };

    const exams =
      await EducatorExam.find(examVisibilityQuery)
        .select(
          [
            "_id",
            "title",
            "slug",
            "shortName",
            "description",
            "category",
            "subject",
            "topic",
            "durationMinutes",
            "totalMarks",
            "passingPercentage",
            "questionCount",
            "accessType",
            "attemptPolicy",
            "maxAttempts",
            "publishedAt",
            "isFeatured",
            "sortOrder",
          ].join(" "),
        )
        .sort({
          isFeatured: -1,
          sortOrder: 1,
          publishedAt: -1,
        })
        .lean();

    const safeExams = exams.map((exam) => ({
      id: exam._id,
      title: exam.title,
      slug: exam.slug,
      shortName: exam.shortName || "",
      description: exam.description || "",
      category: exam.category || "",
      subject: exam.subject || "",
      topic: exam.topic || "",
      durationMinutes: exam.durationMinutes || 0,
      totalMarks: exam.totalMarks || 0,
      passingPercentage:
        exam.passingPercentage ?? 0,
      questionCount:
        exam.questionCount ?? 0,
      accessType:
        exam.accessType || "FREE",
      attemptPolicy:
        exam.attemptPolicy ||
        "SINGLE_ATTEMPT",
      maxAttempts:
        exam.maxAttempts || 1,
      publishedAt:
        exam.publishedAt || null,
      isFeatured:
        Boolean(exam.isFeatured),
      sortOrder:
        exam.sortOrder || 0,
    }));

    return res.status(200).json({
      success: true,

      batch: activeBatch
        ? {
            _id: activeBatch.batch._id,
            name: activeBatch.batch.name,
            code: activeBatch.batch.code || "",
            status: activeBatch.batch.status,
          }
        : null,

      exams: safeExams,
      total: safeExams.length,
    });
  } catch (error) {
    console.error(
      "Get student educator exams error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load educator exams.",
    });
  }
}

module.exports = {
  getMyEducatorExams,
};