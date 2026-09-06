const mongoose = require("mongoose");

const Batch = require("../models/Batch");
const BatchMember = require("../models/BatchMember");
const User = require("../models/User");

function cleanText(value) {
  return String(value || "").trim();
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(
    String(value || ""),
  );
}

/*
 * =========================================================
 * GET BATCH STUDENTS
 * =========================================================
 *
 * Returns all students currently belonging to a batch.
 *
 * Optional query:
 * ?search=rahul
 */
async function getBatchStudents(req, res) {
  try {
    const { batchId } = req.params;
    const search = cleanText(
      req.query?.search,
    );

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batch =
      await Batch.findById(batchId).lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const studentFilter = {
      role: "student",
    };

    if (search) {
      studentFilter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const members =
      await BatchMember.find({
        batch: batchId,
        status: "active",
      })
        .populate({
          path: "student",
          match: studentFilter,
          select:
            "name email phone isEmailVerified isActive createdAt",
        })
        .sort({
          joinedAt: -1,
        })
        .lean();

    const students = members
      .filter(
        (member) => member.student,
      )
      .map((member) => ({
        membershipId: member._id,
        student: member.student,
        status: member.status,
        joinedAt: member.joinedAt,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      }));

    return res.status(200).json({
      success: true,
      batch,
      students,
      total: students.length,
    });
  } catch (error) {
    console.error(
      "Get batch students error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch batch students.",
    });
  }
}

/*
 * =========================================================
 * SEARCH AVAILABLE STUDENTS
 * =========================================================
 *
 * Searches student accounts that can be added to
 * a particular batch.
 *
 * ?search=rahul
 *
 * Students already inside the batch are excluded.
 */
async function searchStudents(req, res) {
  try {
    const { batchId } = req.params;
    const search = cleanText(
      req.query?.search,
    );

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batch =
      await Batch.findById(batchId).lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const filter = {
      role: "student",
      isActive: true,
    };

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const existingMembers =
      await BatchMember.find({
        batch: batchId,
      })
        .select("student")
        .lean();

    const existingStudentIds =
      existingMembers.map(
        (member) =>
          member.student,
      );

    if (
      existingStudentIds.length > 0
    ) {
      filter._id = {
        $nin: existingStudentIds,
      };
    }

    const students =
      await User.find(filter)
        .select(
          "name email phone isEmailVerified isActive createdAt",
        )
        .sort({
          name: 1,
        })
        .limit(50)
        .lean();

    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error(
      "Search students error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to search students.",
    });
  }
}

/*
 * =========================================================
 * ADD STUDENTS TO BATCH
 * =========================================================
 *
 * Body:
 *
 * {
 *   "studentIds": [
 *      "studentId1",
 *      "studentId2"
 *   ]
 * }
 */
async function addStudentsToBatch(
  req,
  res,
) {
  try {
    const { batchId } = req.params;
    const studentIds =
      req.body?.studentIds;

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    if (
      !Array.isArray(studentIds) ||
      studentIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide at least one student.",
      });
    }

    if (studentIds.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          "You can add a maximum of 100 students at once.",
      });
    }

    const uniqueStudentIds = [
      ...new Set(
        studentIds.map((id) =>
          String(id),
        ),
      ),
    ];

    const invalidStudentId =
      uniqueStudentIds.find(
        (id) => !isValidObjectId(id),
      );

    if (invalidStudentId) {
      return res.status(400).json({
        success: false,
        message:
          "One or more student IDs are invalid.",
      });
    }

    const batch =
      await Batch.findById(batchId);

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
          "Students cannot be added to an archived batch.",
      });
    }

    /*
     * Only actual student accounts can be added.
     */
    const students =
      await User.find({
        _id: {
          $in: uniqueStudentIds,
        },
        role: "student",
        isActive: true,
      })
        .select(
          "_id name email phone isActive role",
        )
        .lean();

    const foundStudentIds =
      new Set(
        students.map((student) =>
          String(student._id),
        ),
      );

    const invalidStudentIds =
      uniqueStudentIds.filter(
        (id) =>
          !foundStudentIds.has(id),
      );

    if (
      invalidStudentIds.length > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected users are not active student accounts.",
      });
    }

    /*
     * Check existing memberships.
     */
    const existingMembers =
      await BatchMember.find({
        batch: batchId,
        student: {
          $in: uniqueStudentIds,
        },
      })
        .select("student status")
        .lean();

    const existingIds =
      new Set(
        existingMembers.map(
          (member) =>
            String(member.student),
        ),
      );

    const newStudentIds =
      uniqueStudentIds.filter(
        (id) =>
          !existingIds.has(id),
      );

    if (newStudentIds.length === 0) {
      return res.status(409).json({
        success: false,
        message:
          "All selected students are already members of this batch.",
      });
    }

    const now = new Date();

    const documents =
      newStudentIds.map(
        (studentId) => ({
          batch: batchId,
          student: studentId,
          status: "active",
          joinedAt: now,
          joinedBy:
            req.user?._id ||
            req.user?.id ||
            null,
        }),
      );

    await BatchMember.insertMany(
      documents,
      {
        ordered: false,
      },
    );

    const addedStudents =
      students.filter((student) =>
        newStudentIds.includes(
          String(student._id),
        ),
      );

    return res.status(201).json({
      success: true,
      message:
        `${addedStudents.length} student${
          addedStudents.length === 1
            ? ""
            : "s"
        } added to the batch successfully.`,
      addedCount:
        addedStudents.length,
      skippedCount:
        existingMembers.length,
      students: addedStudents,
    });
  } catch (error) {
    console.error(
      "Add students to batch error:",
      error,
    );

    /*
     * Handle MongoDB duplicate-key protection
     * gracefully.
     */
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "One or more students are already assigned to this batch.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to add students to batch.",
    });
  }
}

/*
 * =========================================================
 * REMOVE STUDENT FROM BATCH
 * =========================================================
 */
async function removeStudentFromBatch(
  req,
  res,
) {
  try {
    const {
      batchId,
      studentId,
    } = req.params;

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const member =
      await BatchMember.findOne({
        batch: batchId,
        student: studentId,
      });

    if (!member) {
      return res.status(404).json({
        success: false,
        message:
          "Student is not a member of this batch.",
      });
    }

    await BatchMember.findByIdAndDelete(
      member._id,
    );

    return res.status(200).json({
      success: true,
      message:
        "Student removed from batch successfully.",
    });
  } catch (error) {
    console.error(
      "Remove student from batch error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove student from batch.",
    });
  }
}

/*
 * =========================================================
 * GET BATCH MEMBER COUNT
 * =========================================================
 */
async function getBatchStudentCount(
  req,
  res,
) {
  try {
    const { batchId } = req.params;

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batchExists =
      await Batch.exists({
        _id: batchId,
      });

    if (!batchExists) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const count =
      await BatchMember.countDocuments({
        batch: batchId,
        status: "active",
      });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(
      "Get batch student count error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch batch student count.",
    });
  }
}

module.exports = {
  getBatchStudents,
  searchStudents,
  addStudentsToBatch,
  removeStudentFromBatch,
  getBatchStudentCount,
};