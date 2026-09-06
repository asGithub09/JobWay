const mongoose = require("mongoose");

const User = require("../models/User");
const Batch = require("../models/Batch");
const BatchMember = require("../models/BatchMember");

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value);

/* ============================================================
   GET ALL STUDENTS
   GET /api/students

   Returns every registered student.

   Includes:
   - name
   - email
   - phone
   - verification status
   - active status
   - registration date
   - current active batch
   ============================================================ */

const getStudents = async (req, res) => {
  try {
    const {
      search = "",
      assignment = "",
    } = req.query;

    const normalizedSearch =
      typeof search === "string"
        ? search.trim()
        : "";

    const normalizedAssignment =
      typeof assignment === "string"
        ? assignment.trim().toLowerCase()
        : "";

    const userFilter = {
      role: "student",
    };

    /*
     * Search by:
     * - name
     * - email
     * - phone
     */
    if (normalizedSearch) {
      const escapedSearch =
        normalizedSearch.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );

      const searchRegex = new RegExp(
        escapedSearch,
        "i",
      );

      userFilter.$or = [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
        {
          phone: searchRegex,
        },
      ];
    }

    /*
     * Get all registered students.
     *
     * We intentionally do not filter by
     * email verification here.
     *
     * A registered student should appear
     * in the Admin Students directory even
     * if email verification is pending.
     */
    const students = await User.find(
      userFilter,
    )
      .select(
        "_id name email phone isEmailVerified isActive createdAt",
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    const studentIds = students.map(
      (student) => student._id,
    );

    /*
     * Find all active memberships for
     * the students returned above.
     */
    const memberships =
      studentIds.length > 0
        ? await BatchMember.find({
            student: {
              $in: studentIds,
            },
            status: "active",
          })
            .populate({
              path: "batch",
              select:
                "_id name code status category startDate endDate",
            })
            .lean()
        : [];

    /*
     * Map active membership by student.
     */
    const membershipByStudent = new Map();

    for (const membership of memberships) {
      /*
       * Ignore broken memberships where the
       * referenced batch no longer exists.
       */
      if (!membership.batch) {
        continue;
      }

      /*
       * Archived batches are not treated as
       * a student's current batch.
       */
      if (
        membership.batch.status ===
        "archived"
      ) {
        continue;
      }

      const studentId =
        membership.student?.toString();

      if (!studentId) {
        continue;
      }

      /*
       * Product rule:
       *
       * A student has one current active batch.
       *
       * If legacy/inconsistent data contains
       * multiple active memberships, do not
       * silently overwrite the first one.
       */
      if (
        !membershipByStudent.has(
          studentId,
        )
      ) {
        membershipByStudent.set(
          studentId,
          membership,
        );
      }
    }

    /*
     * Build the final student response.
     */
    let result = students.map(
      (student) => {
        const membership =
          membershipByStudent.get(
            student._id.toString(),
          );

        return {
          _id: student._id.toString(),

          name: student.name,

          email: student.email,

          phone: student.phone,

          isEmailVerified:
            student.isEmailVerified,

          isActive:
            student.isActive,

          createdAt:
            student.createdAt,

          currentBatch:
            membership?.batch
              ? {
                  _id:
                    membership.batch._id.toString(),

                  name:
                    membership.batch.name,

                  code:
                    membership.batch.code ||
                    "",

                  status:
                    membership.batch.status,
                }
              : null,

          membershipId:
            membership?._id
              ? membership._id.toString()
              : null,

          joinedAt:
            membership?.joinedAt || null,
        };
      },
    );

    /*
     * Optional assignment filter.
     *
     * assignment=assigned
     */
    if (
      normalizedAssignment ===
      "assigned"
    ) {
      result = result.filter(
        (student) =>
          student.currentBatch !== null,
      );
    }

    /*
     * assignment=unassigned
     */
    if (
      normalizedAssignment ===
      "unassigned"
    ) {
      result = result.filter(
        (student) =>
          student.currentBatch === null,
      );
    }

    return res.json({
      success: true,
      students: result,
      total: result.length,
    });
  } catch (error) {
    console.error(
      "Get students error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load students.",
    });
  }
};

/* ============================================================
   GET BATCH SUMMARY
   GET /api/students/batch-summary

   Used by Admin → Students.

   Returns every non-archived batch with
   its active student count.

   Student names are loaded only when the
   admin expands a batch, using the existing
   BatchMember API.
   ============================================================ */

const getBatchSummary = async (
  req,
  res,
) => {
  try {
    const batches =
      await Batch.find({
        status: {
          $ne: "archived",
        },
      })
        .select(
          "_id name code status category startDate endDate",
        )
        .populate({
          path: "category",
          select: "_id name slug",
        })
        .sort({
          createdAt: -1,
        })
        .lean();

    const batchIds = batches.map(
      (batch) => batch._id,
    );

    /*
     * Count active members in each batch
     * using one aggregation instead of making
     * one query per batch.
     */
    const counts =
      batchIds.length > 0
        ? await BatchMember.aggregate([
            {
              $match: {
                batch: {
                  $in: batchIds,
                },
                status: "active",
              },
            },

            {
              $group: {
                _id: "$batch",

                count: {
                  $sum: 1,
                },
              },
            },
          ])
        : [];

    const countMap = new Map(
      counts.map((item) => [
        item._id.toString(),
        item.count,
      ]),
    );

    const result = batches.map(
      (batch) => ({
        _id: batch._id.toString(),

        name: batch.name,

        code: batch.code || "",

        status: batch.status,

        category: batch.category
          ? {
              _id:
                batch.category._id.toString(),

              name:
                batch.category.name,

              slug:
                batch.category.slug,
            }
          : null,

        startDate:
          batch.startDate || null,

        endDate:
          batch.endDate || null,

        studentCount:
          countMap.get(
            batch._id.toString(),
          ) || 0,
      }),
    );

    return res.json({
      success: true,
      batches: result,
    });
  } catch (error) {
    console.error(
      "Get student batch summary error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load batch summary.",
    });
  }
};

