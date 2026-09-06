const mongoose = require("mongoose");

const Batch = require("../models/Batch");
const Course = require("../models/Course");
const BatchCourse = require("../models/BatchCourse");

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value);

/*
 * GET ALL COURSES ASSIGNED TO A BATCH
 */
const getBatchCourses = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batch = await Batch.findById(batchId)
      .select("_id name code status")
      .lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const assignments = await BatchCourse.find({
      batch: batchId,
      status: "active",
    })
      .populate({
        path: "course",
        select:
          "_id title slug category level description bannerImage duration language price discountPrice instructor isFeatured isPublished createdAt updatedAt",
      })
      .sort({ assignedAt: -1 })
      .lean();

    const courses = assignments
      .filter((assignment) => assignment.course)
      .map((assignment) => ({
        membershipId: assignment._id.toString(),
        course: {
          _id: assignment.course._id.toString(),
          title: assignment.course.title,
          slug: assignment.course.slug,
          category: assignment.course.category,
          level: assignment.course.level,
          description: assignment.course.description,
          bannerImage: assignment.course.bannerImage || "",
          duration: assignment.course.duration,
          language: assignment.course.language,
          price: assignment.course.price,
          discountPrice: assignment.course.discountPrice,
          instructor: assignment.course.instructor,
          isFeatured: assignment.course.isFeatured,
          isPublished: assignment.course.isPublished,
          createdAt: assignment.course.createdAt,
          updatedAt: assignment.course.updatedAt,
        },
        status: assignment.status,
        assignedAt: assignment.assignedAt,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      }));

    return res.json({
      success: true,
      batch,
      courses,
      total: courses.length,
    });
  } catch (error) {
    console.error("Get batch courses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load batch courses.",
    });
  }
};

/*
 * GET COURSES AVAILABLE TO ADD TO A BATCH
 *
 * Existing active assignments are excluded.
 * Unpublished courses are intentionally included because
 * this is an admin management endpoint. The admin can decide
 * which course should be assigned; student access will still
 * require the course to be published.
 */
const getAvailableBatchCourses = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { search = "" } = req.query;

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batch = await Batch.findById(batchId)
      .select("_id name status")
      .lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const normalizedSearch =
      typeof search === "string" ? search.trim() : "";

    const escapedSearch = normalizedSearch.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    const searchRegex = normalizedSearch
      ? new RegExp(escapedSearch, "i")
      : null;

    const assignedCourses = await BatchCourse.find({
      batch: batchId,
      status: "active",
    })
      .select("course")
      .lean();

    const assignedCourseIds = assignedCourses.map(
      (assignment) => assignment.course,
    );

    const filter = {
      _id: {
        $nin: assignedCourseIds,
      },
    };

    if (searchRegex) {
      filter.$or = [
        { title: searchRegex },
        { category: searchRegex },
        { slug: searchRegex },
      ];
    }

    const courses = await Course.find(filter)
      .select(
        "_id title slug category level duration price discountPrice instructor isPublished bannerImage",
      )
      .sort({
        isPublished: -1,
        createdAt: -1,
      })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      courses,
      total: courses.length,
    });
  } catch (error) {
    console.error(
      "Get available batch courses error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load available courses.",
    });
  }
};

/*
 * ASSIGN ONE OR MORE COURSES TO A BATCH
 */
const addCoursesToBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { courseIds } = req.body || {};

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    if (
      !Array.isArray(courseIds) ||
      courseIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one course is required.",
      });
    }

    if (courseIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: "You can add a maximum of 100 courses at once.",
      });
    }

    const uniqueCourseIds = [
      ...new Set(
        courseIds.map((courseId) =>
          typeof courseId === "string"
            ? courseId.trim()
            : "",
        ),
      ),
    ];

    const invalidCourseId = uniqueCourseIds.find(
      (courseId) => !isValidObjectId(courseId),
    );

    if (invalidCourseId) {
      return res.status(400).json({
        success: false,
        message: "One or more course IDs are invalid.",
      });
    }

    const batch = await Batch.findById(batchId)
      .select("_id name status")
      .lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    if (batch.status === "archived") {
      return res.status(400).json({
        success: false,
        message:
          "Courses cannot be assigned to an archived batch.",
      });
    }

    const courses = await Course.find({
      _id: { $in: uniqueCourseIds },
    })
      .select("_id title slug category isPublished")
      .lean();

    const courseMap = new Map(
      courses.map((course) => [
        course._id.toString(),
        course,
      ]),
    );

    const missingCourseIds = uniqueCourseIds.filter(
      (courseId) => !courseMap.has(courseId),
    );

    if (missingCourseIds.length > 0) {
      return res.status(404).json({
        success: false,
        message:
          "One or more selected courses were not found.",
      });
    }

    const existingAssignments =
      await BatchCourse.find({
        batch: batchId,
        course: { $in: uniqueCourseIds },
      })
        .select("course status")
        .lean();

    const existingMap = new Map(
      existingAssignments.map((assignment) => [
        assignment.course.toString(),
        assignment,
      ]),
    );

    const now = new Date();
    const assignedBy =
      req.user?.userId || null;

    const operations = [];
    let addedCount = 0;
    let reactivatedCount = 0;
    let skippedCount = 0;

    for (const courseId of uniqueCourseIds) {
      const existing = existingMap.get(courseId);

      if (existing?.status === "active") {
        skippedCount += 1;
        continue;
      }

      if (existing) {
        operations.push({
          updateOne: {
            filter: {
              _id: existing._id,
            },
            update: {
              $set: {
                status: "active",
                assignedAt: now,
                assignedBy,
              },
            },
          },
        });

        reactivatedCount += 1;
      } else {
        operations.push({
          insertOne: {
            document: {
              batch: batchId,
              course: courseId,
              status: "active",
              assignedAt: now,
              assignedBy,
            },
          },
        });

        addedCount += 1;
      }
    }

    if (operations.length > 0) {
      await BatchCourse.bulkWrite(
        operations,
        { ordered: true },
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Batch course assignments updated successfully.",
      addedCount,
      reactivatedCount,
      skippedCount,
      totalProcessed: uniqueCourseIds.length,
    });
  } catch (error) {
    console.error(
      "Add courses to batch error:",
      error,
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "One or more course assignments already exist.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to assign courses to batch.",
    });
  }
};

/*
 * REMOVE COURSE FROM BATCH
 *
 * Historical assignment is retained as inactive.
 */
const removeCourseFromBatch = async (req, res) => {
  try {
    const { batchId, courseId } = req.params;

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID.",
      });
    }

    const assignment = await BatchCourse.findOne({
      batch: batchId,
      course: courseId,
      status: "active",
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "This course is not currently assigned to the batch.",
      });
    }

    assignment.status = "inactive";

    await assignment.save();

    return res.json({
      success: true,
      message:
        "Course removed from batch successfully.",
    });
  } catch (error) {
    console.error(
      "Remove course from batch error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove course from batch.",
    });
  }
};

module.exports = {
  getBatchCourses,
  getAvailableBatchCourses,
  addCoursesToBatch,
  removeCourseFromBatch,
};
