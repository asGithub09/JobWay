const Course = require("../models/Course");
const CourseMaterial = require("../models/CourseMaterial");
const CourseDraft = require("../models/CourseDraft");

const {
  createCourseDraft,
  sanitizeDraft,
} = require("../services/courseFactoryService");

/**
 * ============================================================
 * BUILD COURSE DRAFT
 * ============================================================
 *
 * Build a Course Factory draft from uploaded source material.
 */
async function buildCourseDraft(req, res) {
  try {
    const {
      courseId,
      materialId,
      regenerate = false,
    } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required.",
      });
    }

    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: "Course material ID is required.",
      });
    }

    const course =
      await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const material =
      await CourseMaterial.findById(materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Course material not found.",
      });
    }

    if (
      material.course.toString() !==
      course._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The selected material does not belong to this course.",
      });
    }

    if (
      material.status === "PROCESSING"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This material is still being processed. Please try again shortly.",
      });
    }

    if (
      material.status === "FAILED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          material.errorMessage ||
          "This material failed processing and cannot be used to build a course.",
      });
    }

    /*
     * Normal build:
     * Reuse the latest existing draft.
     *
     * Regeneration:
     * Create a completely new draft using
     * the latest Course Factory logic.
     */
    if (!regenerate) {
      const existingDraft =
        await CourseDraft.findOne({
          course: course._id,
          material: material._id,
          status: {
            $in: [
              "DRAFT",
              "READY_FOR_REVIEW",
              "APPROVED",
              "PUBLISHED",
            ],
          },
        }).sort({
          createdAt: -1,
        });

      if (existingDraft) {
        return res.status(200).json({
          success: true,
          message:
            "A course draft already exists for this material.",
          draft:
            sanitizeDraft(
              existingDraft,
            ),
          reused: true,
        });
      }
    }

    const draft =
      await createCourseDraft({
        courseId:
          course._id.toString(),

        materialId:
          material._id.toString(),

        userId:
          req.user.userId,
      });

    return res.status(201).json({
      success: true,
      message: regenerate
        ? "Course draft regenerated successfully."
        : "Course draft generated successfully.",

      draft:
        sanitizeDraft(draft),

      reused: false,

      regenerated:
        Boolean(regenerate),
    });
  } catch (error) {
    console.error(
      "Build course draft error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate course draft.",
    });
  }
}

/**
 * ============================================================
 * GET ONE COURSE DRAFT
 * ============================================================
 */
async function getCourseDraft(req, res) {
  try {
    const { id } = req.params;

    const draft =
      await CourseDraft.findById(id);

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Course draft not found.",
      });
    }

    return res.status(200).json({
      success: true,
      draft:
        sanitizeDraft(draft),
    });
  } catch (error) {
    console.error(
      "Get course draft error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to retrieve course draft.",
    });
  }
}

/**
 * ============================================================
 * GET ALL COURSE DRAFTS
 * ============================================================
 *
 * Optional:
 * ?courseId=COURSE_ID
 */
async function getCourseDrafts(
  req,
  res,
) {
  try {
    const { courseId } = req.query;

    const filter = {};

    if (courseId) {
      filter.course = courseId;
    }

    const drafts =
      await CourseDraft.find(filter)
        .sort({
          createdAt: -1,
        })
        .limit(100);

    return res.status(200).json({
      success: true,
      drafts:
        drafts.map(sanitizeDraft),
    });
  } catch (error) {
    console.error(
      "Get course drafts error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to retrieve course drafts.",
    });
  }
}

/**
 * ============================================================
 * UPDATE COURSE DRAFT
 * ============================================================
 *
 * Editable fields:
 * - title
 * - description
 * - modules
 * - practice
 * - sourceSections
 *
 * Protected fields such as course, material,
 * createdBy, generationMode and detectionMode
 * cannot be changed from the Review Studio.
 */
async function updateCourseDraft(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Course draft ID is required.",
      });
    }

    const draft =
      await CourseDraft.findById(id);

    if (!draft) {
      return res.status(404).json({
        success: false,
        message:
          "Course draft not found.",
      });
    }

    /*
     * Do not allow modification of a published
     * draft through the Review Studio.
     */
    if (draft.status === "PUBLISHED") {
      return res.status(409).json({
        success: false,
        message:
          "Published course drafts cannot be edited from the Review Studio.",
      });
    }

    const {
      title,
      description,
      modules,
      practice,
      sourceSections,
    } = req.body;

    /*
     * --------------------------------------------------------
     * TITLE
     * --------------------------------------------------------
     */
    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Course title is required.",
        });
      }

      if (title.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message:
            "Course title cannot exceed 200 characters.",
        });
      }

      draft.title = title.trim();
    }

    /*
     * --------------------------------------------------------
     * DESCRIPTION
     * --------------------------------------------------------
     */
    if (description !== undefined) {
      if (
        typeof description !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Course description must be a string.",
        });
      }

      if (description.length > 3000) {
        return res.status(400).json({
          success: false,
          message:
            "Course description cannot exceed 3000 characters.",
        });
      }

      draft.description =
        description.trim();
    }

    /*
     * --------------------------------------------------------
     * MODULES
     * --------------------------------------------------------
     */
    if (modules !== undefined) {
      if (!Array.isArray(modules)) {
        return res.status(400).json({
          success: false,
          message:
            "Modules must be an array.",
        });
      }

      draft.modules = modules;
    }

    /*
     * --------------------------------------------------------
     * PRACTICE
     * --------------------------------------------------------
     */
    if (practice !== undefined) {
      if (!Array.isArray(practice)) {
        return res.status(400).json({
          success: false,
          message:
            "Practice content must be an array.",
        });
      }

      draft.practice = practice;
    }

    /*
     * --------------------------------------------------------
     * SOURCE SECTIONS
     * --------------------------------------------------------
     */
    if (sourceSections !== undefined) {
      if (!Array.isArray(sourceSections)) {
        return res.status(400).json({
          success: false,
          message:
            "Source sections must be an array.",
        });
      }

      draft.sourceSections =
        sourceSections;
    }

    /*
     * Any manually edited draft returns to
     * READY_FOR_REVIEW until the separate
     * approval workflow is completed.
     */
    draft.status =
      "READY_FOR_REVIEW";

    const savedDraft =
      await draft.save();

    return res.status(200).json({
      success: true,
      message:
        "Course draft saved successfully.",
      draft:
        sanitizeDraft(savedDraft),
    });
  } catch (error) {
    console.error(
      "Update course draft error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to save course draft.",
    });
  }
}
/**
 * ============================================================
 * APPROVE COURSE DRAFT
 * ============================================================
 *
 * Moves a reviewed draft from READY_FOR_REVIEW
 * to APPROVED.
 *
 * Approval does NOT publish the course.
 */