/* ============================================================
   ASSIGN / CHANGE STUDENT BATCH
   PATCH /api/students/:studentId/batch

   Body:
   {
     "batchId": "..."
   }

   Behavior:

   New student:
     Not Assigned
          ↓
     Batch A / active

   Existing student:
     Batch A / active
          ↓
     Change to Batch B
          ↓
     Batch A / inactive
     Batch B / active

   Previous membership records are preserved.
   ============================================================ */

const assignStudentToBatch = async (
  req,
  res,
) => {
  const session =
    await mongoose.startSession();

  try {
    const { studentId } =
      req.params;

    const { batchId } =
      req.body || {};

    /*
     * Validate student ID.
     */
    if (
      !isValidObjectId(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid student ID.",
      });
    }

    /*
     * Validate batch ID.
     */
    if (
      !isValidObjectId(batchId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid batch ID.",
      });
    }

    /*
     * Confirm student exists and is
     * actually a student account.
     */
    const student =
      await User.findOne({
        _id: studentId,
        role: "student",
      })
        .select(
          "_id name email phone isEmailVerified isActive createdAt",
        )
        .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found.",
      });
    }

    /*
     * Inactive users cannot receive
     * a current batch assignment.
     */
    if (!student.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Inactive students cannot be assigned to a batch.",
      });
    }

    /*
     * Confirm target batch exists.
     */
    const batch =
      await Batch.findById(
        batchId,
      )
        .select(
          "_id name code status category startDate endDate",
        )
        .lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message:
          "Batch not found.",
      });
    }

    /*
     * Archived batches cannot receive
     * current students.
     */
    if (
      batch.status === "archived"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Students cannot be assigned to an archived batch.",
      });
    }

    /*
     * Start transaction.
     *
     * This keeps the batch change together:
     *
     * old active membership
     *        ↓
     * inactive
     *
     * new membership
     *        ↓
     * active
     */
    session.startTransaction();

    /*
     * Deactivate every other active
     * membership belonging to this student.
     *
     * We do NOT delete old memberships.
     */
    await BatchMember.updateMany(
      {
        student: studentId,

        status: "active",

        batch: {
          $ne: batchId,
        },
      },

      {
        $set: {
          status: "inactive",
        },
      },

      {
        session,
      },
    );

    /*
     * Look for an existing membership
     * for this exact student + batch.
     *
     * Because BatchMember has a unique
     * batch + student index, we can safely
     * reactivate the historical membership.
     */
    let membership =
      await BatchMember.findOne({
        batch: batchId,
        student: studentId,
      }).session(session);

    if (membership) {
      /*
       * Existing historical relationship:
       * reactivate it.
       */
      membership.status = "active";

      membership.joinedAt =
        new Date();

      membership.joinedBy =
        req.user?.userId || null;

      await membership.save({
        session,
      });
    } else {
      /*
       * First-time relationship.
       */
      const created =
        await BatchMember.create(
          [
            {
              batch: batchId,

              student: studentId,

              status: "active",

              joinedAt: new Date(),

              joinedBy:
                req.user?.userId ||
                null,
            },
          ],
          {
            session,
          },
        );

      membership =
        created[0];
    }

    /*
     * Commit the complete assignment.
     */
    await session.commitTransaction();

    return res.json({
      success: true,

      message:
        "Student batch assignment updated successfully.",

      student: {
        _id:
          student._id.toString(),

        name: student.name,

        email: student.email,

        phone: student.phone,

        isEmailVerified:
          student.isEmailVerified,

        isActive:
          student.isActive,

        createdAt:
          student.createdAt,

        currentBatch: {
          _id:
            batch._id.toString(),

          name:
            batch.name,

          code:
            batch.code || "",

          status:
            batch.status,
        },
      },

      membership: {
        _id:
          membership._id.toString(),

        batch:
          batch._id.toString(),

        student:
          student._id.toString(),

        status:
          membership.status,

        joinedAt:
          membership.joinedAt,
      },
    });
  } catch (error) {
    /*
     * Roll back the assignment if
     * anything failed.
     */
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "Assign student to batch error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update student batch assignment.",
    });
  } finally {
    await session.endSession();
  }
};

/* ============================================================
   UNASSIGN STUDENT
   DELETE /api/students/:studentId/batch

   Does not delete the membership.

   Instead:
     active → inactive

   This preserves assignment history.
   ============================================================ */

const unassignStudentFromBatch =
  async (req, res) => {
    try {
      const { studentId } =
        req.params;

      if (
        !isValidObjectId(
          studentId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid student ID.",
        });
      }

      const result =
        await BatchMember.updateMany(
          {
            student: studentId,

            status: "active",
          },

          {
            $set: {
              status: "inactive",
            },
          },
        );

      return res.json({
        success: true,

        message:
          result.modifiedCount > 0
            ? "Student batch assignment removed successfully."
            : "Student is not currently assigned to a batch.",
      });
    } catch (error) {
      console.error(
        "Unassign student from batch error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to remove student batch assignment.",
      });
    }
  };

/* ============================================================
   EXPORTS
   ============================================================ */

module.exports = {
  getStudents,
  getBatchSummary,
  assignStudentToBatch,
  unassignStudentFromBatch,
};