async function approveCourseDraft(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Course draft ID is required.",
      });
    }

    const draft =
      await CourseDraft.findById(id);

    if (!draft) {
      return res.status(404).json({
        success: false,
        message:
          "Course draft not found.",
      });
    }

    if (draft.status === "PUBLISHED") {
      return res.status(409).json({
        success: false,
        message:
          "This course draft has already been published.",
      });
    }

    if (
      draft.status !==
      "READY_FOR_REVIEW"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only a course draft that is ready for review can be approved.",
      });
    }

    draft.status = "APPROVED";

    const savedDraft =
      await draft.save();

    return res.status(200).json({
      success: true,
      message:
        "Course draft approved successfully.",
      draft:
        sanitizeDraft(savedDraft),
    });
  } catch (error) {
    console.error(
      "Approve course draft error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to approve course draft.",
    });
  }
}

/**
 * ============================================================
 * PUBLISH COURSE DRAFT
 * ============================================================
 *
 * Copies the approved Course Factory draft into
 * the actual Course document.
 *
 * Publishing is only allowed after approval.
 */
async function publishCourseDraft(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Course draft ID is required.",
      });
    }

    const draft =
      await CourseDraft.findById(id);

    if (!draft) {
      return res.status(404).json({
        success: false,
        message:
          "Course draft not found.",
      });
    }

    if (draft.status === "PUBLISHED") {
      return res.status(409).json({
        success: false,
        message:
          "This course draft has already been published.",
      });
    }

    if (draft.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message:
          "Course draft must be approved before publishing.",
      });
    }

    if (!draft.course) {
      return res.status(400).json({
        success: false,
        message:
          "This course draft is not linked to a course.",
      });
    }

    const course =
      await Course.findById(
        draft.course,
      );

    if (!course) {
      return res.status(404).json({
        success: false,
        message:
          "The course associated with this draft was not found.",
      });
    }

    /*
     * --------------------------------------------------------
     * COPY REVIEWED CURRICULUM
     * --------------------------------------------------------
     */
    course.curriculum = {
      modules: Array.isArray(
        draft.modules,
      )
        ? draft.modules
        : [],

      practice: Array.isArray(
        draft.practice,
      )
        ? draft.practice
        : [],

      sourceFileName:
        draft.sourceFileName || "",

      generationMode:
        draft.generationMode || "",

      detectionMode:
        draft.detectionMode || "",

      publishedFromDraft:
        draft._id,

      publishedAt:
        new Date(),
    };

    /*
     * --------------------------------------------------------
     * SYNCHRONIZE COURSE INFORMATION
     * --------------------------------------------------------
     */
    if (
      typeof draft.title === "string" &&
      draft.title.trim()
    ) {
      course.title =
        draft.title.trim();
    }

    if (
      typeof draft.description ===
        "string" &&
      draft.description.trim()
    ) {
      course.description =
        draft.description.trim();
    }

    /*
     * --------------------------------------------------------
     * KEEP EXISTING SYLLABUS COMPATIBLE
     * --------------------------------------------------------
     *
     * The existing Course UI already understands
     * the syllabus field, so derive its module list
     * from the reviewed Course Factory modules.
     */
    if (
      Array.isArray(draft.modules)
    ) {
      course.syllabus =
        draft.modules.map(
          (module) => ({
            title:
              module.title ||
              "Untitled Module",

            description:
              module.description ||
              "",
          }),
        );
    }

    /*
     * --------------------------------------------------------
     * PUBLISH COURSE
     * --------------------------------------------------------
     */
    course.isPublished = true;

    await course.save();

    /*
     * Mark the draft published only after
     * the Course has successfully saved.
     */
    draft.status = "PUBLISHED";

    const savedDraft =
      await draft.save();

    return res.status(200).json({
      success: true,
      message:
        "Course published successfully.",

      draft:
        sanitizeDraft(savedDraft),

      course: {
        id:
          course._id.toString(),

        title:
          course.title,

        slug:
          course.slug,

        isPublished:
          course.isPublished,
      },
    });
  } catch (error) {
    console.error(
      "Publish course draft error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to publish course draft.",
    });
  }
}
module.exports = {
  buildCourseDraft,
  getCourseDraft,
  getCourseDrafts,
  updateCourseDraft,
  approveCourseDraft,
  publishCourseDraft,
};